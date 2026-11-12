import paracetamolImg from '../assets/images/med_paracetamol_blister_1794473193875.jpg';
import orsZincImg from '../assets/images/med_ors_zinc_sachet_1794473193729.jpg';
import malariaActImg from '../assets/images/med_malaria_act_pack_1794473195165.jpg';
import antacidSuspensionImg from '../assets/images/med_antacid_suspension_1794473194963.jpg';
import { SupportedLanguage } from '../types/triage';

export type OtcCategory =
  | 'all'
  | 'fever_pain'
  | 'purging_hydration'
  | 'tested_malaria'
  | 'heartburn_stomach'
  | 'cough_cold'
  | 'allergy_rash';

export interface OtcMedicine {
  id: string;
  genericName: string;
  category: OtcCategory;
  categoryName: Record<SupportedLanguage, string>;
  commonBrands: string[];
  imageSrc: string;
  presentation: Record<SupportedLanguage, string>;
  primaryUses: Record<SupportedLanguage, string>;
  keyRule: Record<SupportedLanguage, string>;
  howToTakeAdult: Record<SupportedLanguage, string>;
  howToTakeChild: Record<SupportedLanguage, string>;
  whatToAskPharmacist: Record<SupportedLanguage, string[]>;
  safetyAlerts: Record<SupportedLanguage, string[]>;
  pregnancyAdvisory: Record<SupportedLanguage, { isAllowed: boolean; note: string }>;
  nafdacVerification: {
    regPattern: string;
    tips: Record<SupportedLanguage, string>;
  };
  redFlagsSeekDoctor: Record<SupportedLanguage, string[]>;
}

export const OTC_CATEGORIES: { id: OtcCategory; label: Record<SupportedLanguage, string> }[] = [
  {
    id: 'all',
    label: {
      pidgin: 'All Medicines',
      english: 'All Medicines',
      hausa: 'Dukkan Magunguna',
      yoruba: 'Gbogbo Oogun',
      igbo: 'Ọgwụ Niile',
    },
  },
  {
    id: 'fever_pain',
    label: {
      pidgin: 'Fever & Body Pain',
      english: 'Fever & Pain Relief',
      hausa: 'Zazzabi da Ciwon Jiki',
      yoruba: 'Iba ati Rirọ Ara',
      igbo: 'Ọkụ Ahụ na Mgbu',
    },
  },
  {
    id: 'purging_hydration',
    label: {
      pidgin: 'Purging & Water Stool',
      english: 'Diarrhea & Hydration',
      hausa: 'Zawo da Rashin Ruwa',
      yoruba: 'Igbẹ Gbuuru & Aini Omi',
      igbo: 'Afọ Ọsịsa & Ịkọ Mmiri',
    },
  },
  {
    id: 'tested_malaria',
    label: {
      pidgin: 'Malaria (Tested Only)',
      english: 'Malaria (After Test)',
      hausa: 'Zazzabin Cizon Sauro (Bayan Gwaji)',
      yoruba: 'Iba Iba (Lẹhin Ayẹwo)',
      igbo: 'Ịba (Mgbe Emechara Ule)',
    },
  },
  {
    id: 'heartburn_stomach',
    label: {
      pidgin: 'Heartburn & Acid Reflux',
      english: 'Heartburn & Acidity',
      hausa: 'Kunar Ƙirji da Ƙoshi',
      yoruba: 'Oorun Ọkan ati Gaasi',
      igbo: 'Ọkụ n\'Obi na Ọnya Afọ',
    },
  },
  {
    id: 'cough_cold',
    label: {
      pidgin: 'Cough & Catarrh',
      english: 'Cough & Throat Relief',
      hausa: 'Tari da Majina',
      yoruba: 'Ikọ ati Majina',
      igbo: 'Ukwara na Oyi',
    },
  },
  {
    id: 'allergy_rash',
    label: {
      pidgin: 'Itching & Allergy',
      english: 'Allergy & Itching',
      hausa: 'Ƙaiƙayi da Ƙuraje',
      yoruba: 'Iyun ati Ẹkọ Ara',
      igbo: 'Ọkọ na Nfụkasị Ahụ',
    },
  },
];

