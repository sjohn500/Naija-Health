/**
 * Private care module — data layer.
 *
 * Design rules baked into this file:
 *  1. Never ask the user to name their condition. The language here works
 *     for someone who says "the drugs I take every night".
 *  2. Clinical copy ships in English + Nigerian Pidgin only, authored and
 *     reviewable. Other languages fall back to English with a visible note
 *     rather than machine-guessed medical instructions.
 *  3. No fabricated facility facts: ART capability is derived from the
 *     facility TYPE (public teaching/FMC/general hospitals), and every
 *     listing is labelled "call to confirm stock today".
 */
import { SupportedLanguage, NigerianFacility } from '../types/triage';
import { facilitiesForState } from './facilityDirectory';
import { FACILITY_LEVEL_LABEL, FacilityCapability } from '../types/facility';

export const PEP_WINDOW_HOURS = 72;

/** A short, honest line shown when an answer came from the device, not the model. */
export const LOCAL_ANSWER_NOTE = {
  en: 'Answered from the saved guide on this device — nothing was sent anywhere.',
  pidgin: 'I answer you from the saved guide for this phone — nothing no leave the phone.',
};

type Bi = { en: string; pidgin: string };

export interface OfflineGuide {
  id: string;
  title: Bi;
  body: Bi;
  steps: { en: string[]; pidgin: string[] };
  urgent?: boolean;
}

