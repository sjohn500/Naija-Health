import { SupportedLanguage, TriageResult } from '../types/triage';
import { NIGERIAN_STATES_DATA } from './nigeriaHealthcareData';
import { STATE_LGAS, facilitiesForLga } from './facilityDirectory';

export function getSectionHeaders(language: SupportedLanguage): {
  causes: string;
  home: string;
  action: string;
  disclaimer: string;
} {
  switch (language) {
    case 'english':
      return {
        causes: 'Potential Causes',
        home: 'Home Management',
        action: 'Action Plan',
        disclaimer:
          '⚠️ Medical Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, visit the nearest hospital or call 112 immediately.',
      };
    case 'hausa':
      return {
        causes: 'Abubuwan Da Ka Iya Kawo Shi',
        home: 'Maganin Gida',
        action: 'Mataki Na Gaba',
        disclaimer:
          '⚠️ Tunatarwa: Ni mataimakin AI ne (NaijaHealth AI), ba likita na gaskiya ba. Idan jiki yayi tsanani, tafi asibiti kusa da kai ko kira 112.',
      };
    case 'yoruba':
      return {
        causes: 'Kini O Le Fa E',
        home: 'Ohun Ti O Le Se Ni Ile',
        action: 'Igbese To Kan',
        disclaimer:
          '⚠️ Ìkìlọ̀: Èmi jẹ́ olùrànlọ́wọ́ AI, mi kìí ṣe dọ́kítà gidi. Tí ara bá le koko, ẹ lọ sí ilé-ìwòsàn tàbí kí ẹ pe 112 lẹ́sẹ̀kẹsẹ̀.',
      };
    case 'igbo':
      return {
        causes: 'Ihe Nwere Ike Na-ebute Ya',
        home: 'Ihe I Nwere Ike Ime n\'Ulo',
        action: 'Ihe I Ga-eme Na-esonụ',
        disclaimer:
          '⚠️ Rịba ama: Abụ m onye inyeaka AI, abụghị m ezigbo dọkịta. Ọ bụrụ na ahụ adịghị gị mma nke ukwuu, gaa ụlọ ọgwụ ma ọ bụ kpọọ 112 ugbu a.',
      };
    case 'pidgin':
    default:
      return {
        causes: 'Wetin Fit Dey Happen',
        home: 'Wetin You Fit Do For House',
        action: 'Next Step',
        disclaimer:
          '⚠️ Abeg remember: I be NaijaHealth AI assistant o, I no be real medical doctor. If body no do you well or the matter tight, go meet doctor for hospital or call 112 sharp-sharp.',
      };
  }
}

export function buildFormattedResponse(
  language: SupportedLanguage,
  data: {
    isRedFlag: boolean;
    empathyNote?: string;
    emergencyWarning?: string;
    causes: string;
    home: string;
    action: string;
    disclaimer?: string;
  }
): string {
  const headers = getSectionHeaders(language);
  const disclaimer = data.disclaimer || headers.disclaimer;

  if (data.isRedFlag) {
    return (
      `🚨 ${data.emergencyWarning || headers.causes}\n\n` +
      `**[${headers.causes}]**\n${data.causes}\n\n` +
      `**[${headers.home}]**\n${data.home}\n\n` +
      `**[${headers.action}]**\n${data.action}\n\n${disclaimer}`
    );
  }

  return (
    `💚 ${data.empathyNote || ''}\n\n` +
    `**[${headers.causes}]**\n${data.causes}\n\n` +
    `**[${headers.home}]**\n${data.home}\n\n` +
    `**[${headers.action}]**\n${data.action}\n\n${disclaimer}`
  );
}

// Emergency red-flag detector across English, Pidgin, Hausa, Yoruba & Igbo
export function detectLocalRedFlags(text: string): { isRedFlag: boolean; matchedSymptom?: string } {
  const lower = text.toLowerCase();

  // Exclude explicit mild cough chest tightness from triggering chest-pain cardiac bypass
  const isExplicitMildChestTight =
    /(tight small|mild chest tightness|matsewa kadan|ìfúnpa díẹ̀|siri ike ntakịrị|siri ike ntakiri)/i.test(lower) &&
    !/(severe|sharp|heavy|crushing|sudden|breath.*seize|cannot breathe|kasa numfashi|àìlè mí|enweghị ike iku ume|mgbu obi dị egwu)/i.test(lower);

  const redFlagPatterns = [
    {
      pattern: /(sharp|crushing|severe|heavy|sudden).*(chest|heart|kirji|aya|obi)/i,
      name: 'Heavy Chest Pain / Heart Emergency',
    },
    {
      pattern: /(chest pain|pain in my chest|chest dey pain|ciwon kirji mai tsanani|aya didun lile|àyà mi bẹ̀rẹ̀ sí ro mí líle|mgbu obi dị egwu|mgbu obi di egwu)/i,
      name: 'Acute Chest Pain',
    },
    {
      pattern: /(cannot breathe|severe difficulty breathing|shortness of breath|gasping for air|struggling to breathe|blue lips|breath seize|breath dey seize|suffocat|kasa numfashi|kasa hema|àìlè mí|mi ò sì lè mí|kò lè mí|anaghị m enwe ike iku ume|enweghi ike iku ume)/i,
      name: 'Severe Breathing Difficulty',
    },
    {
      pattern: /(face droop|half body|one side.*(weak|paralyz)|slurred speech|sudden numbness|hand and leg no fit move|shanyewar jiki|apa kan ro|akụkụ ahụ ịda ogbu|strok)/i,
      name: 'Sudden Stroke Signs / Paralysis',
    },
    {
      pattern: /(heavy bleeding|uncontrolled bleeding|bleeding continuously|spurting blood|coughing.*blood|vomiting.*blood|heavy blood|blood dey rush|zubar jini mai yawa|eje pupo|ẹ̀jẹ̀ púpọ̀|ọbara ịgba nke ukwuu|obara igba)/i,
      name: 'Heavy Uncontrolled Bleeding',
    },
    {
      pattern: /(convuls|seizure|passed out|unconscious|fainted and not waking|coma|person faint|eye turn collapse|farfadiya|suma|daku|dídákú|ịda mba|tụbọọ|tuboo)/i,
      name: 'Loss of Consciousness / Seizure',
    },
    {
      pattern: /(stiff neck.*fever|cannot bend neck|high fever.*hallucinat|neck strong.*hot body|tashin hankali|wuya ya kankame|ọrùn líle)/i,
      name: 'Meningitis / Severe Brain Danger',
    },
    {
      pattern: /(pregnan|expectant|get belle|carry belle|mai ciki|juna biyu|oyún|oyun|aboyún|loyún|dị ime|di ime|afọ ime).*(bleed|spotting|blood|zubar jini|jini|ẹ̀jẹ̀|eje|ọbara|obara)|(bleed|spotting|heavy blood|zubar jini|ẹ̀jẹ̀|ọbara).*(pregnan|belle|ciki|juna biyu|oyún|oyun|ime)/i,
      name: 'Bleeding During Pregnancy (Obstetric Emergency)',
    },
    {
      pattern: /(pregnan|expectant|get belle|carry belle|mai ciki|juna biyu|oyún|oyun|aboyún|loyún|dị ime|di ime|afọ ime).*(blur|blurred vision|eye blur|swollen face|face swell|hand swell|severe headache|pounding headache|pre-?eclampsia|eclamps|ciwon kai mai tsanani|orí fífọ́ líle|isi ọwụwa dị egwu)/i,
      name: 'Pregnancy Pre-Eclampsia Warning Signs',
    },
    {
      pattern: /(water break|water broke|leaking fluid|amniotic|baby stopped moving|baby no dey kick|baby not moving|no fetal movement|jariri bai motsi|ọmọ kò ṣe|nwa anaghị emegharị)/i,
      name: 'Obstetric Labor / Fetal Movement Alert',
    },
  ];

  for (const item of redFlagPatterns) {
    if (item.pattern.test(lower)) {
      if (isExplicitMildChestTight && item.name.includes('Chest Pain')) {
        continue;
      }
      return { isRedFlag: true, matchedSymptom: item.name };
    }
  }
  return { isRedFlag: false };
}

const COLLISION_LGA_TOKENS = new Set([
  'abi', 'ido', 'oyo', 'iga', 'isi', 'ini', 'isa', 'asa', 'ala', 'tai', 'aro',
  'ojo', 'ode', 'ogo', 'obi', 'iba', 'oro', 'owe', 'oba', 'aga', 'ita', 'iyo',
  'iya', 'uwa', 'ugo', 'eke', 'efon', 'age', 'oya', 'koko', 'war', 'way', 'man',
  'ana', 'ama', 'oke', 'oku', 'owo', 'iku', 'ara', 'iru', 'ibe', 'idu', 'ife',
  'ike', 'ika', 'ime', 'inu', 'ori', 'eje', 'ohu', 'ona', 'ori', 'ire', 'eto',
  'oti', 'ota', 'apa', 'umu', 'ada', 'abo', 'aga', 'ali', 'ano', 'aso', 'ata',
]);

type LgaHit = { state: string; lga: string; norm: string };