export const NIGERIAN_OTC_MEDICINES: OtcMedicine[] = [
  {
    id: 'paracetamol-500',
    genericName: 'Paracetamol (Acetaminophen) 500mg',
    category: 'fever_pain',
    categoryName: {
      pidgin: 'Fever & Body Pain',
      english: 'Fever & Pain Relief',
      hausa: 'Zazzabi da Ciwon Jiki',
      yoruba: 'Iba ati Rirọ Ara',
      igbo: 'Ọkụ Ahụ na Mgbu',
    },
    commonBrands: ['Panadol', 'Emzor Paracetamol', 'Para-Denk', 'M&B Paracetamol', 'Doliprane'],
    imageSrc: paracetamolImg,
    presentation: {
      pidgin: 'Blister pack of 10-20 white tablets (500mg each), or 120mg/5ml syrup for pikin',
      english: 'Blister pack of 10–20 tablets (500mg each) or 120mg/5ml pediatric oral suspension',
      hausa: 'Kullin kwayoyin magani 10 zuwa 20 (kowacce 500mg), ko maganin ruwa na yara (120mg/5ml)',
      yoruba: 'Paki oogun funfun 10 si 20 (500mg kọọkan), tabi oogun omi fun awọn ọmọde',
      igbo: 'Mbadamba ọgwụ 10 ruo 20 (500mg nke ọ bụla), ma ọ bụ ọgwụ mmiri maka ụmụaka',
    },
    primaryUses: {
      pidgin: 'To bring down hot body (fever), reduce headache, toothache, monthly pain, and body ache.',
      english: 'First-line relief for fever reduction, mild-to-moderate headache, muscle aches, and dental pain.',
      hausa: 'Domin saukar da zafin jiki (zazzabi), ciwon kai, ciwon haƙori, da ciwon jiki.',
      yoruba: 'Lati dinku gbigbona ara (iba), orififo, egbogi ehin, ati irora gbogbo ara.',
      igbo: 'Iji belata oke ọkụ n\'ahụ (ahụ ọkụ), isi ọwụwa, mgbu eze, na rirọ n\'ahụ niile.',
    },
    keyRule: {
      pidgin: 'NEVER take more than 8 tablets in 24 hours. Overdose fit destroy liver permanent.',
      english: 'Never exceed 4,000mg (8 tablets of 500mg) in 24 hours. Overdose causes acute liver failure.',
      hausa: 'KADA ka wuce kwayoyi 8 a cikin sa\'o\'i 24. Yawan shan maganin na iya lalata hanta.',
      yoruba: 'MAṢE mu ju tabulẹti 8 lọ laarin wakati 24. Oogun pupọ ju le ba ẹdọ jẹ patapata.',
      igbo: 'ANALA karịa mbadamba 8 n\'ime awa 24. Ọgwụ karịrị akarị na-emebi umeji.',
    },
    howToTakeAdult: {
      pidgin: '1 or 2 tablets (500mg-1000mg) every 6 to 8 hours with clean water. Wait at least 4-6 hours between doses.',
      english: '1 to 2 tablets (500mg to 1,000mg) every 4 to 6 hours as needed. Maximum 8 tablets (4,000mg) in 24 hours.',
      hausa: 'Kwaya 1 ko 2 (500mg-1000mg) duk bayan sa\'o\'i 4 zuwa 6 idan ana buƙata. Ba a wuce kwayoyi 8 a rana.',
      yoruba: 'Tabulẹti 1 tabi 2 ni gbogbo wakati 4 si 6 pẹlu omi to mọ. Maṣe kọja tabulẹti 8 lojumọ.',
      igbo: 'Mbadamba 1 ma ọ bụ 2 kwa awa 4 ruo 6 dịka mkpa siri dị. Ejila karịa mbadamba 8 n\'otu ụbọchị.',
    },
    howToTakeChild: {
      pidgin: 'Use syrup, NOT adult tablets. Measure with medical syringe or spoon (10-15mg per kg of child weight).',
      english: 'Use pediatric syrup (120mg/5ml or 250mg/5ml) dosed accurately by body weight. Never guess tablet fractions.',
      hausa: 'Yi amfani da maganin ruwa na yara bisa nauyin yaro. Kada a karya kwayar manya a ba yaro.',
      yoruba: 'Lo oogun omi fun ọmọde nipa iye iwuwo rẹ. Maṣe ya tabulẹti agbalagba fun ọmọ kekere.',
      igbo: 'Jiri ọgwụ mmiri ụmụaka dabere n\'arọ ha. Agbalịla ịkpụrụ mbadamba ndị okenye nye obere nwa.',
    },
    whatToAskPharmacist: {
      pidgin: [
        '“Does any other cold or cough medicine I am taking already contain Paracetamol?” (to avoid double dosing)',
        '“Is this genuine registered stock with clear expiry date?”',
        '“What is the exact pediatric syrup dose for my baby’s current weight?”',
      ],
      english: [
        '“Does any other cold, flu, or pain medication I am taking already have Paracetamol / Acetaminophen?”',
        '“Can I confirm the NAFDAC registration number and expiry date on this pack?”',
        '“What is the exact measured dose for a child weighing [X] kg?”',
      ],
      hausa: [
        '“Shin wani maganin sanyi da nake sha yana da Paracetamol a ciki?”',
        '“Shin wannan maganin yana da lambar NAFDAC ingantacciya da kwanan wata?”',
        '“Wane adadi ne daidai da nauyin ɗana a maganin ruwa?”',
      ],
      yoruba: [
        '“Nje oogun otutu miiran ti mo n mu ni Paracetamol ninu?”',
        '“Ṣe nọmba iforukọsilẹ NAFDAC ati ọjọ ipari wa lori paki yii?”',
        '“Iye melo ni o yẹ ki n fun ọmọ mi gẹgẹ bi iwuwo rẹ?”',
      ],
      igbo: [
        '“Ọgwụ oyi ọzọ m na-aṅụ ọ nwere Paracetamol n\'ime ya?”',
        '“Ọ nwere akara NAFDAC doro anya na ụbọchị ngwụcha?”',
        '“Kedu oke ọgwụ mmiri kwesịrị ekwesị maka arọ nwa m?”',
      ],
    },
    safetyAlerts: {
      pidgin: [
        'Never take with alcohol or ogogoro — this doubles risk of serious liver damage.',
        'Do not combine with other painkillers like Panadol Extra, Cold-floc, or Felvin without checking ingredients.',
        'If fever continues past 48 hours, go for malaria/typhoid lab test.',
      ],
      english: [
        'Avoid alcohol consumption while taking paracetamol due to hepatotoxicity risk.',
        'Watch for hidden paracetamol in combined cold and cough remedies to avoid accidental overdose.',
        'If fever persists beyond 48–72 hours, hospital evaluation and blood investigation are mandatory.',
      ],
      hausa: [
        'Kada a haɗa da giya ko maganin gargajiya domin yana cutar da hanta.',
        'Duba sauran magungunan mura don kada a sha paracetamol fiye da kima.',
        'Idan zazzabi ya wuce kwanaki biyu, a je asibiti a yi gwajin jini.',
      ],
      yoruba: [
        'Maṣe mu pẹlu ọti nitori eewu ti o le fa si ẹdọ.',
        'Kiyesi awọn oogun otutu miiran ki o ma ba mu paracetamol pọ ju bi o ti yẹ.',
        'Ti iba ba kọja ọjọ meji, lọ si ile-iwosan fun ayẹwo ẹjẹ.',
      ],
      igbo: [
        'Aṅụla ya na mmanya na-egbu egbu n\'ihi na ọ na-emebi umeji.',
        'Lelee ọgwụ oyi ndị ọzọ ka ị ghara ịṅụ paracetamol abụọ n\'amaghị ama.',
        'Ọ bụrụ na ahụ ọkụ agafee ụbọchị abụọ, gaa ụlọ ọgwụ mee nyocha ọbara.',
      ],
    },
    pregnancyAdvisory: {
      pidgin: {
        isAllowed: true,
        note: 'Paracetamol na the safest painkiller in pregnancy when taken at normal doses for short periods. Avoid Ibuprofen or Diclofenac.',
      },
      english: {
        isAllowed: true,
        note: 'First-line analgesic/antipyretic of choice during pregnancy when clinically needed at lowest effective dose. Avoid NSAIDs.',
      },
      hausa: {
        isAllowed: true,
        note: 'Paracetamol shi ne mafi aminci ga mata masu juna biyu idan aka sha a kan ka\'ida. A guji Ibuprofen.',
      },
      yoruba: {
        isAllowed: true,
        note: 'Paracetamol ni oogun irora ti o ni aabo julọ nigba ti obinrin ba loyun ni iwọn to tọ. Yago fun Ibuprofen.',
      },
      igbo: {
        isAllowed: true,
        note: 'Paracetamol bụ ọgwụ mgbu kachasị mma ma dịkwa nchebe n\'oge ime ma ọ bụrụ na aṅụọ ya n\'ụzọ kwesịrị ekwesị.',
      },
    },
    nafdacVerification: {
      regPattern: 'A4-XXXX (imported) or 04-XXXX (Nigeria manufactured)',
      tips: {
        pidgin: 'Check the back of the blister pack. The NAFDAC Reg No and Expiry date must be cleanly pressed, not smudged or hand-stamped.',
        english: 'Confirm stamped NAFDAC Reg. No. and expiry date on foil backing. Avoid blisters where text scratches off easily.',
        hausa: 'Duba bayan kullin maganin, dole ne lambar NAFDAC da kwanan wata su fito a fili.',
        yoruba: 'Wo ẹhin paki oogun naa lati rii daju pe nọmba NAFDAC ati ọjọ ipari han gbangba.',
        igbo: 'Lelee azụ ngwugwu ọgwụ ahụ iji hụ na akara NAFDAC na ụbọchị ngwụcha pụtara nke ọma.',
      },
    },
    redFlagsSeekDoctor: {
      pidgin: [
        'Fever above 39°C that is not dropping after 2 hours.',
        'Stiff neck, severe vomiting, or seizure/convulsion.',
        'Fever in a baby under 3 months old (emergency — see doctor immediately).',
      ],
      english: [
        'Fever greater than 39.5°C unresponsive to antipyretics.',
        'Stiff neck, photophobia, confusion, or seizures.',
        'Any fever in an infant under 3 months of age (pediatric emergency).',
      ],
      hausa: [
        'Zazzabi mai tsanani da bai sauka ba bayan awanni biyu.',
        'Taurin wuya, amai mai tsanani, ko farfadiya.',
        'Zazzabi a jinjiri ƙasa da wata uku (a gaggauta zuwa asibiti).',
      ],
      yoruba: [
        'Iba to ga pupọ ti ko sọkalẹ lẹhin wakati meji.',
        'Gbigbọn ọrùn, eebi ti ko dawọduro, tabi ijaya.',
        'Iba ninu ọmọ ti ko to oṣu mẹta (pajawiri — lọ si ile-iwosan lẹsẹkẹsẹ).',
      ],
      igbo: [
        'Oke ahụ ọkụ nke na-adaghị mgbe awa abụọ gachara.',
        'Isi ike n\'olu, oke ọgbụgbọ, ma ọ bụ ọdụdọ.',
        'Ahụ ọkụ n\'ime nwa na-erubeghị ọnwa atọ (ihe mberede ahụike).',
      ],
    },
  },

  {
    id: 'ors-zinc',
    genericName: 'Oral Rehydration Salts (ORS) + Zinc Sulphate 20mg',
    category: 'purging_hydration',
    categoryName: {
      pidgin: 'Purging & Water Stool',
      english: 'Diarrhea & Hydration',
      hausa: 'Zawo da Rashin Ruwa',
      yoruba: 'Igbẹ Gbuuru & Aini Omi',
      igbo: 'Afọ Ọsịsa & Ịkọ Mmiri',
    },
    commonBrands: ['WHO-standard ORS', 'Hydrate ORS', 'Restolac', 'Zincovit 20mg Dispersible'],
    imageSrc: orsZincImg,
    presentation: {
      pidgin: 'Foil sachet powder (mix with 1 litre clean water) + 10-14 dispersible Zinc tablets (20mg)',
      english: 'WHO-formula low-osmolarity powder sachet (reconstitute in 1L clean water) plus 20mg dispersible zinc tablets',
      hausa: 'Foda a cikin leda don haɗawa da litar ruwa 1 mai tsabta, tare da kwayoyin Zinc na narke wa',
      yoruba: 'Oogun lulú ninu apo lati da sinu lita omi kan to mọ, pẹlu tabulẹti Zinc 20mg',
      igbo: 'Ntụ ọgwụ a na-agbaze n\'otu lita mmiri dị ọcha, yana mbadamba Zinc 20mg na-agbaze ngwa ngwa',
    },
    primaryUses: {
      pidgin: 'To replace lost body water and salt when purging or vomiting, and stop severe dehydration.',
      english: 'Restores vital electrolytes and fluid balance during acute watery diarrhea; Zinc accelerates mucosal recovery.',
      hausa: 'Domin dawo da ruwan jiki da gishirin da aka rasa lokacin zawo ko amai.',
      yoruba: 'Lati mu omi ati iyọ ti ara padanu pada nigba igbẹ gbuuru tabi eebi.',
      igbo: 'Iji kwụghachi mmiri na mineral ndị furu efu n\'oge afọ ọsịsa ma ọ bụ ọgbụgbọ.',
    },
    keyRule: {
      pidgin: 'ALWAYS mix 1 sachet in exactly 1 Litre of clean drinking water. Do NOT use small cup or mix in milk/juice.',
      english: 'Dissolve the whole sachet in exactly 1,000ml (1 Litre) of boiled and cooled or bottled water. Never guess volume.',
      hausa: 'Haɗa kulli ɗaya a cikin lita 1 na ruwa mai tsabta. Kada a haɗa a ƙaramin kofi.',
      yoruba: 'Da gbogbo oogun inu apo sinu lita omi kan gbako. Maṣe da a sinu kọọpu kekere.',
      igbo: 'Gbazee ngwugwu ahụ dum n\'otu lita mmiri zuru ezu. Agbazela ya n\'obere iko.',
    },
    howToTakeAdult: {
      pidgin: 'Drink 1 big cup (200-250ml) slowly after every watery stool. Sip small-small with cup, do not gulp.',
      english: 'Take 200–400ml after each loose stool. Sip continuously. Discard unused reconstituted solution after 24 hours.',
      hausa: 'Sha babban kofi ɗaya (200-250ml) a hankali bayan kowane zawo.',
      yoruba: 'Mu ife omi nla kan (200-250ml) diẹdiẹ lẹhin gbogbo igbẹ gbuuru.',
      igbo: 'Na-aṅụ otu iko buru ibu nwayọ nwayọ mgbe ọ bụla a gbasịrị afọ ọsịsa.',
    },
    howToTakeChild: {
      pidgin: 'Give 1/2 to 1 cup after every stool using small spoon. Give 1 Zinc tablet (20mg) daily dissolved in spoon of breastmilk/water for 10-14 days.',
      english: 'Give 50–100ml after each stool by spoon. Give 20mg dispersible zinc daily for 10–14 days (10mg if infant < 6 months).',
      hausa: 'Ba yaro kofi rabi ko ɗaya da cokali bayan kowane zawo. A ba da kwayar Zinc ɗaya a kullum har tsawon kwanaki 14.',
      yoruba: 'Fun ọmọ ni idaji ife tabi odindi ife kan pẹlu sibi lẹhin igbẹ kọọkan. Fun ni tabulẹti Zinc kan lojumọ fun ọjọ 14.',
      igbo: 'Nye ọkara ma ọ bụ otu iko site n\'iji ngaji mgbe a gbasịrị afọ ọsịsa. Nye mbadamba Zinc otu ugboro n\'ụbọchị ruo ụbọchị 14.',
    },
    whatToAskPharmacist: {
      pidgin: [
        '“Do you have WHO low-osmolarity ORS sachets and Zinc 20mg dispersible tablets?”',
        '“Can you show me a clean 1-Litre measuring container or bottle (like 2 pure water sachets = 1 Litre)?”',
        '“Should I give this child any antibiotic?” (Answer is NO for simple watery stool without blood)',
      ],
      english: [
        '“Do you have the low-osmolarity WHO-formula ORS along with dispersible 20mg Zinc tablets?”',
        '“Can you confirm the best way to measure 1 Litre accurately (e.g. two 500ml pure water sachets)?”',
        '“Is an antibiotic necessary?” (Standard protocol: Not for uncomplicated watery diarrhea without blood).',
      ],
      hausa: [
        '“Kuna da ORS da kwayoyin Zinc na narke wa?”',
        '“Yaya zan auna lita 1 daidai (kamar ledojin ruwa biyu na 500ml)?”',
        '“Shin yaron yana buƙatar maganin rigakafi?” (A\'a, sai idan akwai jini a bayan gida).',
      ],
      yoruba: [
        '“Ṣe ẹ ni ORS ati tabulẹti Zinc 20mg to n yọ?”',
        '“Bawo ni mo ṣe le wọn lita omi kan ni pipe (bii apo omi meji ti 500ml)?”',
        '“Ṣe ọmọ yii nilo oogun aporo (antibiotic)?” (Rara fun igbẹ lasan ti ko ni ẹjẹ).',
      ],
      igbo: [
        '“Unu nwere ORS na mbadamba Zinc 20mg na-agbaze ngwa ngwa?”',
        '“Kedu ka m ga-esi tụọ otu lita mmiri nke ọma?”',
        '“Nwa a ọ chọrọ ọgwụ antibiotic?” (Mba maka afọ ọsịsa na-enweghị ọbara).',
      ],
    },
    safetyAlerts: {
      pidgin: [
        'DO NOT take Flagyl (Metronidazole) or Tetracycline blindly for simple purging. Antibiotics destroy good gut bacteria.',
        'Throw away any mixed ORS water that has stayed more than 24 hours and mix fresh one.',
        'Continue feeding child and breastfeeding; do not starve the person.',
      ],
      english: [
        'Do not take antibiotics or antidiarrheal antimotility agents (like Loperamide) without physician orders.',
        'Reconstituted solution must be discarded after 24 hours to prevent bacterial contamination.',
        'Never withhold breastmilk or routine feeding during episodes of diarrhea.',
      ],
      hausa: [
        'Kada a sha Flagyl ko Tetracycline ba tare da umarnin likita ba.',
        'Kada a sha ruwan ORS da ya wuce sa\'o\'i 24 bayan haɗawa.',
        'Ci gaba da ba da abinci da nono; kada a hana mara lafiya abinci.',
      ],
      yoruba: [
        'Maṣe mu Flagyl tabi Tetracycline lai gba aṣẹ lọwọ dokita.',
        'Da omi ORS ti o ba ti kọja wakati 24 nu, ki o si da titun.',
        'Tẹsiwaju lati fun ọmọ ni ounjẹ ati ọmu; maṣe fa ebi fun un.',
      ],
      igbo: [
        'Aṅụla Flagyl ma ọ bụ Tetracycline na-enweghị ndụmọdụ dọkịta.',
        'Tụfuo mmiri ORS gafere awa 24 ma gbazee nke ọhụrụ.',
        'Gaa n\'ihu na-enye nwa nri na ara; agụụ ekwesịghị ịgụ ya.',
      ],
    },
    pregnancyAdvisory: {
      pidgin: {
        isAllowed: true,
        note: 'ORS is completely safe and lifesaving during pregnancy to prevent dehydration from vomiting (morning sickness) or purging.',
      },
      english: {
        isAllowed: true,
        note: 'ORS is safe and essential during pregnancy to replenish electrolytes lost from hyperemesis or gastroenteritis.',
      },
      hausa: {
        isAllowed: true,
        note: 'ORS yana da cikakken aminci ga mata masu ciki don hana rashin ruwa a jiki.',
      },
      yoruba: {
        isAllowed: true,
        note: 'ORS ni aabo pupọ fun aboyun lati dena aini omi ninu ara nitori eebi tabi igbẹ.',
      },
      igbo: {
        isAllowed: true,
        note: 'ORS dị ezigbo nchebe ma baa uru n\'oge ime iji gbochie ịkọ mmiri n\'ahụ.',
      },
    },
    nafdacVerification: {
      regPattern: '04-XXXX or A4-XXXX clearly stamped',
      tips: {
        pidgin: 'Check sachet seals for any punctures or dampness. Reject any clumpy, hard powder.',
        english: 'Ensure the aluminum foil sachet is hermetically sealed with no moisture or hardening of contents.',
        hausa: 'Tabbatar cewa ledar a rufe take sosai ba tare da leka ko danshi ba.',
        yoruba: 'Rii daju pe apo naa wa ni titi pa lai si ami jijo tabi ọrinrin.',
        igbo: 'Hụ na ngwugwu ahụ mechiri nke ọma n\'enweghị oghere ma ọ bụ mmiri.',
      },
    },
    redFlagsSeekDoctor: {
      pidgin: [
        'Blood or black mucus in the stool (dysentery).',
        'Sunken eyes, very dry mouth, and cannot drink water at all.',
        'Vomiting everything out repeatedly with zero urine passed in 6 hours.',
      ],
      english: [
        'Visible blood or dark mucus in stool (dysentery).',
        'Signs of severe dehydration: lethargy, sunken eyes, skin pinch going back very slowly.',
        'Inability to drink or keep fluids down; no urination for > 6 hours.',
      ],
      hausa: [
        'Ganin jini a bayan gida.',
        'Idanu sun shiga ciki, baki ya bushe, kuma mutum ba zai iya shan ruwa ba.',
        'Amai ba kakkautawa da rashin fitsari na sama da awanni 6.',
      ],
      yoruba: [
        'Ẹjẹ ninu igbẹ.',
        'Oju ti wọle, ẹnu gbẹ kẹkẹ, ti ko le mu omi rara.',
        'Eebi lemọlemọ lai si ito fun wakati mẹfa.',
      ],
      igbo: [
        'Ọbara n\'ime nsị.',
        'Anya ịbanye n\'ime, ọnụ ịkpọ nkụ, na enweghị ike ịṅụ mmiri.',
        'Ọgbụgbọ na-akwụsịghị akwụsị na enweghị mamịrị ruo awa isii.',
      ],
    },
  },

  {
    id: 'malaria-act',
    genericName: 'Artemether-Lumefantrine 20mg/120mg (ACT)',
    category: 'tested_malaria',
    categoryName: {
      pidgin: 'Malaria (Tested Only)',
      english: 'Malaria (After Test)',
      hausa: 'Zazzabin Cizon Sauro (Bayan Gwaji)',
      yoruba: 'Iba Iba (Lẹhin Ayẹwo)',
      igbo: 'Ịba (Mgbe Emechara Ule)',
    },
    commonBrands: ['Coartem', 'Amatem Softgel / Tab', 'Lonart', 'Artequick', 'Camosunate'],
    imageSrc: malariaActImg,
    presentation: {
      pidgin: 'Standard 24-tablet blister pack (4 tablets taken twice daily for 3 days) or 6-tablet pediatric packs',
      english: 'Pack of 24 tablets (for adult >35kg): 4 tablets taken twice daily over 3 consecutive days (total 6 doses)',
      hausa: 'Kullin kwayoyi 24 (ga manya): kwaya 4 sau biyu a rana har tsawon kwanaki 3',
      yoruba: 'Paki oogun 24 fun agbalagba: tabulẹti mẹrin lẹẹmeji lojumọ fun ọjọ mẹta',
      igbo: 'Ngwugwu mbadamba 24 maka ndị okenye: mbadamba anọ ugboro abụọ n\'ụbọchị ruo ụbọchị atọ',
    },
    primaryUses: {
      pidgin: 'First-line cure for uncomplicated malaria parasite, ONLY after positive malaria blood test (mRDT).',
      english: 'WHO and Nigeria National Malaria Elimination Programme (NMEP) first-line treatment for confirmed uncomplicated P. falciparum malaria.',
      hausa: 'Maganin zazzabin cizon sauro na farko, KAWAI bayan an tabbatar da cutar ta hanyar gwaji.',
      yoruba: 'Oogun akọkọ fun iba iba, KIKI lẹhin ti ayẹwo ẹjẹ ba fihan pe iba wa.',
      igbo: 'Ọgwụ mbụ maka ịba na-enweghị nsogbu, KANSA mgbe ule ọbara gosiri na ịba dị.',
    },
    keyRule: {
      pidgin: 'DO NOT TAKE WITHOUT TEST! Not all fever is malaria. Always take with oily/fatty food or milk for body to absorb it.',
      english: 'TEST BEFORE TREATING! Fever has many non-malaria causes in Nigeria. Always ingest with fatty food/milk for adequate drug absorption.',
      hausa: 'KADA KA SHA BA TARE DA GWAJI BA! Ba kowane zazzabi ne cizon sauro ba. A sha tare da abinci mai maiko ko madara.',
      yoruba: 'MAṢE MU LAI ṢE AYẸWO! Kii ṣe gbogbo iba ni iba iba. Mu pẹlu ounjẹ to ni ọra tabi wara ki ara le gba oogun naa.',
      igbo: 'AṄỤLA MA EMEGHỊ NNYOCHA! Ọ bụghị ahụ ọkụ niile bụ ịba. Ṅụọ ya na nri nwere mmanụ ma ọ bụ mmiri ara ehi.',
    },
    howToTakeAdult: {
      pidgin: 'Adult (>35kg): Take 4 tablets at Hour 0, then 4 tablets 8 hours later on Day 1. Then 4 tablets morning and 4 tablets evening on Days 2 and 3. Complete ALL 24 tablets!',
      english: 'Standard 6-dose regimen: 4 tablets initially, 4 tablets 8 hours later on Day 1; then 4 tablets twice daily (morning & night) on Days 2 and 3. Complete full 3-day course.',
      hausa: 'Manya: Kwaya 4 da farko, kwaya 4 bayan sa\'o\'i 8 a rana ta 1; sannan kwaya 4 safe da yamma a kwanaki 2 da 3. A gama duka kwayoyi 24.',
      yoruba: 'Agbalagba: Tabulẹti 4 lakọkọ, tabulẹti 4 lẹhin wakati 8 ni ọjọ akọkọ; lẹhinna 4 ni owurọ ati 4 ni alẹ ni ọjọ 2 ati 3. Mu gbogbo tabulẹti 24 tan.',
      igbo: 'Ndị okenye: Mbadamba 4 na mbido, 4 mgbe awa 8 gachara n\'ụbọchị mbụ; emesịa 4 n\'ụtụtụ na 4 n\'abalị n\'ụbọchị 2 na 3. Ṅụchaa mbadamba 24 niile.',
    },
    howToTakeChild: {
      pidgin: 'Use exact weight-band pack (yellow 6-tab pack for 5-14kg, blue 12-tab pack for 15-24kg). Crush into spoon with milk or porridge.',
      english: 'Use pediatric weight-band presentations (1 tablet per dose for 5–14kg; 2 tablets per dose for 15–24kg). Consult pharmacist for correct tier.',
      hausa: 'Yi amfani da kalar da ta dace da nauyin yaro (kwaya 1 ga yara 5-14kg; kwaya 2 ga 15-24kg). Tuntubi masanin magani.',
      yoruba: 'Lo paki ti o baamu iwuwo ọmọ (tabulẹti 1 fun 5-14kg; tabulẹti 2 fun 15-24kg). Beere lọwọ oṣiṣẹ ile oogun.',
      igbo: 'Jiri ngwugwu dabara n\'arọ nwa ahụ (otu mbadamba maka 5-14kg; abụọ maka 15-24kg). Gwa onye na-ere ọgwụ.',
    },
    whatToAskPharmacist: {
      pidgin: [
        '“Can you run a rapid malaria test (mRDT) for me right now before I buy?” (Many community pharmacies do this for ₦500-₦1,000)',
        '“Can I scratch the MAS authentication panel to text 38353 for free verification?”',
        '“Must I take this with milk or oily stew?” (Yes! Fat is needed to absorb lumefantrine)',
      ],
      english: [
        '“Can you perform a Malaria Rapid Diagnostic Test (mRDT) before dispensing?”',
        '“Does this box have the NAFDAC Mobile Authentication Service (MAS) scratch-and-text panel?”',
        '“What food should I take with this to ensure proper absorption?”',
      ],
      hausa: [
        '“Za ku iya yi mini gwajin mRDT kafin in sayi maganin?”',
        '“Akwai lambar goge-ka-aika ta NAFDAC (MAS) a jikin akwatin?”',
        '“Wane irin abinci ne ya fi dacewa in ci tare da wannan magani?”',
      ],
      yoruba: [
        '“Ṣe ẹ le ṣe ayẹwo iba (mRDT) fun mi ki n to ra oogun yii?”',
        '“Nje paki yii ni nọmba ifọwọsi NAFDAC (MAS) ti a le ha ranṣẹ si 38353?”',
        '“Ounjẹ wo ni o yẹ ki n jẹ pẹlu rẹ ki oogun le ṣiṣẹ daradara?”',
      ],
      igbo: [
        '“Ị nwere ike ịnwale m maka ịba (mRDT) tupu m zụọ ọgwụ a?”',
        '“Akpa a ọ nwere akara NAFDAC (MAS) a na-akpụcha eziga ozi n\'efu?”',
        '“Kedu nri m kwesịrị iri tupu m ṅụọ ọgwụ a ka o wee rụọ ọrụ nke ọma?”',
      ],
    },
    safetyAlerts: {
      pidgin: [
        'Do not stop on Day 2 just because you feel better! Stopping early makes malaria parasite develop resistance.',
        'If vomiting occurs within 30 minutes of swallowing, take a replacement dose immediately.',
        'Never take with grapefruit juice or certain heart medications.',
      ],
      english: [
        'Complete the entire 3-day 6-dose course even if symptoms resolve earlier to prevent recrudescence.',
        'If vomiting occurs within 30 minutes of a dose, a repeat full dose must be taken.',
        'Beware of counterfeit ACTs in unauthorized kiosks; insist on scratch-card MAS verification.',
      ],
      hausa: [
        'Kada ka daina sha a rana ta 2 don kawai ka ji sauƙi. Kammala kwanaki 3 duka.',
        'Idan an yi amai cikin minti 30 bayan sha, a sake shan wani adadin.',
        'A guji sayen magani a gefen titi saboda magungunan jabu.',
      ],
      yoruba: [
        'Maṣe dawọ rẹ duro ni ọjọ keji nitori pe ara rẹ ti fẹẹ bọ. Pari gbogbo ọjọ mẹtẹẹta.',
        'Ti eebi ba waye laarin iṣẹju 30 lẹhin mimu, tun mu iwọn miiran lẹsẹkẹsẹ.',
        'Yago fun rira oogun ni ọja gbangba tabi lọwọ awọn ti n kiri oogun.',
      ],
      igbo: [
        'Akpụsịla ịṅụ ya n\'ụbọchị nke abụọ n\'ihi na ahụ na-akachasị gị mma. Ṅụchaa ya ụbọchị atọ.',
        'Ọ bụrụ na a gbọọ agbọ n\'ime nkeji iri atọ, ṅụghachi ọgwụ ahụ ozugbo.',
        'Kpachara anya maka ọgwụ adịgboroja; zụọ naanị n\'ụlọ ahịa ọgwụ nwere ikikere.',
      ],
    },
    pregnancyAdvisory: {
      pidgin: {
        isAllowed: false,
        note: 'CAUTION: In the 1st trimester of pregnancy (first 3 months), ACTs are avoided unless prescribed by an OB/GYN doctor. Go to antenatal clinic immediately.',
      },
      english: {
        isAllowed: false,
        note: 'First trimester safety requires specialist assessment; Oral Quinine or specific alternatives are traditionally favored unless WHO 1st-trimester ACT guidance is doctor-supervised.',
      },
      hausa: {
        isAllowed: false,
        note: 'GARGADI: A watanni 3 na farko na ciki, a guji shan ACT sai da umarnin babban likita.',
      },
      yoruba: {
        isAllowed: false,
        note: 'IKILỌ: Ni oṣu mẹta akọkọ ti oyun, a ko gba niyanju lati mu ACT lai si aṣẹ dokita amọja.',
      },
      igbo: {
        isAllowed: false,
        note: 'ỊDỌ AKA NA NTỊ: N\'ọnwa atọ mbụ nke ime, ejila ACT ma ọ bụghị na dọkịta nyere ikike.',
      },
    },
    nafdacVerification: {
      regPattern: 'Look for the Green MAS scratch sticker on the front or back of carton',
      tips: {
        pidgin: 'Scratch the silver panel on the pack. Text the revealed 10-12 digit PIN to 38353 (it is FREE on MTN, Airtel, Glo). You will get SMS saying "OK genuine product".',
        english: 'Scratch the silver coating on the MAS panel. Send the hidden PIN via SMS to 38353 for free instant genuine verification from NAFDAC.',
        hausa: 'Goge wurin silba na jikin maganin, ka tura lambar zuwa 38353 a wayarka kyauta don tabbatar da inganci.',
        yoruba: 'Ha ibi ti a bo pẹlu fadaka lori paki naa, ki o si fi nọmba ti o jade ranṣẹ si 38353 lori foonu rẹ lọfẹ.',
        igbo: 'Kpụchaa akara ọlaọcha dị na ngwugwu ahụ, ziga nọmba ahụ na 38353 n\'efu maka nkwenye NAFDAC.',
      },
    },
    redFlagsSeekDoctor: {
      pidgin: [
        'Vomiting continuously and cannot keep oral medicine down.',
        'Yellow eyes (jaundice), dark "Coca-Cola" urine, or extreme pale palms.',
        'Confusion, strange behavior, or seizures (danger signs of cerebral malaria!).',
      ],
      english: [
        'Repeated vomiting preventing oral medication retention.',
        'Jaundice (yellowing sclera), dark tea-colored urine, extreme pallor/anemia.',
        'Confusion, delirium, loss of consciousness, or convulsions (cerebral malaria emergencies).',
      ],
      hausa: [
        'Amai mai tsanani da ya hana magani zama a ciki.',
        'Idanu sun yi rawaya, fitsari kamar kalar shayi, ko rashin jini mai tsanani.',
        'Rikicewar hankali, suma, ko farfadiya (alamomin cutar malaria mai tsanani).',
      ],
      yoruba: [
        'Eebi ti ko jẹ ki oogun duro ninu agbada.',
        'Oju ti o pọn pupa tabi iyẹfun, ito dudu bi kọka, tabi aini ẹjẹ to le.',
        'Idarudapọ ọpọlọ, daku, tabi warapa (ẹri iba ti o lewu pupọ).',
      ],
      igbo: [
        'Ọgbụgbọ na-adịghị akwụsị akwụsị na-eme ka ọgwụ ghara ịnọ n\'afọ.',
        'Anya na-acha odo odo, mamịrị gbara ọchịchịrị dị ka kọla, ma ọ bụ enweghị ọbara.',
        'Ọgba aghara n\'uche, ịdaba n\'amaghị onwe, ma ọ bụ ọdụdọ (ihe mberede ịba ụbụrụ).',
      ],
    },
  },

  {
    id: 'antacid-liquid',
    genericName: 'Antacid Oral Suspension (Aluminium & Magnesium Hydroxide + Simethicone)',
    category: 'heartburn_stomach',
    categoryName: {
      pidgin: 'Heartburn & Acid Reflux',
      english: 'Heartburn & Acidity',
      hausa: 'Kunar Ƙirji da Ƙoshi',
      yoruba: 'Oorun Ọkan ati Gaasi',
      igbo: 'Ọkụ n\'Obi na Ọnya Afọ',
    },
    commonBrands: ['Gaviscon Liquid', 'Mist Mag (Magnesium Trisilicate)', 'Gestid Suspension', 'Novagel', 'Gelusil'],
    imageSrc: antacidSuspensionImg,
    presentation: {
      pidgin: '100ml–200ml white bottle suspension or blister pack of chewable tablets',
      english: '100ml to 200ml oral suspension in glass/PET bottle or blister pack of chewable mint tablets',
      hausa: 'Maganin ruwa na kofi 100ml zuwa 200ml a kwalba, ko kwayoyin taunawa',
      yoruba: 'Oogun omi 100ml-200ml ninu igo tabi tabulẹti funfun ti a n jẹ',
      igbo: 'Ọgwụ mmiri 100ml ruo 200ml n\'ime karama ma ọ bụ mbadamba a na-ata ata',
    },
    primaryUses: {
      pidgin: 'Fast relief for hot chest/burning throat (heartburn), pepper-stomach, gas bloating, and sour belching.',
      english: 'Neutralizes excess gastric acid and coats the esophageal lining to relieve acid indigestion, reflux, and dyspepsia.',
      hausa: 'Maganin gaggawa na ƙunar ƙirji, ciwon ciki mai zafi, da kumburin ciki na iska.',
      yoruba: 'Fun iranlọwọ kiakia fun oorun ọkan, irora inu gbigbona, ati gaasi ninu ikun.',
      igbo: 'Enweta ngwọta ngwa ngwa maka ọkụ n\'obi, mgbu afọ na-ere ọkụ, na oke ikuku n\'afọ.',
    },
    keyRule: {
      pidgin: 'Always SHAKE bottle well before pouring. Take 1 to 2 hours AFTER meals or right before bed.',
      english: 'Shake bottle thoroughly before measuring. Take 1 to 2 hours after meals and at bedtime for maximum contact time.',
      hausa: 'Ka karkada kwalbar sosai kafin ka sha. A sha bayan awa 1 ko 2 da cin abinci.',
      yoruba: 'Gbọn igo naa daradara ki o to mu. Mu ni wakati 1 si 2 lẹhin ounjẹ tabi ṣaaju sisun.',
      igbo: 'Kwegharịa karama ahụ nke ọma tupu ị wụnye ya. Na-aṅụ ya mgbe awa 1 ma ọ bụ 2 gasịrị mgbe i risịrị nri.',
    },
    howToTakeAdult: {
      pidgin: 'Take 2 to 4 teaspoons (10ml-20ml) between meals and at bedtime, or chew 1 to 2 tablets thoroughly.',
      english: 'Adults: 10ml to 20ml suspension (or 1–2 chewable tablets chewed thoroughly) up to 4 times daily, preferably after meals.',
      hausa: 'Manya: Cokali 2 zuwa 4 na maganin ruwa (10ml-20ml) ko tauna kwaya 1 zuwa 2 sosai.',
      yoruba: 'Agbalagba: Sibí 2 si 4 ti oogun omi (10ml-20ml) tabi jẹ tabulẹti 1 si 2 daradara.',
      igbo: 'Ndị okenye: Ngaji 2 ruo 4 nke ọgwụ mmiri (10ml-20ml) ma ọ bụ taa mbadamba 1 ruo 2 nke ọma.',
    },
    howToTakeChild: {
      pidgin: 'Not recommended for small children under 6 years without doctor prescription.',
      english: 'Not generally indicated in children under 6 years without pediatric evaluation.',
      hausa: 'Ba a ba da shawarar ba ga yara ƙasa da shekaru 6 sai da izinin likita.',
      yoruba: 'A ko gba niyanju fun awọn ọmọde labẹ ọdun 6 lai si aṣẹ dokita.',
      igbo: 'Akwadoghị ya maka ụmụaka na-erubeghị afọ isii ma ọ bụghị na dọkịta kwuru ya.',
    },
    whatToAskPharmacist: {
      pidgin: [
        '“Can I take this together with other medicines like antibiotics or iron blood tonic?” (Leave at least 2 hours gap because antacid blocks absorption!)',
        '“Does this brand contain high sodium if I have high blood pressure?”',
      ],
      english: [
        '“How many hours gap should I leave between this antacid and other medications like iron or antibiotics?” (Separation of 2 hours is required).',
        '“Is this low-sodium if I am managing hypertension?”',
      ],
      hausa: [
        '“Shin zan iya shan wannan tare da maganin jini ko na rigakafi?” (A bar tazarar sa\'o\'i biyu).',
        '“Shin wannan maganin yana da gishiri mai yawa idan ina da hawan jini?”',
      ],
      yoruba: [
        '“Ṣe mo le mu eyi pẹlu awọn oogun miiran bi oogun ẹjẹ tabi aporo?” (Fi wakati meji si aarin).',
        '“Nje oogun yii ni iyọ pupọ fun ẹniti o ni ríru ẹjẹ?”',
      ],
      igbo: [
        '“Enwere m ike ịṅụ nke a na ọgwụ ndị ọzọ dị ka ọgwụ ọbara ma ọ bụ antibiotic?” (Hapụ oghere nke awa abụọ).',
        '“Ọ nwere nnu dị ukwuu maka onye nwere ọbara mgbali elu?”',
      ],
    },
    safetyAlerts: {
      pidgin: [
        'Antacids only cool down the fire temporarily; they do NOT cure bacterial peptic ulcer or H. pylori infection.',
        'Never take within 2 hours of taking your daily blood pressure, iron capsule, or thyroid tablets.',
        'If chest pain feels tight, squeezes like heavy rock, or shoots to your left shoulder/jaw, THAT IS NOT HEARTBURN — call 112 / 767 immediately!',
      ],
      english: [
        'Antacids provide symptomatic relief only; they do not eradicate H. pylori or heal severe ulcerative disease.',
        'Antacids chelate and severely impair absorption of antibiotics (e.g. ciprofloxacin, doxycycline) and oral iron.',
        'CRITICAL: Crushing retrosternal chest tightness radiating to the arm/jaw is cardiac ischemia, NOT acid reflux. Seek emergency medical attention.',
      ],
      hausa: [
        'Maganin yana kwantar da zafi ne kawai, baya warkar da gyambon ciki (ulcer) gaba ɗaya.',
        'Kada a sha a lokaci guda da magungunan hawan jini ko maganin ƙara jini.',
        'GARGADI: Idan ciwon ƙirji yana matsewa kuma yana yaduwa zuwa kafaɗar hagu, wannan ba ƙunar ƙirji ba ce — a gaggauta kiran asibiti!',
      ],
      yoruba: [
        'Oogun yii n dinku irora nikan, ko ki n ṣe iwosan ọgbẹ inu (ulcer) patapata.',
        'Maṣe mu ni akoko kanna pẹlu oogun eje riru tabi oogun eje.',
        'IKILỌ: Ti irora ọkan ba n fa si apa osi tabi erigi, kii ṣe oorun ọkan — pe 112 lẹsẹkẹsẹ!',
      ],
      igbo: [
        'Ọgwụ a na-ebelata ihe mgbu nwa oge, ọ naghị agwọ ọnya afọ (ulcer) kpamkpam.',
        'Aṅụla ya n\'otu oge na ọgwụ mgbali elu ma ọ bụ ọgwụ na-enye ọbara.',
        'ỊDỌ AKA NA NTỊ: Ọ bụrụ na obi na-egbu mgbu ma na-agbasa n\'aka ekpe ma ọ bụ agba, ọ bụghị ọkụ n\'obi nkịtị — kpọọ 112 ozugbo!',
      ],
    },
    pregnancyAdvisory: {
      pidgin: {
        isAllowed: true,
        note: 'Antacids with calcium carbonate or magnesium are generally safe for pregnancy heartburn when used occasionally. Avoid preparations with sodium bicarbonate or aspirin.',
      },
      english: {
        isAllowed: true,
        note: 'Calcium- or magnesium-based antacids are generally safe for pregnancy reflux. Avoid sodium bicarbonate (risk of fluid retention/metabolic alkalosis).',
      },
      hausa: {
        isAllowed: true,
        note: 'Maganin da ke da sinadarin Calcium ko Magnesium yana da aminci ga mata masu ciki idan aka sha a kan ka\'ida.',
      },
      yoruba: {
        isAllowed: true,
        note: 'Awọn oogun ti o ni calcium tabi magnesium wa ni aabo fun oorun ọkan nigba oyun. Yago fun awọn ti o ni sodium bicarbonate.',
      },
      igbo: {
        isAllowed: true,
        note: 'Ọgwụ ndị nwere calcium ma ọ bụ magnesium dị mma maka ọkụ n\'obi n\'oge ime ma ọ bụrụ na e jiri nwayọọ na-aṅụ ya.',
      },
    },
    nafdacVerification: {
      regPattern: 'Check bottle label for 04-XXXX or A4-XXXX plus manufacturer address',
      tips: {
        pidgin: 'Ensure bottle cap has an unbroken security plastic seal before opening.',
        english: 'Inspect intact tamper-evident ring on the bottle cap before purchase.',
        hausa: 'Tabbatar cewa murfin kwalbar yana da raba mai kariya kafin buɗewa.',
        yoruba: 'Rii daju pe fila igo naa ni edidi aabo ti a ko tii fọ ṣaaju ṣiṣi.',
        igbo: 'Hụ na mkpuchi karama ahụ nwere akara nchebe a na-emebibeghị tupu imepe ya.',
      },
    },
    redFlagsSeekDoctor: {
      pidgin: [
        'Stomach pain waking you up at night with dark black or tar-like stool.',
        'Difficulty swallowing food (food getting stuck in throat).',
        'Vomiting blood or dark liquid that looks like coffee grounds.',
      ],
      english: [
        'Nocturnal epigastric pain accompanied by melena (black tarry stool).',
        'Progressive dysphagia (difficulty or pain upon swallowing food).',
        'Hematemesis (vomiting fresh blood or coffee-ground emesis).',
      ],
      hausa: [
        'Ciwon ciki da ke tada mutum da daddare tare da baƙin bayan gida.',
        'Wahalar haɗiye abinci (abinci na maƙalewa a maƙogwaro).',
        'Aman jini ko ruwa mai duhu kamar kofi.',
      ],
      yoruba: [
        'Irora inu ti n ji eniyan ni oru pẹlu igbẹ dudu.',
        'Iṣoro lati gbe ounjẹ mì (ounjẹ n di ni ọfun).',
        'Eebi ẹjẹ tabi omi dudu ti o dabi kọfi.',
      ],
      igbo: [
        'Mgbu afọ na-akpọte mmadụ n\'abalị yana nsị gbara ọchịchịrị dị ka taa.',
        'Ihe isi ike ilo nri (nri ịrapara n\'akpịrị).',
        'Ịgbọ ọbara ma ọ bụ mmiri gbara ọchịchịrị dị ka kọfị.',
      ],
    },
  },
];