/** Six answers that must survive a dead network. */
export const OFFLINE_GUIDES: OfflineGuide[] = [
  {
    id: 'exposure',
    urgent: true,
    title: { en: 'Possible exposure — act now', pidgin: 'Something happen — do am now' },
    body: {
      en: 'HIV prevention medicine (PEP) can stop infection, but only if you start within 72 hours of exposure. The sooner the better — after 72 hours it is usually too late.',
      pidgin: 'Medicine wey dey stop HIV (PEP) fit work, but you must start am inside 72 hours after the thing happen. If 72 hours pass, e no dey work again.',
    },
    steps: {
      en: [
        'Go to a public hospital with an emergency or ART unit today. Do not wait for morning if the exposure was recent.',
        'Ask for PEP by name at the desk. Say you need post-exposure prophylaxis.',
        'PEP is a 28-day course. You must finish it, and you will be tested at the start and again later.',
      ],
      pidgin: [
        'Go general hospital wey get emergency or ART unit today. No wait till morning if e just happen.',
        'Ask for PEP with the name. Tell them say you need post-exposure prophylaxis.',
        'PEP na 28 days course. You must finish am, and dem go test you first and later again.',
      ],
    },
  },
  {
    id: 'missed_dose',
    title: { en: 'I missed my medicine', pidgin: 'I miss my drug' },
    body: {
      en: 'Missing one dose is common and is not a disaster. The important thing is to restart, not to double up.',
      pidgin: 'To miss one dose dey happen, e no be disaster. The main thing na to start again, no take double.',
    },
    steps: {
      en: [
        'Take the next dose at its normal time. Do not take two doses at once to catch up.',
        'If you have missed several days, tell your clinic — do not stop completely and do not restart on your own.',
        'If you keep missing doses, ask about a different regimen or a refill schedule that fits your day. That is a normal conversation, not a failure.',
      ],
      pidgin: [
        'Take the next dose at the normal time. No take two at once to catch up.',
        'If you don miss plenty days, tell your clinic — no stop am completely, no start am by yourself.',
        'If you dey always miss am, ask about another regimen or refill time wey fit your day. Na normal talk, no be failure.',
      ],
    },
  },
  {
    id: 'side_effects',
    title: { en: 'The medicine is making me sick', pidgin: 'The drug dey make me sick' },
    body: {
      en: 'Most early side effects settle within a few weeks. A few are dangerous and need same-day care. Do not stop your medicine without talking to a clinician first.',
      pidgin: 'Plenty side effect dey stop after few weeks. But some dey dangerous and need same-day care. No stop your drug without talk to health worker first.',
    },
    steps: {
      en: [
        'Nausea, vivid dreams, tiredness and mild headache in the first weeks are common. Take the dose with food if advised, and tell your clinic.',
        'Go to a hospital TODAY for: a spreading rash with fever or peeling skin, yellow eyes or dark urine, severe stomach pain, or difficulty breathing.',
        'Never stop or switch your medicine on your own — that is how resistance starts.',
      ],
      pidgin: [
        'Nausea, strange dream, tiredness and small headache in first weeks dey normal. Take am with food if dem tell you, and tell your clinic.',
        'Go hospital TODAY if: rash dey spread with fever or skin dey peel, eye yellow or urine dark, belle pain well well, or you no fit breathe well.',
        'No ever stop or change your drug by yourself — na so resistance dey start.',
      ],
    },
  },
  {
    id: 'stockout',
    title: { en: 'The clinic has no medicine', pidgin: 'Clinic no get drug' },
    body: {
      en: 'A stockout is the clinic’s problem, not yours. Do not buy from an unverified seller, and do not stretch your remaining doses by half.',
      pidgin: 'Stockout na the clinic problem, no be your own. No buy from person wey you no sabi, and no reduce your dose to half.',
    },
    steps: {
      en: [
        'Ask the facility pharmacy for an emergency refill or a transfer slip to another ART site nearby.',
        'Call the next public ART site in this app before you travel, and confirm they have stock.',
        'If you are handed a pack anywhere, check that it carries a NAFDAC registration number before you take it.',
      ],
      pidgin: [
        'Ask the pharmacy for emergency refill or transfer slip to another ART site near you.',
        'Call the next public ART site inside this app before you travel, make sure say dem get stock.',
        'If anybody give you pack, check say NAFDAC number dey on top before you take am.',
      ],
    },
  },
  {
    id: 'test_result',
    title: { en: 'I tested — what does it mean?', pidgin: 'I test — wetin e mean?' },
    body: {
      en: 'A test only means something when you know the window period. A negative result taken too early does not mean you are negative.',
      pidgin: 'Test only mean something if you know the window period. Negative wey you take too early no mean say you dey negative.',
    },
    steps: {
      en: [
        'Tell the counsellor when the exposure happened. If it was within the last few weeks, you need a repeat test later.',
        'A positive result is confirmed with a second test before anyone is started on treatment. Ask for that confirmation.',
        'If you are confirmed positive, treatment can start the same day in Nigeria. Early treatment means a normal, long life.',
      ],
      pidgin: [
        'Tell the counsellor when the thing happen. If e be within few weeks, you go need repeat test later.',
        'Positive result dem dey confirm with second test before treatment start. Ask for that confirmation.',
        'If dem confirm say you get am, treatment fit start same day for Nigeria. Early treatment mean normal, long life.',
      ],
    },
  },
  {
    id: 'disclosure',
    title: { en: 'I am afraid to tell anyone', pidgin: 'I dey fear to tell person' },
    body: {
      en: 'You do not owe anyone your status. Confidentiality is your legal right in Nigeria, including from relatives and employers.',
      pidgin: 'You no owe anybody your status. Confidentiality na your right by law for Nigeria, even from family and employer.',
    },
    steps: {
      en: [
        'You can be treated without telling family. Clinics are required to keep your status confidential.',
        'If someone is threatening you with your status, that is an offence under the HIV/AIDS Anti-Discrimination Act. Tell a trusted counsellor or legal aid office.',
        'If you feel unsafe or in danger right now, call 112. Your safety comes before disclosure.',
      ],
      pidgin: [
        'You fit collect treatment without tell your family. Clinic suppose keep your status secret by law.',
        'If person dey threaten you with your status, na offence under HIV/AIDS Anti-Discrimination Act. Tell counsellor you trust or legal aid.',
        'If you no dey safe right now, call 112. Your safety come before disclosure.',
      ],
    },
  },
];

