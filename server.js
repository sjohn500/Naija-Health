import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { NIGERIAN_STATES_DATA, RED_FLAG_SYMPTOMS, NATIONAL_EMERGENCY_NUMBERS } from "./src/data/nigeriaHealthcareData";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "2mb" }));
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function detectLocalRedFlags(text) {
  const lower = text.toLowerCase();
  const redFlagPatterns = [
    { pattern: /(sharp|crushing|severe|tight|pressure|heavy).*(chest|heart)/i, name: "Heavy Chest Pain / Heart Trouble" },
    { pattern: /(chest pain|pain in my chest|chest dey pain|chest dey tight|chest dey press|ciwon kirji|aya kirji|inu riro)/i, name: "Heavy Chest Pain" },
    { pattern: /(cannot breathe|severe difficulty breathing|shortness of breath|gasping for air|struggling to breathe|blue lips|breath seize|breath hang|breath dey seize|suffocat|kasa numfashi|kasa hema|kukuru eemi)/i, name: "Severe Breath Seize / Inability to Breathe" },
    { pattern: /(face droop|half body|one side.*(weak|paralyz)|slurred speech|sudden numbness|hand and leg no fit move|shanyewar jiki|apa kan ro)/i, name: "Sudden Half-Body Weakness / Stroke Signs" },
    { pattern: /(heavy bleeding|uncontrolled bleeding|bleeding continuously|spurting blood|coughing.*blood|vomiting.*blood|heavy blood|blood dey rush|zubar jini|eje pupo)/i, name: "Heavy Blood dey Rush / Uncontrolled Bleeding" },
    { pattern: /(convuls|seizure|fit|passed out|unconscious|fainted and not waking|coma|person faint|eye turn collapse|farfadiya|dandana|daku)/i, name: "Loss of Consciousness / Person Faint" },
    { pattern: /(stiff neck.*fever|cannot bend neck|high fever.*hallucinat|neck strong.*hot body|tashin hankali)/i, name: "Meningitis / Brain Infection Danger" }
  ];
  for (const item of redFlagPatterns) {
    if (item.pattern.test(lower)) {
      return { isRedFlag: true, matchedSymptom: item.name };
    }
  }
  return { isRedFlag: false };
}
function detectStateFromText(text) {
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
  if (lower.includes("abuja") || lower.includes("fct")) return "FCT - Abuja";
  if (lower.includes("lag") || lower.includes("ikeja") || lower.includes("yaba") || lower.includes("lekki") || lower.includes("surulere") || lower.includes("ikorodu")) return "Lagos";
  if (lower.includes("ph") || lower.includes("port harcourt") || lower.includes("pitakwa")) return "Rivers";
  if (lower.includes("ibadan")) return "Oyo";
  if (lower.includes("onitsha") || lower.includes("awka") || lower.includes("nnewi")) return "Anambra";
  if (lower.includes("benin") || lower.includes("irrua")) return "Edo";
  if (lower.includes("zaria") || lower.includes("kaduna")) return "Kaduna";
  if (lower.includes("warri") || lower.includes("asaba")) return "Delta";
  if (lower.includes("aba") || lower.includes("umuahia")) return "Abia";
  if (lower.includes("jos")) return "Plateau";
  if (lower.includes("kano")) return "Kano";
  return void 0;
}
function buildFallbackTriage(message, stateName = "Lagos", language = "pidgin") {
  const redFlag = detectLocalRedFlags(message);
  const stateData = NIGERIAN_STATES_DATA[stateName] || NIGERIAN_STATES_DATA["Lagos"];
  const topFacilities = stateData.facilities.map((f) => `${f.name} (${f.city})`).slice(0, 3);
  let disclaimer = "\u26A0\uFE0F Abeg remember: I be NaijaHealth AI assistant o, I no be real medical doctor. If body no do you well or the matter tight, go meet doctor for hospital or call 112 sharp-sharp.";
  if (language === "english") {
    disclaimer = "\u26A0\uFE0F Medical Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, visit the nearest hospital or call 112 immediately.";
  } else if (language === "hausa") {
    disclaimer = "\u26A0\uFE0F Tunatarwa: Ni mataimakin AI ne (NaijaHealth AI), ba likita na gaskiya ba. Idan jiki yayi tsanani, tafi asibiti kusa da kai ko kira 112.";
  } else if (language === "yoruba") {
    disclaimer = "\u26A0\uFE0F \xCCk\xECl\u1ECD\u0300: \xC8mi j\u1EB9\u0301 ol\xF9r\xE0nl\u1ECD\u0301w\u1ECD\u0301 AI, mi k\xEC\xED \u1E63e d\u1ECD\u0301k\xEDt\xE0 gidi. T\xED ara b\xE1 le koko, \u1EB9 l\u1ECD s\xED il\xE9-\xECw\xF2s\xE0n t\xE0b\xED k\xED \u1EB9 pe 112 l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300.";
  } else if (language === "igbo") {
    disclaimer = "\u26A0\uFE0F R\u1ECBba ama: Ab\u1EE5 m onye inyeaka AI, ab\u1EE5gh\u1ECB m ezigbo d\u1ECDk\u1ECBta. \u1ECC b\u1EE5r\u1EE5 na ah\u1EE5 ad\u1ECBgh\u1ECB g\u1ECB mma nke ukwuu, gaa \u1EE5l\u1ECD \u1ECDgw\u1EE5 ma \u1ECD b\u1EE5 kp\u1ECD\u1ECD 112 ugbu a.";
  }
  if (redFlag.isRedFlag) {
    let actionPlan = `\u{1F6A8} EMERGENCY O! Abeg drop everything, no waste one second for house! Rush sharp-sharp go the nearest General Hospital or Emergency Trauma Centre for ${stateName} State now now!
Hospitals wey dey close to you:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

Call 112 (National Toll-Free line) or ${stateData.emergencyHotlines.join(", ")} sharp-sharp! No drink any medicine or concoction for house, hospital be the only answer now!`;
    if (language === "english") {
      actionPlan = `\u{1F6A8} RED-FLAG EMERGENCY: Please bypass all home remedies and go IMMEDIATELY to the nearest General Hospital or Emergency Department in ${stateName}.
Nearby health centres:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

Call 112 (National Emergency) or ${stateData.emergencyHotlines.join(", ")} immediately!`;
    } else if (language === "hausa") {
      actionPlan = `\u{1F6A8} GAGGAWA CE: Kada ka tsaya maganin gida! Yi maza-maza ka tafi Asibitin Gwamnati mafi kusa a jihar ${stateName} yanzu-yanzu!
Asibitocin da ke kusa da kai:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

Kira 112 (layin gaggawa na kasa) ba tare da bata lokaci ba!`;
    } else if (language === "yoruba") {
      actionPlan = `\u{1F6A8} P\xC0J\xC1W\xCCR\xCC: \u1EB8 m\xE1 \u1E63e o\xF2g\xF9n il\xE9 kankan! \u1EB8 y\xE1ra s\xE1r\xE9 l\u1ECD s\xED Il\xE9-\xECw\xF2s\xE0n \xCCj\u1ECDba t\xF3 s\xFAnm\u1ECD\u0301 y\xEDn j\xF9l\u1ECD n\xED \xCCp\xEDnl\u1EB9\u0300 ${stateName} l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300!
\xC0w\u1ECDn Il\xE9-\xECw\xF2s\xE0n t\xF3 w\xE0 n\xEDt\xF2s\xED:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

\u1EB8 pe 112 l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300!`;
    } else if (language === "igbo") {
      actionPlan = `\u{1F6A8} MBEREDE: Emela \u1ECDgw\u1EE5 \u1EE5l\u1ECD \u1ECD b\u1EE5la! Gbaa \u1ECDs\u1ECD gaa na General Hospital kacha nso na steeti ${stateName} ugbu a!
\u1EE4l\u1ECD \u1ECDgw\u1EE5 nd\u1ECB d\u1ECB g\u1ECB nso:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

Kp\u1ECD\u1ECD 112 ozugbo!`;
    }
    return {
      language,
      urgencyLevel: "emergency",
      isRedFlag: true,
      emergencyWarning: `\u{1F6A8} DANGER DEY: Wetin you talk (${redFlag.matchedSymptom || "this acute symptom"}) na dangerous red-flag emergency sign!`,
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
      fullFormattedResponse: `\u{1F6A8} EMERGENCY ALERT!

**[Wetin Fit Dey Happen]**
Acute red-flag emergency requiring hospital resuscitation and monitoring.

**[Wetin You Fit Do For House]**
CANCELLED. Rush to emergency unit.

**[Next Step]**
${actionPlan}

${disclaimer}`,
      disclaimer
    };
  }
  const lower = message.toLowerCase();
  let wetinFitDeyHappen = "";
  let wetinYouFitDoForHouse = "";
  let nextStep = "";
  let clarifyingQuestions = [];
  if (lower.includes("fever") || lower.includes("hot body") || lower.includes("chills") || lower.includes("bitter") || lower.includes("zazzabi") || lower.includes("iba")) {
    if (language === "english") {
      wetinFitDeyHappen = `High fever with body pain and bitter taste is commonly caused in Nigeria by Malaria (transmitted by female Anopheles mosquitoes) or Typhoid fever. It can also be viral flu.`;
      wetinYouFitDoForHouse = `1. Tepid sponging with lukewarm water (never cold water or alcohol/spirit) to bring fever down.
2. Drink plenty of clean boiled water or fresh juice.
3. Sleep under an insecticide-treated mosquito net.
4. Paracetamol can be taken according to package directions for relief.`;
      nextStep = `Get a rapid malaria test (mRDT) or typhoid test at a nearby certified medical laboratory or clinic before taking antimalarials. Visit ${topFacilities[0]} if fever persists past 48 hours or vomiting occurs.`;
      clarifyingQuestions = [
        "How many days have you had this fever?",
        "Are you experiencing any vomiting or tea-coloured urine?"
      ];
    } else if (language === "hausa") {
      wetinFitDeyHappen = `Sannu! Zazzabi mai zafi tare da ciwon jiki yawanci alamomin cutar zazzabin cizon sauro (Malaria) ne ko Typhoid daga ruwa ko abinci maras tsabta.`;
      wetinYouFitDoForHouse = `1. Yi amfani da kyallen da aka jika a ruwa mara sanyi don goge goshi da jiki.
2. Sha ruwa mai tsabta sosai.
3. Kwana a cikin gidan sauro mai magani.`;
      nextStep = `Je cibiyar lafiya mafi kusa don gwajin Malaria (mRDT) kafin shan magani. Idan zazzabi ya wuce kwanaki biyu, tafi ${topFacilities[0]} nan take.`;
      clarifyingQuestions = ["Kwana nawa jiki ke zafi?", "Akwai amai ko canjin launin fitsari?"];
    } else if (language === "yoruba") {
      wetinFitDeyHappen = `P\u1EB9l\u1EB9 o! \xCCb\xE0 gb\xEDgb\xF3n\xE1 p\u1EB9\u0300l\xFA ara r\xEDro s\xE1b\xE0 m\xE1a \u0144 j\u1EB9\u0301 \xE0m\xEC Iba (Malaria) l\xE1ti ara \u1EB9\u0300f\u1ECDn t\xE0b\xED Iba T\xE0\xEDf\u1ECD\u0301\u1ECD\u0300d\xF9.`;
      wetinYouFitDoForHouse = `1. Fi a\u1E63\u1ECD t\xFAt\xF9 (omi l\xE1s\xE1n, k\xEC\xED \u1E63e omi y\xECny\xEDn) nu iwaju ati ara lati dinku igbona ara.
2. Mu omi mim\u1ECD ti a b\u1ECD daradara.
3. Sun lab\u1EB9 \xE0w\u1ECD\u0300n \u1EB9\u0300f\u1ECDn.`;
      nextStep = `L\u1ECD \u1E63e \xE0y\u1EB9\u0300w\xF2 \u1EB9\u0300j\u1EB9\u0300 fun iba (RDT) ni ile-iwosan to wa nitosi. Ti iba ba k\u1ECDja \u1ECDj\u1ECD meji, l\u1ECD si ${topFacilities[0]} l\u1EB9s\u1EB9k\u1EB9s\u1EB9.`;
      clarifyingQuestions = ["\u1ECCj\u1ECD\u0301 m\xE9l\xF2\xF3 ni ara ti \u0144 gb\xF3n\xE1?", "\u1E62\xE9 o \u0144 b\xEC t\xE0b\xED t\u1ECD\u0301 y\xED pad\xE0 s\xED \xE0w\u1ECD\u0300 tii?"];
    } else {
      wetinFitDeyHappen = `Pele o! This kind hot body, body pain, and mouth wey dey bitter na normal sign of Malaria (from female Anopheles mosquito bite) or Typhoid fever (from dirty water or food). E fit still be common flu.`;
      wetinYouFitDoForHouse = `1. Use clean towel and ordinary lukewarm water (no use cold water or spirit) clean the forehead, armpit, and neck make hotness come down.
2. Drink plenty clean boiled water or fresh orange juice.
3. Sleep under insecticide-treated mosquito net.
4. Paracetamol fit calm the body pain.`;
      nextStep = `Waka go do Malaria RDT test for nearby clinic before you buy malaria medicine. If the fever pass 2 days, or you dey vomit everything, waka go ${topFacilities[0]} sharp-sharp.`;
      clarifyingQuestions = [
        "Pele, how many days the hot body and body pain don dey do you?",
        "You dey vomit or your urine dey yellow/brown like tea?"
      ];
    }
  } else if (lower.includes("purg") || lower.includes("stool") || lower.includes("watery") || lower.includes("belly") || lower.includes("zawo") || lower.includes("igbe")) {
    if (language === "english") {
      wetinFitDeyHappen = `Stomach cramping and watery stool (purging) indicates acute gastroenteritis, often caused by contaminated food, bacteria, or seasonal cholera.`;
      wetinYouFitDoForHouse = `1. Prepare Oral Rehydration Salt (ORS / Salt-Sugar Solution): Mix 1 level teaspoon salt + 10 level teaspoons sugar (or 5 cubes) in 1 litre clean boiled water.
2. Drink one cup after every loose stool.
3. Eat light bland foods like rice, pap (akamu), or bananas.
4. Avoid raw vegetables, street food, and sugary soda.`;
      nextStep = `Visit ${topFacilities[0]} or your nearest clinic if purging exceeds 5 times in 24 hours, if there is blood in stool, or if you feel dizzy upon standing.`;
      clarifyingQuestions = ["Is there any blood in the stool?", "Can you hold fluids without vomiting?"];
    } else if (language === "hausa") {
      wetinFitDeyHappen = `Zawo da ciwon ciki na faruwa ne idan kwayoyin cuta sun shiga ciki ta hanyar abinci ko ruwa maras tsabta.`;
      wetinYouFitDoForHouse = `1. Hada ruwan gishiri da sukari (ORS): Karamin cokali daya na gishiri da cokula goma na sukari a cikin lita daya ta ruwa mai tsabta.
2. Sha kofi daya a duk lokacin da aka yi zawo.
3. Ci abinci mai laushi kamar koko.`;
      nextStep = `Idan zawo ya wuce sau 5 a rana daya ko akwai jini a bayan gida, tafi ${topFacilities[0]} ba tare da bata lokaci ba.`;
      clarifyingQuestions = ["Akwai jini a cikin zawon?", "Kana iya rike ruwa a ciki ba tare da amai ba?"];
    } else if (language === "yoruba") {
      wetinFitDeyHappen = `\xC0r\xF9n gbuuru (\xECgb\u1EB9\u0301 gbuuru) ati inu r\xEDrun s\xE1b\xE0 m\xE1a \u0144 w\xE1 l\xE1ti ara o\xFAnj\u1EB9 t\xE0b\xED omi t\xED k\xF2 m\u1ECD\u0301.`;
      wetinYouFitDoForHouse = `1. Mu omi iy\u1ECD ati suga (ORS): Sibi iy\u1ECD kekere 1 ati sibi suga 10 sinu lita omi mim\u1ECD kan.
2. Mu ife kan l\u1EB9hin igb\u1EB9 k\u1ECD\u1ECDkan.
3. J\u1EB9 ounj\u1EB9 f\u1EB9l\u1EB9f\u1EB9l\u1EB9 bii \xE8k\u1ECD (\xF2g\xEC).`;
      nextStep = `T\xED \xECgb\u1EB9\u0301 gbuuru b\xE1 ju \u1EB9\u0300\u1EB9\u0300m\u1EB9\u0301f\xE0 l\u1ECD l\xF3j\xFAm\u1ECD\u0301 kan t\xE0b\xED \u1EB9\u0300j\u1EB9\u0300 w\xE0 n\xEDn\xFA r\u1EB9\u0300, \u1EB9 l\u1ECD s\xED ${topFacilities[0]} k\xED\xE1.`;
      clarifyingQuestions = ["\u1E62\xE9 \u1EB9\u0300j\u1EB9\u0300 w\xE0 n\xEDn\xFA \xECgb\u1EB9\u0301 n\xE1\xE0?", "\u1E62\xE9 o l\xE8 mu omi l\xE1\xEC b\xEC?"];
    } else {
      wetinFitDeyHappen = `Ayaah, sorry o! When belle dey bite and person dey purge watery stool, e fit be say dirty germ, bad food, or contaminated water don enter belly (gastroenteritis). During rainy season, e fit even be cholera warning.`;
      wetinYouFitDoForHouse = `1. Mix Salt-Sugar Solution (Home ORS): Measure 1 clean bottle of water (or 2 pure water sachets), put 1 level small spoon of salt plus 10 level small spoon of sugar (or 5 cubes). Turn am well make e melt.
2. Drink one full cup every time you go toilet purge.
3. Eat soft pap (akamu) or boiled rice in small quantity.
4. Avoid soft drinks or roadside food now.`;
      nextStep = `If the purging pass 5 to 6 times inside one day, or you see blood inside the stool, move go ${topFacilities[0]} or any clinic close to you immediately.`;
      clarifyingQuestions = [
        "Ehya, blood dey inside the watery stool?",
        "You fit hold water or ORS for stomach, abi you dey vomit am out?"
      ];
    }
  } else {
    wetinFitDeyHappen = `Ehya, pele o! The way your body dey do you fit be from heavy stress, body tiredness, or early sign say infection or malaria dey try enter body.`;
    wetinYouFitDoForHouse = `1. Rest well-well for room wey breeze dey blow.
2. Drink plenty clean water make your system cool down.
3. Watch your body make you see if hot body or headache go join am.`;
    nextStep = `If the body pain or weakness no gree stop after 24 to 48 hours, waka go see nurse or doctor for ${topFacilities[0]} or your nearest General Hospital.`;
    clarifyingQuestions = [
      "How long this body weakness or pain don start?",
      "You get any condition before, like blood pressure, ulcer, or sickle cell?"
    ];
  }
  return {
    language,
    urgencyLevel: "urgent",
    isRedFlag: false,
    empathyNote: language === "hausa" ? "Sannu! Allah Ya sauwake." : language === "yoruba" ? "P\u1EB9l\u1EB9 o! \u1EB8 j\u1EB9\u0301 k'\xE1 b\xF3j\xFAt\xF3 e." : language === "english" ? "So sorry to hear about this." : "Pele o! Take am easy, make I break down wetin you fit do.",
    wetinFitDeyHappen,
    wetinYouFitDoForHouse,
    nextStep,
    potentialCauses: wetinFitDeyHappen,
    homeManagement: wetinYouFitDoForHouse,
    actionPlan: nextStep,
    clarifyingQuestions,
    recommendedFacilities: topFacilities,
    detectedLocation: stateName,
    fullFormattedResponse: `\u{1F49A}

**[Wetin Fit Dey Happen]**
${wetinFitDeyHappen}

**[Wetin You Fit Do For House]**
${wetinYouFitDoForHouse}

**[Next Step]**
${nextStep}

${disclaimer}`,
    disclaimer
  };
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "NaijaHealth AI Medical Triage Service (Multilingual Edition)",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/facilities", (req, res) => {
  const state = req.query.state;
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
app.post("/api/triage", async (req, res) => {
  try {
    const { message, conversationHistory = [], userLocation, language = "pidgin" } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Symptom description message is required." });
    }
    const targetLang = ["pidgin", "english", "hausa", "yoruba", "igbo"].includes(language) ? language : "pidgin";
    const immediateSafetyCheck = detectLocalRedFlags(message);
    const detectedFromMsg = detectStateFromText(message);
    const targetState = userLocation?.state || detectedFromMsg || "Lagos";
    const stateData = NIGERIAN_STATES_DATA[targetState] || NIGERIAN_STATES_DATA["Lagos"];
    const facilitiesList = stateData.facilities.map((f) => `${f.name} inside ${f.city}`).join(", ");
    if (immediateSafetyCheck.isRedFlag) {
      console.log("Immediate red-flag detected. Dispatching emergency triage without waiting.");
      const emergencyResult = buildFallbackTriage(message, targetState, targetLang);
      return res.json(emergencyResult);
    }
    const isApiKeyValid = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    if (!ai || !isApiKeyValid) {
      console.log(`Using rule-based triage fallback in ${targetLang} (API key unconfigured).`);
      const fallbackResult = buildFallbackTriage(message, targetState, targetLang);
      return res.json(fallbackResult);
    }
    let langInstruction = `You MUST reply strictly and entirely in fluent, natural Nigerian Pidgin English. Use comforting words like "Ayaah", "Pele", "Sorry o". Section titles: [Wetin Fit Dey Happen], [Wetin You Fit Do For House], [Next Step].`;
    if (targetLang === "english") {
      langInstruction = `You MUST reply in simple, clear, empathetic everyday English. Avoid complex medical jargon so ordinary people easily understand. Section titles: [Potential Causes], [Home Management], [Action Plan].`;
    } else if (targetLang === "hausa") {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Hausa (Harshen Hausa). Use comforting words like "Sannu", "Allah Ya sauwake". Section titles: [Abubuwan Da Ka Iya Kawo Shi], [Maganin Gida / Abinda Zaka Iya Yi A Gida], [Mataki Na Gaba / Asibiti].`;
    } else if (targetLang === "yoruba") {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Yoruba (\xC8d\xE8 Yor\xF9b\xE1). Use comforting words like "P\u1EB9l\u1EB9 o", "\u1EB8 m\xE1 binu". Section titles: [Kini O Le Fa E], [Ohun Ti O Le Se Ni Ile], [Igbese To Kan / Ile Iwosan].`;
    } else if (targetLang === "igbo") {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Igbo (As\u1EE5s\u1EE5 Igbo). Use comforting words like "Ndo", "Ndewo". Section titles: [Ihe Nwere Ike Na-ebute Ya], [Ihe I Nwere Ike Ime n'Ulo], [Ihe I Ga-eme Na-eson\u1EE5 / Hospital].`;
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
${conversationHistory.map((m) => `${m.role === "user" ? "Patient" : "NaijaHealth AI"}: ${m.parts?.[0]?.text || m.text || ""}`).join("\n")}

Patient Symptoms:
"${message}"

Evaluate this patient's symptoms thoroughly in ${targetLang} following the 3-part triage structure.`;
    const generatePromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRedFlag: {
              type: Type.BOOLEAN,
              description: "True if symptoms describe dangerous red flags like chest pain, breath seize, sudden stroke weakness, heavy bleeding, or unconsciousness."
            },
            urgencyLevel: {
              type: Type.STRING,
              enum: ["emergency", "urgent", "routine"],
              description: "Triage priority level"
            },
            empathyNote: {
              type: Type.STRING,
              description: "Warm comforting opening in chosen language"
            },
            emergencyWarning: {
              type: Type.STRING,
              description: "Direct aggressive alert in chosen language if red-flag is triggered, else empty"
            },
            wetinFitDeyHappen: {
              type: Type.STRING,
              description: "Part 1: Simple breakdown in chosen language without big medical grammar"
            },
            wetinYouFitDoForHouse: {
              type: Type.STRING,
              description: "Part 2: Safe first-aid and home steps in chosen language. MUST be empty or say home remedy cancelled if isRedFlag is true."
            },
            nextStep: {
              type: Type.STRING,
              description: "Part 3: When and which hospital to visit inside their state in chosen language"
            },
            clarifyingQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1 to 2 short clarifying questions in chosen language if details are missing"
            },
            recommendedFacilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Names of recommended hospitals in their state"
            },
            detectedLocation: {
              type: Type.STRING,
              description: "State or city inside Nigeria"
            },
            fullFormattedResponse: {
              type: Type.STRING,
              description: "Complete formatted response strictly in the chosen language with the 3 parts and disclaimer"
            },
            disclaimer: {
              type: Type.STRING,
              description: "Disclaimer in the chosen language"
            }
          },
          required: ["isRedFlag", "urgencyLevel", "wetinFitDeyHappen", "wetinYouFitDoForHouse", "nextStep", "fullFormattedResponse", "disclaimer"]
        }
      }
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timed out")), 7e3);
    });
    const response = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini.");
    }
    const parsedData = JSON.parse(responseText);
    parsedData.language = targetLang;
    parsedData.potentialCauses = parsedData.wetinFitDeyHappen;
    parsedData.homeManagement = parsedData.wetinYouFitDoForHouse;
    parsedData.actionPlan = parsedData.nextStep;
    if (immediateSafetyCheck.isRedFlag) {
      parsedData.isRedFlag = true;
      parsedData.urgencyLevel = "emergency";
      parsedData.wetinYouFitDoForHouse = "All house remedies cancelled! Rush sharp-sharp go emergency unit for hospital.";
      parsedData.homeManagement = parsedData.wetinYouFitDoForHouse;
    }
    if (!parsedData.detectedLocation) {
      parsedData.detectedLocation = targetState;
    }
    return res.json(parsedData);
  } catch (error) {
    console.error("Error during triage processing:", error);
    const fallbackResult = buildFallbackTriage(req.body.message || "", req.body.userLocation?.state || "Lagos", req.body.language || "pidgin");
    return res.json(fallbackResult);
  }
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NaijaHealth AI server (Multilingual Edition) running at http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