export const PHARMACY_SAFETY_GUIDELINES = {
  nafdacTips: {
    pidgin: [
      'Always look for registered Community Pharmacies with a visible Pharmacist Council of Nigeria (PCN) green cross sign.',
      'Check the NAFDAC Reg Number on the packet: "04-XXXX" means made in Nigeria; "A4-XXXX" means officially imported.',
      'Use NAFDAC MAS scratch panel: Scratch the silver panel and SMS the PIN to 38353 for free on MTN/Airtel/Glo to verify genuine.',
      'Check expiry date: Never buy medicines whose expiry date has passed or was erased/scratched out.',
      'Avoid roadside open-air patent stalls where medicines bake in direct hot Nigerian sun for months.',
    ],
    english: [
      'Purchase only from registered Community Pharmacies displaying the Pharmacists Council of Nigeria (PCN) green emblem.',
      'Examine the NAFDAC registration code: Formats are 04-XXXX (domestic manufacture) or A4-XXXX (regulated import).',
      'Utilize Mobile Authentication Service (MAS): Scratch the tamper-resistant panel and text the PIN to 38353 for instant free authentication.',
      'Scrutinize the expiry and batch print: Refuse packages with faded, reprinted, or smeared expiration stamps.',
      'Avoid street hawkers and open-market kiosks where extreme heat and humidity degrade active drug ingredients.',
    ],
    hausa: [
      'Sayi magunguna kawai daga kantin magani mai rajista tare da alamar PCN ta kore.',
      'Duba lambar NAFDAC: 04-XXXX (wanda aka yi a Najeriya) ko A4-XXXX (wanda aka shigo da shi).',
      'Yi amfani da sabis na MAS: Goge wurin silba ka tura lambar zuwa 38353 kyauta.',
      'Duba kwanan watan ƙarewa: Kada ka sayi maganin da ya ƙare ko aka goge kwanan watan.',
      'A guji sayen magunguna a gefen hanya ko a wuraren da rana ke dukan magunguna.',
    ],
    yoruba: [
      'Ra oogun nikan lati ile oogun ti o forukọsilẹ pẹlu ami PCN alawọ ewe.',
      'Wo nọmba NAFDAC: 04-XXXX (ti a ṣe ni Naijiria) tabi A4-XXXX (ti a mu wọle).',
      'Lo iṣẹ MAS: Ha ibi fadaka ki o fi nọmba naa ranṣẹ si 38353 lọfẹ.',
      'Ṣayẹwo ọjọ ipari: Maṣe ra oogun ti akoko rẹ ti kọja tabi ti a ti pa ọjọ rẹ rẹ.',
      'Yago fun rira oogun lọwọ awọn ti n kiri labẹ oorun ti o le ba agbara oogun jẹ.',
    ],
    igbo: [
      'Zụta naanị n\'ụlọ ahịa ọgwụ nwere akara PCN na-acha akwụkwọ ndụ akwụkwọ ndụ.',
      'Lelee akara NAFDAC: 04-XXXX (nke emere na Naijiria) ma ọ bụ A4-XXXX (nke esiri na mba ọzọ bubata).',
      'Jiri ọrụ MAS: Kpụchaa akara ọlaọcha ziga ya na 38353 n\'efu maka nkwenye.',
      'Lelee ụbọchị ngwụcha: Azụla ọgwụ gafeworo ụbọchị ngwụcha ya.',
      'Zenarị ịzụta ọgwụ n\'aka ndị na-akpụgharị ya n\'anyanwụ nke nwere ike imebi ya.',
    ],
  },
  generalRules: {
    pidgin: [
      'Never take antibiotics (like Amoxil, Ampiclox, Cipro, Flagyl) without a doctor prescription and lab test.',
      'Traditional herbal mixtures ("Agbo") must NEVER be mixed with English pharmaceutical drugs.',
      'Pregnant women must strictly avoid NSAIDs like Ibuprofen, Diclofenac, Feldene, and Aspirin.',
      'Always finish full doses of genuine antimalarial or antibiotic treatment even if you feel 100% fine.',
    ],
    english: [
      'Antibiotics (e.g., Amoxicillin, Ciprofloxacin, Metronidazole) require medical evaluation and culture tests—never use them casually.',
      'Never combine traditional herbal remedies (agbo/dawa) with pharmaceutical agents due to unpredictable organ toxicity.',
      'Pregnant patients must avoid NSAIDs (Ibuprofen, Diclofenac, Meloxicam, Aspirin); consult your antenatal clinic.',
      'Always complete prescribed courses of antimalarials to prevent parasite recrudescence and drug resistance.',
    ],
    hausa: [
      'Kada a sha maganin rigakafi (antibiotics) ba tare da binciken likita ba.',
      'Kada a haɗa maganin gargajiya da na asibiti a lokaci guda.',
      'Mata masu juna biyu su guji magunguna kamar Ibuprofen da Diclofenac.',
      'Koyaushe a kammala dukkan kwanakin shan maganin zazzabin cizon sauro.',
    ],
    yoruba: [
      'Maṣe lo oogun aporo (antibiotics) lai si iwe aṣẹ dokita ati ayẹwo.',
      'A ko gbọdọ da agbo ati oogun oyinbo pọ mọra rara nitori eewu si kidinrin ati ẹdọ.',
      'Awọn aboyun gbọdọ yago fun awọn oogun irora bii Ibuprofen ati Diclofenac.',
      'Pari gbogbo iwọn oogun iba ti a fun ọ paapaa ti o ba ti n lero pe ara rẹ ti da.',
    ],
    igbo: [
      'Aṅụla ọgwụ mgbochi nje (antibiotics) na-enweghị ndụmọdụ dọkịta na ule nyocha.',
      'Ejila ọgwụ ọdịnala (agbo) na ọgwụ bekee agwakọta n\'ihi na ọ na-emebi akụrụ na umeji.',
      'Ụmụ nwaanyị dị ime ga-ezere ọgwụ mgbu dị ka Ibuprofen na Diclofenac.',
      'Na-aṅụcha ọgwụ ịba niile e nyere gị ọbụna ma ọ bụrụ na ahụ na-adị gị mma.',
    ],
  },
};