/** Danger signs that must never be softened. */
export const HIV_DANGER_SIGNS = {
  en: [
    'Rash spreading fast, with fever, or skin peeling',
    'Yellow eyes, yellow skin, or dark urine',
    'Severe stomach pain or vomiting that will not stop',
    'Difficulty breathing, confusion, or fainting',
    'Very dark, cloudy urine with swelling, or no urine at all',
  ],
  pidgin: [
    'Rash wey dey spread fast, with fever, or skin dey peel',
    'Eye yellow, skin yellow, or urine dark',
    'Belle pain well well or vomit wey no dey stop',
    'You no fit breathe well, confusion, or you faint',
    'Urine dark and cloudy with swelling, or no urine at all',
  ],
};

export const NAFDAC_NOTE = {
  en: 'Every genuine medicine pack in Nigeria carries a NAFDAC registration number. If a pack has none, or the number looks altered, do not take it — report it to NAFDAC.',
  pidgin: 'Every correct medicine pack for Nigeria get NAFDAC number. If the pack no get am, or the number look like dem change am, no take am — report to NAFDAC.',
};

/* ------------------------------------------------------------------ */
/* Localised UI labels                                                 */
/* ------------------------------------------------------------------ */

const EN_UI = {
  entryTitle: 'Private chat',
  entrySub: 'Sensitive questions. Nothing stays on this device.',
  title: 'Private chat',
  sub: 'This conversation is not saved. Closing it wipes it.',
  disclosure:
    'Your words are sent to our AI provider to generate the answer. Nothing is stored on this device, and we do not keep a copy of your messages.',
  topicsTitle: 'Start with one tap',
  placeholder: 'Say it any way you like — you do not have to name anything',
  send: 'Ask',
  listening: 'Listening… tap to stop',
  speak: 'Speak',
  offline: 'No network. Showing the saved offline guide for this topic.',
  quickExit: 'Close and wipe',
  pepTitle: 'Exposure clock',
  pepSub: 'PEP works only inside 72 hours',
  artTitle: 'Where ART is free',
  artSub: 'Public sites. Call to confirm stock today.',
  callConfirm: 'Call to confirm stock',
  stockout: 'Report out of stock',
  reported: 'Reported. Thank you.',
  reportNote: 'Your report carries no name and no phone number.',
  confirmStock: 'ART is free at public facilities. This list is by facility type, so always call before you travel.',
  dangerTitle: 'Go today, do not wait',
  clear: 'Wipe conversation',
  looking: 'Looking for the right next step…',
  notDiagnosis: 'Guidance only. This is not a diagnosis or a prescription.',
};

export type PrivateUi = typeof EN_UI;

