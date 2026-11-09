import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { NIGERIAN_STATES_DATA, RED_FLAG_SYMPTOMS, NATIONAL_EMERGENCY_NUMBERS } from './src/data/nigeriaHealthcareData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize Google GenAI client (User-Agent header required by skill)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Emergency red flag terms checker for safety verification
function detectLocalRedFlags(text: string): { isRedFlag: boolean; matchedSymptom?: string } {
  const lower = text.toLowerCase();
  const redFlagPatterns = [
    { pattern: /(sharp|crushing|severe|tight|pressure).*(chest|heart)/i, name: 'Sharp / Crushing Chest Pain' },
    { pattern: /(chest pain|pain in my chest)/i, name: 'Chest Pain' },
    { pattern: /(cannot breathe|severe difficulty breathing|shortness of breath|gasping for air|struggling to breathe|blue lips)/i, name: 'Severe Breathing Difficulty' },
    { pattern: /(face droop|half body|one side.*(weak|paralyz)|slurred speech|sudden numbness)/i, name: 'Sudden Half-Body Weakness / Stroke Signs' },
    { pattern: /(heavy bleeding|uncontrolled bleeding|bleeding continuously|spurting blood|coughing.*blood|vomiting.*blood)/i, name: 'Heavy Uncontrolled Bleeding' },
    { pattern: /(convuls|seizure|fit|passed out|unconscious|fainted and not waking|coma)/i, name: 'Loss of Consciousness / Convulsions' },
    { pattern: /(stiff neck.*fever|cannot bend neck|high fever.*hallucinat)/i, name: 'Meningitis / Neurological Emergency' }
  ];

  for (const item of redFlagPatterns) {
    if (item.pattern.test(lower)) {
      return { isRedFlag: true, matchedSymptom: item.name };
    }
  }
  return { isRedFlag: false };
}

// Extract or match Nigerian state from text
function detectStateFromText(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const stateName of Object.keys(NIGERIAN_STATES_DATA)) {
    if (lower.includes(stateName.toLowerCase())) {
      return stateName;
    }
    const stateInfo = NIGERIAN_STATES_DATA[stateName];
    if (stateInfo.capital && lower.includes(stateInfo.capital.toLowerCase())) {
      return stateName;
    }
    for (const fac of stateInfo.facilities) {
      if (lower.includes(fac.city.toLowerCase())) {
        return stateName;
      }
    }
  }
  // Common aliases
  if (lower.includes('abuja') || lower.includes('fct')) return 'FCT - Abuja';
  if (lower.includes('lag') || lower.includes('ikeja') || lower.includes('yaba') || lower.includes('lekki') || lower.includes('surulere')) return 'Lagos';
  if (lower.includes('ph') || lower.includes('port harcourt')) return 'Rivers';
  if (lower.includes('ibadan')) return 'Oyo';
  if (lower.includes('onitsha') || lower.includes('awka') || lower.includes('nnewi')) return 'Anambra';
  if (lower.includes('benin') || lower.includes('irrua')) return 'Edo';
  if (lower.includes('zaria')) return 'Kaduna';
  if (lower.includes('warri') || lower.includes('asaba')) return 'Delta';
  return undefined;
}

