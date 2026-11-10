import { SupportedLanguage } from '../types/triage';

export interface LocalizedSymptomPrompt {
  label: string;
  text: string;
  iconName: 'thermometer' | 'droplet' | 'zap' | 'wind' | 'heart' | 'alert' | 'activity' | 'baby';
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  dotColor: string;
}

export interface LanguageStrings {
  greeting: string;
  switchNotice: string;
  welcomeShowcase: {
    headline: string;
    tagline: string;
    pillars: { title: string; desc: string }[];
    voiceCta: string;
    pregnancyCta: string;
    hospitalsCta: string;
  };
  header: {
    badge: string;
    subtitle: string;
    hospitals: string;
    firstAid: string;
    shareApp: string;
    shareShort: string;
    linkCopied: string;
    emergencyBtn: string;
    stateSuffix: string;
  };
  contextBar: {
    routingActive: string;
    voiceAssisted: string;
    clinicalMode: string;
    whatsappMode: string;
    newSession: string;
    whatsappStatus: string;
    call112: string;
  };
  chat: {
    you: string;
    evaluating: string;
    commonSymptomsTitle: string;
    scrollHint: string;
    placeholderIdle: string;
    placeholderListening: string;
    placeholderRecording: string;
    placeholderTranscribing: string;
    triageBtn: string;
    tapToStopRecording: string;
    tapToSpeak: string;
    voiceUnsupported: string;
    micDenied: string;
    transcribeFailed: string;
    networkError: (state: string) => string;
    footerDisclaimerPrefix: string;
    footerCall112: string;
    footerImmediate: string;
    footerNcdc: string;
  };
  triageCard: {
    emergencyEval: string;
    urgentReview: string;
    routineCare: string;
    listen: string;
    stopAudio: string;
    preparingAudio: string;
    share: string;
    copied: string;
    immediateAttention: string;
    defaultEmergencyWarning: string;
    call112Free: string;
    causesTitle: string;
    homeTitle: string;
    actionTitle: string;
    bypassedBadge: string;
    homeWithheld: string;
    defaultHomeRest: string;
    browseHospitals: string;
    clarifyingTitle: string;
    clarifyPrefix: string;
    defaultDisclaimer: string;
    whatsappHeader: string;
    whatsappLocation: string;
    whatsappUrgency: string;
    whatsappEmergencyVal: string;
    whatsappUrgentVal: string;
    whatsappStableVal: string;
    whatsappHomeCancelled: string;
  };
  emergencyPrefix: string;
  visuals: {
    guidesTitle: string;
    guidesSubtitle: string;
    openGuideCta: string;
    hospitalsCta: string;
    cards: {
      welcome: { title: string; caption: string };
      ors: { title: string; caption: string };
      sponging: { title: string; caption: string };
      choking: { title: string; caption: string };
      pregnancy: { title: string; caption: string };
      hospital: { title: string; caption: string };
    };
  };
  symptoms: LocalizedSymptomPrompt[];
}