const UI: Record<SupportedLanguage, PrivateUi> = {
  english: EN_UI,
  pidgin: {
    entryTitle: 'Private chat',
    entrySub: 'Sensitive question. Nothing dey stay for this phone.',
    title: 'Private chat',
    sub: 'We no dey save this talk. If you close am, e go wipe.',
    disclosure:
      'We dey send wetin you type go our AI provider so e go answer you. Nothing no dey stay for this phone, and we no dey keep copy of your message.',
    topicsTitle: 'Tap one to start',
    placeholder: 'Talk am anyhow you like — you no need call the name',
    send: 'Ask',
    listening: 'I dey listen… tap to stop',
    speak: 'Speak',
    offline: 'Network no dey. I dey show you the guide wey we save for this topic.',
    quickExit: 'Close and wipe',
    pepTitle: 'Exposure clock',
    pepSub: 'PEP dey work only inside 72 hours',
    artTitle: 'Where ART free',
    artSub: 'Public site. Call first to confirm stock today.',
    callConfirm: 'Call confirm stock',
    stockout: 'Report say e finish',
    reported: 'We don record am. Thank you.',
    reportNote: 'Your report no carry name or phone number.',
    confirmStock: 'ART free for public facility. This list na by facility type, so call before you travel.',
    dangerTitle: 'Go today, no wait',
    clear: 'Wipe this talk',
    looking: 'I dey find the correct next step…',
    notDiagnosis: 'Na guidance only. No be diagnosis or prescription.',
  },
  hausa: {
    entryTitle: 'Tattaunawa ta sirri',
    entrySub: 'Tambayoyi masu mahimmanci. Babu abin da ke tsayawa a wannan wayar.',
    title: 'Tattaunawa ta sirri',
    sub: 'Ba a adana wannan tattaunawa. Idan ka rufe, za a goge ta.',
    disclosure:
      'Ana aika maganarka zuwa ga mai ba da fasahar AI don samar da amsa. Ba a adana komai a wannan wayar, kuma ba mu riƙe kwafin saƙonninka.',
    topicsTitle: 'Fara da danna ɗaya',
    placeholder: 'Faɗe shi yadda ka so — ba lallai ka ambaci sunan ba',
    send: 'Tambaya',
    listening: 'Ina saurare… danna don tsayawa',
    speak: 'Yi magana',
    offline: 'Babu hanyar sadarwa. Ana nuna maka jagorar da aka adana.',
    quickExit: 'Rufe kuma goge',
    pepTitle: 'Agogon fallasa',
    pepSub: 'PEP na aiki ne kawai cikin awa 72',
    artTitle: 'Inda ART ke kyauta',
    artSub: 'Wuraren gwamnati. Ka kira ka tabbatar da wadata yau.',
    callConfirm: 'Kira ka tabbatar',
    stockout: 'Bayar da rahoton ƙarewa',
    reported: 'An karɓa. Na gode.',
    reportNote: 'Rahotonka ba ya ɗauke da suna ko lambar waya.',
    confirmStock: 'ART kyauta ne a wuraren gwamnati. Jerin bisa nau’in asibiti ne, don haka kira kafin tafiya.',
    dangerTitle: 'Je yau, kada ka jira',
    clear: 'Goge tattaunawa',
    looking: 'Ina neman mataki na gaba…',
    notDiagnosis: 'Jagora ne kawai. Ba ganewar asali ba ne.',
  },
  yoruba: {
    entryTitle: 'Ìjíròrò àṣírí',
    entrySub: 'Àwọn ìbéèrè pàtàkì. Kò sí ohun tí ó dúró lórí fọ́n fọ́n yìí.',
    title: 'Ìjíròrò àṣírí',
    sub: 'A kò fi ìjíròrò yìí pamọ́. Bí o bá tiì, yóò pa á rẹ́.',
    disclosure:
      'A ń fi ọ̀rọ̀ rẹ ránṣẹ́ sí olùpèsè AI wa láti gbé ìdáhùn jáde. A kò fi ohunkóhun pamọ́ lórí fọ́n fọ́n yìí, a kò sì tọ́jú ẹ̀dà àwọn ìfiránṣẹ́ rẹ.',
    topicsTitle: 'Bẹ̀rẹ̀ pẹ̀lú títẹ̀ kan',
    placeholder: 'Sọ ọ́ bí o bá fẹ́ — kò pọn dandan kí o dárúkọ rẹ̀',
    send: 'Bèèrè',
    listening: 'Mò ń gbọ́… tẹ̀ láti dúró',
    speak: 'Sọ̀rọ̀',
    offline: 'Kò sí nẹ́tíwọ́kì. Ìtọ́sọ́nà tí a fi pamọ́ ni a ń fi hàn ọ́.',
    quickExit: 'Tì í kí o sì pa á rẹ́',
    pepTitle: 'Aago ìfarahàn',
    pepSub: 'PEP ń ṣiṣẹ́ nínú wákàtí 72 péré',
    artTitle: 'Ibomimí tí ART ti lọ́fẹ̀ẹ́',
    artSub: 'Ibomimí ìjọba. Pe kí o jẹ́rìí pé ó wà lónìí.',
    callConfirm: 'Pe kí o jẹ́rìí',
    stockout: 'Sọ pé ó ti tán',
    reported: 'A ti gbà á. Ẹ ṣé.',
    reportNote: 'Ìròyìn rẹ kò ní orúkọ tàbí nọ́mbà fọ́n fọ́n.',
    confirmStock: 'ART lọ́fẹ̀ẹ́ ní ibomimí ìjọba. Àtòjọ yìí dá lórí irú ilé ìwòsàn, nítorí náà pe kí o tó lọ.',
    dangerTitle: 'Lọ lónìí, má ṣe dúró',
    clear: 'Pa ìjíròrò rẹ́',
    looking: 'Mò ń wá ìgbésẹ̀ tó tọ́…',
    notDiagnosis: 'Ìtọ́sọ́nà ni. Kì í ṣe ìwádìí àrùn tàbí ìwé òògùn.',
  },
  igbo: {
    entryTitle: 'Nkwurịta okwu nzuzo',
    entrySub: 'Ajụjụ dị mkpa. Ọ dịghị ihe na-anọ na ekwentị a.',
    title: 'Nkwurịta okwu nzuzo',
    sub: 'Anaghị echekwa mkparịta ụka a. Ị mechie ya, a ga-ehichapụ ya.',
    disclosure:
      'A na-eziga okwu gị na onye na-enye AI anyị ka o wepụta azịza. Ọ dịghị ihe na-anọ na ekwentị a, anyị anaghị edebe oyiri ozi gị.',
    topicsTitle: 'Malite site na ịpị otu',
    placeholder: 'Kwuo ya otu ọ bụla masịrị gị — ọ dịghị mkpa ịkpọ aha ya',
    send: 'Jụọ',
    listening: 'Ana m anụ… pịa ka ị kwụsị',
    speak: 'Kwuo okwu',
    offline: 'Enweghị netwọk. Ana m egosi gị ntuziaka echekwara.',
    quickExit: 'Mechie ma hichapụ',
    pepTitle: 'Elekere oge mmetụta',
    pepSub: 'PEP na-arụ ọrụ naanị n’ime awa 72',
    artTitle: 'Ebe ART bụ n’efu',
    artSub: 'Ebe gọọmentị. Kpọọ ka ị jide n’aka na ọ dị taa.',
    callConfirm: 'Kpọọ ka ị jide n’aka',
    stockout: 'Kọọ na ọ gwụla',
    reported: 'Anyị natara ya. Daalụ.',
    reportNote: 'Akụkọ gị enweghị aha ma ọ bụ nọmba ekwentị.',
    confirmStock: 'ART bụ n’efu n’ebe gọọmentị. Ndepụta a dabere n’ụdị ụlọ ọgwụ, ya mere kpọọ tupu ị gaa.',
    dangerTitle: 'Gaa taa, echekwala',
    clear: 'Hichapụ mkparịta ụka',
    looking: 'Ana m achọ nzọụkwụ ziri ezi…',
    notDiagnosis: 'Ntuziaka naanị. Ọ bụghị nyocha ma ọ bụ ọgwụ.',
  },
};