const { UNIQUE_LGA_MATCHES, STATE_LGA_PATTERNS } = (() => {
  const counts = new Map<string, LgaHit[]>();
  const byState = new Map<string, LgaHit[]>();

  const registerPattern = (state: string, lga: string, rawPattern: string) => {
    const norm = rawPattern.toLowerCase().replace(/\s+/g, ' ').trim();
    if (norm.length < 4 || COLLISION_LGA_TOKENS.has(norm)) return;
    const hit: LgaHit = { state, lga, norm };
    const arr = counts.get(norm) || [];
    if (!arr.some((x) => x.state === state && x.lga === lga)) {
      arr.push(hit);
      counts.set(norm, arr);
    }
    const stArr = byState.get(state) || [];
    if (!stArr.some((x) => x.norm === norm && x.lga === lga)) {
      stArr.push(hit);
      byState.set(state, stArr);
    }
  };

  for (const [state, lgas] of Object.entries(STATE_LGAS)) {
    for (const lga of lgas) {
      registerPattern(state, lga, lga);
      const spaced = lga.replace(/[/()-]/g, ' ').replace(/\s+/g, ' ').trim();
      if (spaced && spaced !== lga) {
        registerPattern(state, lga, spaced);
      }
      const noSpace = spaced.replace(/\s+/g, '');
      if (noSpace.length >= 6) {
        registerPattern(state, lga, noSpace);
      }
    }
  }

  // Safe FCT districts & major LGA city centers inside single states
  const extraAliases: Array<[string, string, string]> = [
    ['FCT - Abuja', 'Abuja Municipal Area Council (AMAC)', 'amac'],
    ['FCT - Abuja', 'Abuja Municipal Area Council (AMAC)', 'garki'],
    ['FCT - Abuja', 'Abuja Municipal Area Council (AMAC)', 'wuse'],
    ['FCT - Abuja', 'Abuja Municipal Area Council (AMAC)', 'maitama'],
    ['FCT - Abuja', 'Abuja Municipal Area Council (AMAC)', 'asokoro'],
    ['FCT - Abuja', 'Abuja Municipal Area Council (AMAC)', 'nyanya'],
    ['FCT - Abuja', 'Abuja Municipal Area Council (AMAC)', 'gwarinpa'],
    ['FCT - Abuja', 'Bwari', 'kubwa'],
    ['Ogun', 'Ado Odo/Ota', 'sango ota'],
    ['Ogun', 'Ado Odo/Ota', 'ado odo ota'],
    ['Lagos', 'Eti-Osa', 'lekki'],
    ['Lagos', 'Eti-Osa', 'victoria island'],
    ['Lagos', 'Lagos Mainland', 'yaba'],
    ['Lagos', 'Lagos Mainland', 'ebute metta'],
    ['Lagos', 'Kosofe', 'gbagada'],
    ['Lagos', 'Kosofe', 'ketu'],
    ['Lagos', 'Alimosho', 'igando'],
    ['Rivers', 'Port Harcourt', 'pitakwa'],
    ['Anambra', 'Onitsha North', 'onitsha'],
    ['Anambra', 'Nnewi North', 'nnewi'],
  ];
  for (const [st, lga, alias] of extraAliases) {
    registerPattern(st, lga, alias);
  }

  const unique: LgaHit[] = [];
  for (const [, hits] of counts.entries()) {
    if (hits.length === 1) {
      unique.push(hits[0]);
    }
  }
  unique.sort((a, b) => b.norm.length - a.norm.length);

  const perState = new Map<string, LgaHit[]>();
  for (const [st, hits] of byState.entries()) {
    perState.set(
      st,
      [...hits].sort((a, b) => b.norm.length - a.norm.length)
    );
  }

  return { UNIQUE_LGA_MATCHES: unique, STATE_LGA_PATTERNS: perState };
})();