// Fallback rule-based triage if API key is unconfigured or rate limited
function buildFallbackTriage(message: string, stateName: string = 'Lagos'): any {
  const redFlag = detectLocalRedFlags(message);
  const stateData = NIGERIAN_STATES_DATA[stateName] || NIGERIAN_STATES_DATA['Lagos'];
  const topFacilities = stateData.facilities.map(f => `${f.name} (${f.city})`).slice(0, 3);
  const disclaimer = '⚠️ Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, please visit the nearest hospital or call 112 immediately.';

  if (redFlag.isRedFlag) {
    const actionPlan = `🚨 RED-FLAG EMERGENCY: Please go IMMEDIATELY to the nearest General Hospital or Emergency Trauma Centre in ${stateName}.\n` +
      `Recommended nearby hospitals:\n` +
      topFacilities.map(f => `• ${f}`).join('\n') +
      `\n\nCall 112 (National Toll-Free Emergency) or ${stateData.emergencyHotlines.join(', ')} without delay. Do NOT attempt home treatments.`;

    return {
      urgencyLevel: 'emergency',
      isRedFlag: true,
      emergencyWarning: `CRITICAL RED FLAG DETECTED: Symptoms matching ${redFlag.matchedSymptom || 'an acute medical emergency'}. Immediate hospital evaluation required.`,
      potentialCauses: `Possible severe acute conditions such as cardiovascular emergency, acute respiratory distress, cerebrovascular event, or internal/external hemorrhage requiring urgent hospital assessment.`,
      homeManagement: `Home remedies are strictly bypassed due to red-flag danger signs. Keep the patient calm, sitting upright or in recovery position if breathing, loosen tight clothing, and transport immediately to hospital.`,
      actionPlan,
      recommendedFacilities: topFacilities,
      detectedLocation: stateName,
      clarifyingQuestions: [],
      fullFormattedResponse: `### 🚨 IMMEDIATE EMERGENCY ALERT: Red-Flag Symptoms Detected\n\n` +
        `**Symptoms reported:** "${message}"\n\n` +
        `**[Potential Causes]**\nPossible acute emergency requiring hospital diagnostics and resuscitation.\n\n` +
        `**[Home Management]**\n*All home remedies are bypassed.* Please rush to the nearest emergency ward.\n\n` +
        `**[Action Plan]**\n${actionPlan}\n\n${disclaimer}`,
      disclaimer
    };
  }

  // Common condition heuristics
  const lower = message.toLowerCase();
  let potentialCauses = '';
  let homeManagement = '';
  let actionPlan = '';
  let clarifyingQuestions: string[] = [];

  if (lower.includes('fever') || lower.includes('hot body') || lower.includes('chills') || lower.includes('bitter taste')) {
    potentialCauses = `Common in Nigeria due to Malaria (Plasmodium infection transmitted by female Anopheles mosquitoes), Typhoid fever (Salmonella enterica), or viral respiratory flu. Body pain and chills frequently accompany high parasitemia.`;
    homeManagement = `1. Tepid sponging with lukewarm water (never cold water or spirit) to gently bring down body temperature.\n2. Hydration: Drink plenty of clean boiled/filtered water or fresh fruit juice.\n3. Rest under an insecticide-treated mosquito net.\n4. Paracetamol can help relieve fever and body pain according to standard packaging instructions (avoid exceeding dose).`;
    actionPlan = `Take a Rapid Diagnostic Test (mRDT) or blood smear for malaria and a Widal/typhoid test at a nearby certified medical laboratory or Primary Health Centre (PHC) before starting antimalarial medication. If fever exceeds 39°C, lasts more than 48 hours, or is accompanied by vomiting everything, visit ${topFacilities[0]} or your nearest clinic immediately.`;
    clarifyingQuestions = [
      'How many days have you felt the fever and hot body?',
      'Have you noticed any vomiting, dark urine, or yellowing of the eyes?'
    ];
  } else if (lower.includes('purg') || lower.includes('stool') || lower.includes('diarrhea') || lower.includes('watery') || lower.includes('belly pain')) {
    potentialCauses = `Acute gastroenteritis, food or waterborne bacterial infections (including Cholera during rainy seasons), amoebiasis, or dietary irritation.`;
    homeManagement = `1. Start Salt-Sugar Solution (SSS / Home ORS) immediately: 1 level teaspoon of salt + 10 level teaspoons of sugar in 1 litre of clean boiled water.\n2. Drink one cup of SSS after each loose stool to prevent dehydration.\n3. Eat soft, easily digestible foods (such as boiled rice, pap/akamu, or plantain mash) in small amounts.\n4. Avoid raw vegetables, roadside unfiltered water, and carbonated sugary drinks.`;
    actionPlan = `Seek physical care at ${topFacilities[0]} or a nearby Health Centre if purging exceeds 6 times in 24 hours, if stool contains blood or mucus, if you cannot retain fluids, or if you feel dizzy upon standing.`;
    clarifyingQuestions = [
      'Is there any blood or mucus visible in the stool?',
      'Are you able to keep sips of water or ORS down without vomiting?'
    ];
  } else {
    potentialCauses = `Symptoms may indicate acute physical fatigue, viral infection, tension headache, or early signs of systemic infection common within local communities.`;
    homeManagement = `1. Ensure complete rest in a well-ventilated, quiet room.\n2. Maintain consistent fluid intake with clean water.\n3. Note any additional symptoms such as temperature spikes, rash, or changes in urine color.`;
    actionPlan = `If symptoms do not improve within 24 to 48 hours, or if new symptoms develop (such as vomiting or breathlessness), visit a health facility like ${topFacilities[0]} or your local General Hospital for a medical checkup.`;
    clarifyingQuestions = [
      'How long have you noticed these symptoms?',
      'Do you have any existing health conditions (such as high blood pressure, diabetes, or sickle cell)?'
    ];
  }

  return {
    urgencyLevel: 'urgent',
    isRedFlag: false,
    potentialCauses,
    homeManagement,
    actionPlan,
    clarifyingQuestions,
    recommendedFacilities: topFacilities,
    detectedLocation: stateName,
    fullFormattedResponse: `### 🩺 Health Guidance & Triage Report\n\n` +
      `**[Potential Causes]**\n${potentialCauses}\n\n` +
      `**[Home Management]**\n${homeManagement}\n\n` +
      `**[Action Plan]**\n${actionPlan}\n\n${disclaimer}`,
    disclaimer
  };
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NaijaHealth AI Medical Triage Service',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/facilities', (req: Request, res: Response) => {
  const state = req.query.state as string;
  if (state && NIGERIAN_STATES_DATA[state]) {
    return res.json({
      state,
      data: NIGERIAN_STATES_DATA[state]
    });
  }
  return res.json({
    states: Object.keys(NIGERIAN_STATES_DATA),
    nationalHotlines: NATIONAL_EMERGENCY_NUMBERS,
    redFlags: RED_FLAG_SYMPTOMS
  });
});

