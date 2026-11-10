import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { NIGERIAN_STATES_DATA, RED_FLAG_SYMPTOMS, NATIONAL_EMERGENCY_NUMBERS } from './src/data/nigeriaHealthcareData';
import {
  buildFallbackTriage,
  buildFormattedResponse,
  detectLocalRedFlags,
  detectStateFromText,
  getSectionHeaders,
} from './src/data/fallbackTriage';
import { SupportedLanguage } from './src/types/triage';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '8mb' }));

// Initialize Google GenAI client (v1beta supports ThinkingLevel, speechConfig, and full model catalog)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: 'v1beta',
    httpOptions: {
      apiVersion: 'v1beta',
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getTargetLanguage(lang: unknown): SupportedLanguage {
  if (typeof lang === 'string' && ['pidgin', 'english', 'hausa', 'yoruba', 'igbo'].includes(lang)) {
    return lang as SupportedLanguage;
  }
  return 'pidgin';
}

function detectExplicitNigerianLanguage(text: string): SupportedLanguage | null {
  const lower = text.toLowerCase();

  // Strong Hausa lexical markers
  const hausaMatches = (
    lower.match(
      /\b(ina|kina|sannu|zazzabi|zazzaɓi|ciwon|ciwo|jikina|jiki|amai|zawo|numfashi|ciki|juna biyu|mai ciki|gaggawa|asibiti|kano|kaduna|sokoto|katsina|da safe|tun jiya|ruwa|gajiya)\b/g
    ) || []
  ).length;
  // Strong Yoruba lexical markers
  const yorubaMatches = (
    lower.match(
      /\b(ara mi|ori mi|orí|ori|gbona|gbóná|iba|ìbà|eebi|èébì|igbe|ìgbẹ́|gbuuru|oyun|oyún|aboyun|aboyún|eje|ẹ̀jẹ̀|inu rirun|irora|ìrora|ile-iwosan|ilé-ìwòsàn|omo|ọmọ|fo mi|n fo|n dun|da mi|laamu)\b/g
    ) || []
  ).length;
  // Strong Igbo lexical markers
  const igboMatches = (
    lower.match(
      /\b(ahu|ahụ|isi|owuwa|ọwụwa|afo|afọ|osisa|ọsịsa|ime|obara|ọbara|ukwara|ụkwara|oku|ọkụ|ekpo|agwo|gwọ|nnoo|ndo|ulo ogwu|ụlọ ọgwụ|nwa|ike|mgbu|na-egbu|na-ekpo|na-awa|nututu|nụtụtụ|adi m|adị m)\b/g
    ) || []
  ).length;

  const maxIndigenous = Math.max(hausaMatches, yorubaMatches, igboMatches);
  if (maxIndigenous >= 2) {
    if (hausaMatches === maxIndigenous) return 'hausa';
    if (yorubaMatches === maxIndigenous) return 'yoruba';
    return 'igbo';
  }

  // Distinct Pidgin tokens vs standard English
  const pidginMatches = (
    lower.match(
      /\b(dey|wetin|pikin|belle|abeg|wahala|sabi|chop|comot|waka|sharp-sharp|no fit|e don|my body|head dey|foot dey|eye dey|throat dey)\b/g
    ) || []
  ).length;
  if (pidginMatches >= 2) return 'pidgin';

  return null;
}

function resolveTargetLanguage(requestedLang: unknown, text: string, strictMode = false): SupportedLanguage {
  const baseLang = getTargetLanguage(requestedLang);
  if (strictMode) return baseLang;

  const inferred = detectExplicitNigerianLanguage(text);
  if (!inferred) return baseLang;

  // Preserve explicit Hausa/Yoruba/Igbo selection if user mixed English medical words,
  // but honor automatic detection if they clearly wrote in Hausa/Yoruba/Igbo while dropdown stayed on Pidgin/English.
  if (baseLang === 'pidgin' || baseLang === 'english') {
    return inferred;
  }
  if ((inferred === 'hausa' || inferred === 'yoruba' || inferred === 'igbo') && inferred !== baseLang) {
    return inferred;
  }
  return baseLang;
}

function isGeminiConfigured(): boolean {
  return Boolean(ai && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NaijaHealth AI Medical Triage Service (Multilingual Edition)',
    languages: ['pidgin', 'english', 'hausa', 'yoruba', 'igbo'],
    hasApiKey: isGeminiConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// Nigerian Hospital & Emergency Directory
app.get('/api/facilities', (req: Request, res: Response) => {
  const state = req.query.state as string;
  if (state && NIGERIAN_STATES_DATA[state]) {
    return res.json({
      state,
      data: NIGERIAN_STATES_DATA[state],
    });
  }
  return res.json({
    states: Object.keys(NIGERIAN_STATES_DATA),
    nationalHotlines: NATIONAL_EMERGENCY_NUMBERS,
    redFlags: RED_FLAG_SYMPTOMS,
  });
});

// Triage Evaluation Endpoint supporting Pidgin, English, Hausa, Yoruba, and Igbo
app.post('/api/triage', async (req: Request, res: Response) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const targetLang = resolveTargetLanguage(req.body?.language, message, Boolean(req.body?.languageLocked));
  const conversationHistory = Array.isArray(req.body?.conversationHistory) ? req.body.conversationHistory : [];
  const userLocation = req.body?.userLocation;

  if (!message) {
    return res.status(400).json({ error: 'Symptom description message is required.' });
  }

  // Detect location from message or payload
  const detectedFromMsg = detectStateFromText(message);
  const targetState =
    userLocation?.state && NIGERIAN_STATES_DATA[userLocation.state]
      ? userLocation.state
      : detectedFromMsg || 'Lagos';
  const stateData = NIGERIAN_STATES_DATA[targetState] || NIGERIAN_STATES_DATA['Lagos'];
  const facilitiesList = stateData.facilities.map((f) => `${f.name} (${f.city})`).join(', ');
  const headers = getSectionHeaders(targetLang);

  // Safety check first: detect red flags across all 5 languages immediately
  const immediateSafetyCheck = detectLocalRedFlags(message);
  if (immediateSafetyCheck.isRedFlag) {
    console.log(`Immediate red-flag detected (${targetLang}). Dispatching urgent response without waiting.`);
    const emergencyResult = buildFallbackTriage(message, targetState, targetLang);
    return res.json(emergencyResult);
  }

  // If API key not configured, use full 5-language clinical fallback
  if (!ai || !isGeminiConfigured()) {
    console.log(`Using multilingual rule-based triage in ${targetLang} (API key unconfigured).`);
    return res.json(buildFallbackTriage(message, targetState, targetLang));
  }

  const languageSpecs: Record<SupportedLanguage, string> = {
    pidgin:
      'Write EVERY SINGLE JSON STRING strictly in fluent, warm Nigerian Pidgin English (e.g. "Ayaah", "Pele o", "Sorry o", "hot body", "purging"). Never switch into formal textbook English. Use [Wetin Fit Dey Happen], [Wetin You Fit Do For House], [Next Step].',
    english:
      'Write EVERY SINGLE JSON STRING strictly in simple, warm, everyday Nigerian English free of heavy clinical jargon. Use [Potential Causes], [Home Management], [Action Plan].',
    hausa:
      'Write EVERY SINGLE JSON STRING strictly and completely in natural, everyday Hausa (Harshen Hausa), e.g., "Sannu da jiki", "Allah Ya sauwake". DO NOT reply in English or Pidgin! Even if the user message contained English words, your entire response MUST be 100% Hausa (you may keep medical terms like ORS, Malaria, Typhoid, and Nigerian hospital names).',
    yoruba:
      'Write EVERY SINGLE JSON STRING strictly and completely in natural, everyday Yoruba (Èdè Yorùbá) with clear tone marks/diacritics, e.g., "Pẹ̀lẹ́ o", "Ẹ má bínú". DO NOT reply in English or Pidgin! Even if the user message contained English words, your entire response MUST be 100% Yoruba (you may keep terms like ORS, Malaria, Typhoid, and Nigerian hospital names).',
    igbo:
      'Write EVERY SINGLE JSON STRING strictly and completely in natural, everyday Igbo (Asụsụ Igbo) with clear diacritics, e.g., "Ndo nu", "Ndewo". DO NOT reply in English or Pidgin! Even if the user message contained English words, your entire response MUST be 100% Igbo (you may keep terms like ORS, Malaria, Typhoid, and Nigerian hospital names).',
  };

  const systemInstruction = `You are "NaijaHealth AI", an empathetic, culturally grounded medical triage assistant supporting communities across Nigeria.
TARGET LANGUAGE: ${targetLang.toUpperCase()}
LANGUAGE REQUIREMENT: ${languageSpecs[targetLang]}

CLINICAL & CULTURAL GUIDANCE:
- Avoid complex medical terminology; explain gently in plain everyday language so anyone in a Nigerian market can understand.
- Include local Nigerian health context where appropriate: Malaria / Typhoid awareness (advise mRDT malaria testing before medication), purging/cholera awareness, and Sickle Cell precautions for severe joint/bone crisis.
- PREGNANCY & MATERNAL CARE PROTOCOL:
  * If the user is pregnant (expectant mother / "get belle" / "mai ciki" / "oyún" / "dị ime"): FIRST screen for obstetric danger signs (vaginal bleeding/spotting, severe headache, blurred vision, sudden face or hand swelling [pre-eclampsia], convulsions, leaking fluid/water breaking early, decreased or absent baby kicks/movement, severe abdominal pain, high fever).
  * If ANY obstetric danger sign is present -> IMMEDIATELY set "isRedFlag": true and "urgencyLevel": "emergency", forbid ALL herbs/home drugs, and urge immediate travel to a General/Teaching Hospital Maternity Emergency Ward in ${targetState} or call 112.
  * For non-emergency pregnancy complaints (morning sickness, mild fatigue, mild fever, mild backache, urinary discomfort): warn explicitly NEVER to take unprescribed painkillers (especially NSAIDs like Ibuprofen, Diclofenac, Aspirin), unprescribed antibiotics/antimalarials, or local herbal mixtures ("agbo"), give safe hydration/rest guidance, and advise prompt Antenatal Clinic (ANC) doctor/midwife review.
- For purging/dehydration, give the exact safe Salt-Sugar Solution (Home ORS) ratio: 1 level small teaspoon of salt + 10 level small teaspoons of sugar (or 5 sugar cubes) dissolved in 1 litre (two 50cl pure water sachets) of clean boiled/cooled water.
- For high fever, advise lukewarm tepid sponging (explicitly warn NEVER to use cold water, ice, or methylated spirit).
- Warn gently against unprescribed antibiotics or unsafe herbal concoctions.
- Always route physical care to ${targetState} State hospitals: ${facilitiesList} (Emergency hotlines: 112, NCDC 6232, ${stateData.emergencyHotlines.join(', ')}).

CRITICAL SAFETY PROTOCOL:
- If ANY red-flag symptom is described (sharp/crushing chest pain, severe breathing difficulty, sudden half-body weakness / stroke FAST signs, heavy uncontrolled bleeding, unconsciousness/seizure, neck stiffness with fever, OR pregnancy danger signs such as bleeding in pregnancy, pre-eclampsia headache/vision/face swelling, early water breaking, or absent baby movement):
  * Set "isRedFlag": true and "urgencyLevel": "emergency".
  * Set "wetinYouFitDoForHouse" to a brief warning in ${targetLang} saying ALL home remedies are cancelled — go immediately to emergency care!
  * Direct them urgently to the nearest emergency hospital in ${targetState} and to call 112.
- Keep responses concise, empathetic, and structured clearly.`;

  const promptText = `Patient State/City: ${targetState}, Nigeria (City note: ${userLocation?.city || 'not specified'}).
Target Output Language: ${targetLang.toUpperCase()}.
Recent Conversation:
${conversationHistory
  .slice(-6)
  .map((m: any) => `${m.role === 'user' ? 'Patient' : 'NaijaHealth AI'}: ${m.parts?.[0]?.text || m.text || ''}`)
  .join('\n')}

Patient Message:
"${message}"

Respond in JSON with every narrative string written in ${targetLang.toUpperCase()}.`;

  const startedAt = Date.now();
  const baseSchema = {
    type: Type.OBJECT,
    properties: {
      isRedFlag: {
        type: Type.BOOLEAN,
        description:
          'True only if dangerous red flags are present (severe chest pain, inability to breathe, stroke weakness, heavy bleeding, unconsciousness/seizure).',
      },
      urgencyLevel: {
        type: Type.STRING,
        enum: ['emergency', 'urgent', 'routine'],
        description: 'Clinical triage priority level',
      },
      empathyNote: {
        type: Type.STRING,
        description: `Short warm comforting greeting strictly in ${targetLang}`,
      },
      emergencyWarning: {
        type: Type.STRING,
        description: `Urgent warning strictly in ${targetLang} if isRedFlag is true, otherwise empty string`,
      },
      wetinFitDeyHappen: {
        type: Type.STRING,
        description: `Part 1 (${headers.causes}): Simple, non-jargon explanation strictly in ${targetLang}`,
      },
      wetinYouFitDoForHouse: {
        type: Type.STRING,
        description: `Part 2 (${headers.home}): Safe first-aid and home care strictly in ${targetLang}. Say home remedies cancelled if isRedFlag is true.`,
      },
      nextStep: {
        type: Type.STRING,
        description: `Part 3 (${headers.action}): Clear timeline & hospital guidance inside ${targetState} strictly in ${targetLang}`,
      },
      clarifyingQuestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: `1 to 2 short helpful follow-up questions strictly in ${targetLang}`,
      },
      recommendedFacilities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: `2 to 3 recommended hospitals in ${targetState} State`,
      },
      detectedLocation: {
        type: Type.STRING,
        description: 'Nigerian state name',
      },
      disclaimer: {
        type: Type.STRING,
        description: `Brief AI medical disclaimer strictly in ${targetLang}`,
      },
    },
    required: [
      'isRedFlag',
      'urgencyLevel',
      'empathyNote',
      'wetinFitDeyHappen',
      'wetinYouFitDoForHouse',
      'nextStep',
      'disclaimer',
    ],
  };

  async function callTriageModel(modelName: string, thinkingLevel: ThinkingLevel) {
    const genPromise = ai!.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel },
        responseMimeType: 'application/json',
        responseSchema: baseSchema,
      },
    });
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`${modelName} timed out after 7s`)), 7000);
    });
    return Promise.race([genPromise, timeoutPromise]);
  }

  try {
    let response;
    let usedModel = 'gemini-3.8-flash';
    try {
      response = await callTriageModel('gemini-3.8-flash', ThinkingLevel.LOW);
    } catch (primaryErr: any) {
      console.warn(
        `Primary model gemini-3.8-flash error (${primaryErr?.status || primaryErr?.message}), trying gemini-3.1-flash-lite...`
      );
      usedModel = 'gemini-3.1-flash-lite';
      response = await callTriageModel('gemini-3.1-flash-lite', ThinkingLevel.MINIMAL);
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini.');
    }

    const parsedData = JSON.parse(responseText);

    // Ensure consistent normalized fields & build fullFormattedResponse server-side
    const normalizedLocation =
      parsedData.detectedLocation && NIGERIAN_STATES_DATA[parsedData.detectedLocation]
        ? parsedData.detectedLocation
        : targetState;

    const causes = parsedData.wetinFitDeyHappen || '';
    let home = parsedData.wetinYouFitDoForHouse || '';
    const action = parsedData.nextStep || '';
    const disclaimer = parsedData.disclaimer || headers.disclaimer;

    // Double-check local red-flag enforcement
    if (immediateSafetyCheck.isRedFlag) {
      parsedData.isRedFlag = true;
      parsedData.urgencyLevel = 'emergency';
      home = buildFallbackTriage(message, normalizedLocation, targetLang).wetinYouFitDoForHouse;
    }

    const recommendedFacilities =
      Array.isArray(parsedData.recommendedFacilities) && parsedData.recommendedFacilities.length > 0
        ? parsedData.recommendedFacilities
        : stateData.facilities.map((f) => `${f.name} (${f.city})`).slice(0, 3);

    const finalPayload = {
      ...parsedData,
      language: targetLang,
      detectedLocation: normalizedLocation,
      recommendedFacilities,
      wetinFitDeyHappen: causes,
      wetinYouFitDoForHouse: home,
      nextStep: action,
      potentialCauses: causes,
      homeManagement: home,
      actionPlan: action,
      disclaimer,
      fullFormattedResponse: buildFormattedResponse(targetLang, {
        isRedFlag: Boolean(parsedData.isRedFlag),
        empathyNote: parsedData.empathyNote,
        emergencyWarning: parsedData.emergencyWarning,
        causes,
        home,
        action,
        disclaimer,
      }),
    };

    console.log(`Triage (${targetLang}) completed via ${usedModel} in ${Date.now() - startedAt}ms`);
    return res.json(finalPayload);
  } catch (error: any) {
    console.error(`Triage (${targetLang}) AI error after ${Date.now() - startedAt}ms:`, error?.message || error);
    const fallbackResult = buildFallbackTriage(message, targetState, targetLang);
    return res.json(fallbackResult);
  }
});