function containsWholePhrase(normalizedHaystack: string, phrase: string): boolean {
  if (!normalizedHaystack.includes(phrase)) return false;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`).test(normalizedHaystack);
}

function detectExplicitStateOnly(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const stateName of Object.keys(NIGERIAN_STATES_DATA)) {
    if (containsWholePhrase(lower, stateName.toLowerCase())) {
      return stateName;
    }
    const stateInfo = NIGERIAN_STATES_DATA[stateName];
    if (stateInfo.capital && containsWholePhrase(lower, stateInfo.capital.toLowerCase())) {
      return stateName;
    }
    for (const fac of stateInfo.facilities) {
      if (fac.city && containsWholePhrase(lower, fac.city.toLowerCase())) {
        return stateName;
      }
    }
  }
  if (/\b(abuja|fct|gwagwalada)\b/i.test(lower)) return 'FCT - Abuja';
  if (/\b(lagos|ikeja|yaba|lekki|surulere|ikorodu|eko|alimosho)\b/i.test(lower)) return 'Lagos';
  if (/\b(port harcourt|pitakwa|obio)\b/i.test(lower)) return 'Rivers';
  if (/\b(ibadan|ogbomoso)\b/i.test(lower)) return 'Oyo';
  if (/\b(onitsha|awka|nnewi)\b/i.test(lower)) return 'Anambra';
  if (/\b(enugu|nsukka)\b/i.test(lower)) return 'Enugu';
  if (/\b(owerri|orlu|okigwe)\b/i.test(lower)) return 'Imo';
  if (/\b(benin|irrua)\b/i.test(lower)) return 'Edo';
  if (/\b(zaria|kaduna|kafanchan)\b/i.test(lower)) return 'Kaduna';
  if (/\b(warri|asaba|sapele)\b/i.test(lower)) return 'Delta';
  if (/\b(aba|umuahia)\b/i.test(lower)) return 'Abia';
  if (/\b(jos|pankshin)\b/i.test(lower)) return 'Plateau';
  if (/\bkano\b/i.test(lower)) return 'Kano';
  if (/\b(abeokuta|ijebu|sagamu|shagamu)\b/i.test(lower)) return 'Ogun';
  if (/\bilorin\b/i.test(lower)) return 'Kwara';
  if (/\bcalabar\b/i.test(lower)) return 'Cross River';
  if (/\b(uyo|eket|ikot ekpene)\b/i.test(lower)) return 'Akwa Ibom';
  if (/\bmaiduguri\b/i.test(lower)) return 'Borno';
  if (/\bsokoto\b/i.test(lower)) return 'Sokoto';
  if (/\bbauchi\b/i.test(lower)) return 'Bauchi';
  if (/\b(makurdi|gboko|otukpo)\b/i.test(lower)) return 'Benue';
  if (/\b(abakaliki|afikpo)\b/i.test(lower)) return 'Ebonyi';
  if (/\b(akure|ondo|owo)\b/i.test(lower)) return 'Ondo';
  if (/\b(osogbo|oshogbo|ile-ife|ilesa)\b/i.test(lower)) return 'Osun';
  return undefined;
}

/** Detect Nigerian State and specific Local Government Area (LGA) when unambiguous in text. */
export function detectLocationFromText(text: string): { state?: string; lga?: string } {
  const normalized = text.toLowerCase().replace(/[/]+/g, ' ').replace(/\s+/g, ' ').trim();
  const explicitState = detectExplicitStateOnly(text);

  if (explicitState) {
    const candidates = STATE_LGA_PATTERNS.get(explicitState) || [];
    for (const c of candidates) {
      if (containsWholePhrase(normalized, c.norm)) {
        return { state: explicitState, lga: c.lga };
      }
    }
    return { state: explicitState };
  }

  for (const hit of UNIQUE_LGA_MATCHES) {
    if (containsWholePhrase(normalized, hit.norm)) {
      return { state: hit.state, lga: hit.lga };
    }
  }

  return {};
}

// Extract or match Nigerian state from text
export function detectStateFromText(text: string): string | undefined {
  return detectLocationFromText(text).state;
}

type CategoryKey = 'child_fever' | 'pregnancy' | 'purging' | 'fever' | 'cough' | 'joint_pain' | 'general';

function detectCategory(text: string): CategoryKey {
  const lower = text.toLowerCase();

  // Child / infant fever + vomiting priority
  if (
    /(pikin|child|baby|toddler|infant|year-old|yaro|jariri|shekara|ọmọ|omo|ọlọ́dún|ọmọdé|nwa|nwatakịrị|afọ atọ)/i.test(lower) &&
    /(hot|fever|vomit|refuse to eat|zazzabi|amai|gbóná|gbona|èébì|eebi|ọkụ|oku|gbọọla|igbo agbo)/i.test(lower)
  ) {
    return 'child_fever';
  }

  // Pregnancy / Antenatal priority (Pidgin, English, Hausa, Yoruba, Igbo)
  if (
    /(pregnan|expectant|antenatal|trimester|maternal|morning sickness|get belle|carry belle|belle woman|mai ciki|juna biyu|oyún|oyun|aboyún|loyún|dị ime|di ime|afọ ime)/i.test(
      lower
    )
  ) {
    return 'pregnancy';
  }

  // Purging / Diarrhea / Stomach pain
  if (
    /(purg|stool|watery|diarrh|belly|belle|stomach|cramp|cholera|zawo|murda ciki|ciwon ciki|igbe|ìgbẹ́|gbuuru|inú|inu rirun|afọ ọsịsa|afo osisa|afọ mgbu|afo mgbu|nsị mmiri|nsi mmiri|afọ na-egbu)/i.test(lower)
  ) {
    return 'purging';
  }

  // Fever / Malaria / Chills / Headache
  if (
    /(fever|hot body|body dey hot|hot like fire|chills|shaking|bitter|malaria|typhoid|headache|head dey hammer|zazzabi|zafi|ciwon kai|rawar jiki|daci|iba|ibà|gbóná|gbona|orififo|orí fífọ́|korò|ọkụ|oku|ahụ ọkụ|ahu oku|isi ọwụwa|isi na-awa|ilu|jijiji)/i.test(lower)
  ) {
    return 'fever';
  }

  // Cough & Mild Respiratory Congestion
  if (
    /(cough|catarrh|phlegm|throat|chest tight|chest dey tight|tari|matsewar kirji|mura|ikọ́|iko|fífún|àpótí àyà|ụkwara|ukwara|obi siri ike|akpịrị)/i.test(lower)
  ) {
    return 'cough';
  }

  // Joint, Bone & Sickle Cell Crisis
  if (
    /(joint|bone|waist|sickle|crisis|arthritis|gabbai|kashi|kugu|oríkèé|orikee|egungun|ìbàdí|ibadi|nkwonkwo|ọkpụkpụ|okpukpu|úkwù)/i.test(lower)
  ) {
    return 'joint_pain';
  }

  return 'general';
}

export function buildFallbackTriage(
  message: string,
  stateName: string = 'Lagos',
  language: SupportedLanguage = 'pidgin',
  lgaName?: string
): TriageResult {
  const redFlag = detectLocalRedFlags(message);
  const stateData = NIGERIAN_STATES_DATA[stateName] || NIGERIAN_STATES_DATA['Lagos'];
  const detectedLoc = detectLocationFromText(message);
  const resolvedLga =
    lgaName && STATE_LGAS[stateName]?.includes(lgaName)
      ? lgaName
      : detectedLoc.state === stateName
      ? detectedLoc.lga
      : undefined;

  const lgaFacilities = resolvedLga ? facilitiesForLga(stateName, resolvedLga) : [];
  const lgaLabels = lgaFacilities
    .slice(0, 2)
    .map((f) => `${f.name} (${resolvedLga} LGA)`);
  const flagshipLabels = stateData.facilities.map((f) => `${f.name} (${f.city})`);
  const topFacilities = Array.from(new Set([...lgaLabels, ...flagshipLabels])).slice(0, 3);
  const headers = getSectionHeaders(language);
  const hotlines = stateData.emergencyHotlines.join(', ');
  const primaryHospital = topFacilities[0] || `Nearest General Hospital in ${stateName}`;

  if (redFlag.isRedFlag) {
    const isObstetricRedFlag = /pregnancy|obstetric|fetal/i.test(redFlag.matchedSymptom || '');

    const emergencyCopy: Record<
      SupportedLanguage,
      {
        warning: string;
        empathy: string;
        causes: string;
        home: string;
        action: string;
      }
    > = {
      pidgin: isObstetricRedFlag
        ? {
            warning: `🚨 PREGNANCY DANGER SIGN: Dis sign inside belle (${redFlag.matchedSymptom}) na emergency wey Maternity Doctor must check sharp-sharp!`,
            empathy: `Pele mummy! Make you no fear, but abeg rush go Maternity / Labour Ward right now to protect both you and your baby.`,
            causes: `Bleeding inside belle, heavy headache with eye blur/swollen face (Pre-eclampsia high BP), early water break, or baby wey stop to kick fit put both mother and baby life inside danger if doctor no attend fast.`,
            home: `NO TAKE ANY DRUG OR AGBO FOR HOUSE! Cancel all herbal mix, painkiller, or chemist medicine now. Lie slightly on your left side while somebody carry you go hospital sharp-sharp.`,
            action: `🚨 RUSH GO MATERNITY / EMERGENCY WARD NOW! Proceed straight to ${primaryHospital} or the nearest General Hospital / Maternity Centre inside ${stateName} State immediately!\n\nHospitals wey dey close:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nCall 112 (National Toll-Free) or ${hotlines} sharp-sharp!`,
          }
        : {
            warning: `🚨 DANGER DEY: Wetin you talk (${redFlag.matchedSymptom || 'this acute symptom'}) na dangerous red-flag emergency sign!`,
            empathy: `Ayaah! Sorry o, stay calm and rush go hospital now now!`,
            causes: `This kind symptom fit mean say heart, breath, or serious blood condition dey happen wey doctor must check with emergency machine immediately.`,
            home: `NO DO ANY HOUSE TREATMENT! All home remedies cancel. Loosen tight cloth, sit or lie down carefully, and let somebody carry you run go hospital now.`,
            action: `🚨 EMERGENCY O! Drop everything, no waste one second for house! Rush sharp-sharp go ${primaryHospital} or nearest General Hospital inside ${stateName} State now now!\n\nHospitals wey dey close:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nCall 112 (National Toll-Free) or ${hotlines} sharp-sharp!`,
          },
      english: isObstetricRedFlag
        ? {
            warning: `🚨 MATERNITY EMERGENCY ALERT: ${redFlag.matchedSymptom || 'Obstetric warning sign'} requires immediate Maternity / Emergency Hospital evaluation!`,
            empathy: `Please remain calm and arrange immediate transport to the Maternity or Emergency Unit right now to protect both mother and baby.`,
            causes: `Danger signs in pregnancy—such as vaginal bleeding, severe headache with blurred vision or facial swelling (Pre-eclampsia/high blood pressure in pregnancy), premature water breaking, or reduced/absent baby movement—require urgent specialist obstetric care.`,
            home: `ALL HOME REMEDIES CANCELLED! Do not take unprescribed painkillers, aspirin/ibuprofen, or herbal mixtures ("agbo"). Rest gently on your left side during transport to the hospital.`,
            action: `🚨 Bypass home waiting and proceed IMMEDIATELY to the Maternity / Emergency Unit at ${primaryHospital} or the nearest General Hospital in ${stateName} State.\n\nNearby emergency facilities:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nCall 112 (National Emergency) or ${hotlines} immediately!`,
          }
        : {
            warning: `🚨 RED-FLAG EMERGENCY: Your symptoms (${redFlag.matchedSymptom || 'acute warning sign'}) require immediate emergency hospital care!`,
            empathy: `Please remain calm and arrange emergency transport to the hospital right now.`,
            causes: `These symptoms can indicate an acute cardiac, respiratory, neurological, or life-threatening emergency that requires urgent medical resuscitation and equipment.`,
            home: `ALL HOME REMEDIES CANCELLED! Do not take herbal mixtures or self-medicate. Loosen tight clothing and have someone take you to the emergency room immediately.`,
            action: `🚨 Bypass all home care and proceed IMMEDIATELY to ${primaryHospital} or the nearest Emergency Department in ${stateName} State.\n\nNearby emergency facilities:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nCall 112 (National Emergency) or ${hotlines} immediately!`,
          },
      hausa: isObstetricRedFlag
        ? {
            warning: `🚨 GAGGAWAR HAIHUWA DA CIKI: Alamun da kika ambata a lokacin ciki suna bukatar ganin likitan mata na gaggawa nan take!`,
            empathy: `Sannu uwa! Kwantar da hankalinki kuma a garzaya da ke zuwa sashin haihuwa na asibiti yanzu-yanzu don kare lafiyar ki da ta jariri.`,
            causes: `Zubar jini yayin ciki, ciwon kai mai tsanani da disashewar gani ko kumburin fuska (Pre-eclampsia / hawan jini na ciki), fashewar ruwan mahaifa da wuri, ko daina motsin jariri na bukatar agajin gaggawa a asibiti.`,
            home: `KADA A SHA WANI MAGANIN GIDA KO NA GARGAJIYA! An hana duk wani jiko ko maganin rage zafi ba tare da izinin likita ba. Kwanta a gefen hagu a hankali yayin da ake kaiki asibiti nan take.`,
            action: `🚨 Yi maza-maza ki tafi sashin haihuwa na ${primaryHospital} ko Asibitin Gwamnati mafi kusa a jihar ${stateName} yanzu-yanzu!\n\nAsibitoci mafi kusa:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nKira 112 (kyauta) ko ${hotlines} ba tare da bata lokaci ba!`,
          }
        : {
            warning: `🚨 GAGGAWA CE MAI HATSARI: Alamun da ka fada suna nuna matsanancin yanayin gaggawa da ke bukatar likita nan take!`,
            empathy: `Sannu! Kwantar da hankalinka kuma a garzaya da kai asibiti yanzu-yanzu!`,
            causes: `Wadannan alamun suna iya nuna matsalar zuciya, numfashi, jini, ko kwakwalwa da ke bukatar na'urorin gaggawa na asibiti nan take.`,
            home: `KADA A YI WANI MAGANIN GIDA! An soke duk shan magani ko jiko a gida. Sake tufafi masu matsewa kuma wani ya kai ka dakin gaggawa na asibiti yanzu.`,
            action: `🚨 Yi maza-maza ka tafi ${primaryHospital} ko Asibitin Gwamnati mafi kusa a jihar ${stateName} yanzu-yanzu!\n\nAsibitoci mafi kusa:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nKira 112 (layin gaggawa na kasa kyauta) ko ${hotlines} ba tare da bata lokaci ba!`,
          },
      yoruba: isObstetricRedFlag
        ? {
            warning: `🚨 PÀJÁWÌRÌ OYÚN & ÌBÍMỌ: Àwọn àmì ewu nínú oyún yìí nílò ìtọ́jú pàjáwìrì ní ẹ̀ka ìbímọ ilé-ìwòsàn lẹ́sẹ̀kẹsẹ̀!`,
            empathy: `Pẹ̀lẹ́ ìyá! Ẹ fọkàn balẹ̀ kí ẹ sì sáré lọ sí ilé-ìwòsàn aboyún báyìí láti dáàbò bo ìyá àti ọmọ.`,
            causes: `Ẹ̀jẹ̀ yíyọ nínú oyún, orí fífọ́ líle pẹ̀lú ojú rírí bàìbàì tàbí wíwú ojú (Pre-eclampsia / ẹ̀jẹ̀ ríru nínú oyún), omi oyún tó dà ṣáájú àsìkò, tàbí àìrìn ọmọ nínú oyún jẹ́ àmì pàjáwìrì tó nílò dọ́kítà aboyún kíákíá.`,
            home: `Ẹ MÁ ṢE OÒGÙN ILÉ TÀBÍ ÀGBO KANKAN! A ti fagi lé gbogbo àgbo tàbí oògùn ilé. Ẹ dùbúlẹ̀ sí ẹ̀gbẹ́ òsì ní pẹ̀lẹ́ kí ẹnikẹ́ni gbé yín lọ sí ilé-ìwòsàn lẹ́sẹ̀kẹsẹ̀.`,
            action: `🚨 Ẹ sáré lọ sí ẹ̀ka ìbímọ ní ${primaryHospital} tàbí Ilé-ìwòsàn Ìjọba tó súnmọ́ yín ní Ìpínlẹ̀ ${stateName} báyìí!\n\nÀwọn ilé-ìwòsàn tó wà nítòsí:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nẸ pe 112 (lọ́fẹ̀ẹ́) tàbí ${hotlines} lẹ́sẹ̀kẹsẹ̀!`,
          }
        : {
            warning: `🚨 PÀJÁWÌRÌ EWU: Àwọn àmì àìsàn tí ẹ sọ yìí jẹ́ pàjáwìrì gidi tó nílò ìtọ́jú ilé-ìwòsàn lẹ́sẹ̀kẹsẹ̀!`,
            empathy: `Ẹ fọkàn balẹ̀ kí ẹ sì sáré lọ sí ilé-ìwòsàn báyìí!`,
            causes: `Àwọn àmì wọ̀nyí lè túmọ̀ sí ìṣòro líle ní ọkàn, èémí, tàbí ẹ̀jẹ̀ tí dọ́kítà gbọ́dọ̀ fi ẹ̀rọ pàjáwìrì yẹ̀ wò lẹ́sẹ̀kẹsẹ̀.`,
            home: `Ẹ MÁ ṢE OÒGÙN ILÉ KANKAN! A ti fagi lé gbogbo àgbo tàbí oògùn ilé. Ẹ tú aṣọ tó fún yín kí ẹnikẹ́ni sì gbé yín sáré lọ sí ilé-ìwòsàn báyìí.`,
            action: `🚨 Ẹ sáré lọ sí ${primaryHospital} tàbí Ilé-ìwòsàn Ìjọba tó súnmọ́ yín ní Ìpínlẹ̀ ${stateName} lẹ́sẹ̀kẹsẹ̀!\n\nÀwọn ilé-ìwòsàn tó wà nítòsí:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nẸ pe 112 (lọ́fẹ̀ẹ́) tàbí ${hotlines} báyìí!`,
          },
      igbo: isObstetricRedFlag
        ? {
            warning: `🚨 MBEREDE AFỌ IME DỊ EGWU: Mgbaàmà ndị a n'oge afọ ime chọrọ nlekọta ngalaba ọmụmụ ụlọ ọgwụ ozugbo!`,
            empathy: `Ndo nu nne! Nwee obi ike ma gbaa ọsọ gaa ngalaba ọmụmụ (Maternity) ugbu a iji chebe nne na nwa.`,
            causes: `Ọbara ịpụ n'oge ime, isi ọwụwa siri ike na anya ghara ịhụ ụzọ nke ọma ma ọ bụ ihu fụrụ afụ (Pre-eclampsia / ọbara mgbali elu n'afọ ime), mmiri ime ịgbawa n'oge na-erughị erughị, ma ọ bụ nwa ịkwụsị imegharị ahụ chọrọ dọkịta ọmụmụ ozugbo.`,
            home: `AṄỤLA ỌGWỤ ỤLỌ MA Ọ BỤ AGBO Ọ BỤLA! A kagbuola ọgwụ ọdịnala na ọgwụ mgbu niile. Dina n'akụkụ aka ekpe gị ka mmadụ buru gị gaa ụlọ ọgwụ ugbu a.`,
            action: `🚨 Gbaa ọsọ gaa ngalaba ọmụmụ nke ${primaryHospital} ma ọ bụ General Hospital kacha nso na Steeti ${stateName} ozugbo!\n\nỤlọ ọgwụ ndị dị gị nso:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nKpọọ 112 (n'efu) ma ọ bụ ${hotlines} ugbu a!`,
          }
        : {
            warning: `🚨 MBEREDE DỊ EGWU: Mgbaàmà ndị a ị kọwara bụ ihe ịrịba ama mberede dị egwu chọrọ nlekọta ụlọ ọgwụ ozugbo!`,
            empathy: `Ndo nu! Nwee obi ike ma gbaa ọsọ gaa ụlọ ọgwụ ugbu a!`,
            causes: `Mgbaàmà ndị a nwere ike igosi nsogbu siri ike nke obi, iku ume, ọbara, ma ọ bụ ụbụrụ nke chọrọ ngwaọrụ mberede ụlọ ọgwụ ozugbo.`,
            home: `EMELA ỌGWỤ ỤLỌ Ọ BỤLA! A kagbuola ọgwụ ụlọ niile. Tọghe uwe siri ike ma mee ka mmadụ buru gị gbaa ọsọ gaa ngalaba mberede ụlọ ọgwụ ugbu a.`,
            action: `🚨 Gbaa ọsọ gaa ${primaryHospital} ma ọ bụ General Hospital kacha nso na Steeti ${stateName} ozugbo!\n\nỤlọ ọgwụ ndị dị gị nso:\n${topFacilities.map((f) => `• ${f}`).join('\n')}\n\nKpọọ 112 (n'efu) ma ọ bụ ${hotlines} ugbu a!`,
          },
    };

    const c = emergencyCopy[language];
    return {
      language,
      urgencyLevel: 'emergency',
      isRedFlag: true,
      emergencyWarning: c.warning,
      empathyNote: c.empathy,
      wetinFitDeyHappen: c.causes,
      wetinYouFitDoForHouse: c.home,
      nextStep: c.action,
      potentialCauses: c.causes,
      homeManagement: c.home,
      actionPlan: c.action,
      recommendedFacilities: topFacilities,
      detectedLocation: stateName,
      detectedLga: resolvedLga,
      clarifyingQuestions: [],
      disclaimer: headers.disclaimer,
      fullFormattedResponse: buildFormattedResponse(language, {
        isRedFlag: true,
        emergencyWarning: c.warning,
        empathyNote: c.empathy,
        causes: c.causes,
        home: c.home,
        action: c.action,
        disclaimer: headers.disclaimer,
      }),
    };
  }

  const category = detectCategory(message);

  type CategoryContent = {
    urgencyLevel: 'urgent' | 'routine';
    empathy: string;
    causes: string;
    home: string;
    action: string;
    questions: string[];
  };

  const CONTENT: Record<CategoryKey, Record<SupportedLanguage, CategoryContent>> = {
    child_fever: {
      pidgin: {
        urgencyLevel: 'urgent',
        empathy: 'Ayaah, pele for your small pikin o! Children fever and vomiting need sharp care so dem no dry out.',
        causes: 'When small pikin body dey hot well-well and e dey vomit, common causes inside Nigeria na severe Malaria, ear/throat infection, or stomach infection.',
        home: '1. Use clean towel dipped in ordinary lukewarm water (NO use ice block, cold water, or methylated spirit!) wipe pikin forehead, armpit, and neck.\n2. Dress pikin in light cotton cloth — no wrap pikin inside thick blanket.\n3. Give small sips of ORS (Salt-Sugar Solution) or breastmilk every 5 minutes with spoon make pikin no weak.',
        action: `Because pikin refuse to eat or drink and dey vomit, carry am go ${primaryHospital} or nearest General Hospital / Paediatric Clinic today! If pikin weak well-well, eye sink, or convulse, run go emergency immediately.`,
        questions: [
          'How many hours since the pikin last piss (wet diaper)?',
          'The pikin dey weak well-well or find am hard to wake up?',
        ],
      },
      english: {
        urgencyLevel: 'urgent',
        empathy: 'I am very sorry your little child is unwell. High fever with vomiting in young children requires prompt attention to prevent dehydration.',
        causes: 'High fever, vomiting, and poor feeding in a child under 5 in Nigeria are most commonly caused by acute Malaria, viral/bacterial throat or ear infections, or acute gastroenteritis.',
        home: '1. Cool gently with lukewarm tepid sponging (never use cold water, ice, or methylated spirit).\n2. Dress the child in a single light cotton layer; avoid heavy blankets.\n3. Offer frequent small sips (one teaspoon every few minutes) of ORS or breast milk to avoid dehydration.',
        action: `Since the child is vomiting and refusing fluids, take them promptly to ${primaryHospital} or the nearest General Hospital / Children's Emergency today for a rapid malaria test and hydration check. Seek emergency help immediately if drowsiness, sunken eyes, or convulsions occur.`,
        questions: [
          'How long ago did your child last pass urine?',
          'Does your child seem unusually drowsy or difficult to wake?',
        ],
      },
      hausa: {
        urgencyLevel: 'urgent',
        empathy: 'Sannu! Allah Ya baiwa yaro lafiya. Zazzabi da amai ga kananan yara yana bukatar kulawa cikin gaggawa don kar ruwa ya kare a jikinsu.',
        causes: 'Zazzabi mai zafi tare da amai da kin cin abinci a kananan yara a Najeriya yawanci yana zuwa ne daga cutar zazzabin cizon sauro (Malaria), ciwon makogwaro/kunne, ko matsalar ciki.',
        home: '1. Yi amfani da kyallen da aka jika a ruwa mai dumi kadan (kada a yi amfani da ruwan kankara ko spirit!) don goge goshin yaron da hamata.\n2. Sanya wa yaron riga marar nauyi — kada a lullube shi da bargo mai kauri.\n3. Bashi ruwan ORS (ruwan gishiri da sukari) ko nono cokali-cokali akai-akai don kar jiki ya bushe.',
        action: `Tunda yaron yana amai kuma ya ki cin abinci ko shan ruwa, a dauke shi a kai ${primaryHospital} ko Asibitin Yara mafi kusa yau don gwajin Malaria da duba lafiya. Idan idanu sun zurma ko yaron ya kasa motsi ko ya yi farfadiya, a garzaya dakin gaggawa nan take.`,
        questions: [
          'Yaushe rabon da yaron ya yi fitsari?',
          'Shin yaron yana yawan bacci mai nauyi ko kasa tashi?',
        ],
      },
      yoruba: {
        urgencyLevel: 'urgent',
        empathy: 'Pẹ̀lẹ́ o! Olúwa á wo ọmọ náà sàn. Ibà gbígbóná àti èébì lára ọmọdé nílò ìtọ́jú kíákíá kí omi ara rẹ̀ má baà gbẹ.',
        causes: 'Ara gbígbóná tó le pẹ̀lú èébì àti àìfẹ́ jẹun lára ọmọ kékeré sábà máa ń wá láti ara Ibà (Malaria), àkóràn ọ̀fun tàbí etí, tàbí àìsàn inú.',
        home: '1. Fi aṣọ tútù díẹ̀ (omi lásán tí kò tutù ju, kìí ṣe yìnyín tàbí spirit) nu iwájú orí àti abẹ́ apá ọmọ.\n2. Wọ aṣọ fẹ́lẹ́fẹ́lẹ́ fún ọmọ — ẹ má bo ọmọ ní aṣọ tó nípọn.\n3. Fi ṣíbí fún un ní omi ORS (omi iyọ̀ àti ṣúgà) díẹ̀díẹ̀ tàbí ọmú ní ìṣẹ́jú díẹ̀díẹ̀.',
        action: `Nítorí pé ọmọ ń bì kò sì fẹ́ mu omi, ẹ gbé e lọ sí ${primaryHospital} tàbí Ilé-ìwòsàn Ìjọba lónìí fún àyẹ̀wò Malaria àti ìtọ́jú. Tí ojú rẹ̀ bá wọlẹ̀, tó rẹ̀ púpọ̀, tàbí tó ń gíri, ẹ sáré lọ sí ẹ̀ka pàjáwìrì lẹ́sẹ̀kẹsẹ̀.`,
        questions: [
          'Ìgbà wo ni ọmọ náà tọ̀ kẹ́yìn?',
          'Ṣé ọmọ náà ń sùn jù tàbí kò tètè jí?',
        ],
      },
      igbo: {
        urgencyLevel: 'urgent',
        empathy: 'Ndo nu! Chineke ga-agwọ nwatakịrị ahụ. Ahụ ọkụ na ịgbọ agbọ n\'ime ụmụaka chọrọ nlekọta ngwa ngwa ka mmiri ghara ịgwụ ha n\'ahụ.',
        causes: 'Ahụ ọkụ dị elu, ịgbọ agbọ, na ọjụjụ nri n\'ime nwatakịrị na Naịjirịa na-abụkarị site na Ịba (Malaria), ọrịa akpịrị ma ọ bụ ntị, ma ọ bụ nsogbu afọ.',
        home: '1. Jiri ákwà dị ọcha e tinyere na mmiri na-adịghị oyi (ejila mmiri oyi ma ọ bụ methylated spirit!) hichaa egedege ihu na abụba nwa.\n2. Yikwasị nwa ahụ uwe dị mfe — ekpuchila ya blanket dị arọ.\n3. Na-enye ya obere mmiri ORS (mmiri nnu na shuga) ma ọ bụ ara nne n\'obere ngaji kwa nkeji ole na ole.',
        action: `Ebe nwa ahụ na-agbọ agbọ ma jụ ịṅụ mmiri, kpọga ya ${primaryHospital} ma ọ bụ General Hospital kacha nso taa maka nyocha Malaria. Ọ bụrụ na anya nwa ahụ dara n\'ime ma ọ bụ na-ama jijiji, gbaa ọsọ gaa ngalaba mberede ozugbo.`,
        questions: [
          'Mgbe ole ka nwa ahụ nyụrụ mamịrị ikpeazụ?',
          'Nwa ahụ ọ na-rahụ ụra nke ukwuu ma ọ bụ na-esiri ike ịkpọte?',
        ],
      },
    },

    pregnancy: {
      pidgin: {
        urgencyLevel: 'urgent',
        empathy: 'Congratulations & pele o, Mama! When woman get belle (pregnant), every symptom need gentle, extra careful attention to protect both you and pikin.',
        causes: 'Morning vomiting, weakness, tiredness, or mild fever inside pregnancy fit happen because body hormones dey change, anemia (low blood), urinary infection, or malaria inside pregnancy.',
        home: '1. STRICTLY NO SELF-MEDICATION: No swallow Ibuprofen, Diclofenac, Aspirin, random chemist drugs, or local agbo/herbs without your antenatal doctor permission!\n2. Eat small dry food early morning (crackers, toast) and sip clean water or ORS little by little so you no dry out.\n3. If hot body dey, wipe gently with lukewarm water towel only (no spirit or ice) and rest under treated mosquito net.',
        action: `Book or walk into your Antenatal Clinic (ANC) or Maternity Ward at ${primaryHospital} promptly so nurse/doctor fit check your BP, blood level, and urine/malaria safely. 🚨 RUSH TO EMERGENCY SHARP-SHARP if you see ANY blood, eye blur, heavy headache, face swelling, water breaking, or pikin no dey kick well.`,
        questions: [
          'How many months or weeks your pregnancy be right now?',
          'Any blood spot, blurred eye, face swelling, or pikin stop kicking?',
        ],
      },
      english: {
        urgencyLevel: 'urgent',
        empathy: 'Warm congratulations, and sorry you are feeling uncomfortable. Pregnancy requires extra-careful screening to protect both mother and baby.',
        causes: 'Weakness, morning nausea/vomiting, or fever during pregnancy can stem from hormonal morning sickness, low blood levels (anaemia), urinary tract infection, or malaria in pregnancy.',
        home: '1. DO NOT SELF-MEDICATE: Avoid unprescribed painkillers (especially Ibuprofen, Diclofenac, Aspirin), chemist antibiotics, or herbal concoctions ("agbo") unless approved by your antenatal doctor.\n2. Eat small dry meals frequently and sip clean water or ORS slowly to prevent dehydration.\n3. For mild fever, use lukewarm tepid sponging only and always sleep under an insecticide-treated mosquito net.',
        action: `Visit your registered Antenatal Clinic (ANC) or Maternal Unit at ${primaryHospital} promptly for blood pressure, blood count, and safe malaria/urine checks. 🚨 Seek emergency maternity care IMMEDIATELY if you notice ANY vaginal bleeding, severe headache, blurred vision, sudden face/hand swelling, leaking fluid, or reduced baby movement.`,
        questions: [
          'How many weeks or months pregnant are you currently?',
          'Are you having any bleeding, severe headache, blurred vision, face swelling, or reduced baby kicks?',
        ],
      },
      hausa: {
        urgencyLevel: 'urgent',
        empathy: 'Sannu da kokari, Mama! A lokacin da mace take da juna biyu, duk wani rashin lafiya yana bukatar kulawa ta musamman don kare lafiyar uwa da ta jariri.',
        causes: 'Amai na safe, kasala, ko zazzabi a lokacin ciki yakan faru ne saboda canjin jiki na ciki, karancin jini, sanyin mara (UTI), ko zazzabin cizon sauro (Malaria).',
        home: '1. KADA A SHA MAGANI BA TARE DA LIKITA BA: Guji magungunan radadi kamar Ibuprofen/Diclofenac, antibiotics na kasuwa, ko maganin gargajiya/jiko ba tare da izinin likitan asibiti ba.\n2. Ci abinci kadan-kadan kuma a rika kurbar ruwa mai tsabta ko ORS a hankali don kar ruwa ya kare.\n3. Idan akwai zazzabi kadan, a goge jiki da ruwa mai dumi kadan sannan a kwana cikin gidan sauro.',
        action: `A gaggauta zuwa asibitin haihuwa / Antenatal Clinic (ANC) a ${primaryHospital} don auna jini (BP), gwajin jini, da Malaria cikin aminci. 🚨 A GARZAYA ASIBITI NAN TAKE idan aka ga jini, ciwon kai mai tsanani, disashewar gani, kumburin fuska, fashewar ruwan ciki, ko jariri ya daina motsi.`,
        questions: [
          'Cikin ya kai wata nawa ko mako nawa yanzu?',
          'Shin akwai zubar jini, matsanancin ciwon kai, disashewar gani, kumburin fuska, ko jariri ya daina motsi?',
        ],
      },
      yoruba: {
        urgencyLevel: 'urgent',
        empathy: 'Pẹ̀lẹ́ o, Ìyá Ìbejì/Aláboyún! Nígbà tí obìnrin bá lóyún, gbogbo àìsàn nílò àbójútó ṣọ́ra púpọ̀ láti dáàbò bo ìyá àti ọmọ.',
        causes: 'Èébì àárọ̀, àárẹ̀, tàbí ibà nígbà oyún lè wá láti ara ìyípadà oyún, àìtó ẹ̀jẹ̀, àkóràn ilé-ìtọ̀, tàbí Ibà (Malaria) nínú oyún.',
        home: '1. Ẹ MÁ LO OÒGÙN FÚNRA YÍN: Yẹra fún àwọn oògùn ìrora bíi Ibuprofen/Diclofenac, Aspirin, tàbí àgbo ìbílẹ̀ láì gba àṣẹ lọ́dọ̀ dọ́kítà oyún (ANC)!\n2. Jẹ oúnjẹ díẹ̀díẹ̀ léraléra kí o sì mu omi mímọ́ tàbí ORS díẹ̀díẹ̀.\n3. Tí ara bá gbóná díẹ̀, nu ara pẹ̀lú aṣọ omi dídùn lásán kí o sì sùn lábẹ́ àwọ̀n ẹ̀fọn.',
        action: `Ẹ lọ sí ilé-ìwòsàn ìtọ́jú aláboyún (ANC) ní ${primaryHospital} kíákíá fún àyẹ̀wò ìfúnpá ẹ̀jẹ̀ (BP), ẹ̀jẹ̀, àti Ibà tó láàbò. 🚨 Ẹ SÁRÉ LỌ SÍ YÀRÁ PÀJÁWÌRÌ LẸ́SẸ̀KẸSẸ̀ tí ẹ bá rí ẹ̀jẹ̀, orí fífọ́ líle, ojú ríran bàìbàì, wíwú ojú/ọwọ́, omi oyún tó dà jáde, tàbí tí ọmọ kò bá yípo mọ́.`,
        questions: [
          'Ọ̀sẹ̀ tàbí oṣù mélòó ni oyún náà wà báyìí?',
          'Ṣé ẹ rí ẹ̀jẹ̀, orí fífọ́ líle, ojú bàìbàì, wíwú ojú, tàbí ọmọ kò mí nínú mọ́?',
        ],
      },
      igbo: {
        urgencyLevel: 'urgent',
        empathy: 'Ndo nu, Mama! Mgbe nwaanyị dị ime, mgbaàmà ahụike ọ bụla chọrọ nlekọta pụrụ iche iji chebe nne na nwa nọ n\'afọ.',
        causes: 'Ịgbọ agbọ ụtụtụ, ike ọgwụgwụ, ma ọ bụ ahụ ọkụ n\'ime ime nwere ike isite na mgbanwe nke ime, ụkọ ọbara, ọrịa mamịrị (UTI), ma ọ bụ Ịba (Malaria).',
        home: '1. AṄỤLA ỌGWỤ N\'ONWE GỊ: Zere ọgwụ mgbu dịka Ibuprofen/Diclofenac, Aspirin, antibiotics n\'echeghị dọkịta, ma ọ bụ mgbọrọgwụ ("agbo") ma ọ bụrụ na dọkịta ANC ekweghị!\n2. Rie obere nri kpọrọ nkụ mgbe niile ma na-aṅụ mmiri dị ọcha ma ọ bụ ORS nwayọọ nwayọọ.\n3. Maka ahụ ọkụ dị nro, jiri ákwà mmiri na-adịghị oyi hichaa ahụ ma rahụ n\'okpuru netị anwụnta.',
        action: `Gaa ụlọ ọgwụ nlekọta ndị dị ime (Antenatal Clinic) na ${primaryHospital} ozugbo maka nlele BP, ọbara, na Malaria dị nchebe. 🚨 GBAA ỌSỌ GAA NGALABA MBEREDE UGBU A ma ọ bụrụ na ị hụ ọbara, isi ọwụwa dị egwu, anya ịhụghị nke ọma, ihu/aka fụrụ afụ, mmiri ịgbawa, ma ọ bụ nwa akwụsị imegharị.`,
        questions: [
          'Ọnwa ma ọ bụ izu ole ka ime ahụ dị ugbu a?',
          'Ị na-ahụ ọbara, isi ọwụwa dị egwu, anya ịhụghị ụzọ, ihu fụrụ afụ, ma ọ bụ nwa adịghị emegharị?',
        ],
      },
    },

    purging: {
      pidgin: {
        urgencyLevel: 'urgent',
        empathy: 'Ayaah, sorry o! When belle dey bite and person dey purge watery stool, e dey sap strength sharp-sharp.',
        causes: 'Belle bite and watery purging fit happen when germ enter food or drinking water (gastroenteritis / food poisoning). Inside rainy season, e fit be warning for cholera too.',
        home: '1. Mix Salt-Sugar Solution (Home ORS): Inside 1 litre clean boiled water (two 50cl pure-water sachets), put 1 level small spoon salt + 10 level small spoons sugar (or 5 cubes). Turn am well.\n2. Drink 1 full cup after every time you go purge.\n3. Eat light food like pap (akamu), ripe banana, or soft white rice. Stop roadside food or sugary minerals for now.',
        action: `If purging pass 5 to 6 times inside 1 day, or you see blood inside stool, or eye dey turn you when you stand up, waka go ${primaryHospital} or nearest clinic immediately.`,
        questions: [
          'Any blood dey inside the watery stool?',
          'You fit hold water or ORS for stomach without vomiting am out?',
        ],
      },
      english: {
        urgencyLevel: 'urgent',
        empathy: 'So sorry you are dealing with stomach cramps and watery stool. Replacing lost fluids quickly is the top priority.',
        causes: 'Frequent watery stool (purging) with stomach cramps is usually acute gastroenteritis from contaminated food or water. During heavy rains, it can also require cholera precautions.',
        home: '1. Prepare Oral Rehydration Solution (Salt-Sugar Solution): Mix 1 level teaspoon of salt + 10 level teaspoons of sugar (or 5 sugar cubes) in 1 litre of clean boiled or treated water.\n2. Drink one full cup after every loose stool.\n3. Eat bland foods like pap (akamu), rice, or bananas, and avoid dairy, spicy foods, and sugary sodas.',
        action: `Visit ${primaryHospital} or your nearest clinic promptly if purging exceeds 5 times in 24 hours, if blood appears in the stool, if you have a high fever, or if you feel dizzy when standing.`,
        questions: [
          'Have you noticed any blood or mucus in your stool?',
          'Are you able to keep fluids down without vomiting?',
        ],
      },
      hausa: {
        urgencyLevel: 'urgent',
        empathy: 'Sannu da jiki! Allah Ya sauwake. Murda ciki da zawo mai ruwa suna sa karfin jiki ya kare da sauri, don haka shan ruwa yana da muhimmanci sosai.',
        causes: 'Zawo mai ruwa tare da murda ciki yakan faru ne idan kwayoyin cuta sun shiga ciki ta hanyar abinci marar tsabta ko gurbataccen ruwa. A lokacin damina, yana da kyau a kiyaye cutar kwalara.',
        home: '1. Hada ruwan gishiri da sukari (ORS): A cikin lita daya (1L) ta ruwa mai tsabta (ledar pure water biyu), zuba karamin cokali daya (1) na gishiri da cokula goma (10) na sukari (ko sukari guda 5), a motsa sosai.\n2. Sha kofi daya cike duk lokacin da aka yi zawo.\n3. Ci abinci mai laushi kamar koko (akamu), shinkafa, ko ayaba; ka guji abincin titi da lemun kwalba.',
        action: `Idan zawon ya wuce sau 5 zuwa 6 a rana daya, ko akwai jini a bayan gida, ko kana jin jiri idan ka tashi tsaye, tafi ${primaryHospital} ko cibiyar lafiya mafi kusa nan take.`,
        questions: [
          'Shin akwai jini a cikin zawon?',
          'Kana iya rike ruwan ORS a ciki ba tare da yin amai ba?',
        ],
      },
      yoruba: {
        urgencyLevel: 'urgent',
        empathy: 'Pẹ̀lẹ́ o! Inú rírun àti ìgbẹ́ gbuuru máa ń fa agbára ara lọ kíákíá, nítorí náà rírọ́pò omi ara ṣe pàtàkì gan-an.',
        causes: 'Ìgbẹ́ gbuuru olómi àti inú rírun sábà máa ń jẹ́ àkóràn inú láti ara oúnjẹ tàbí omi tí kò mọ́. Ní àsìkò òjò, ó tún lè jẹ́ ìkìlọ̀ àrùn kọ́lẹ́rà (onígbáméjì).',
        home: '1. Pèsè omi iyọ̀ àti ṣúgà (ORS): Nínú líítà omi mímọ́ kan (ọ̀rá pure water méjì), fi ṣíbí iyọ̀ kékeré kan (1) àti ṣíbí ṣúgà mẹ́wàá (10) (tàbí onígun 5) sínú rẹ̀, kí o sì rò ó pọ̀ dáadáa.\n2. Mu ife kan lẹ́hìn ìgbẹ́ gbuuru kọ̀ọ̀kan.\n3. Jẹ oúnjẹ fẹ́lẹ́fẹ́lẹ́ bíi ògì (akamu), ìrẹsì mímọ́, tàbí ọ̀gẹ̀dẹ̀; yẹra fún oúnjẹ ìta àti ohun mímu olóòórùn.',
        action: `Tí ìgbẹ́ gbuuru náà bá ju ìgbà márùn-ún lọ lójúmọ́ kan, tàbí tí ẹ̀jẹ̀ bá wà nínú ìgbẹ́, tàbí oòyì bá ń kọ́ ọ nígbà tí o bá dìde, ẹ lọ sí ${primaryHospital} tàbí ilé-ìwòsàn tó súnmọ́ yín lẹ́sẹ̀kẹsẹ̀.`,
        questions: [
          'Ṣé ẹ rí ẹ̀jẹ̀ nínú ìgbẹ́ olómi náà?',
          'Ṣé ẹ lè mu omi tàbí ORS láì bì í síta?',
        ],
      },
      igbo: {
        urgencyLevel: 'urgent',
        empathy: 'Ndo nu! Afọ mgbu na afọ ọsịsa mmiri mmiri na-adọpụ ike n\'ahụ ọsịsọ, ya mere ịṅụ mmiri dị ọcha ugbu a dị oke mkpa.',
        causes: 'Afọ mgbu na nsị mmiri mmiri (purging) na-esikarị n\'nje dị na nri ma ọ bụ mmiri ruru unyi. N\'oge udu mmiri, ọ nwekwara ike ịbụ ịdọ aka ná ntị maka ọrịa cholera.',
        home: '1. Kwadebe Mmiri Nnu na Shuga (Home ORS): N\'ime otu lita mmiri dị ọcha e siri esi (pure water abụọ), tinye 1 obere ngaji nnu + obere ngaji shuga 10 (ma ọ bụ cube shuga 5), gwakọta ya nke ọma.\n2. Ṅụọ otu iko zuru ezu mgbe ọ bụla ị gara ụlọ mposi.\n3. Rie nri dị nro dịka akamu, unere chara acha, ma ọ bụ osikapa dị ọcha; zere nri okporo ụzọ na ihe ọṅụṅụ nwere shuga.',
        action: `Ọ bụrụ na afọ ọsịsa ahụ agafe ugboro 5 ruo 6 n\'otu ụbọchị, ma ọ bụ ị hụ ọbara na nsị gị, ma ọ bụ anya na-agba gị gburugburu ma i bilie, gaa ${primaryHospital} ma ọ bụ ụlọ ọgwụ kacha nso ozugbo.`,
        questions: [
          'Ọbara ọ dị n\'ime nsị mmiri mmiri ahụ?',
          'Ị na-enwe ike ịṅụ mmiri ma ọ bụ ORS n\'agbọghị agbọ?',
        ],
      },
    },

    fever: {
      pidgin: {
        urgencyLevel: 'urgent',
        empathy: 'Pele o! This kind hot body, headache, and bitter mouth fit make person weak patapata.',
        causes: 'Inside Nigeria, hot body with cold chills, head pain, and bitter taste for mouth na common sign of Malaria (from female Anopheles mosquito bite) or Typhoid fever. E fit still be viral flu.',
        home: '1. Use clean towel dipped in lukewarm water (no use cold water or spirit!) rub forehead, armpit, and neck make hotness drop.\n2. Drink plenty clean water or fresh juice.\n3. Rest well inside cool room under insecticide-treated mosquito net.\n4. Standard Paracetamol fit ease fever and body pain.',
        action: `Abeg go clinic or pharmacy lab run quick Malaria RDT test first before you swallow antimalarial drugs. If hot body pass 2 days, or you dey vomit everything, or piss turn dark brown like Coca-Cola, waka go ${primaryHospital} immediately.`,
        questions: [
          'How many days the hot body and headache don start?',
          'You dey vomit or notice yellow eyes / dark tea-coloured urine?',
        ],
      },
      english: {
        urgencyLevel: 'urgent',
        empathy: 'So sorry you are feeling feverish and weak. Testing properly before taking medication is the safest step.',
        causes: 'High fever with chills, headache, body aches, and a bitter mouth in Nigeria is most often caused by Malaria (transmitted by mosquitoes), Typhoid fever, or a viral infection.',
        home: '1. Cool down safely with lukewarm tepid sponging (never cold water, ice, or methylated spirit).\n2. Stay hydrated with clean drinking water or fresh fluids.\n3. Rest under an insecticide-treated mosquito net.\n4. Paracetamol (following standard label dose) can help reduce fever and pain.',
        action: `Get a rapid diagnostic test (mRDT) for malaria at a nearby clinic or certified laboratory before taking antimalarials. Visit ${primaryHospital} promptly if fever lasts over 48 hours, if you cannot keep fluids down, or if your urine turns dark tea-coloured.`,
        questions: [
          'How many days have you had the fever and chills?',
          'Are you experiencing vomiting, yellowing of the eyes, or dark urine?',
        ],
      },
      hausa: {
        urgencyLevel: 'urgent',
        empathy: 'Sannu da jiki! Allah Ya ba ka lafiya. Zazzabi tare da ciwon kai da dacin baki suna sa gajiya sosai.',
        causes: 'Zazzabi mai zafi da sanyi, ciwon kai, da dacin baki a Najeriya yawanci alamomin zazzabin cizon sauro (Malaria) ne ko zazzabin Typhoid, ko kuma mura.',
        home: '1. Yi amfani da tsaftataccen kyalle da aka jika a ruwa mara sanyi (ba ruwan kankara ko spirit ba!) don goge goshi, hamata, da wuya.\n2. Sha ruwa mai tsabta da yawa.\n3. Huta a wuri mai iska kuma ka kwana cikin gidan sauro mai magani.\n4. Za a iya shan Paracetamol bisa ka\'ida don rage ciwon jiki da zazzabi.',
        action: `Je asibiti ko dakin gwaji mafi kusa don yin gwajin Malaria (mRDT) kafin shan maganin zazzabi. Idan zazzabin ya wuce kwanaki biyu, ko kana amai, ko fitsarin ka ya koma ja ko baki kamar shayi, tafi ${primaryHospital} nan take.`,
        questions: [
          'Kwana nawa kenan jiki ke zafi?',
          'Shin kana amai ko idanunka sun yi rawaya ko fitsari ya canza launi?',
        ],
      },
      yoruba: {
        urgencyLevel: 'urgent',
        empathy: 'Pẹ̀lẹ́ o! Ara gbígbóná, orí fífọ́, àti ẹnu kíkòrò lè mú kí ara rẹ̀ pátápátá.',
        causes: 'Ní Nàìjíríà, ara gbígbóná pẹ̀lú òtútù, orí fífọ́, ara ríro, àti ẹnu kíkòrò sábà máa ń jẹ́ àmì Ibà (Malaria láti ara ẹ̀fọn) tàbí Ibà Tàífọ́ọ̀dù (Typhoid).',
        home: '1. Fi aṣọ mímọ́ tí a rẹ sínú omi lásán tí kò tutù ju (kìí ṣe omi yìnyín tàbí spirit!) nu iwájú orí, abẹ́ apá, àti ọrùn.\n2. Mu omi mímọ́ púpọ̀ tàbí omi òrom̀bó tuntun.\n3. Sinmi dáadáa ní yàrá tó ní atẹ́gùn kí o sì sùn lábẹ́ àwọ̀n ẹ̀fọn.\n4. Oògùn Paracetamol (ní ìwọ̀n tó yẹ) lè dín ìrora ara àti ibà kù.',
        action: `Lọ ṣe àyẹ̀wò ẹ̀jẹ̀ fún Ibà (mRDT) ní ilé-ìwòsàn tàbí láàbù tó súnmọ́ ọ kí o tó lo oògùn ibà. Tí ibà bá kọjá ọjọ́ méjì, tí o bá ń bì, tàbí tọ̀ rẹ bá pọ́n bíi tii, ẹ lọ sí ${primaryHospital} lẹ́sẹ̀kẹsẹ̀.`,
        questions: [
          'Ọjọ́ mélòó ni ibà àti orí fífọ́ yìí ti bẹ̀rẹ̀?',
          'Ṣé o ń bì tàbí ojú rẹ ń pọ́n tàbí ìtọ̀ rẹ ń ṣókùnkùn?',
        ],
      },
      igbo: {
        urgencyLevel: 'urgent',
        empathy: 'Ndo nu! Ahụ ọkụ, isi ọwụwa, na ọnụ ilu na-eme ka ike gwụ mmadụ kpamkpam.',
        causes: 'Na Naịjirịa, ahụ ọkụ, oyi jijiji, ahụ mgbu, na ọnụ ilu na-abụkarị ihe ịrịba ama nke Ịba (Malaria site n\'ọta anwụnta) ma ọ bụ Typhoid fever.',
        home: '1. Jiri ákwà dị ọcha e tinyere na mmiri na-ekpo ọkụ ntakịrị (ejila mmiri oyi ma ọ bụ methylated spirit!) hichaa egedege ihu, abụba, na olu.\n2. Ṅụọ mmiri dị ọcha nke ukwuu.\n3. Zuo ike nke ọma ma rahụ n\'okpuru netị anwụnta.\n4. Paracetamol (dịka ntụziaka si dị) nwere ike inye aka belata ahụ ọkụ na mgbu.',
        action: `Gaa ụlọ ọgwụ ma ọ bụ ụlọ nyocha mee nyocha Malaria (mRDT) tupu ị ṅụọ ọgwụ ịba. Ọ bụrụ na ahụ ọkụ ahụ agafe ụbọchị abụọ, ma ọ bụ ị na-agbọ agbọ, ma ọ bụ mamịrị gị gbanwee agba dịka tii ojii, gaa ${primaryHospital} ozugbo.`,
        questions: [
          'Ụbọchị ole ka ahụ ọkụ na isi ọwụwa a malitere?',
          'Ị na-agbọ agbọ ma ọ bụ hụ anya odo ma ọ bụ mamịrị gbara ọchịchịrị?',
        ],
      },
    },

    cough: {
      pidgin: {
        urgencyLevel: 'urgent',
        empathy: 'Pele o! Dry cough and slight chest tightness dey tire person chest well-well.',
        causes: 'Dry cough with mild hot body and small chest tight fit come from common chest cold, flu, bronchitis, dust/harmattan irritation, or early respiratory infection.',
        home: '1. Drink plenty warm water or warm tea with honey (never give honey to baby under 1 year) to calm throat.\n2. Breathe steam from hot water bowl safely to clear chest.\n3. Stay away from smoke, dust, and strong generator fumes.\n4. Rest well and no buy antibiotics without doctor prescription.',
        action: `Watch your breathing carefully. If cough pass 1 week, or high fever join am, or breath begin seize, or you cough out blood, waka go ${primaryHospital} sharp-sharp.`,
        questions: [
          'How long the dry cough don stay, and phlegm or blood dey come out?',
          'You get difficulty catching your breath when you walk small?',
        ],
      },
      english: {
        urgencyLevel: 'urgent',
        empathy: 'So sorry you are having a nagging cough and mild chest tightness. Monitoring your breathing closely is important.',
        causes: 'A dry cough with mild fever and slight chest tightness is commonly caused by a viral upper respiratory infection, bronchitis, seasonal dust irritation, or early pneumonia.',
        home: '1. Sip warm fluids (water, warm herbal tea, or lemon with honey for adults) to soothe throat irritation.\n2. Inhale gentle steam from warm water and keep your room well ventilated.\n3. Avoid dust, tobacco smoke, and generator exhaust fumes.\n4. Avoid taking unprescribed antibiotics.',
        action: `Seek care at ${primaryHospital} or a nearby clinic if the cough lasts beyond 7 days, if high fever develops, or if you feel short of breath. If you suddenly struggle to breathe or feel sharp chest pain, go to the emergency room immediately.`,
        questions: [
          'How long have you had this cough, and is it bringing up sputum or blood?',
          'Do you feel out of breath during normal movement?',
        ],
      },
      hausa: {
        urgencyLevel: 'urgent',
        empathy: 'Sannu da jiki! Busasshen tari da dan matsewar kirji suna da wahala, Allah Ya kawo sauki.',
        causes: 'Busasshen tari tare da dan matsewar kirji da zazzabi kadan yakan faru ne saboda mura ta kirji, kura ko sanyin hunturu, ko cutar huhu ta farko.',
        home: '1. Sha ruwan dumi ko shayi mai zuma (kada a baiwa jariri kasa da shekara 1 zuma) don kwantar da makogwaro.\n2. Shaki tururin ruwan dumi a hankali don bude kirji.\n3. Nisanci hayaki, kura, da hayakin janareto.\n4. Huta sosai kuma kada a sha maganin antibiotics ba tare da likita ya rubuta ba.',
        action: `Kula da numfashin ka sosai. Idan tarin ya wuce mako daya, ko zazzabi ya karu, ko numfashi ya fara yankewa, tafi ${primaryHospital} ko asibiti mafi kusa nan take.`,
        questions: [
          'Kwana nawa kenan kana wannan tarin, kuma kana tofa kaki ko jini?',
          'Kana jin wahalar numfashi idan ka yi tafiya kadan?',
        ],
      },
      yoruba: {
        urgencyLevel: 'urgent',
        empathy: 'Pẹ̀lẹ́ o! Ikọ́ gbígbẹ àti ìfúnpa àyà máa ń mú kí ara má balẹ̀.',
        causes: 'Ikọ́ gbígbẹ pẹ̀lú ìfúnpa díẹ̀ ní àyà àti ibà díẹ̀ sábà máa ń wá láti ara òtútù àyà, eruku tàbí òtútù òyẹ́, tàbí àkóràn ẹ̀dọ̀fóró.',
        home: '1. Mu omi gbígbóná díẹ̀ tàbí omi tii pẹ̀lú oyin (ẹ má fi oyin fún ọmọ tí kò tíì pé ọdún kan) láti rọ ọ̀fun.\n2. Fa èéfín omi gbígbóná sínú díẹ̀díẹ̀ láti tú àyà.\n3. Jìnnà sí èéfín sígá, eruku, àti èéfín jẹ́nẹ́rétọ̀.\n4. Sinmi dáadáa kí o má sì lo oògùn apakòkòrò láì rí dọ́kítà.',
        action: `Ṣọ́ èémí rẹ dáadáa. Tí ikọ́ náà bá kọjá ọ̀sẹ̀ kan, tí ibà líle bá bẹ̀rẹ̀, tàbí tí èémí bá ń ṣòro láti gbà, lọ sí ${primaryHospital} lẹ́sẹ̀kẹsẹ̀.`,
        questions: [
          'Ọjọ́ mélòó ni ikọ́ yìí ti wà, ṣé kẹ̀lẹ̀bẹ̀ tàbí ẹ̀jẹ̀ ń jáde?',
          'Ṣé èémí ń pín nígbà tí o bá rìn díẹ̀?',
        ],
      },
      igbo: {
        urgencyLevel: 'urgent',
        empathy: 'Ndo nu! Ụkwara kpọrọ nkụ na obi siri ike ntakịrị na-eme ka ahụ ghara iru mmadụ ala.',
        causes: 'Ụkwara kpọrọ nkụ nwere ahụ ọkụ ntakịrị na obi siri ike ntakịrị na-esikarị n\'oyi dị n\'obi, uzuzu harmattan, ma ọ bụ mbido ọrịa iku ume.',
        home: '1. Ṅụọ mmiri dị ọkụ ntakịrị ma ọ bụ tii nwere mmanụ aṅụ (enyela nwa na-erughị otu afọ mmanụ aṅụ) iji mee ka akpịrị dị jụụ.\n2. Kuru uzuoku mmiri ọkụ nwayọọ nwayọọ iji meghere obi.\n3. Zere anwụrụ ọkụ, uzuzu, na anwụrụ igwe ọkụ (generator).\n4. Zuo ike ma zere ịṅụ antibiotics n\'enweghị ndụmọdụ dọkịta.',
        action: `Lezienụ iku ume gị anya. Ọ bụrụ na ụkwara gafere otu izu, ahụ ọkụ abịa, ma ọ bụ iku ume esiri gị ike, gaa ${primaryHospital} ma ọ bụ ụlọ ọgwụ kacha nso ngwa ngwa.`,
        questions: [
          'Ụbọchị ole ka ụkwara a nọrọla, ọ na-ewepụta ụfụfụ ma ọ bụ ọbara?',
          'Iku ume ọ na-esiri gị ike mgbe ị na-eje ije ntakịrị?',
        ],
      },
    },

    joint_pain: {
      pidgin: {
        urgencyLevel: 'urgent',
        empathy: 'Ayaah, sorry well-well! Deep waist, joint, and bone pain dey really trouble person.',
        causes: 'Heavy pain for waist, joints, and bone with extreme tiredness fit be Sickle Cell pain crisis (if you get SS/SC genotype), severe viral/malaria body aches, or typhoid/arthritis flare.',
        home: '1. Drink plenty clean water (warm water or ORS) right away so blood flow well.\n2. Keep joints warm with clean blanket — no put ice block on top bone pain!\n3. Stay warm and rest completely for quiet place.\n4. Paracetamol or prescribed pain relief fit ease pain; avoid strong NSAIDs if you get ulcer.',
        action: `If you get Sickle Cell (SS/SC), or pain no gree calm down, or fever/yellow eyes join am, waka go ${primaryHospital} or Haematology / General Hospital today for proper hydration and pain care.`,
        questions: [
          'You sabi your blood genotype (like AA, AS, or SS/SC)?',
          'Hot body or yellow eyes join the bone pain?',
        ],
      },
      english: {
        urgencyLevel: 'urgent',
        empathy: 'I am so sorry you are experiencing severe waist, joint, and bone pains. Staying hydrated and warm is essential.',
        causes: 'Severe bone, waist, and joint pains with extreme weakness can be triggered by a Sickle Cell vaso-occlusive crisis (in SS/SC individuals), severe malaria/viral illness, or acute inflammatory arthritis.',
        home: '1. Hydrate aggressively with clean water or ORS to support blood circulation.\n2. Keep your body and painful joints warmly wrapped — never apply ice or cold packs.\n3. Rest completely in a warm, comfortable space.\n4. Use safe pain relief as previously prescribed by your doctor (avoid NSAIDs if you have stomach ulcers or kidney disease).',
        action: `If you have Sickle Cell disease, if the pain continues to escalate, or if accompanied by fever, dark urine, or chest discomfort, go promptly to ${primaryHospital} or your nearest General Hospital for IV fluids and medical pain management.`,
        questions: [
          'Do you know your haemoglobin genotype (AA, AS, SS, SC)?',
          'Are you experiencing any fever, yellowing of the eyes, or chest pain?',
        ],
      },
      hausa: {
        urgencyLevel: 'urgent',
        empathy: 'Sannu da jiki! Ciwon kugu, gabbai, da kashi mai tsanani yana da zafi sosai, Allah Ya sauwake.',
        causes: 'Ciwon kugu, gabbai, da kashi tare da kasala mai tsanani yana iya faruwa saboda ciwon Sickle Cell (masu SS/SC), zazzabin cizon sauro mai karfi, ko ciwon gabbai.',
        home: '1. Sha ruwa mai tsabta da yawa (ruwan dumi ko ORS) nan take don jini ya rika gudu da kyau.\n2. Rufe jiki da gabbai da bargo mai dumi — kada a dora kankara a kan kashi mai ciwo!\n3. Huta gaba daya a wuri mai dumi.\n4. Sha maganin rage radadi kamar Paracetamol kamar yadda likita ya tsara.',
        action: `Idan kana da ciwon Sickle Cell (SS/SC), ko ciwon ya ki sauki, ko akwai zazzabi da idanun rawaya, tafi ${primaryHospital} yau don samun ruwan asibiti (drip) da taimakon likita.`,
        questions: [
          'Shin ka san nau\'in jininka (genotype kamar AA, AS, ko SS)?',
          'Shin akwai zazzabi ko rawayar idanu tare da ciwon kashin?',
        ],
      },
      yoruba: {
        urgencyLevel: 'urgent',
        empathy: 'Pẹ̀lẹ́ o! Ìrora líle ní ìbàdí, oríkèé, àti egungun máa ń ni ni lára gan-an.',
        causes: 'Ìrora egungun, ìbàdí, àti oríkèé pẹ̀lú àárẹ̀ gidi lè wá láti ara àìsàn sẹ́ẹ̀lì (Sickle Cell SS/SC), Ibà líle, tàbí làkúrègbé.',
        home: '1. Mu omi mímọ́ púpọ̀ lẹ́sẹ̀kẹsẹ̀ kí ẹ̀jẹ̀ lè ṣàn dáadáa nínú ara.\n2. Jẹ́ kí ara àti àwọn oríkèé gbóná díẹ̀ — ẹ má fi yìnyín sí egungun tó ń ro yín!\n3. Sinmi dáadáa ní ibi tí kò ní òtútù.\n4. Lo oògùn ìrora bíi Paracetamol gẹ́gẹ́ bí dọ́kítà ṣe kọ ọ́.',
        action: `Tí ẹ bá ní Sickle Cell (SS/SC), tàbí tí ìrora kò dínkù, tàbí tí ibà àti ojú pípọ́n bá wà pẹ̀lú rẹ̀, ẹ lọ sí ${primaryHospital} lónìí fún omi ìṣáná (drip) àti ìtọ́jú dọ́kítà.`,
        questions: [
          'Ṣé ẹ mọ irú ẹ̀jẹ̀ yín (genotype bíi AA, AS, SS)?',
          'Ṣé ibà tàbí ojú pípọ́n wà pẹ̀lú ìrora egungun náà?',
        ],
      },
      igbo: {
        urgencyLevel: 'urgent',
        empathy: 'Ndo nu! Mgbu siri ike n\'úkwù, nkwonkwo, na ọkpụkpụ na-egbu mgbu nke ukwuu.',
        causes: 'Mgbu ọkpụkpụ, úkwù, na nkwonkwo nwere ike ọgwụgwụ dị ukwuu nwere ike ịbụ mwakpo Sickle Cell (maka ndị nwere SS/SC), Ịba siri ike, ma ọ bụ ọrịa nkwonkwo.',
        home: '1. Ṅụọ mmiri dị ọcha nke ukwuu ozugbo iji nyere ọbara aka ịga nke ọma.\n2. Mee ka ahụ na nkwonkwo na-ekpo ọkụ — etinyela ice block n\'ebe ọkpụkpụ na-egbu mgbu!\n3. Zuo ike kpamkpam n\'ebe dị ọkụ.\n4. Were ọgwụ mgbu dị nchebe dịka Paracetamol dịka dọkịta si kụzie.',
        action: `Ọ bụrụ na i nwere Sickle Cell (SS/SC), ma ọ bụ mgbu ahụ akwụsịghị, ma ọ bụ ahụ ọkụ na anya odo abịa, gaa ${primaryHospital} taa maka mmiri ụlọ ọgwụ (drip) na nlekọta dọkịta.`,
        questions: [
          'Ị maara genotype ọbara gị (dịka AA, AS, ma ọ bụ SS/SC)?',
          'Ahụ ọkụ ma ọ bụ anya odo ọ dị n\'ime mgbu ọkpụkpụ ahụ?',
        ],
      },
    },

    general: {
      pidgin: {
        urgencyLevel: 'urgent',
        empathy: 'Pele o! Take am easy, make I break down wetin you fit do.',
        causes: 'The way your body dey do you fit come from stress, dehydration, early malaria/typhoid infection, or tiredness. Make sure you observe any new sign.',
        home: '1. Rest well-well for airy room.\n2. Drink plenty clean water make your body cool down.\n3. Watch your body well make you see if fever, purging, or pain increase.',
        action: `If the feeling no better after 24 to 48 hours, or e worse, waka go see nurse or doctor for ${primaryHospital} or your nearest General Hospital inside ${stateName}.`,
        questions: [
          'How many days this body problem don start?',
          'Any hot body, purging, or strong pain join am?',
        ],
      },
      english: {
        urgencyLevel: 'urgent',
        empathy: 'So sorry you are not feeling well. Let us go through some safe steps to monitor your symptoms.',
        causes: 'Your symptoms may result from physical stress, mild dehydration, or the early stage of a common infection such as malaria or a viral illness.',
        home: '1. Get plenty of rest in a cool, well-ventilated room.\n2. Drink clean, boiled or bottled water regularly.\n3. Monitor closely for new symptoms like rising fever, vomiting, or severe pain.',
        action: `If your symptoms do not improve within 24 to 48 hours, or if they worsen at any time, please visit ${primaryHospital} or your nearest clinic in ${stateName} for proper examination.`,
        questions: [
          'How many days ago did these symptoms start?',
          'Do you also have a fever, stomach pain, or difficulty sleeping?',
        ],
      },
      hausa: {
        urgencyLevel: 'urgent',
        empathy: 'Sannu da jiki! Allah Ya sauwake. Ga shawarwari masu sauki da zaka bi a hankali.',
        causes: 'Yadda jikinka ke yi maka yana iya fitowa daga gajiya mai yawa, karancin ruwa a jiki, ko farkon zazzabin cizon sauro (Malaria) ko mura.',
        home: '1. Huta sosai a daki mai shigar iska mai kyau.\n2. Sha ruwa mai tsabta da yawa.\n3. Kula da jikinka ka gani ko zazzabi, zawo, ko ciwon kai zai karu.',
        action: `Idan jikin bai yi sauki ba bayan sa'o'i 24 zuwa 48, ko ya kara tsanani, tafi ka ga likita a ${primaryHospital} ko asibitin gwamnati mafi kusa a ${stateName}.`,
        questions: [
          'Yaushe wannan ciwon ko kasalar ya fara?',
          'Shin akwai zazzabi, zawo, ko wani ciwo mai tsanani tare da shi?',
        ],
      },
      yoruba: {
        urgencyLevel: 'urgent',
        empathy: 'Pẹ̀lẹ́ o! Ẹ jẹ́ ká bójútó bí ara ṣe ń ṣe yín pẹ̀lú àbójútó tó rọrùn.',
        causes: 'Bí ara ṣe ń ṣe yín lè wá láti ara àárẹ̀ púpọ̀, àìní omi tó tó nínú ara, tàbí ìbẹ̀rẹ̀ àìsàn bíi Ibà (Malaria) tàbí òtútù.',
        home: '1. Sinmi dáadáa ní yàrá tí atẹ́gùn ń fẹ́ sí.\n2. Mu omi mímọ́ púpọ̀ lójoojúmọ́.\n3. Ṣọ́ ara rẹ dáadáa bóyá ibà, ìgbẹ́ gbuuru, tàbí ìrora mìíràn yóò yọjú.',
        action: `Tí ara kò bá yá láàárín wákàtí mẹ́rìnlélógún sí méjìdínláàádọ́ta (24-48 hours), tàbí tí ó bá le sí i, ẹ lọ rí dọ́kítà ní ${primaryHospital} tàbí ilé-ìwòsàn tó súnmọ́ yín ní ${stateName}.`,
        questions: [
          'Ọjọ́ mélòó ni àìsàn yìí ti bẹ̀rẹ̀?',
          'Ṣé ibà gbígbóná, ìgbẹ́ gbuuru, tàbí ìrora líle wà pẹ̀lú rẹ̀?',
        ],
      },
      igbo: {
        urgencyLevel: 'urgent',
        empathy: 'Ndo nu! Jiri nwayọọ, ka m kọwaa ihe i nwere ike ime iji lekọta onwe gị.',
        causes: 'Ka ahụ dị gị nwere ike ịbụ site na ike ọgwụgwụ, ụkọ mmiri n\'ahụ, ma ọ bụ mbido ọrịa dịka Ịba (Malaria) ma ọ bụ oyi.',
        home: '1. Zuo ike nke ọma n\'ime ụlọ nwere ikuku dị mma.\n2. Ṅụọ mmiri dị ọcha nke ukwuu.\n3. Lezienụ ahụ gị anya ma ahụ ọkụ, afọ ọsịsa, ma ọ bụ mgbu ga-abawanye.',
        action: `Ọ bụrụ na ahụ adịghị mma mgbe awa 24 ruo 48 gachara, ma ọ bụ ọ ka njọ, gaa hụ nọọsụ ma ọ bụ dọkịta na ${primaryHospital} ma ọ bụ General Hospital dị na ${stateName}.`,
        questions: [
          'Ụbọchị ole ka ahụ adịghị mma a malitere?',
          'Ọ nwere ahụ ọkụ, afọ ọsịsa, ma ọ bụ mgbu siri ike so ya?',
        ],
      },
    },
  };

  const c = CONTENT[category][language];

  return {
    language,
    urgencyLevel: c.urgencyLevel,
    isRedFlag: false,
    empathyNote: c.empathy,
    wetinFitDeyHappen: c.causes,
    wetinYouFitDoForHouse: c.home,
    nextStep: c.action,
    potentialCauses: c.causes,
    homeManagement: c.home,
    actionPlan: c.action,
    clarifyingQuestions: c.questions,
    recommendedFacilities: topFacilities,
    detectedLocation: stateName,
    detectedLga: resolvedLga,
    disclaimer: headers.disclaimer,
    fullFormattedResponse: buildFormattedResponse(language, {
      isRedFlag: false,
      empathyNote: c.empathy,
      causes: c.causes,
      home: c.home,
      action: c.action,
      disclaimer: headers.disclaimer,
    }),
  };
}