export function privateUi(lang: SupportedLanguage): PrivateUi {
  return UI[lang] || EN_UI;
}

/** Offline clinical copy exists in English + Pidgin only — say so, don't fake it. */
export function offlineTextAvailable(lang: SupportedLanguage): boolean {
  return lang === 'english' || lang === 'pidgin';
}

export function guideText(guide: OfflineGuide, lang: SupportedLanguage) {
  const key: keyof Bi = lang === 'pidgin' ? 'pidgin' : 'en';
  return {
    title: guide.title[key],
    body: guide.body[key],
    steps: guide.steps[key],
  };
}

/* ------------------------------------------------------------------ */
/* ART / PEP site derivation                                           */
/* ------------------------------------------------------------------ */

export type ArtCapability = Extract<FacilityCapability, 'ART' | 'PEP' | 'PMTCT' | 'VL testing'>;

export interface ArtSite {
  id: string;
  name: string;
  city: string;
  state: string;
  lga: string | null;
  type: string;
  phone?: string;
  capabilities: ArtCapability[];
  verification: 'unverified' | 'reported' | 'verified';
  lastVerified: string | null;
}

const ART_CAPABILITIES: ArtCapability[] = ['ART', 'PEP', 'PMTCT', 'VL testing'];

/**
 * Capability comes from the shared national directory, where it is derived from
 * facility LEVEL — never a stock claim. Every surface that uses this must still
 * say "call to confirm".
 */