// Triage Evaluation Endpoint
app.post('/api/triage', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], userLocation } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Symptom description message is required.' });
    }

    // Safety check first: detect local red-flag triggers immediately
    const immediateSafetyCheck = detectLocalRedFlags(message);

    // Detect location from message or payload
    const detectedFromMsg = detectStateFromText(message);
    const targetState = userLocation?.state || detectedFromMsg || 'Lagos';
    const stateData = NIGERIAN_STATES_DATA[targetState] || NIGERIAN_STATES_DATA['Lagos'];
    const facilitiesList = stateData.facilities.map(f => `${f.name} in ${f.city}`).join(', ');

    // Fallback if AI SDK or key is not active
    if (!ai || !process.env.GEMINI_API_KEY) {
      console.log('Using rule-based triage fallback (GEMINI_API_KEY not configured or offline).');
      const fallbackResult = buildFallbackTriage(message, targetState);
      return res.json(fallbackResult);
    }

    // Build the system prompt strictly adhering to prompt guidelines
    const systemInstruction = `You are "NaijaHealth AI", an advanced, empathetic AI Medical Triage Assistant developed specifically to support communities across Nigeria.

YOUR ROLE:
Listen carefully to the user's symptoms, ask clarifying questions if details are missing, and provide clear, structured, and easy-to-understand health guidance.

CRITICAL LOGISTICS & ACCURACY ROUTING:
1. Identify the user's state or city within Nigeria when they provide it. If they mentioned or have selected state "${targetState}", tailor your facility routing directly to healthcare centres in ${targetState} (e.g., ${facilitiesList}).
2. Structure your response strictly into 3 concise parts:
   - [Potential Causes]: Explain common reasons for the symptoms simply, using local Nigerian phrasing if relevant (e.g., terms like "body pain", "purging", "typhoid/malaria awareness", fever patterns, cholera, sickle cell caution, respiratory flu).
   - [Home Management]: Provide safe, practical first-aid or home-care steps (e.g., exact Salt-Sugar Solution SSS/ORS recipe: 1 level tsp salt + 10 level tsp sugar in 1 liter clean water, tepid sponging with lukewarm water, bed rest under treated net, avoiding unprescribed antibiotics or toxic concoctions).
   - [Action Plan]: State exactly when and where they should seek physical care. Reference real General Hospitals, Federal Medical Centres (FMCs), or Teaching Hospitals in their Nigerian State (${targetState}).

CRITICAL SAFETY PROTOCOL:
- You are an AI assistant, NOT a medical doctor. Always include a brief disclaimer at the end.
- If the user describes red-flag symptoms (such as sharp chest pain, severe difficulty breathing, sudden half-body weakness or facial droop, heavy uncontrolled bleeding, loss of consciousness, convulsion, or severe unresponsiveness):
  * BYPASS ALL HOME REMEDIES completely.
  * Immediately and aggressively instruct them to visit the nearest General Hospital or comprehensive health center without delay.
  * Set isRedFlag to true and urgencyLevel to "emergency".
  * Provide the emergency hotlines: 112 (National Toll-free), 6232 (NCDC), and state hotlines.

TONE:
Empathetic, calm, respectful, culturally attuned to Nigeria. Ask 1-2 clarifying questions at the end if crucial details (duration, age, blood in stool/vomit, pregnancy) are not mentioned.`;

    const promptText = `User Location Context: State is ${targetState}.
Previous Conversation:
${conversationHistory.map((m: any) => `${m.role === 'user' ? 'Patient' : 'NaijaHealth AI'}: ${m.parts?.[0]?.text || m.text || ''}`).join('\n')}

Patient Symptom Description:
"${message}"

Evaluate this patient's symptoms thoroughly according to the NaijaHealth AI protocols.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRedFlag: {
              type: Type.BOOLEAN,
              description: 'True if symptoms describe red flags like sharp chest pain, severe difficulty breathing, sudden half-body weakness, heavy uncontrolled bleeding, convulsion, or unconsciousness.'
            },
            urgencyLevel: {
              type: Type.STRING,
              enum: ['emergency', 'urgent', 'routine'],
              description: 'Triage priority: emergency (immediate ER), urgent (visit clinic in 24h), routine (home care with clinic follow-up)'
            },
            emergencyWarning: {
              type: Type.STRING,
              description: 'Urgent red-flag alert directive if red-flag symptoms are present, otherwise empty'
            },
            potentialCauses: {
              type: Type.STRING,
              description: '[Potential Causes] explanation using simple terms and Nigerian phrasing where appropriate'
            },
            homeManagement: {
              type: Type.STRING,
              description: '[Home Management] Safe practical first-aid or home-care steps. Must be empty or say "Bypassed due to emergency" if isRedFlag is true.'
            },
            actionPlan: {
              type: Type.STRING,
              description: '[Action Plan] Exact timeline and specific Nigerian health facilities (General Hospital, FMC, or Teaching Hospital in their state) to visit'
            },
            clarifyingQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '1 to 3 short clarifying questions if critical info is missing'
            },
            recommendedFacilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific hospitals or clinics in the user state'
            },
            detectedLocation: {
              type: Type.STRING,
              description: 'State or city recognized'
            },
            fullFormattedResponse: {
              type: Type.STRING,
              description: 'Full markdown formatted response including [Potential Causes], [Home Management], [Action Plan], and disclaimer'
            },
            disclaimer: {
              type: Type.STRING,
              description: 'The AI triage disclaimer'
            }
          },
          required: ['isRedFlag', 'urgencyLevel', 'potentialCauses', 'homeManagement', 'actionPlan', 'fullFormattedResponse', 'disclaimer']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini.');
    }

    const parsedData = JSON.parse(responseText);

    // Double-check our programmatic safety override in case model missed an obvious red-flag:
    if (immediateSafetyCheck.isRedFlag) {
      parsedData.isRedFlag = true;
      parsedData.urgencyLevel = 'emergency';
      if (!parsedData.emergencyWarning) {
        parsedData.emergencyWarning = `CRITICAL RED FLAG DETECTED: Symptoms matching ${immediateSafetyCheck.matchedSymptom}. Immediate emergency hospital care is required.`;
      }
      parsedData.homeManagement = 'Bypassed. For red-flag emergency symptoms, do not waste time on home treatments. Transport immediately to an emergency care facility.';
    }

    if (!parsedData.detectedLocation) {
      parsedData.detectedLocation = targetState;
    }

    if (!parsedData.disclaimer) {
      parsedData.disclaimer = '⚠️ Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, please visit the nearest hospital or call 112 immediately.';
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error during triage processing:', error);
    // Graceful fallback to rule-based triage if API call errors
    const fallbackResult = buildFallbackTriage(req.body.message || '', req.body.userLocation?.state || 'Lagos');
    return res.json(fallbackResult);
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
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
    console.log(`NaijaHealth AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
