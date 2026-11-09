import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { NIGERIAN_STATES_DATA, RED_FLAG_SYMPTOMS, NATIONAL_EMERGENCY_NUMBERS } from './src/data/nigeriaHealthcareData';
import { SupportedLanguage } from './src/types/triage';

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
    { pattern: /(sharp|crushing|severe|tight|pressure|heavy).*(chest|heart)/i, name: 'Heavy Chest Pain / Heart Trouble' },
    { pattern: /(chest pain|pain in my chest|chest dey pain|chest dey tight|chest dey press|ciwon kirji|aya kirji|inu riro)/i, name: 'Heavy Chest Pain' },
    { pattern: /(cannot breathe|severe difficulty breathing|shortness of breath|gasping for air|struggling to breathe|blue lips|breath seize|breath hang|breath dey seize|suffocat|kasa numfashi|kasa hema|kukuru eemi)/i, name: 'Severe Breath Seize / Inability to Breathe' },
    { pattern: /(face droop|half body|one side.*(weak|paralyz)|slurred speech|sudden numbness|hand and leg no fit move|shanyewar jiki|apa kan ro)/i, name: 'Sudden Half-Body Weakness / Stroke Signs' },
    { pattern: /(heavy bleeding|uncontrolled bleeding|bleeding continuously|spurting blood|coughing.*blood|vomiting.*blood|heavy blood|blood dey rush|zubar jini|eje pupo)/i, name: 'Heavy Blood dey Rush / Uncontrolled Bleeding' },
    { pattern: /(convuls|seizure|fit|passed out|unconscious|fainted and not waking|coma|person faint|eye turn collapse|farfadiya|dandana|daku)/i, name: 'Loss of Consciousness / Person Faint' },
    { pattern: /(stiff neck.*fever|cannot bend neck|high fever.*hallucinat|neck strong.*hot body|tashin hankali)/i, name: 'Meningitis / Brain Infection Danger' }
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
  if (lower.includes('lag') || lower.includes('ikeja') || lower.includes('yaba') || lower.includes('lekki') || lower.includes('surulere') || lower.includes('ikorodu')) return 'Lagos';
  if (lower.includes('ph') || lower.includes('port harcourt') || lower.includes('pitakwa')) return 'Rivers';
  if (lower.includes('ibadan')) return 'Oyo';
  if (lower.includes('onitsha') || lower.includes('awka') || lower.includes('nnewi')) return 'Anambra';
  if (lower.includes('benin') || lower.includes('irrua')) return 'Edo';
  if (lower.includes('zaria') || lower.includes('kaduna')) return 'Kaduna';
  if (lower.includes('warri') || lower.includes('asaba')) return 'Delta';
  if (lower.includes('aba') || lower.includes('umuahia')) return 'Abia';
  if (lower.includes('jos')) return 'Plateau';
  if (lower.includes('kano')) return 'Kano';
  return undefined;
}