export function artSitesForState(state: string): ArtSite[] {
  return facilitiesForState(state).map((f) => ({
    id: f.id,
    name: f.name,
    city: f.city,
    state: f.state,
    lga: f.lga,
    type: FACILITY_LEVEL_LABEL[f.level],
    phone: f.phone ?? undefined,
    capabilities: f.capabilities.filter((c): c is ArtCapability =>
      (ART_CAPABILITIES as string[]).includes(c)
    ),
    verification: f.verification,
    lastVerified: f.lastVerified,
  }));
}

export function pepSitesForState(state: string): ArtSite[] {
  return artSitesForState(state).filter((s) => s.capabilities.includes('PEP'));
}

/* ------------------------------------------------------------------ */
/* Deterministic topic routing                                          */
/* ------------------------------------------------------------------ */

/**
 * The six core questions are answered from the reviewed library on the device,
 * NEVER sent to the model. Two reasons:
 *  1. Safety — a stockout question must not come back as generic
 *     "rest and drink water" advice.
 *  2. Privacy — these six answers never leave the phone at all.
 */
const STRONG_PHRASES: Record<string, string[]> = {
  exposure: [
    'pep',
    'post-exposure',
    'post exposure',
    'condom break',
    'condom broke',
    'broke condom',
    'unprotected',
    'raped',
    'rape',
    'sexual assault',
    'needle stick',
    'needlestick',
  ],
  stockout: [
    'out of stock',
    'no stock',
    'stock out',
    'stockout',
    'drug finish',
    'drugs finish',
    'medicine finish',
    'medication finish',
    'ran out',
    'run out',
    'refill',
    'pharmacy empty',
  ],
  missed_dose: ['missed dose', 'miss my dose', 'miss a dose', 'miss dose', 'forgot to take', 'skipped dose', 'skip dose', 'miss my drug'],
  side_effects: ['side effect', 'side effects', 'side-effect', 'reaction to the drug', 'reaction to my drug'],
  test_result: ['window period', 'test result', 'test came back', 'reactive', 'confirmed positive', 'test positive', 'test negative'],
  disclosure: ['disclose', 'tell my partner', 'tell my family', 'tell my husband', 'tell my wife', 'afraid to tell', 'scared to tell', 'people will know'],
};

const WEAK_WORDS: Record<string, string[]> = {
  exposure: ['exposure', 'exposed', 'condom', 'sex', 'assault'],
  stockout: ['finish', 'finished', 'empty', 'buy', 'availability', 'available'],
  missed_dose: ['miss', 'missed', 'forgot', 'skip'],
  side_effects: ['nausea', 'vomiting', 'dizzy', 'dizziness', 'rash', 'itching', 'dream', 'dreams', 'weakness', 'tired'],
  test_result: ['test', 'tested', 'negative', 'positive', 'result'],
  disclosure: ['tell', 'afraid', 'scared', 'stigma', 'shame', 'hide', 'family', 'partner'],
};

export function matchPrivateTopic(text: string): string | null {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ')} `;

  for (const [topic, phrases] of Object.entries(STRONG_PHRASES)) {
    if (phrases.some((p) => t.includes(` ${p} `) || t.includes(p))) return topic;
  }

  let best: string | null = null;
  let bestScore = 0;
  for (const [topic, words] of Object.entries(WEAK_WORDS)) {
    const score = words.reduce((n, w) => (t.includes(` ${w} `) ? n + 1 : n), 0);
    if (score >= 2 && score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Redact obvious direct identifiers before a message leaves the device.
 * State/city names are kept on purpose: routing needs them, and they are not
 * unique identifiers. Names, phone numbers, emails and street addresses go.
 */
export function redactForSend(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email removed]')
    .replace(/(\+?234|0)\s?\d{3}[\s-]?\d{3}[\s-]?\d{4}/g, '[number removed]')
    .replace(/\b\d{1,5}\s+(?:[A-Za-z]+\s){1,3}(street|st\.?|road|rd\.?|avenue|ave\.?|close|crescent|lane)\b/gi, '[address removed]')
    .replace(/\bmy name is\s+[A-Za-z]+(\s+[A-Za-z]+)?/gi, 'my name is [removed]')
    .replace(/\bi am\s+[A-Z][a-z]+\b/g, 'I am [removed]');
}