// Multilingual Text-to-Speech Endpoint using Gemini TTS (Pidgin, English, Hausa, Yoruba, Igbo)
app.post('/api/tts', async (req: Request, res: Response) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const targetLang = getTargetLanguage(req.body?.language);

  if (!text) {
    return res.status(400).json({ error: 'Text is required for speech synthesis.' });
  }

  if (!ai || !isGeminiConfigured()) {
    return res.status(503).json({ error: 'Server TTS unavailable without API key.' });
  }

  const cleanText = text
    .replace(/[*_`#🚨💚⚠️❌🟡🟢\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);

  const langLabels: Record<SupportedLanguage, string> = {
    pidgin: 'Nigerian Pidgin English',
    english: 'Nigerian English',
    hausa: 'Hausa',
    yoruba: 'Yoruba',
    igbo: 'Igbo',
  };

  try {
    const ttsPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Read aloud warmly and clearly in ${langLabels[targetLang]}: ${cleanText}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TTS generation timed out')), 9000);
    });

    const response = await Promise.race([ttsPromise, timeoutPromise]);
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(502).json({ error: 'No audio generated.' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error(`TTS error (${targetLang}):`, error?.message || error);
    return res.status(503).json({ error: 'TTS failed, please use browser speech fallback.' });
  }
});

// Multilingual Audio Transcription + Spoken Language Detection Endpoint (Hausa, Yoruba, Igbo, Pidgin, English)
app.post('/api/transcribe', async (req: Request, res: Response) => {
  const audioBase64 = typeof req.body?.audioBase64 === 'string' ? req.body.audioBase64 : '';
  const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType : 'audio/webm';
  const hintLang = getTargetLanguage(req.body?.language);

  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required.' });
  }

  if (!ai || !isGeminiConfigured()) {
    return res.status(503).json({ error: 'Server voice transcription unavailable without API key.' });
  }

  const cleanMimeType = mimeType.split(';')[0] || 'audio/webm';
  const audioPart = {
    inlineData: {
      mimeType: cleanMimeType,
      data: audioBase64,
    },
  };

  let transcribedText = '';
  let detectedLanguage: SupportedLanguage = hintLang;

  let attempt1ErrMsg = '';
  // Attempt 1: Dedicated gemini-3.5-transcribe
  try {
    const transcribePromise = ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          role: 'user',
          parts: [
            audioPart,
            {
              text: 'Transcribe this audio verbatim.',
            },
          ],
        },
      ],
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('gemini-3.5-transcribe timed out')), 10000);
    });

    const response = await Promise.race([transcribePromise, timeoutPromise]);
    transcribedText = (response.text || '').trim();
    if (!transcribedText) {
      attempt1ErrMsg = `empty_text candidates=${JSON.stringify(response.candidates?.[0]?.finishReason || 'none')}`;
    }
  } catch (err: any) {
    attempt1ErrMsg = `${err?.status || ''} ${err?.message || err}`.trim();
    console.warn(`gemini-3.5-transcribe fallback trigger (${hintLang}):`, attempt1ErrMsg);
  }

  // Attempt 2: Multimodal Gemini 3.8 Flash fallback (handles transcription + spoken language detection in JSON)
  if (!transcribedText) {
    try {
      const flashPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              audioPart,
              {
                text: `Listen carefully to this patient voice recording from Nigeria (UI hint language: ${hintLang}). Transcribe verbatim what the speaker said in its original spoken language (do NOT translate to English if they spoke Hausa, Yoruba, Igbo, or Pidgin), and identify which supported language they spoke: "pidgin", "english", "hausa", "yoruba", or "igbo".`,
              },
            ],
          },
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'Verbatim transcription in the exact spoken language.',
              },
              detectedLanguage: {
                type: Type.STRING,
                enum: ['pidgin', 'english', 'hausa', 'yoruba', 'igbo'],
                description: 'The language spoken in the recording.',
              },
            },
            required: ['text', 'detectedLanguage'],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('gemini-3.8-flash transcribe timed out')), 14000);
      });

      const flashRes = await Promise.race([flashPromise, timeoutPromise]);
      const parsed = JSON.parse((flashRes.text || '{}').trim());
      if (typeof parsed.text === 'string') {
        transcribedText = parsed.text.trim();
      }
      if (parsed.detectedLanguage) {
        detectedLanguage = getTargetLanguage(parsed.detectedLanguage);
      }
    } catch (fallbackErr: any) {
      const attempt2Msg = `${fallbackErr?.status || ''} ${fallbackErr?.message || fallbackErr}`.trim();
      console.warn(
        `gemini-3.8-flash transcribe fallback trigger (${hintLang}) | attempt1=${attempt1ErrMsg} | attempt2=${attempt2Msg}`
      );
      // Attempt 3: Fast Gemini 3.1 Flash Lite audio fallback
      try {
        const litePromise = ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: [
            {
              role: 'user',
              parts: [
                audioPart,
                {
                  text: `Transcribe this Nigerian healthcare voice recording verbatim in its spoken language and detect the language as one of ["pidgin", "english", "hausa", "yoruba", "igbo"].`,
                },
              ],
            },
          ],
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                detectedLanguage: {
                  type: Type.STRING,
                  enum: ['pidgin', 'english', 'hausa', 'yoruba', 'igbo'],
                },
              },
              required: ['text', 'detectedLanguage'],
            },
          },
        });
        const liteRes = await Promise.race([
          litePromise,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('flash-lite timeout')), 10000)),
        ]);
        const parsedLite = JSON.parse((liteRes.text || '{}').trim());
        if (typeof parsedLite.text === 'string') {
          transcribedText = parsedLite.text.trim();
        }
        if (parsedLite.detectedLanguage) {
          detectedLanguage = getTargetLanguage(parsedLite.detectedLanguage);
        }
      } catch (liteErr: any) {
        console.error(
          `All transcription attempts failed (${hintLang}):`,
          liteErr?.message || liteErr
        );
        return res.status(502).json({ error: 'Voice transcription failed.' });
      }
    }
  } else {
    // When gemini-3.5-transcribe succeeded cleanly, confirm spoken language cleanly
    const ruleLang = detectExplicitNigerianLanguage(transcribedText);
    if (ruleLang) {
      detectedLanguage = ruleLang;
    } else if (transcribedText.length >= 4) {
      try {
        const langCheck = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: `Classify the language of this Nigerian healthcare message strictly as one of [pidgin, english, hausa, yoruba, igbo] (if standard English with no Pidgin grammar, choose "english"; UI hint was "${hintLang}"):\n"${transcribedText}"`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  detectedLanguage: {
                    type: Type.STRING,
                    enum: ['pidgin', 'english', 'hausa', 'yoruba', 'igbo'],
                  },
                },
                required: ['detectedLanguage'],
              },
            },
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('lang detect timeout')), 2500)),
        ]);
        const parsedLang = JSON.parse((langCheck.text || '{}').trim());
        if (parsedLang.detectedLanguage) {
          detectedLanguage = getTargetLanguage(parsedLang.detectedLanguage);
        }
      } catch {
        detectedLanguage = resolveTargetLanguage(hintLang, transcribedText);
      }
    }
  }

  if (!transcribedText) {
    return res.status(422).json({ error: 'Could not detect clear speech.' });
  }

  return res.json({
    text: transcribedText,
    detectedLanguage,
  });
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NaijaHealth AI server (Multilingual Edition) running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