// Fallback rule-based triage supporting multilingual Nigerian communities
function buildFallbackTriage(message: string, stateName: string = 'Lagos', language: SupportedLanguage = 'pidgin'): any {
  const redFlag = detectLocalRedFlags(message);
  const stateData = NIGERIAN_STATES_DATA[stateName] || NIGERIAN_STATES_DATA['Lagos'];
  const topFacilities = stateData.facilities.map(f => `${f.name} (${f.city})`).slice(0, 3);
  
  let disclaimer = '⚠️ Abeg remember: I be NaijaHealth AI assistant o, I no be real medical doctor. If body no do you well or the matter tight, go meet doctor for hospital or call 112 sharp-sharp.';
  if (language === 'english') {
    disclaimer = '⚠️ Medical Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, visit the nearest hospital or call 112 immediately.';
  } else if (language === 'hausa') {
    disclaimer = '⚠️ Tunatarwa: Ni mataimakin AI ne (NaijaHealth AI), ba likita na gaskiya ba. Idan jiki yayi tsanani, tafi asibiti kusa da kai ko kira 112.';
  } else if (language === 'yoruba') {
    disclaimer = '⚠️ Ìkìlọ̀: Èmi jẹ́ olùrànlọ́wọ́ AI, mi kìí ṣe dọ́kítà gidi. Tí ara bá le koko, ẹ lọ sí ilé-ìwòsàn tàbí kí ẹ pe 112 lẹ́sẹ̀kẹsẹ̀.';
  } else if (language === 'igbo') {
    disclaimer = '⚠️ Rịba ama: Abụ m onye inyeaka AI, abụghị m ezigbo dọkịta. Ọ bụrụ na ahụ adịghị gị mma nke ukwuu, gaa ụlọ ọgwụ ma ọ bụ kpọọ 112 ugbu a.';
  }

  if (redFlag.isRedFlag) {
    let actionPlan = `🚨 EMERGENCY O! Abeg drop everything, no waste one second for house! Rush sharp-sharp go the nearest General Hospital or Emergency Trauma Centre for ${stateName} State now now!\n` +
      `Hospitals wey dey close to you:\n` +
      topFacilities.map(f => `• ${f}`).join('\n') +
      `\n\nCall 112 (National Toll-Free line) or ${stateData.emergencyHotlines.join(', ')} sharp-sharp! No drink any medicine or concoction for house, hospital be the only answer now!`;

    if (language === 'english') {
      actionPlan = `🚨 RED-FLAG EMERGENCY: Please bypass all home remedies and go IMMEDIATELY to the nearest General Hospital or Emergency Department in ${stateName}.\n` +
        `Nearby health centres:\n` + topFacilities.map(f => `• ${f}`).join('\n') +
        `\n\nCall 112 (National Emergency) or ${stateData.emergencyHotlines.join(', ')} immediately!`;
    } else if (language === 'hausa') {
      actionPlan = `🚨 GAGGAWA CE: Kada ka tsaya maganin gida! Yi maza-maza ka tafi Asibitin Gwamnati mafi kusa a jihar ${stateName} yanzu-yanzu!\n` +
        `Asibitocin da ke kusa da kai:\n` + topFacilities.map(f => `• ${f}`).join('\n') +
        `\n\nKira 112 (layin gaggawa na kasa) ba tare da bata lokaci ba!`;
    } else if (language === 'yoruba') {
      actionPlan = `🚨 PÀJÁWÌRÌ: Ẹ má ṣe oògùn ilé kankan! Ẹ yára sáré lọ sí Ilé-ìwòsàn Ìjọba tó súnmọ́ yín jùlọ ní Ìpínlẹ̀ ${stateName} lẹ́sẹ̀kẹsẹ̀!\n` +
        `Àwọn Ilé-ìwòsàn tó wà nítòsí:\n` + topFacilities.map(f => `• ${f}`).join('\n') +
        `\n\nẸ pe 112 lẹ́sẹ̀kẹsẹ̀!`;
    } else if (language === 'igbo') {
      actionPlan = `🚨 MBEREDE: Emela ọgwụ ụlọ ọ bụla! Gbaa ọsọ gaa na General Hospital kacha nso na steeti ${stateName} ugbu a!\n` +
        `Ụlọ ọgwụ ndị dị gị nso:\n` + topFacilities.map(f => `• ${f}`).join('\n') +
        `\n\nKpọọ 112 ozugbo!`;
    }

    return {
      language,
      urgencyLevel: 'emergency',
      isRedFlag: true,
      emergencyWarning: `🚨 DANGER DEY: Wetin you talk (${redFlag.matchedSymptom || 'this acute symptom'}) na dangerous red-flag emergency sign!`,
      empathyNote: `Ayaah! Sorry o, stay calm and rush go hospital now now!`,
      wetinFitDeyHappen: `This kind symptom fit mean say heart, breath, or serious blood condition dey happen wey doctor must check with machine immediately.`,
      wetinYouFitDoForHouse: `NO DO ANY HOUSE TREATMENT! All home remedies cancel. Loosen tight cloth, sit down calmly, and let somebody carry you run go hospital now.`,
      nextStep: actionPlan,
      potentialCauses: `Severe acute emergency requiring urgent hospital evaluation.`,
      homeManagement: `Bypassed for emergency. Rush to hospital.`,
      actionPlan,
      recommendedFacilities: topFacilities,
      detectedLocation: stateName,
      clarifyingQuestions: [],
      fullFormattedResponse: `🚨 EMERGENCY ALERT!\n\n` +
        `**[Wetin Fit Dey Happen]**\nAcute red-flag emergency requiring hospital resuscitation and monitoring.\n\n` +
        `**[Wetin You Fit Do For House]**\nCANCELLED. Rush to emergency unit.\n\n` +
        `**[Next Step]**\n${actionPlan}\n\n${disclaimer}`,
      disclaimer
    };
  }

  // Common condition heuristics
  const lower = message.toLowerCase();
  let wetinFitDeyHappen = '';
  let wetinYouFitDoForHouse = '';
  let nextStep = '';
  let clarifyingQuestions: string[] = [];

  if (lower.includes('fever') || lower.includes('hot body') || lower.includes('chills') || lower.includes('bitter') || lower.includes('zazzabi') || lower.includes('iba')) {
    if (language === 'english') {
      wetinFitDeyHappen = `High fever with body pain and bitter taste is commonly caused in Nigeria by Malaria (transmitted by female Anopheles mosquitoes) or Typhoid fever. It can also be viral flu.`;
      wetinYouFitDoForHouse = `1. Tepid sponging with lukewarm water (never cold water or alcohol/spirit) to bring fever down.\n2. Drink plenty of clean boiled water or fresh juice.\n3. Sleep under an insecticide-treated mosquito net.\n4. Paracetamol can be taken according to package directions for relief.`;
      nextStep = `Get a rapid malaria test (mRDT) or typhoid test at a nearby certified medical laboratory or clinic before taking antimalarials. Visit ${topFacilities[0]} if fever persists past 48 hours or vomiting occurs.`;
      clarifyingQuestions = [
        'How many days have you had this fever?',
        'Are you experiencing any vomiting or tea-coloured urine?'
      ];
    } else if (language === 'hausa') {
      wetinFitDeyHappen = `Sannu! Zazzabi mai zafi tare da ciwon jiki yawanci alamomin cutar zazzabin cizon sauro (Malaria) ne ko Typhoid daga ruwa ko abinci maras tsabta.`;
      wetinYouFitDoForHouse = `1. Yi amfani da kyallen da aka jika a ruwa mara sanyi don goge goshi da jiki.\n2. Sha ruwa mai tsabta sosai.\n3. Kwana a cikin gidan sauro mai magani.`;
      nextStep = `Je cibiyar lafiya mafi kusa don gwajin Malaria (mRDT) kafin shan magani. Idan zazzabi ya wuce kwanaki biyu, tafi ${topFacilities[0]} nan take.`;
      clarifyingQuestions = ['Kwana nawa jiki ke zafi?', 'Akwai amai ko canjin launin fitsari?'];
    } else if (language === 'yoruba') {
      wetinFitDeyHappen = `Pẹlẹ o! Ìbà gbígbóná pẹ̀lú ara ríro sábà máa ń jẹ́ àmì Iba (Malaria) láti ara ẹ̀fọn tàbí Iba Tàífọ́ọ̀dù.`;
      wetinYouFitDoForHouse = `1. Fi aṣọ tútù (omi lásán, kìí ṣe omi yìnyín) nu iwaju ati ara lati dinku igbona ara.\n2. Mu omi mimọ ti a bọ daradara.\n3. Sun labẹ àwọ̀n ẹ̀fọn.`;
      nextStep = `Lọ ṣe àyẹ̀wò ẹ̀jẹ̀ fun iba (RDT) ni ile-iwosan to wa nitosi. Ti iba ba kọja ọjọ meji, lọ si ${topFacilities[0]} lẹsẹkẹsẹ.`;
      clarifyingQuestions = ['Ọjọ́ mélòó ni ara ti ń gbóná?', 'Ṣé o ń bì tàbí tọ́ yí padà sí àwọ̀ tii?'];
    } else {
      wetinFitDeyHappen = `Pele o! This kind hot body, body pain, and mouth wey dey bitter na normal sign of Malaria (from female Anopheles mosquito bite) or Typhoid fever (from dirty water or food). E fit still be common flu.`;
      wetinYouFitDoForHouse = `1. Use clean towel and ordinary lukewarm water (no use cold water or spirit) clean the forehead, armpit, and neck make hotness come down.\n2. Drink plenty clean boiled water or fresh orange juice.\n3. Sleep under insecticide-treated mosquito net.\n4. Paracetamol fit calm the body pain.`;
      nextStep = `Waka go do Malaria RDT test for nearby clinic before you buy malaria medicine. If the fever pass 2 days, or you dey vomit everything, waka go ${topFacilities[0]} sharp-sharp.`;
      clarifyingQuestions = [
        'Pele, how many days the hot body and body pain don dey do you?',
        'You dey vomit or your urine dey yellow/brown like tea?'
      ];
    }
  } else if (lower.includes('purg') || lower.includes('stool') || lower.includes('watery') || lower.includes('belly') || lower.includes('zawo') || lower.includes('igbe')) {
    if (language === 'english') {
      wetinFitDeyHappen = `Stomach cramping and watery stool (purging) indicates acute gastroenteritis, often caused by contaminated food, bacteria, or seasonal cholera.`;
      wetinYouFitDoForHouse = `1. Prepare Oral Rehydration Salt (ORS / Salt-Sugar Solution): Mix 1 level teaspoon salt + 10 level teaspoons sugar (or 5 cubes) in 1 litre clean boiled water.\n2. Drink one cup after every loose stool.\n3. Eat light bland foods like rice, pap (akamu), or bananas.\n4. Avoid raw vegetables, street food, and sugary soda.`;
      nextStep = `Visit ${topFacilities[0]} or your nearest clinic if purging exceeds 5 times in 24 hours, if there is blood in stool, or if you feel dizzy upon standing.`;
      clarifyingQuestions = ['Is there any blood in the stool?', 'Can you hold fluids without vomiting?'];
    } else if (language === 'hausa') {
      wetinFitDeyHappen = `Zawo da ciwon ciki na faruwa ne idan kwayoyin cuta sun shiga ciki ta hanyar abinci ko ruwa maras tsabta.`;
      wetinYouFitDoForHouse = `1. Hada ruwan gishiri da sukari (ORS): Karamin cokali daya na gishiri da cokula goma na sukari a cikin lita daya ta ruwa mai tsabta.\n2. Sha kofi daya a duk lokacin da aka yi zawo.\n3. Ci abinci mai laushi kamar koko.`;
      nextStep = `Idan zawo ya wuce sau 5 a rana daya ko akwai jini a bayan gida, tafi ${topFacilities[0]} ba tare da bata lokaci ba.`;
      clarifyingQuestions = ['Akwai jini a cikin zawon?', 'Kana iya rike ruwa a ciki ba tare da amai ba?'];
    } else if (language === 'yoruba') {
      wetinFitDeyHappen = `Àrùn gbuuru (ìgbẹ́ gbuuru) ati inu rírun sábà máa ń wá láti ara oúnjẹ tàbí omi tí kò mọ́.`;
      wetinYouFitDoForHouse = `1. Mu omi iyọ ati suga (ORS): Sibi iyọ kekere 1 ati sibi suga 10 sinu lita omi mimọ kan.\n2. Mu ife kan lẹhin igbẹ kọọkan.\n3. Jẹ ounjẹ fẹlẹfẹlẹ bii èkọ (ògì).`;
      nextStep = `Tí ìgbẹ́ gbuuru bá ju ẹ̀ẹ̀mẹ́fà lọ lójúmọ́ kan tàbí ẹ̀jẹ̀ wà nínú rẹ̀, ẹ lọ sí ${topFacilities[0]} kíá.`;
      clarifyingQuestions = ['Ṣé ẹ̀jẹ̀ wà nínú ìgbẹ́ náà?', 'Ṣé o lè mu omi láì bì?'];
    } else {
      wetinFitDeyHappen = `Ayaah, sorry o! When belle dey bite and person dey purge watery stool, e fit be say dirty germ, bad food, or contaminated water don enter belly (gastroenteritis). During rainy season, e fit even be cholera warning.`;
      wetinYouFitDoForHouse = `1. Mix Salt-Sugar Solution (Home ORS): Measure 1 clean bottle of water (or 2 pure water sachets), put 1 level small spoon of salt plus 10 level small spoon of sugar (or 5 cubes). Turn am well make e melt.\n2. Drink one full cup every time you go toilet purge.\n3. Eat soft pap (akamu) or boiled rice in small quantity.\n4. Avoid soft drinks or roadside food now.`;
      nextStep = `If the purging pass 5 to 6 times inside one day, or you see blood inside the stool, move go ${topFacilities[0]} or any clinic close to you immediately.`;
      clarifyingQuestions = [
        'Ehya, blood dey inside the watery stool?',
        'You fit hold water or ORS for stomach, abi you dey vomit am out?'
      ];
    }
  } else {
    wetinFitDeyHappen = `Ehya, pele o! The way your body dey do you fit be from heavy stress, body tiredness, or early sign say infection or malaria dey try enter body.`;
    wetinYouFitDoForHouse = `1. Rest well-well for room wey breeze dey blow.\n2. Drink plenty clean water make your system cool down.\n3. Watch your body make you see if hot body or headache go join am.`;
    nextStep = `If the body pain or weakness no gree stop after 24 to 48 hours, waka go see nurse or doctor for ${topFacilities[0]} or your nearest General Hospital.`;
    clarifyingQuestions = [
      'How long this body weakness or pain don start?',
      'You get any condition before, like blood pressure, ulcer, or sickle cell?'
    ];
  }

  return {
    language,
    urgencyLevel: 'urgent',
    isRedFlag: false,
    empathyNote: language === 'hausa' ? 'Sannu! Allah Ya sauwake.' : language === 'yoruba' ? 'Pẹlẹ o! Ẹ jẹ́ k\'á bójútó e.' : language === 'english' ? 'So sorry to hear about this.' : 'Pele o! Take am easy, make I break down wetin you fit do.',
    wetinFitDeyHappen,
    wetinYouFitDoForHouse,
    nextStep,
    potentialCauses: wetinFitDeyHappen,
    homeManagement: wetinYouFitDoForHouse,
    actionPlan: nextStep,
    clarifyingQuestions,
    recommendedFacilities: topFacilities,
    detectedLocation: stateName,
    fullFormattedResponse: `💚\n\n` +
      `**[Wetin Fit Dey Happen]**\n${wetinFitDeyHappen}\n\n` +
      `**[Wetin You Fit Do For House]**\n${wetinYouFitDoForHouse}\n\n` +
      `**[Next Step]**\n${nextStep}\n\n${disclaimer}`,
    disclaimer
  };
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NaijaHealth AI Medical Triage Service (Multilingual Edition)',
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

// Triage Evaluation Endpoint supporting Language selection
app.post('/api/triage', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], userLocation, language = 'pidgin' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Symptom description message is required.' });
    }

    const targetLang: SupportedLanguage = ['pidgin', 'english', 'hausa', 'yoruba', 'igbo'].includes(language) 
      ? language 
      : 'pidgin';

    // Safety check first: detect local red-flag triggers immediately
    const immediateSafetyCheck = detectLocalRedFlags(message);

    // Detect location from message or payload
    const detectedFromMsg = detectStateFromText(message);
    const targetState = userLocation?.state || detectedFromMsg || 'Lagos';
    const stateData = NIGERIAN_STATES_DATA[targetState] || NIGERIAN_STATES_DATA['Lagos'];
    const facilitiesList = stateData.facilities.map(f => `${f.name} inside ${f.city}`).join(', ');

    // If red flag is triggered, respond immediately without delay!
    if (immediateSafetyCheck.isRedFlag) {
      console.log('Immediate red-flag detected. Dispatching emergency triage without waiting.');
      const emergencyResult = buildFallbackTriage(message, targetState, targetLang);
      return res.json(emergencyResult);
    }

    // Fallback if AI SDK or key is not active or placeholder
    const isApiKeyValid = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
    if (!ai || !isApiKeyValid) {
      console.log(`Using rule-based triage fallback in ${targetLang} (API key unconfigured).`);
      const fallbackResult = buildFallbackTriage(message, targetState, targetLang);
      return res.json(fallbackResult);
    }

    // Define Language guidelines for the model
    let langInstruction = `You MUST reply strictly and entirely in fluent, natural Nigerian Pidgin English. Use comforting words like "Ayaah", "Pele", "Sorry o". Section titles: [Wetin Fit Dey Happen], [Wetin You Fit Do For House], [Next Step].`;
    if (targetLang === 'english') {
      langInstruction = `You MUST reply in simple, clear, empathetic everyday English. Avoid complex medical jargon so ordinary people easily understand. Section titles: [Potential Causes], [Home Management], [Action Plan].`;
    } else if (targetLang === 'hausa') {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Hausa (Harshen Hausa). Use comforting words like "Sannu", "Allah Ya sauwake". Section titles: [Abubuwan Da Ka Iya Kawo Shi], [Maganin Gida / Abinda Zaka Iya Yi A Gida], [Mataki Na Gaba / Asibiti].`;
    } else if (targetLang === 'yoruba') {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Yoruba (Èdè Yorùbá). Use comforting words like "Pẹlẹ o", "Ẹ má binu". Section titles: [Kini O Le Fa E], [Ohun Ti O Le Se Ni Ile], [Igbese To Kan / Ile Iwosan].`;
    } else if (targetLang === 'igbo') {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Igbo (Asụsụ Igbo). Use comforting words like "Ndo", "Ndewo". Section titles: [Ihe Nwere Ike Na-ebute Ya], [Ihe I Nwere Ike Ime n'Ulo], [Ihe I Ga-eme Na-esonụ / Hospital].`;
    }

    const systemInstruction = `You are "NaijaHealth AI", an empathetic medical triage assistant inside WhatsApp and conversational chat, made specially to support communities across Nigeria.
Selected Language: ${targetLang.toUpperCase()}.
${langInstruction}

HOW YOU GO DEY TALK:
- Clear your mind of big big medical grammar and medical English jargon. Explain everything break-down style make ordinary person for market understand easily.
- Show serious empathy and bedside warmth.
- If watery stool or diarrhea, mention "purging".
- If fever, explain hot body and malaria (mosquito bites) / typhoid awareness.
- If dehydration, give exact Salt-Sugar Solution (ORS) ratio: 1 level small tea-spoon salt + 10 level small tea-spoon sugar (or 5 sugar cubes) in 1 clean bottle or 2 pure water sachets (1 litre).

YOUR STRICT RESPONSE STRUCTURE:
1. [Wetin Fit Dey Happen] / [Potential Causes]: Explain symptoms softly.
2. [Wetin You Fit Do For House] / [Home Management]: Safe first-aid and home steps. Warn against unprescribed antibiotics or toxic concoctions.
3. [Next Step] / [Action Plan]: Exact conditions and facilities to visit in their state (${targetState}) such as: ${facilitiesList}.

SAFETY RULES (NO DEY JOKE WITH THIS ONE):
- Continuous reminder say you be AI assistant, not a real doctor.
- IF RED-FLAG EMERGENCY (heavy chest pain, breath seize/hang, sudden stroke signs, heavy blood rush, person faint/unconscious):
  * DROP ALL HOME REMEDY TALK COMPLETELY!
  * Instruct them aggressively to rush to the nearest emergency ward in ${targetState} immediately!
  * Set isRedFlag to true and urgencyLevel to "emergency".
  * Mention National 112, NCDC 6232, and state hotlines.`;

    const promptText = `User Location Context: Patient is in ${targetState} State, Nigeria. Language requested: ${targetLang}.
Previous Chat History:
${conversationHistory.map((m: any) => `${m.role === 'user' ? 'Patient' : 'NaijaHealth AI'}: ${m.parts?.[0]?.text || m.text || ''}`).join('\n')}

Patient Symptoms:
"${message}"

Evaluate this patient's symptoms thoroughly in ${targetLang} following the 3-part triage structure.`;

    const generatePromise = ai.models.generateContent({
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
              description: 'True if symptoms describe dangerous red flags like chest pain, breath seize, sudden stroke weakness, heavy bleeding, or unconsciousness.'
            },
            urgencyLevel: {
              type: Type.STRING,
              enum: ['emergency', 'urgent', 'routine'],
              description: 'Triage priority level'
            },
            empathyNote: {
              type: Type.STRING,
              description: 'Warm comforting opening in chosen language'
            },
            emergencyWarning: {
              type: Type.STRING,
              description: 'Direct aggressive alert in chosen language if red-flag is triggered, else empty'
            },
            wetinFitDeyHappen: {
              type: Type.STRING,
              description: 'Part 1: Simple breakdown in chosen language without big medical grammar'
            },
            wetinYouFitDoForHouse: {
              type: Type.STRING,
              description: 'Part 2: Safe first-aid and home steps in chosen language. MUST be empty or say home remedy cancelled if isRedFlag is true.'
            },
            nextStep: {
              type: Type.STRING,
              description: 'Part 3: When and which hospital to visit inside their state in chosen language'
            },
            clarifyingQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '1 to 2 short clarifying questions in chosen language if details are missing'
            },
            recommendedFacilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Names of recommended hospitals in their state'
            },
            detectedLocation: {
              type: Type.STRING,
              description: 'State or city inside Nigeria'
            },
            fullFormattedResponse: {
              type: Type.STRING,
              description: 'Complete formatted response strictly in the chosen language with the 3 parts and disclaimer'
            },
            disclaimer: {
              type: Type.STRING,
              description: 'Disclaimer in the chosen language'
            }
          },
          required: ['isRedFlag', 'urgencyLevel', 'wetinFitDeyHappen', 'wetinYouFitDoForHouse', 'nextStep', 'fullFormattedResponse', 'disclaimer']
        }
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI response timed out')), 7000);
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini.');
    }

    const parsedData = JSON.parse(responseText);

    parsedData.language = targetLang;
    parsedData.potentialCauses = parsedData.wetinFitDeyHappen;
    parsedData.homeManagement = parsedData.wetinYouFitDoForHouse;
    parsedData.actionPlan = parsedData.nextStep;

    // Double-check our programmatic safety override
    if (immediateSafetyCheck.isRedFlag) {
      parsedData.isRedFlag = true;
      parsedData.urgencyLevel = 'emergency';
      parsedData.wetinYouFitDoForHouse = 'All house remedies cancelled! Rush sharp-sharp go emergency unit for hospital.';
      parsedData.homeManagement = parsedData.wetinYouFitDoForHouse;
    }

    if (!parsedData.detectedLocation) {
      parsedData.detectedLocation = targetState;
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error during triage processing:', error);
    const fallbackResult = buildFallbackTriage(req.body.message || '', req.body.userLocation?.state || 'Lagos', req.body.language || 'pidgin');
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
    console.log(`NaijaHealth AI server (Multilingual Edition) running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