export const TRANSLATIONS: Record<SupportedLanguage, LanguageStrings> = {
  pidgin: {
    greeting: `Pele o! How your body dey do you or your family right now?

Tell me any sickness at all — **hot body, belle trouble, small pikin fever, or belle (pregnancy) check** — by voice or typing. Remember to mention your **state or town** so I fit show you real hospital near you sharp-sharp!`,
    switchNotice: `💚 Language don change to **Naija Pidgin**. Tell me how your body dey do you, I go reply you inside clear Pidgin!`,
    welcomeShowcase: {
      headline: 'Check Your Health Fast — No Big Medical Grammar',
      tagline: 'Speak or type any symptom in your own Naija language and get clear steps in seconds.',
      pillars: [
        { title: '5 Naija Languages', desc: 'Pidgin, English, Hausa, Yoruba & Igbo — speak or listen aloud' },
        { title: 'Pregnancy & Family Safe', desc: 'Antenatal danger checks, child fever cooling & Home ORS steps' },
        { title: 'Real State Hospitals', desc: 'Verified clinics across all 36 states + Abuja & instant 112 alert' },
      ],
      voiceCta: 'Speak Now (Mic)',
      pregnancyCta: 'Pregnancy Safety Check',
      hospitalsCta: 'Find Hospital Near Me',
    },
    header: {
      badge: 'Federal Health Triage',
      subtitle: 'Empathetic Medical Navigation • Nigeria',
      hospitals: 'Hospitals',
      firstAid: 'First Aid',
      shareApp: 'Share App',
      shareShort: 'Share',
      linkCopied: 'Link Copied!',
      emergencyBtn: 'Emergency (112)',
      stateSuffix: 'State',
    },
    contextBar: {
      routingActive: 'Health routing active',
      voiceAssisted: 'Voice Assisted',
      clinicalMode: 'Clinical',
      whatsappMode: 'WhatsApp',
      newSession: 'New Session',
      whatsappStatus: 'online • Nigerian Medical Triage',
      call112: 'Call 112',
    },
    chat: {
      you: 'You',
      evaluating: 'Dey check your symptoms and Nigerian health guidelines...',
      commonSymptomsTitle: '⚡ Common Symptoms (Tap to check):',
      scrollHint: 'Scroll to see all →',
      placeholderIdle: 'Describe how body dey do you (e.g. 2 days hot body, purging, Ikeja Lagos)...',
      placeholderListening: 'I dey hear you, talk your symptoms...',
      placeholderRecording: 'Dey record voice... Tap red mic again when you finish.',
      placeholderTranscribing: 'Dey turn your voice to text...',
      triageBtn: 'Check Am',
      tapToStopRecording: 'Tap to stop voice recording',
      tapToSpeak: 'Speak your symptoms using voice',
      voiceUnsupported: 'Your browser no support voice recording. Abeg type how body dey do you.',
      micDenied: 'Microphone permission no dey. Abeg allow mic or type your symptoms.',
      transcribeFailed: 'Voice no clear well. Abeg try speak again or type am.',
      networkError: (state) => `Ayaah, network hold my hand small. But if your body no do you well at all, abeg waka go the nearest General Hospital for ${state} State or dial 112 for emergency!`,
      footerDisclaimerPrefix: 'NaijaHealth AI dey give health guide only. For sharp emergency, call',
      footerCall112: '112',
      footerImmediate: 'now-now.',
      footerNcdc: 'Federal Ministry of Health & NCDC Aligned Guidelines',
    },
    triageCard: {
      emergencyEval: 'Emergency Alert (Rush Go Hospital)',
      urgentReview: 'Go See Doctor Soon',
      routineCare: 'Mild Care / Watch For House',
      listen: 'Listen (Gbo am)',
      stopAudio: 'Stop',
      preparingAudio: 'Loading voice...',
      share: 'Share',
      copied: 'Copied',
      immediateAttention: '🚨 RUSH GO HOSPITAL NOW-NOW',
      defaultEmergencyWarning: 'Danger sign dey! No do any home remedy at all.',
      call112Free: 'Call 112 Free',
      causesTitle: 'Wetin Fit Dey Happen',
      homeTitle: 'Wetin You Fit Do For House',
      actionTitle: 'Next Step',
      bypassedBadge: 'Cancelled',
      homeWithheld: 'All house treatment cancelled because na dangerous emergency sign! Rush go hospital emergency room now-now.',
      defaultHomeRest: 'Rest well and drink plenty clean water.',
      browseHospitals: 'Check Hospitals',
      clarifyingTitle: 'Small question make I understand well:',
      clarifyPrefix: 'Answer:',
      defaultDisclaimer: '⚠️ Abeg remember: I be NaijaHealth AI assistant o, I no be real medical doctor. If body no do you well or the matter tight, go meet doctor for hospital or call 112 sharp-sharp.',
      whatsappHeader: '*🟢 NAIJAHEALTH AI TRIAGE REPORT*',
      whatsappLocation: '*Location:*',
      whatsappUrgency: '*Level:*',
      whatsappEmergencyVal: '🚨 RED-FLAG EMERGENCY',
      whatsappUrgentVal: '🟡 NEED DOCTOR ATTENTION',
      whatsappStableVal: '🟢 STABLE',
      whatsappHomeCancelled: '❌ ALL HOME REMEDIES CANCELLED! RUSH GO HOSPITAL IMMEDIATELY!',
    },
    emergencyPrefix: 'EMERGENCY CHECK:',
    symptoms: [
      {
        label: 'Hot body & body pain',
        text: 'My body dey hot well-well and body dey pain me for 3 days, mouth dey bitter',
        iconName: 'thermometer',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-200',
        hoverColor: 'hover:bg-amber-100/90 hover:border-amber-300',
        dotColor: 'bg-amber-500',
      },
      {
        label: 'Belle bite & purging',
        text: 'My belle dey bite me and I dey purge watery stool since yesterday morning',
        iconName: 'droplet',
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-900',
        borderColor: 'border-sky-200',
        hoverColor: 'hover:bg-sky-100/90 hover:border-sky-300',
        dotColor: 'bg-sky-500',
      },
      {
        label: 'Cold chills & headache',
        text: 'Cold and shaking chills dey catch me, my head dey hammer, and body weak patapata',
        iconName: 'zap',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-900',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:bg-purple-100/90 hover:border-purple-300',
        dotColor: 'bg-purple-500',
      },
      {
        label: 'Cough & chest tight',
        text: 'I get dry cough and my chest dey tight small with slight hot body',
        iconName: 'wind',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-900',
        borderColor: 'border-teal-200',
        hoverColor: 'hover:bg-teal-100/90 hover:border-teal-300',
        dotColor: 'bg-teal-600',
      },
      {
        label: 'Pikin hot body & vomit',
        text: 'My 3-year-old pikin body dey hot like fire, e don vomit twice and refuse to eat or drink',
        iconName: 'heart',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-900',
        borderColor: 'border-rose-200',
        hoverColor: 'hover:bg-rose-100/90 hover:border-rose-300',
        dotColor: 'bg-rose-500',
      },
      {
        label: 'Joint pains & bone crisis',
        text: 'I dey feel heavy waist, joint, and bone pains with strong body weakness',
        iconName: 'activity',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-900',
        borderColor: 'border-indigo-200',
        hoverColor: 'hover:bg-indigo-100/90 hover:border-indigo-300',
        dotColor: 'bg-indigo-500',
      },
      {
        label: 'Belle / Pregnancy care',
        text: 'I get belle (pregnant) and I dey feel weak, vomit for morning or hot body',
        iconName: 'baby',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-900',
        borderColor: 'border-pink-200',
        hoverColor: 'hover:bg-pink-100/90 hover:border-pink-300',
        dotColor: 'bg-pink-500',
      },
      {
        label: 'Heavy chest pain & breath seize',
        text: 'Sudden heavy chest pain dey hold me and my breath dey seize',
        iconName: 'alert',
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        borderColor: 'border-red-300',
        hoverColor: 'hover:bg-red-100 hover:border-red-400 ring-1 ring-red-400/30',
        dotColor: 'bg-red-600',
      },
    ],
    visuals: {
      guidesTitle: 'Picture Health Guides',
      guidesSubtitle: 'Tap any real photo to see step-by-step house care & hospital help',
      openGuideCta: 'See Full Picture Guide',
      hospitalsCta: 'Find Hospital Near You',
      cards: {
        welcome: {
          title: 'Friendly Care in Your Own Language',
          caption: 'Plain Naija health guidance linked to hospitals across 36 states + FCT',
        },
        ors: {
          title: 'Salt-Sugar Water (Home ORS)',
          caption: '1L clean water · 1 level tsp salt · 10 level tsp sugar (5 cubes)',
        },
        sponging: {
          title: 'Lukewarm Sponge for Hot Body',
          caption: 'Wipe gently with lukewarm water cloth only — never ice or methylated spirit',
        },
        choking: {
          title: 'Choking Rescue Back Blows',
          caption: 'Support chest, lean forward, give 5 firm shoulder-blade blows',
        },
        pregnancy: {
          title: 'Pregnancy & Antenatal Safety',
          caption: 'No unprescribed drugs or agbo herbs · Check ANC clinic & danger signs',
        },
        hospital: {
          title: 'Rush Go Hospital / Call 112',
          caption: 'Go straight to nearest General Hospital or FMC Emergency Ward now',
        },
      },
    },
  },

  english: {
    greeting: `How are you or your loved ones feeling today?

Tell me about **any illness or symptom** — whether fever, stomach pain, child care, or pregnancy concerns — by voice or text. Mention your **city or state** to get nearby Nigerian hospital routing immediately.`,
    switchNotice: `💚 Language switched to **English (Nigeria)**. Please share your symptoms and I will guide you clearly in plain English.`,
    welcomeShowcase: {
      headline: 'Instant Health Guidance Without Confusing Medical Jargon',
      tagline: 'Describe any symptom by voice or text and get trusted steps tailored to Nigeria.',
      pillars: [
        { title: '5 Nigerian Languages', desc: 'Pidgin, English, Hausa, Yoruba & Igbo — voice input & audio playback' },
        { title: 'Pregnancy & Family Care', desc: 'Maternal red-flag screening, safe ORS mixing & child fever steps' },
        { title: 'Verified Hospital Routing', desc: '36 states + FCT hospital directory & rapid 112 emergency help' },
      ],
      voiceCta: 'Speak Symptom',
      pregnancyCta: 'Pregnancy Safety Check',
      hospitalsCta: 'Find Local Hospitals',
    },
    header: {
      badge: 'Federal Health Triage',
      subtitle: 'Empathetic Medical Navigation • Nigeria',
      hospitals: 'Hospitals',
      firstAid: 'First Aid',
      shareApp: 'Share App',
      shareShort: 'Share',
      linkCopied: 'Link Copied!',
      emergencyBtn: 'Emergency (112)',
      stateSuffix: 'State',
    },
    contextBar: {
      routingActive: 'Health routing active',
      voiceAssisted: 'Voice Assisted',
      clinicalMode: 'Clinical',
      whatsappMode: 'WhatsApp',
      newSession: 'New Session',
      whatsappStatus: 'online • Nigerian Medical Triage',
      call112: 'Call 112',
    },
    chat: {
      you: 'You',
      evaluating: 'Evaluating symptoms and checking verified Nigerian clinical protocols...',
      commonSymptomsTitle: '⚡ Common Symptoms (Tap to triage):',
      scrollHint: 'Scroll to see all →',
      placeholderIdle: 'Type your symptoms (e.g. fever for 2 days, purging, Ikeja Lagos)...',
      placeholderListening: 'Listening to your voice...',
      placeholderRecording: 'Recording audio... Tap red mic again when finished.',
      placeholderTranscribing: 'Transcribing your voice...',
      triageBtn: 'Triage',
      tapToStopRecording: 'Stop recording',
      tapToSpeak: 'Dictate your symptoms using voice',
      voiceUnsupported: 'Your browser does not support voice recording. Please type your symptoms.',
      micDenied: 'Microphone access was denied. Please enable it or type your symptoms.',
      transcribeFailed: 'Could not transcribe clearly. Please try speaking again or type your symptoms.',
      networkError: (state) => `We had trouble connecting to the network. If you feel very unwell, please visit the nearest General Hospital in ${state} State or dial 112 immediately.`,
      footerDisclaimerPrefix: 'NaijaHealth AI provides informational medical triage. For emergencies, please call',
      footerCall112: '112',
      footerImmediate: 'immediately.',
      footerNcdc: 'Federal Ministry of Health & NCDC Aligned Guidelines',
    },
    triageCard: {
      emergencyEval: 'Emergency Evaluation',
      urgentReview: 'Clinical Review Advised',
      routineCare: 'Routine Care / Safe at Home',
      listen: 'Listen Aloud',
      stopAudio: 'Stop',
      preparingAudio: 'Loading voice...',
      share: 'Share',
      copied: 'Copied',
      immediateAttention: 'Immediate Medical Attention Required',
      defaultEmergencyWarning: 'Red-flag symptoms detected. Do not attempt home treatment.',
      call112Free: 'Call 112 Free',
      causesTitle: 'Potential Causes',
      homeTitle: 'Home Management',
      actionTitle: 'Action Plan',
      bypassedBadge: 'Bypassed',
      homeWithheld: 'Home remedies are withheld due to emergency warning signs. Rush immediately to emergency care.',
      defaultHomeRest: 'Ensure adequate rest and hydration with clean drinking water.',
      browseHospitals: 'Browse Hospitals',
      clarifyingTitle: 'Clarifying details:',
      clarifyPrefix: 'Answer:',
      defaultDisclaimer: '⚠️ Medical Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, visit the nearest hospital or call 112 immediately.',
      whatsappHeader: '*🟢 NAIJAHEALTH AI TRIAGE REPORT*',
      whatsappLocation: '*Location:*',
      whatsappUrgency: '*Urgency:*',
      whatsappEmergencyVal: '🚨 RED-FLAG EMERGENCY',
      whatsappUrgentVal: '🟡 ATTENTION NEEDED',
      whatsappStableVal: '🟢 STABLE',
      whatsappHomeCancelled: '❌ ALL HOME REMEDIES CANCELLED! RUSH TO HOSPITAL IMMEDIATELY!',
    },
    emergencyPrefix: 'EMERGENCY CHECK:',
    symptoms: [
      {
        label: 'High fever & body pain',
        text: 'I have had high fever, body aches, and a bitter taste in my mouth for 3 days',
        iconName: 'thermometer',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-200',
        hoverColor: 'hover:bg-amber-100/90 hover:border-amber-300',
        dotColor: 'bg-amber-500',
      },
      {
        label: 'Stomach cramps & purging',
        text: 'I have stomach cramps and frequent watery stool (purging) since yesterday morning',
        iconName: 'droplet',
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-900',
        borderColor: 'border-sky-200',
        hoverColor: 'hover:bg-sky-100/90 hover:border-sky-300',
        dotColor: 'bg-sky-500',
      },
      {
        label: 'Cold chills & headache',
        text: 'I am having shaking chills, throbbing headache, and extreme body weakness',
        iconName: 'zap',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-900',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:bg-purple-100/90 hover:border-purple-300',
        dotColor: 'bg-purple-500',
      },
      {
        label: 'Cough & chest tightness',
        text: 'I have a dry cough and mild chest tightness with a low-grade fever',
        iconName: 'wind',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-900',
        borderColor: 'border-teal-200',
        hoverColor: 'hover:bg-teal-100/90 hover:border-teal-300',
        dotColor: 'bg-teal-600',
      },
      {
        label: 'Child fever & vomiting',
        text: 'My 3-year-old child has a very high fever, has vomited twice, and refuses to eat or drink',
        iconName: 'heart',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-900',
        borderColor: 'border-rose-200',
        hoverColor: 'hover:bg-rose-100/90 hover:border-rose-300',
        dotColor: 'bg-rose-500',
      },
      {
        label: 'Joint pains & bone crisis',
        text: 'I have severe waist, joint, and bone pains with extreme weakness',
        iconName: 'activity',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-900',
        borderColor: 'border-indigo-200',
        hoverColor: 'hover:bg-indigo-100/90 hover:border-indigo-300',
        dotColor: 'bg-indigo-500',
      },
      {
        label: 'Pregnancy & antenatal check',
        text: 'I am pregnant and experiencing morning nausea, weakness, or fever — what is safe?',
        iconName: 'baby',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-900',
        borderColor: 'border-pink-200',
        hoverColor: 'hover:bg-pink-100/90 hover:border-pink-300',
        dotColor: 'bg-pink-500',
      },
      {
        label: 'Severe chest pain & breathlessness',
        text: 'I have sudden sharp chest pain and severe difficulty breathing',
        iconName: 'alert',
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        borderColor: 'border-red-300',
        hoverColor: 'hover:bg-red-100 hover:border-red-400 ring-1 ring-red-400/30',
        dotColor: 'bg-red-600',
      },
    ],
    visuals: {
      guidesTitle: 'Visual Care Guides',
      guidesSubtitle: 'Select any photo guide for step-by-step home & clinic steps',
      openGuideCta: 'Open Care Guide',
      hospitalsCta: 'Browse Local Hospitals',
      cards: {
        welcome: {
          title: 'Compassionate Nigerian Health Triage',
          caption: 'Clear guidance in 5 languages · Routed to verified clinics near you',
        },
        ors: {
          title: 'Home Salt-Sugar Solution (ORS)',
          caption: '1L clean water · 1 level tsp salt · 10 level tsp sugar (5 cubes)',
        },
        sponging: {
          title: 'Safe Tepid Sponging for Fever',
          caption: 'Gentle lukewarm water cloth only — never cold ice or methylated spirit',
        },
        choking: {
          title: 'Choking Emergency Back Blows',
          caption: 'Support chest, lean forward, give 5 firm shoulder-blade blows',
        },
        pregnancy: {
          title: 'Pregnancy & Antenatal Safety',
          caption: 'Avoid self-medication or herbal mixes · Know emergency maternity signs',
        },
        hospital: {
          title: 'Hospital Emergency Care',
          caption: 'Proceed directly to the nearest FMC or General Hospital, or call 112',
        },
      },
    },
  },

  hausa: {
    greeting: `Sannu da zuwa! Yaya jikinka ko lafiyar iyalinka ke ciki a yau?

Fada min **kowace irin rashin lafiya** — kamar zazzabi, ciwon ciki, lafiyar yaro, ko kula da mai juna biyu — ta hanyar murya ko rubutu, kuma ka fadi **jihar da kake ciki** don ganin asibiti mafi kusa.`,
    switchNotice: `💚 An canza yare zuwa **Harshen Hausa**. Fada min abin da ke damun ka, zan ba ka shawara a Hausa mai sauki!`,
    welcomeShowcase: {
      headline: 'Binciken Lafiya Cikin Sauri Ba Tare Da Wahala Ba',
      tagline: 'Yi magana ko rubuta alamun cutar ka cikin sauki don samun shawarwari da asibitoci.',
      pillars: [
        { title: 'Harsuna 5 Na Najeriya', desc: 'Hausa, Pidgin, English, Yoruba & Igbo — da murya ko rubutu' },
        { title: 'Kulawa Ga Masu Juna Biyu', desc: 'Gane alamun hatsari ga ciki, hada ruwan ORS da kula da zazzabi' },
        { title: 'Asibitocin Jihohi 36 + Abuja', desc: 'Samun asibitocin gwamnati da lambar gaggawa 112 nan take' },
      ],
      voiceCta: 'Yi Magana Yanzu',
      pregnancyCta: 'Kula Da Mai Juna Biyu',
      hospitalsCta: 'Nemo Asibiti Kusa',
    },
    header: {
      badge: 'Kiwon Lafiya Najeriya',
      subtitle: 'Taimakon Gaggawa na Kiwon Lafiya • Najeriya',
      hospitals: 'Asibitoci',
      firstAid: 'Taimakon Farko',
      shareApp: 'Tura Abokai',
      shareShort: 'Tura',
      linkCopied: 'An Kwafa!',
      emergencyBtn: 'Gaggawa (112)',
      stateSuffix: 'Jiha',
    },
    contextBar: {
      routingActive: 'Tsarin asibiti yana aiki',
      voiceAssisted: 'Da Murya',
      clinicalMode: 'Asibiti',
      whatsappMode: 'WhatsApp',
      newSession: 'Sabo',
      whatsappStatus: 'a kunne • Taimakon Lafiya Najeriya',
      call112: 'Kira 112',
    },
    chat: {
      you: 'Kai',
      evaluating: 'Ana duba alamun cutar da ka' + '\'' + 'idar lafiya ta Najeriya...',
      commonSymptomsTitle: '⚡ Alamomin Cuta Na Yau Da Kullum (Danna):',
      scrollHint: 'Zame don ganin saura →',
      placeholderIdle: 'Bayyana abin da ke damun ka (misali: zazzabi, zawo, Kano)...',
      placeholderListening: 'Ina sauraron ka, yi magana...',
      placeholderRecording: 'Ana daukar murya... Danna jan makirufo idan ka gama.',
      placeholderTranscribing: 'Ana rubuta maganar ka...',
      triageBtn: 'Duba',
      tapToStopRecording: 'Tsayar da daukar murya',
      tapToSpeak: 'Fadi alamun cutar ka da murya',
      voiceUnsupported: 'Wayar ko na' + '\'' + 'urar ba ta goyan bayan murya. Da fatan za a rubuta.',
      micDenied: 'Ba a ba da izinin makirufo ba. Don Allah ka bude ko ka rubuta.',
      transcribeFailed: 'Ba a ji muryar sosai ba. Don Allah sake gwadawa ko rubuta.',
      networkError: (state) => `Akwai matsalar yanar gizo. Idan jiki yayi tsanani, yi maza ka tafi Babban Asibitin Gwamnati a jihar ${state} ko ka kira 112 nan take!`,
      footerDisclaimerPrefix: 'NaijaHealth AI yana ba da shawarar lafiya ne kawai. A lokacin gaggawa, kira',
      footerCall112: '112',
      footerImmediate: 'nan take.',
      footerNcdc: 'Bisa ka' + '\'' + 'idojin Ma' + '\'' + 'aikatar Lafiya da NCDC ta Najeriya',
    },
    triageCard: {
      emergencyEval: 'GAGGAWA CE (Tafi Asibiti Yanzu)',
      urgentReview: 'Je Ka Ga Likita Nan Kusa',
      routineCare: 'Kula A Gida / Mai Sauki',
      listen: 'Saurara (Murya)',
      stopAudio: 'Tsaya',
      preparingAudio: 'Ana hada murya...',
      share: 'Tura',
      copied: 'An Kwafa',
      immediateAttention: '🚨 GAGGAWA: A TAFI ASIBITI NAN TAKE',
      defaultEmergencyWarning: 'Alamun hatsari ne! Kada ka tsaya wani maganin gida ko kadan.',
      call112Free: 'Kira 112 Kyauta',
      causesTitle: 'Abubuwan Da Ka Iya Kawo Shi',
      homeTitle: 'Maganin Gida',
      actionTitle: 'Mataki Na Gaba',
      bypassedBadge: 'An Soke',
      homeWithheld: 'An soke duk maganin gida saboda wannan alamun gaggawa ne! Yi maza-maza zuwa dakin gaggawa na asibiti yanzu.',
      defaultHomeRest: 'Huta sosai kuma sha ruwa mai tsabta da yawa.',
      browseHospitals: 'Duba Asibitoci',
      clarifyingTitle: 'Karin bayani:',
      clarifyPrefix: 'Amsa:',
      defaultDisclaimer: '⚠️ Tunatarwa: Ni mataimakin AI ne (NaijaHealth AI), ba likita na gaskiya ba. Idan jiki yayi tsanani, tafi asibiti kusa da kai ko kira 112.',
      whatsappHeader: '*🟢 RAHOTON LAFIYA NA NAIJAHEALTH AI*',
      whatsappLocation: '*Wuri:*',
      whatsappUrgency: '*Yanayi:*',
      whatsappEmergencyVal: '🚨 GAGGAWAR HATSARI',
      whatsappUrgentVal: '🟡 ANA BUKATAR LIKITA',
      whatsappStableVal: '🟢 MAI SAUKI',
      whatsappHomeCancelled: '❌ AN SOKE MAGANIN GIDA! YI MAZA ZUWA ASIBITI NAN TAKE!',
    },
    emergencyPrefix: 'BINCIKEN GAGGAWA:',
    symptoms: [
      {
        label: 'Zazzabi da ciwon jiki',
        text: 'Jiki na yana zafi sosai kuma jiki na yana ciwo tsawon kwanaki 3, baki na yana daci',
        iconName: 'thermometer',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-200',
        hoverColor: 'hover:bg-amber-100/90 hover:border-amber-300',
        dotColor: 'bg-amber-500',
      },
      {
        label: 'Murda ciki da zawo',
        text: 'Ciki na yana murda min kuma ina yin zawo mai ruwa tun safiyar jiya',
        iconName: 'droplet',
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-900',
        borderColor: 'border-sky-200',
        hoverColor: 'hover:bg-sky-100/90 hover:border-sky-300',
        dotColor: 'bg-sky-500',
      },
      {
        label: 'Sanyi da ciwon kai',
        text: 'Ina jin sanyi da rawar jiki, kai na yana sarawa sosai, kuma jiki ya yi sanyi',
        iconName: 'zap',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-900',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:bg-purple-100/90 hover:border-purple-300',
        dotColor: 'bg-purple-500',
      },
      {
        label: 'Tari da matsewar kirji',
        text: 'Ina da busasshen tari kuma kirji na yana matsewa kadan tare da dan zazzabi',
        iconName: 'wind',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-900',
        borderColor: 'border-teal-200',
        hoverColor: 'hover:bg-teal-100/90 hover:border-teal-300',
        dotColor: 'bg-teal-600',
      },
      {
        label: 'Zazzabin yaro da amai',
        text: 'Yaro na dan shekara 3 yana da zazzabi mai zafi sosai, ya yi amai sau biyu kuma ya ki cin abinci ko shan ruwa',
        iconName: 'heart',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-900',
        borderColor: 'border-rose-200',
        hoverColor: 'hover:bg-rose-100/90 hover:border-rose-300',
        dotColor: 'bg-rose-500',
      },
      {
        label: 'Ciwon gabbai da kashi',
        text: 'Ina jin ciwon kugu, gabbai, da kashi mai tsanani tare da kasala sosai',
        iconName: 'activity',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-900',
        borderColor: 'border-indigo-200',
        hoverColor: 'hover:bg-indigo-100/90 hover:border-indigo-300',
        dotColor: 'bg-indigo-500',
      },
      {
        label: 'Kula da mai juna biyu',
        text: 'Ina da juna biyu kuma ina jin kasala, amai na safe, ko dan zazzabi',
        iconName: 'baby',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-900',
        borderColor: 'border-pink-200',
        hoverColor: 'hover:bg-pink-100/90 hover:border-pink-300',
        dotColor: 'bg-pink-500',
      },
      {
        label: 'Ciwon kirji & kasa numfashi',
        text: 'Wani ciwon kirji mai tsanani ya kama ni ba zato kuma ina kasa numfashi',
        iconName: 'alert',
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        borderColor: 'border-red-300',
        hoverColor: 'hover:bg-red-100 hover:border-red-400 ring-1 ring-red-400/30',
        dotColor: 'bg-red-600',
      },
    ],
    visuals: {
      guidesTitle: 'Hotunan Jagoran Lafiya',
      guidesSubtitle: 'Danna kowane hoto don ganin matakan kula a gida da asibiti',
      openGuideCta: 'Duba Cikakken Hoto',
      hospitalsCta: 'Nemo Asibiti Kusa Da Kai',
      cards: {
        welcome: {
          title: 'Kulawar Lafiya Cikin Harshen Ku',
          caption: 'Bayani mai sauki a harsuna 5 · Tare da asibitoci a fadin Najeriya',
        },
        ors: {
          title: 'Ruwan Gishiri da Sukari (ORS)',
          caption: 'Lita 1 ruwa mai tsabta · cokali 1 na gishiri · cokali 10 na sukari',
        },
        sponging: {
          title: 'Shafa Ruwan Dumi ga Zazzabi',
          caption: 'Yi amfani da kyalle da ruwan dumi kadan — banda kankara ko spirit',
        },
        choking: {
          title: 'Ceto Idan Abinci Ya Makale',
          caption: 'Rike kirji, karkata gaba, buga tsakanin kafada sau 5 da karfi',
        },
        pregnancy: {
          title: 'Kula Da Lafiyar Mai Juna Biyu',
          caption: 'Guji shan magani ko jiko ba tare da izinin likita ba · San alamun hatsari',
        },
        hospital: {
          title: 'Gaggawa: Tafi Asibiti / Kira 112',
          caption: 'Garzaya Babban Asibiti ko FMC mafi kusa nan take',
        },
      },
    },
  },

  yoruba: {
    greeting: `Pẹ̀lẹ́ o! Báwo ni ara rẹ tàbí ti ẹbí rẹ ṣe ń ṣe lónìí?

Sọ **irú àìsàn èyíkéyìí** fún mi — yálà ibà, inú rírun, ìtọ́jú ọmọdé, tàbí ti aláboyún — nípa fífi ohùn sọ̀rọ̀ tàbí kíkọ ọ́ sílẹ̀, kí o sì dárúkọ **ìpínlẹ̀ rẹ** fún ilé-ìwòsàn tó súnmọ́.`,
    switchNotice: `💚 A ti yí èdè padà sí **Èdè Yorùbá**. Ẹ sọ bí ara ṣe ń ṣe yín fún mi, màá sì bá yín sọ̀rọ̀ ní Yorùbá tó rọrùn!`,
    welcomeShowcase: {
      headline: 'Àyẹ̀wò Ìlera Kíákíá Ní Èdè Rẹ Láìsí Ọ̀rọ̀ Tó Le',
      tagline: 'Sọ̀rọ̀ tàbí kọ bí ara ṣe ń ṣe ọ́ kí o sì gba ìtọ́sọ́nà ilé àti ilé-ìwòsàn lẹ́sẹ̀kẹsẹ̀.',
      pillars: [
        { title: 'Èdè Nàìjíríà Márùn-ún', desc: 'Yorùbá, Pidgin, English, Hausa & Igbo — pẹ̀lú ohùn àti àkọsílẹ̀' },
        { title: 'Àbójútó Aláboyún & Ọmọ', desc: 'Àmì ewu oyún, omi ORS àti ìtọ́jú ibà tó láàbò ní ilé' },
        { title: 'Ilé-ìwòsàn Ìpínlẹ̀ 36 + Abuja', desc: 'Ilé-ìwòsàn ìjọba tó súnmọ́ ọ àti ìpè pàjáwìrì 112 lọ́fẹ̀ẹ́' },
      ],
      voiceCta: 'Sọ̀rọ̀ Báyìí (Mic)',
      pregnancyCta: 'Àyẹ̀wò Aláboyún',
      hospitalsCta: 'Wo Ilé-ìwòsàn Nítòsí',
    },
    header: {
      badge: 'Ìtọ́sọ́nà Ìlera Nàìjíríà',
      subtitle: 'Ìtọ́jú Àìsàn Pẹ̀lú Àánú • Nàìjíríà',
      hospitals: 'Ilé-ìwòsàn',
      firstAid: 'Ìtọ́jú Àkọ́kọ́',
      shareApp: 'Pín Rẹ̀',
      shareShort: 'Pín',
      linkCopied: 'A Ti Da Kọ́ọ̀pì!',
      emergencyBtn: 'Pàjáwìrì (112)',
      stateSuffix: 'Ìpínlẹ̀',
    },
    contextBar: {
      routingActive: 'Ìtọ́sọ́nà ilé-ìwòsàn wà níṣẹ́',
      voiceAssisted: 'Pẹ̀lú Ohùn',
      clinicalMode: 'Ilé-ìwòsàn',
      whatsappMode: 'WhatsApp',
      newSession: 'Ìbẹ̀rẹ̀ Tuntun',
      whatsappStatus: 'wà lórí ayélujára • Ìtọ́jú Ìlera Nàìjíríà',
      call112: 'Pe 112',
    },
    chat: {
      you: 'Ìwọ',
      evaluating: 'À ń ṣàyẹ̀wò àmì àìsàn yín àti ìlànà ìlera Nàìjíríà...',
      commonSymptomsTitle: '⚡ Àwọn Àmì Àìsàn Tó Wọ́pọ̀ (Tẹ̀ ẹ́):',
      scrollHint: 'Yí i láti rí ìyókù →',
      placeholderIdle: 'Kọ bí ara ṣe ń ṣe yín (àpẹẹrẹ: ibà, ìgbẹ́ gbuuru, Ibadan)...',
      placeholderListening: 'Mo ń gbọ́ yín, ẹ sọ̀rọ̀...',
      placeholderRecording: 'Ń gba ohùn sílẹ̀... Tẹ maikirofoonu pupa padà tí ẹ bá parí.',
      placeholderTranscribing: 'Ń yí ohùn yín sí ọ̀rọ̀...',
      triageBtn: 'Ṣàyẹ̀wò',
      tapToStopRecording: 'Dá gbígba ohùn dúró',
      tapToSpeak: 'Sọ àmì àìsàn yín pẹ̀lú ohùn',
      voiceUnsupported: 'Ẹ̀rọ yín kò ṣe àtìlẹ́yìn ohùn. Ẹ jọ̀wọ́ kọ àmì àìsàn yín sílẹ̀.',
      micDenied: 'A kò fún maikirofoonu ní àṣẹ. Ẹ jọ̀wọ́ yọ̀ọ̀da rẹ̀ tàbí kọ ọ́ sílẹ̀.',
      transcribeFailed: 'Ohùn kò ṣe kedere tó. Ẹ gbìyànjú lẹ́ẹ̀kan sí i tàbí kọ ọ́.',
      networkError: (state) => `Ìṣòro ìkànnì wáyé. Tí ara kò bá yá rárá, ẹ lọ sí Ilé-ìwòsàn Ìjọba tó súnmọ́ yín ní Ìpínlẹ̀ ${state} tàbí kí ẹ pe 112 lẹ́sẹ̀kẹsẹ̀!`,
      footerDisclaimerPrefix: 'NaijaHealth AI ń fúnni ní ìtọ́sọ́nà ìlera nìkan. Fún pàjáwìrì, ẹ pe',
      footerCall112: '112',
      footerImmediate: 'lẹ́sẹ̀kẹsẹ̀.',
      footerNcdc: 'Ìlànà Ilé-iṣẹ́ Ìlera Ìjọba Àpapọ̀ & NCDC',
    },
    triageCard: {
      emergencyEval: 'PÀJÁWÌRÌ (Sáré Lọ Ilé-ìwòsàn)',
      urgentReview: 'Lọ Rí Dọ́kítà Kíá',
      routineCare: 'Ìtọ́jú Ilé / Tòjúmọ́',
      listen: 'Gbọ́ àsọyé',
      stopAudio: 'Dúró',
      preparingAudio: 'Ń mú ohùn bọ̀...',
      share: 'Pín',
      copied: 'Ti Da Kọ́ọ̀pì',
      immediateAttention: '🚨 PÀJÁWÌRÌ: Ẹ LỌ SÍ ILÉ-ÌWÒSÀN LẸ́SẸ̀KẸSẸ̀',
      defaultEmergencyWarning: 'Àmì ewu gidi ni èyí! Ẹ má ṣe oògùn ilé kankan.',
      call112Free: 'Pe 112 Lọ́fẹ̀ẹ́',
      causesTitle: 'Kini O Le Fa E',
      homeTitle: 'Ohun Ti O Le Se Ni Ile',
      actionTitle: 'Igbese To Kan',
      bypassedBadge: 'Ti Fagi Lé',
      homeWithheld: 'A ti dá gbogbo ìtọ́jú ilé dúró nítorí àmì ewu pàjáwìrì! Ẹ sáré lọ sí yàrá pàjáwìrì ilé-ìwòsàn báyìí.',
      defaultHomeRest: 'Ẹ sinmi dáadáa kí ẹ sì mu omi mímọ́ púpọ̀.',
      browseHospitals: 'Wo Ilé-ìwòsàn',
      clarifyingTitle: 'Àlàyé síwájú si:',
      clarifyPrefix: 'Ìdáhùn:',
      defaultDisclaimer: '⚠️ Ìkìlọ̀: Èmi jẹ́ olùrànlọ́wọ́ AI, mi kìí ṣe dọ́kítà gidi. Tí ara bá le koko, ẹ lọ sí ilé-ìwòsàn tàbí kí ẹ pe 112 lẹ́sẹ̀kẹsẹ̀.',
      whatsappHeader: '*🟢 ÀBÁJÁDE ÌTỌ́SỌ́NÀ NAIJAHEALTH AI*',
      whatsappLocation: '*Agbègbè:*',
      whatsappUrgency: '*Ipò:*',
      whatsappEmergencyVal: '🚨 PÀJÁWÌRÌ EWU',
      whatsappUrgentVal: '🟡 NÍLÒ DỌ́KÍTÀ',
      whatsappStableVal: '🟢 RỌRÙN',
      whatsappHomeCancelled: '❌ A TI FAGI LÉ OÒGÙN ILÉ! Ẹ SÁRÉ LỌ ILÉ-ÌWÒSÀN LẸ́SẸ̀KẸSẸ̀!',
    },
    emergencyPrefix: 'ÀṢÀRÒ PÀJÁWÌRÌ:',
    symptoms: [
      {
        label: 'Ara gbígbóná & ara ríro',
        text: 'Ara mi ń gbóná gan-an, ara sì ń ro mí fún ọjọ́ mẹ́ta, ẹnu mi sì ń korò',
        iconName: 'thermometer',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-200',
        hoverColor: 'hover:bg-amber-100/90 hover:border-amber-300',
        dotColor: 'bg-amber-500',
      },
      {
        label: 'Inú rírun & ìgbẹ́ gbuuru',
        text: 'Inú ń run mí, mo sì ń ya ìgbẹ́ gbuuru olómi láti àárọ̀ àná',
        iconName: 'droplet',
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-900',
        borderColor: 'border-sky-200',
        hoverColor: 'hover:bg-sky-100/90 hover:border-sky-300',
        dotColor: 'bg-sky-500',
      },
      {
        label: 'Òtútù & orí fífọ́',
        text: 'Òtútù àti ìgbọ̀n ń mú mi, orí ń fọ́ mi gan-an, ara mi sì rẹ̀ pátápátá',
        iconName: 'zap',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-900',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:bg-purple-100/90 hover:border-purple-300',
        dotColor: 'bg-purple-500',
      },
      {
        label: 'Ikọ́ & àyà dídùn',
        text: 'Mo ní ikọ́ gbígbẹ àti ìfúnpa díẹ̀ ní àyà pẹ̀lú ara gbígbóná díẹ̀',
        iconName: 'wind',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-900',
        borderColor: 'border-teal-200',
        hoverColor: 'hover:bg-teal-100/90 hover:border-teal-300',
        dotColor: 'bg-teal-600',
      },
      {
        label: 'Ibà ọmọdé & èébì',
        text: 'Ara ọmọ mi ọlọ́dún mẹ́ta gbóná bí iná, ó ti bì lẹ́ẹ̀mejì kò sì fẹ́ jẹun tàbí mu omi',
        iconName: 'heart',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-900',
        borderColor: 'border-rose-200',
        hoverColor: 'hover:bg-rose-100/90 hover:border-rose-300',
        dotColor: 'bg-rose-500',
      },
      {
        label: 'Oríkèé & egungun ríro',
        text: 'Mo ń ní ìrora líle ní ìbàdí, oríkèé, àti egungun pẹ̀lú àárẹ̀ gidi',
        iconName: 'activity',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-900',
        borderColor: 'border-indigo-200',
        hoverColor: 'hover:bg-indigo-100/90 hover:border-indigo-300',
        dotColor: 'bg-indigo-500',
      },
      {
        label: 'Ìtọ́jú Aláboyún (Pregnancy)',
        text: 'Mo lóyún, ara sì ń rẹ̀ mí pẹ̀lú èébì àárọ̀ tàbí ibà díẹ̀',
        iconName: 'baby',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-900',
        borderColor: 'border-pink-200',
        hoverColor: 'hover:bg-pink-100/90 hover:border-pink-300',
        dotColor: 'bg-pink-500',
      },
      {
        label: 'Àyà dídùn líle & àìlè mí',
        text: 'Àyà mi bẹ̀rẹ̀ sí ro mí líle lójijì, mi ò sì lè mí dáadáa',
        iconName: 'alert',
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        borderColor: 'border-red-300',
        hoverColor: 'hover:bg-red-100 hover:border-red-400 ring-1 ring-red-400/30',
        dotColor: 'bg-red-600',
      },
    ],
    visuals: {
      guidesTitle: 'Àwòrán Ìtọ́jú Ìlera',
      guidesSubtitle: 'Tẹ àwòrán èyíkéyìí láti rí ìgbésẹ̀ ìtọ́jú ilé àti ilé-ìwòsàn',
      openGuideCta: 'Wo Àwòrán Kíkún',
      hospitalsCta: 'Wá Ilé-ìwòsàn Nítòsí',
      cards: {
        welcome: {
          title: 'Ìtọ́jú Ìlera Ní Èdè Abínibí Rẹ',
          caption: 'Ìtọ́sọ́nà rọrùn ní èdè márùn-ún · Pẹ̀lú ilé-ìwòsàn ní gbogbo ìpínlẹ̀',
        },
        ors: {
          title: 'Omi Iyọ̀ àti Ṣúgà (ORS Ilé)',
          caption: 'Lítà 1 omi mímọ́ · ṣíbí ìyọ̀ 1 · ṣíbí ṣúgà 10 (tàbí onígun 5)',
        },
        sponging: {
          title: 'Ìnu-ara Pẹ̀lú Omi Dídùn fún Ibà',
          caption: 'Lo aṣọ pẹ̀lú omi dídùn nìkan — má lo yìnyín tàbí spirit',
        },
        choking: {
          title: 'Ìgbàlà Fún Ìdènà Ọ̀fun',
          caption: 'Di àyà mú, tẹ̀ síwájú, lu àárín èjìká ní ìgbà 5 dáadáa',
        },
        pregnancy: {
          title: 'Ààbò & Ìtọ́jú Aláboyún (ANC)',
          caption: 'Yẹra fún oògùn tàbí àgbo láì rí dọ́kítà · Mọ àmì ewu oyún',
        },
        hospital: {
          title: 'Pàjáwìrì: Lọ Ilé-ìwòsàn / Pe 112',
          caption: 'Sáré lọ sí Ilé-ìwòsàn Ìjọba tàbí FMC tó súnmọ́ jùlọ báyìí',
        },
      },
    },
  },

  igbo: {
    greeting: `Ndewo! Kedu ka ahụ dị gị ma ọ bụ ezinụlọ gị taa?

Gwa m **ụdị ọrịa ọ bụla** — dịka ahụ ọkụ, afọ mgbu, nlekọta nwatakịrị, ma ọ bụ nwaanyị dị ime — site n'olu ma ọ bụ ide edemede, ma kwuo **steeti i nọ na ya** ka m gosi gị ụlọ ọgwụ dị nso.`,
    switchNotice: `💚 Agbanweela asụsụ gaa n'**Asụsụ Igbo**. Biko gwa m ka ahụ dị gị, m ga-aza gị n'Igbo doro anya!`,
    welcomeShowcase: {
      headline: 'Nyocha Ahụike Ngwa Ngwa N’Asụsụ Gị N’Enyemaka Doro Anya',
      tagline: 'Jiri olu gị ma ọ bụ dee mgbaàmà gị ka i nweta ntụziaka nchebe na ụlọ ọgwụ.',
      pillars: [
        { title: 'Asụsụ Naịjirịa 5', desc: 'Igbo, Pidgin, English, Hausa & Yoruba — n’olu ma ọ bụ edemede' },
        { title: 'Nwaanyị Dị Ime & Nwa', desc: 'Nchebe ndị dị ime, ngwakọta ORS & nlekọta ahụ ọkụ nwatakịrị' },
        { title: 'Ụlọ Ọgwụ Steeti 36 + Abuja', desc: 'Ụlọ ọgwụ gọọmentị dị gị nso & oku mberede 112 n’efu' },
      ],
      voiceCta: 'Kwuo Okwu Ugbu A',
      pregnancyCta: 'Nlekọta Nwaanyị Dị Ime',
      hospitalsCta: 'Chọta Ụlọ Ọgwụ Dị Nso',
    },
    header: {
      badge: 'Ahụike Naịjirịa',
      subtitle: 'Nnyemaaka Ahụike Dị Mfe • Naịjirịa',
      hospitals: 'Ụlọ Ọgwụ',
      firstAid: 'Nlekọta Mbụ',
      shareApp: 'Kesaa App',
      shareShort: 'Kesaa',
      linkCopied: 'E Detụrụ Ya!',
      emergencyBtn: 'Mberede (112)',
      stateSuffix: 'Steeti',
    },
    contextBar: {
      routingActive: 'Ụzọ ụlọ ọgwụ na-arụ ọrụ',
      voiceAssisted: 'Na-akpọ n' + '\'' + 'Olu',
      clinicalMode: 'Ụlọ Ọgwụ',
      whatsappMode: 'WhatsApp',
      newSession: 'Bido Ọhụrụ',
      whatsappStatus: 'nọ n' + '\'' + 'ịntanetị • Ahụike Naịjirịa',
      call112: 'Kpọọ 112',
    },
    chat: {
      you: 'Gị',
      evaluating: 'Na-enyocha mgbaàmà ahụike gị na usoro ahụike Naịjirịa...',
      commonSymptomsTitle: '⚡ Ọrịa Ndị Na-emekarị (Pịa ebe a):',
      scrollHint: 'Kpụgharịa iji hụ ndị ọzọ →',
      placeholderIdle: 'Kọwaa ka ahụ dị gị (dịka ahụ ọkụ ụbọchị abụọ, afọ ọsịsa, Enugu)...',
      placeholderListening: 'Ana m ege gị ntị, kwuo okwu...',
      placeholderRecording: 'Na-edekọ olu gị... Pịa maikrofon uhie ọzọ ma i kwuchaa.',
      placeholderTranscribing: 'Na-atụgharị olu gị ka ọ bụrụ edemede...',
      triageBtn: 'Nyochaa',
      tapToStopRecording: 'Kwụsị ndekọ olu',
      tapToSpeak: 'Jiri olu gị kwuo ihe na-eme gị',
      voiceUnsupported: 'Ihe nchọgharị gị anaghị akwado olu. Biko dee mgbaàmà gị.',
      micDenied: 'E kweghị ka maikrofon rụọ ọrụ. Biko nye ikike ma ọ bụ dee ya.',
      transcribeFailed: 'Anụghị m olu gị nke ọma. Biko gbalịa kwuo ọzọ ma ọ bụ dee ya.',
      networkError: (state) => `Netwọk na-enye nsogbu ntakịrị. Ọ bụrụ na ahụ adịghị gị mma ma ọlị, biko gaa General Hospital kacha nso na Steeti ${state} ma ọ bụ kpọọ 112 ozugbo!`,
      footerDisclaimerPrefix: 'NaijaHealth AI na-enye naanị ndụmọdụ ahụike. N' + '\'' + 'ọnọdụ mberede, kpọọ',
      footerCall112: '112',
      footerImmediate: 'ozugbo.',
      footerNcdc: 'Ọ dabara n' + '\'' + 'usoro Federal Ministry of Health & NCDC',
    },
    triageCard: {
      emergencyEval: 'MBEREDE (Gbaa Ọsọ Gaa Ụlọ Ọgwụ)',
      urgentReview: 'Gaa Hụ Dọkịta Ngwa Ngwa',
      routineCare: 'Nlekọta Nke Ụlọ / Dị Mfe',
      listen: 'Ge nti (Olu)',
      stopAudio: 'Kwụsị',
      preparingAudio: 'Na-akwadebe olu...',
      share: 'Kesaa',
      copied: 'E Detụrụ Ya',
      immediateAttention: '🚨 MBEREDE: Gaa Ụlọ Ọgwụ Ozugbo',
      defaultEmergencyWarning: 'Nke a bụ ihe ịrịba ama mberede dị egwu! Emela ọgwụ ụlọ ọ bụla.',
      call112Free: 'Kpọọ 112 N' + '\'' + 'efu',
      causesTitle: 'Ihe Nwere Ike Na-ebute Ya',
      homeTitle: 'Ihe I Nwere Ike Ime n' + '\'' + 'Ulo',
      actionTitle: 'Ihe I Ga-eme Na-esonụ',
      bypassedBadge: 'A Kagbuola',
      homeWithheld: 'A kagbuola ọgwụ ụlọ niile n' + '\'' + 'ihi na nke a bụ mberede dị egwu! Gbaa ọsọ gaa ụlọ ọgwụ ozugbo.',
      defaultHomeRest: 'Zuo ike nke ọma ma ṅụọ mmiri dị ọcha nke ukwuu.',
      browseHospitals: 'Chọta Ụlọ Ọgwụ',
      clarifyingTitle: 'Ajụjụ ntakịrị iji ghọta nke ọma:',
      clarifyPrefix: 'Azịza:',
      defaultDisclaimer: '⚠️ Rịba ama: Abụ m onye inyeaka AI, abụghị m ezigbo dọkịta. Ọ bụrụ na ahụ adịghị gị mma nke ukwuu, gaa ụlọ ọgwụ ma ọ bụ kpọọ 112 ugbu a.',
      whatsappHeader: '*🟢 AKỤKỌ AHỤIKE NAIJAHEALTH AI*',
      whatsappLocation: '*Ebe ị nọ:*',
      whatsappUrgency: '*Ọkwa:*',
      whatsappEmergencyVal: '🚨 MBEREDE DỊ EGWU',
      whatsappUrgentVal: '🟡 CHỌRỌ DỌKỊTA',
      whatsappStableVal: '🟢 DỊ MFE',
      whatsappHomeCancelled: '❌ A KAGBUOLA ỌGWỤ ỤLỌ! GBAA ỌSỌ GAA ỤLỌ ỌGWỤ UGBU A!',
    },
    emergencyPrefix: 'NYOCHA MBEREDE:',
    symptoms: [
      {
        label: 'Ahụ ọkụ na ahụ mgbu',
        text: 'Ahụ m na-ekpo ọkụ nke ukwuu, ahụ na-egbu m mgbu kemgbe ụbọchị atọ, ọnụ m na-elu ilu',
        iconName: 'thermometer',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-200',
        hoverColor: 'hover:bg-amber-100/90 hover:border-amber-300',
        dotColor: 'bg-amber-500',
      },
      {
        label: 'Afọ mgbu na afọ ọsịsa',
        text: 'Afọ na-egbu m mgbu ma ana m anyụ nsị mmiri mmiri kemgbe ụtụtụ ụnyaahụ',
        iconName: 'droplet',
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-900',
        borderColor: 'border-sky-200',
        hoverColor: 'hover:bg-sky-100/90 hover:border-sky-300',
        dotColor: 'bg-sky-500',
      },
      {
        label: 'Oyi na isi ọwụwa',
        text: 'Oyi na-atụ m ma ahụ na-ama m jijiji, isi na-awa m nke ukwuu, ike gwụrụ m kpamkpam',
        iconName: 'zap',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-900',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:bg-purple-100/90 hover:border-purple-300',
        dotColor: 'bg-purple-500',
      },
      {
        label: 'Ụkwara na obi siri ike',
        text: 'Ana m akwa ụkwara kpọrọ nkụ, obi m siri ike ntakịrị ma ahụ na-ekpo ọkụ ntakịrị',
        iconName: 'wind',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-900',
        borderColor: 'border-teal-200',
        hoverColor: 'hover:bg-teal-100/90 hover:border-teal-300',
        dotColor: 'bg-teal-600',
      },
      {
        label: 'Ahụ ọkụ nwa & ịgbọ agbọ',
        text: 'Ahụ nwa m dị afọ atọ na-ekpo ọkụ dịka ọkụ, ọ gbọọla agbọ ugboro abụọ ma jụ iri nri ma ọ bụ ịṅụ mmiri',
        iconName: 'heart',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-900',
        borderColor: 'border-rose-200',
        hoverColor: 'hover:bg-rose-100/90 hover:border-rose-300',
        dotColor: 'bg-rose-500',
      },
      {
        label: 'Mgbu nkwonkwo na ọkpụkpụ',
        text: 'Enwere m mgbu siri ike n' + '\'' + 'úkwù, nkwonkwo, na ọkpụkpụ na ike ọgwụgwụ dị ukwuu',
        iconName: 'activity',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-900',
        borderColor: 'border-indigo-200',
        hoverColor: 'hover:bg-indigo-100/90 hover:border-indigo-300',
        dotColor: 'bg-indigo-500',
      },
      {
        label: 'Nlekọta Nwaanyị Dị Ime',
        text: 'Adị m ime, ike na-agwụ m ma m na-agbọ agbọ ma ọ bụ nwee ahụ ọkụ ntakịrị',
        iconName: 'baby',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-900',
        borderColor: 'border-pink-200',
        hoverColor: 'hover:bg-pink-100/90 hover:border-pink-300',
        dotColor: 'bg-pink-500',
      },
      {
        label: 'Mgbu obi siri ike & iku ume',
        text: 'Mgbu obi dị egwu jidere m na mberede ma anaghị m enwe ike iku ume nke ọma',
        iconName: 'alert',
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        borderColor: 'border-red-300',
        hoverColor: 'hover:bg-red-100 hover:border-red-400 ring-1 ring-red-400/30',
        dotColor: 'bg-red-600',
      },
    ],
    visuals: {
      guidesTitle: 'Foto Nlekọta Ahụike',
      guidesSubtitle: 'Pịa foto ọ bụla iji hụ usoro nlekọta ụlọ na nke ụlọ ọgwụ',
      openGuideCta: 'Hụ Foto Nlekọta',
      hospitalsCta: 'Chọta Ụlọ Ọgwụ Dị Nso',
      cards: {
        welcome: {
          title: 'Nnyemaaka Ahụike n’Asụsụ Gị',
          caption: 'Ntuziaka doro anya n’asụsụ 5 · Jikọtara ya na ụlọ ọgwụ steeti gị',
        },
        ors: {
          title: 'Mmiri Nnu na Shuga (ORS Ụlọ)',
          caption: 'Lita 1 mmiri dị ọcha · ngaji nnu 1 · ngaji shuga 10 (ma ọ bụ kụbụ 5)',
        },
        sponging: {
          title: 'Ịfụchasị Ahụ Maka Ahụ Ọkụ',
          caption: 'Jiri akwa mmiri dị nro naanị — ejila aịsụ ma ọ bụ spirit',
        },
        choking: {
          title: 'Enyemaka Mgbe Ihe Kpọchiri Akpịrị',
          caption: 'Jide obi, rụda n’ihu, kụọ n’etiti ubu ugboro 5 nke ọma',
        },
        pregnancy: {
          title: 'Nchekwa Nwaanyị Dị Ime (ANC)',
          caption: 'Aṅụla ọgwụ ma ọ bụ agbo n’onwe gị · Mara ihe mgbaàmà mberede',
        },
        hospital: {
          title: 'Mberede: Gaa Ụlọ Ọgwụ / Kpọọ 112',
          caption: 'Gbaa ọsọ gaa General Hospital ma ọ bụ FMC kacha nso ozugbo',
        },
      },
    },
  },
};
