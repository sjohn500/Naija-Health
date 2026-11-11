import { SupportedLanguage } from '../types/triage';

export interface ChatGateStrings {
  composerNotice: string;
  composerActionBtn: string;
  activeBadge: string;
  inlineTitle: string;
  inlineBody: string;
  pendingPrefix: string;
  inlineCta: string;
  modalTitle: string;
  modalSubtitle: string;
  modalBannerDesc: string;
  modalPendingVoice: string;
  loginAndChatCta: string;
  createAndChatCta: string;
}

export interface AccountLocalizationStrings {
  headerButtonSignedOut: string;
  headerButtonSignedInFallback: string;
  heroTitle: string;
  heroSub: string;
  heroBtnSignedOut: string;
  heroBtnSignedIn: string;
  modalTitle: string;
  modalSubtitle: string;
  freeTierBadge: string;
  privacyNote: string;
  noSmsChargeNote: string;
  signInCta: string;
  saveAndSignInCta: string;
  signingIn: string;
  signOutCta: string;
  signedInLabel: string;
  emailPasswordTip: string;
  tabProfile: string;
  tabCheckups: string;
  displayNameLabel: string;
  displayNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneHelp: string;
  emergencyPhoneLabel: string;
  emergencyPhonePlaceholder: string;
  emergencyPhoneHelp: string;
  stateLabel: string;
  langLabel: string;
  saveProfileBtn: string;
  savingBtn: string;
  profileSavedMsg: string;
  deleteProfileBtn: string;
  profileDeletedMsg: string;
  saveCheckupBtn: string;
  savedCheckupDone: string;
  savingCheckup: string;
  emptyCheckupsTitle: string;
  emptyCheckupsDesc: string;
  signInCheckupsHint: string;
  loadCheckupBtn: string;
  deleteCheckupBtn: string;
  chatGate: ChatGateStrings;
  errors: {
    invalidName: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidEmergencyPhone: string;
    invalidState: string;
    unverified: string;
    popupClosed: string;
    popupBlocked: string;
    quotaExceeded: string;
    permission: string;
    unknown: string;
  };
}

export const ACCOUNT_LOCALIZATION: Record<SupportedLanguage, AccountLocalizationStrings> = {
  pidgin: {
    headerButtonSignedOut: 'Log In / Sign Up',
    headerButtonSignedInFallback: 'My Account',
    heroTitle: 'Get your own free health account ($0) to chat anytime',
    heroSub: 'Sign up or log in free to chat anytime, save your phone number & email, and keep checkup summaries.',
    heroBtnSignedOut: 'Log In / Sign Up',
    heroBtnSignedIn: 'My Account',
    modalTitle: 'Free Health Account & Contact Info',
    modalSubtitle: 'Free Google Cloud database ($0 Spark tier) · Emergency care still works without login.',
    freeTierBadge: '100% Free ($0 Spark Tier)',
    privacyNote: 'Only your contact profile and normal checkups you save go to your private database. Private Care (HIV/PEP/ART) is NEVER stored.',
    noSmsChargeNote: 'Your Nigerian phone number saves free here without paid SMS OTP fees.',
    signInCta: 'Log In / Sign Up with Google (Free)',
    saveAndSignInCta: 'Create Account & Save Contact',
    signingIn: 'Connecting Google account...',
    signOutCta: 'Sign out',
    signedInLabel: 'Signed in as',
    emailPasswordTip: 'Want Email & Password login too? It is also free ($0) — the app owner can switch it on inside Firebase Console → Authentication → Sign-in method.',
    tabProfile: 'Phone & Email',
    tabCheckups: 'Saved Checkups',
    displayNameLabel: 'Your Name or Nickname',
    displayNamePlaceholder: 'e.g. Chinedu Okafor',
    emailLabel: 'Contact Email Address',
    emailPlaceholder: 'e.g. you@gmail.com',
    phoneLabel: 'Phone Number (Nigeria or Intl)',
    phonePlaceholder: 'e.g. +234 803 123 4567 or 08031234567',
    phoneHelp: 'Used as your personal & clinic reference inside your private profile.',
    emergencyPhoneLabel: 'Emergency Contact Phone (Optional)',
    emergencyPhonePlaceholder: 'e.g. 0802 987 6543',
    emergencyPhoneHelp: 'Family member or next-of-kin number for quick hospital arrival.',
    stateLabel: 'Preferred State / FCT',
    langLabel: 'Preferred Language',
    saveProfileBtn: 'Save Phone & Email',
    savingBtn: 'Saving...',
    profileSavedMsg: 'Your phone number, email & state preferences don save safely!',
    deleteProfileBtn: 'Clear Saved Profile',
    profileDeletedMsg: 'Saved phone & email info don clear from cloud.',
    saveCheckupBtn: 'Save checkup',
    savedCheckupDone: 'Saved',
    savingCheckup: 'Saving...',
    emptyCheckupsTitle: 'No saved checkups yet',
    emptyCheckupsDesc: 'After you check normal symptoms, tap "Save checkup" to keep summary for hospital visit.',
    signInCheckupsHint: 'Sign in free with Google to see and manage your saved triage checkups across devices.',
    loadCheckupBtn: 'Open',
    deleteCheckupBtn: 'Delete',
    chatGate: {
      composerNotice: 'Abeg log in or sign up free first so you go get your own account to chat anytime.',
      composerActionBtn: 'Log In / Sign Up',
      activeBadge: 'Your account active — chat anytime',
      inlineTitle: 'Log In or Sign Up First to Chat',
      inlineBody: 'Create your own free NaijaHealth account ($0) first so you fit chat with our health AI anytime you want and save your phone, email & checkups.',
      pendingPrefix: 'Question ready to send:',
      inlineCta: 'Log In / Sign Up Free ($0)',
      modalTitle: 'Log In or Sign Up Free to Chat',
      modalSubtitle: 'Create your own free account ($0) to chat anytime you want and save your contact details.',
      modalBannerDesc: 'Log in with Google sharp-sharp OR enter your name, email & Nigerian phone below to create your free account and send your chat right away!',
      modalPendingVoice: 'Voice recording go start sharp-sharp immediately after you log in.',
      loginAndChatCta: 'Log In / Sign Up with Google & Start Chat',
      createAndChatCta: 'Create My Free Account & Chat',
    },
    errors: {
      invalidName: 'Abeg enter your name or nickname (1 to 80 characters).',
      invalidEmail: 'Abeg enter a correct email address (like name@gmail.com).',
      invalidPhone: 'Abeg check phone format (7–20 digits/spaces, e.g. 08031234567 or +234 803 123 4567).',
      invalidEmergencyPhone: 'Abeg check emergency contact phone format (7–20 digits or leave empty).',
      invalidState: 'Abeg select your Nigerian state.',
      unverified: 'Your account email must be verified before saving data.',
      popupClosed: 'You close the Google sign-in window. Tap the button again anytime.',
      popupBlocked: 'Browser block the sign-in popup. Abeg allow popups for this site and try again.',
      quotaExceeded: 'Daily free database limit don full for today. E go reset tomorrow!',
      permission: 'Account permission check fail. Abeg sign out and sign in again.',
      unknown: 'Something hold network small. Abeg try again.',
    },
  },
  english: {
    headerButtonSignedOut: 'Log In / Sign Up',
    headerButtonSignedInFallback: 'Account',
    heroTitle: 'Get your own free health account ($0) to chat anytime',
    heroSub: 'Sign up or log in free to unlock unlimited triage chat, save your phone number & email, and keep checkups.',
    heroBtnSignedOut: 'Log In / Sign Up',
    heroBtnSignedIn: 'My Account',
    modalTitle: 'Free Health Account & Contact Details',
    modalSubtitle: 'Powered by Google Cloud free Spark tier ($0) · Emergency hotlines always work without signing in.',
    freeTierBadge: '100% Free ($0 Spark Tier)',
    privacyNote: 'Only your contact details and public triage summaries you choose to save are stored. Private Care (HIV/PEP/ART) never touches the database.',
    noSmsChargeNote: 'Your phone number is stored safely for clinic reference with zero paid SMS OTP charges.',
    signInCta: 'Log In / Sign Up with Google (Free)',
    saveAndSignInCta: 'Create Account & Save Contact',
    signingIn: 'Signing in with Google...',
    signOutCta: 'Sign out',
    signedInLabel: 'Signed in as',
    emailPasswordTip: 'Need Email & Password sign-in too? It is also free ($0) — the app owner can enable it under Firebase Console → Authentication → Sign-in method.',
    tabProfile: 'Phone & Email',
    tabCheckups: 'Saved Checkups',
    displayNameLabel: 'Full Name or Nickname',
    displayNamePlaceholder: 'e.g. Amina Bello',
    emailLabel: 'Contact Email Address',
    emailPlaceholder: 'e.g. name@example.com',
    phoneLabel: 'Phone Number (Nigeria or Intl)',
    phonePlaceholder: 'e.g. +234 803 123 4567 or 08031234567',
    phoneHelp: 'Stored strictly in your private owner-only profile for quick clinic reference.',
    emergencyPhoneLabel: 'Emergency Contact Phone (Optional)',
    emergencyPhonePlaceholder: 'e.g. 0802 987 6543',
    emergencyPhoneHelp: 'Family member or next-of-kin phone number for emergencies.',
    stateLabel: 'Preferred State / FCT',
    langLabel: 'Preferred Language',
    saveProfileBtn: 'Save Phone & Email',
    savingBtn: 'Saving...',
    profileSavedMsg: 'Your phone number, email, and care preferences have been saved!',
    deleteProfileBtn: 'Clear Saved Profile',
    profileDeletedMsg: 'Your stored contact details have been removed from the database.',
    saveCheckupBtn: 'Save checkup',
    savedCheckupDone: 'Saved',
    savingCheckup: 'Saving...',
    emptyCheckupsTitle: 'No saved checkups yet',
    emptyCheckupsDesc: 'Run any symptom triage check and tap "Save checkup" to keep a copy for your doctor visit.',
    signInCheckupsHint: 'Sign in free with Google to view or manage your saved triage checkups across devices.',
    loadCheckupBtn: 'Open',
    deleteCheckupBtn: 'Delete',
    chatGate: {
      composerNotice: 'Log in or sign up free first to get your own account and chat anytime you want.',
      composerActionBtn: 'Log In / Sign Up',
      activeBadge: 'Your account is active — chat anytime',
      inlineTitle: 'Please Log In or Sign Up First to Chat',
      inlineBody: 'Create your own free NaijaHealth account ($0) to chat with the AI health assistant anytime you want, save your phone & email, and keep checkups.',
      pendingPrefix: 'Your question is ready:',
      inlineCta: 'Log In / Sign Up Free ($0)',
      modalTitle: 'Log In or Sign Up Free to Chat',
      modalSubtitle: 'Create your own personal NaijaHealth account ($0) so you can chat anytime you want.',
      modalBannerDesc: 'Sign in with 1 click via Google below OR enter your name, email & Nigerian phone number to create your account and start chatting immediately!',
      modalPendingVoice: 'Voice chat will begin right after you finish signing in.',
      loginAndChatCta: 'Log In / Sign Up with Google & Start Chat',
      createAndChatCta: 'Create My Free Account & Chat',
    },
    errors: {
      invalidName: 'Please enter a name or nickname (1 to 80 characters).',
      invalidEmail: 'Please enter a valid email address (e.g. name@example.com).',
      invalidPhone: 'Please enter a valid phone number (7–20 characters, e.g. 08031234567 or +234 803 123 4567).',
      invalidEmergencyPhone: 'Please enter a valid emergency contact phone number or leave it blank.',
      invalidState: 'Please choose your state.',
      unverified: 'Your email must be verified before saving profile details.',
      popupClosed: 'The Google sign-in window was closed before completing.',
      popupBlocked: 'Sign-in popup was blocked by your browser. Please allow popups and retry.',
      quotaExceeded: 'Daily free Spark tier quota exceeded. It resets automatically tomorrow.',
      permission: 'Permission check failed. Please sign in again and retry.',
      unknown: 'Unable to reach your account database right now. Please try again.',
    },
  },
  hausa: {
    headerButtonSignedOut: 'Shiga / Yi Rajista',
    headerButtonSignedInFallback: 'Asusu',
    heroTitle: 'Buɗe asusun lafiya kyauta ($0) don tattaunawa a kowane lokaci',
    heroSub: 'Shiga ko yi rajista kyauta don samun naka asusun, adana lambar waya, da yin hira a kowane lokaci.',
    heroBtnSignedOut: 'Shiga / Rajista',
    heroBtnSignedIn: 'Asusunka',
    modalTitle: 'Asusun Lafiya Kyauta & Lambobin Tuntuɓa',
    modalSubtitle: 'Kyauta ne gabaɗaya ($0 Spark tier) · Ana iya kiran gaggawa ba tare da shiga asusu ba.',
    freeTierBadge: 'Kyauta 100% ($0)',
    privacyNote: 'Lambobin tuntuɓarka da sakamakon binciken gama-gari ne kawai za a iya adanawa. Sirrin HIV/PEP ba ya taɓa shiga rumbun bayanai.',
    noSmsChargeNote: 'Ana adana lambar wayar Najeriya kyauta ba tare da kuɗin saƙon SMS ba.',
    signInCta: 'Shiga / Yi Rajista da Google (Kyauta)',
    saveAndSignInCta: 'Buɗe Asusu & Adana Lamba',
    signingIn: 'Ana haɗawa da Google...',
    signOutCta: 'Fita',
    signedInLabel: 'An shiga da',
    emailPasswordTip: 'Kuna son shiga da Imel & Kalmar Sirri? Shima kyauta ne ($0) — mai kula da manhajar zai iya kunna shi a Firebase Console.',
    tabProfile: 'Waya & Imel',
    tabCheckups: 'Binciken Da Aka Adana',
    displayNameLabel: 'Suna ko Sunan Lakabi',
    displayNamePlaceholder: 'misali: Musa Ibrahim',
    emailLabel: 'Adireshin Imel',
    emailPlaceholder: 'misali: suna@gmail.com',
    phoneLabel: 'Lambar Waya (Najeriya ko Waje)',
    phonePlaceholder: 'misali: +234 803 123 4567 ko 08031234567',
    phoneHelp: 'An adana a keɓaɓɓen asusunka don sauƙin zuwa asibiti.',
    emergencyPhoneLabel: 'Lambar Waya Ta Gaggawa (Na Iyali)',
    emergencyPhonePlaceholder: 'misali: 0802 987 6543',
    emergencyPhoneHelp: 'Lambar dan uwa ko na kusa don gaggawa a asibiti.',
    stateLabel: 'Jihar Da Kake Ciki',
    langLabel: 'Yaren Da Ka Fi So',
    saveProfileBtn: 'Adana Waya & Imel',
    savingBtn: 'Ana adanawa...',
    profileSavedMsg: 'An adana lambar wayarka, imel da zaɓin jiha cikin aminci!',
    deleteProfileBtn: 'Goge Bayanai',
    profileDeletedMsg: 'An goge bayanan waya da imel daga ma’ajiya.',
    saveCheckupBtn: 'Adana',
    savedCheckupDone: 'An adana',
    savingCheckup: 'Ana adanawa...',
    emptyCheckupsTitle: 'Babu binciken da aka adana tukuna',
    emptyCheckupsDesc: 'Bayan ka duba alamun lafiya, danna "Adana" don ajiye bayanin zuwa asibiti.',
    signInCheckupsHint: 'Shiga kyauta da Google don ganin binciken da ka adana a kowace na’ura.',
    loadCheckupBtn: 'Buɗe',
    deleteCheckupBtn: 'Goge',
    chatGate: {
      composerNotice: 'Fara shiga ko yin rajista kyauta don samun naka asusun kafin fara tattaunawa.',
      composerActionBtn: 'Shiga / Rajista',
      activeBadge: 'Asusunka yana kunne — yi hira kowane lokaci',
      inlineTitle: 'Fara Shiga ko Yin Rajista Kafin Fara Tattaunawa',
      inlineBody: 'Buɗe asusun NaijaHealth kyauta ($0) don ka samu damar tattaunawa da mu a kowane lokaci da kake so.',
      pendingPrefix: 'Tambayar ka a shirye take:',
      inlineCta: 'Shiga / Yi Rajista Kyauta ($0)',
      modalTitle: 'Shiga ko Yi Rajista Kyauta Don Tattaunawa',
      modalSubtitle: 'Samu naka asusun kyauta ($0) don yi hira a kowane lokaci da adana lambar waya.',
      modalBannerDesc: 'Shiga da Google nan take ko ka cika suna, imel da lambar wayarka a ƙasa don fara tattaunawa!',
      modalPendingVoice: 'Ɗaukar murya zai fara nan take bayan ka shiga asusu.',
      loginAndChatCta: 'Shiga da Google & Fara Tattaunawa',
      createAndChatCta: 'Buɗe Asusu Kyauta & Fara Hira',
    },
    errors: {
      invalidName: 'Da fatan za a shigar da suna (haruffa 1 zuwa 80).',
      invalidEmail: 'Da fatan za a shigar da ingantaccen adireshin imel.',
      invalidPhone: 'Da fatan za a duba tsarin lambar waya (lambobi 7–20).',
      invalidEmergencyPhone: 'Da fatan za a duba lambar wayar gaggawa ko bar ta fanko.',
      invalidState: 'Da fatan za a zaɓi jihar ku.',
      unverified: 'Ana buƙatar tabbatar da imel kafin adana bayanai.',
      popupClosed: 'An rufe tagar shiga ta Google kafin a kammala.',
      popupBlocked: 'An toshe tagar shiga. Bude popups a burauzar ka.',
      quotaExceeded: 'Iyakar kyauta ta yau ta cika. Za ta dawo gobe!',
      permission: 'Matsalar izini. Da fatan za a sake shiga.',
      unknown: 'An samu matsalar sadarwa. Sake gwadawa.',
    },
  },
  yoruba: {
    headerButtonSignedOut: 'Wọlé / Forúkọsílẹ̀',
    headerButtonSignedInFallback: 'Àkáǹtì Mi',
    heroTitle: 'Gba àkáǹtì ìlera ọ̀fẹ́ tirẹ ($0) láti bá wa sọ̀rọ̀ nígbàkúgbà',
    heroSub: 'Wọlé tàbí forúkọsílẹ̀ lọ́fẹ̀ẹ́ láti ní àkáǹtì tirẹ, tọ́jú fóònù & ímeèlì, kí o sì máa sọ̀rọ̀ nígbàkígbà.',
    heroBtnSignedOut: 'Wọlé / Forúkọsílẹ̀',
    heroBtnSignedIn: 'Àkáǹtì Mi',
    modalTitle: 'Àkáǹtì Ìlera Ọ̀fẹ́ & Àlàyé Ìbánisọ̀rọ̀',
    modalSubtitle: 'Ó wà lọ́fẹ̀ẹ́ lórí Spark tier ($0) · Ìpè pàjáwìrì 112 kò nílò wíwọlé.',
    freeTierBadge: 'Ọ̀fẹ́ 100% ($0 Spark Tier)',
    privacyNote: 'Ìbánisọ̀rọ̀ rẹ àti àyẹ̀wò gbogbogbò nìkan ni a lè fi pamọ́. Ìtọ́jú Ìkọ̀kọ̀ (HIV/PEP) kò ní wọ inú database láé.',
    noSmsChargeNote: 'A ń fi nọ́mbà fóònù Nàìjíríà pamọ́ lọ́fẹ̀ẹ́ láìsí owó SMS OTP kankan.',
    signInCta: 'Wọlé / Forúkọsílẹ̀ pẹ̀lú Google (Ọ̀fẹ́)',
    saveAndSignInCta: 'Ṣẹ̀dá Àkáǹtì & Fi Pamọ́',
    signingIn: 'Ń sopọ̀ mọ́ Google...',
    signOutCta: 'Jáde',
    signedInLabel: 'O wọlé pẹ̀lú',
    emailPasswordTip: 'Ṣé o fẹ́ wọlé pẹ̀lú Ímeèlì & Ọ̀rọ̀ Aṣínà? Ọ̀fẹ́ ni ($0) — olùdarí app lè tan án nínú Firebase Console.',
    tabProfile: 'Fóònù & Ímeèlì',
    tabCheckups: 'Àyẹ̀wò Tó Pamọ́',
    displayNameLabel: 'Orúkọ Rẹ Tàbí Àpèlé',
    displayNamePlaceholder: 'àpẹẹrẹ: Tunde Adebayo',
    emailLabel: 'Àdírẹ́sì Ímeèlì',
    emailPlaceholder: 'àpẹẹrẹ: oruko@gmail.com',
    phoneLabel: 'Nọ́mbà Fóònù (Nàìjíríà / Òkèèrè)',
    phonePlaceholder: 'àpẹẹrẹ: +234 803 123 4567 tàbí 08031234567',
    phoneHelp: 'Wà nínú àkáǹtì rẹ nìkan fún ìrànlọ́wọ́ ilé-ìwòsàn.',
    emergencyPhoneLabel: 'Fóònù Pàjáwìrì (Ẹbí)',
    emergencyPhonePlaceholder: 'àpẹẹrẹ: 0802 987 6543',
    emergencyPhoneHelp: 'Nọ́mbà ẹbí tàbí aládùúgbò fún ìpè pàjáwìrì.',
    stateLabel: 'Ìpínlẹ̀ Rẹ',
    langLabel: 'Èdè Tí O Fẹ́ràn',
    saveProfileBtn: 'Fi Fóònù & Ímeèlì Pamọ́',
    savingBtn: 'Ń fi pamọ́...',
    profileSavedMsg: 'A ti fi nọ́mbà fóònù, ímeèlì & ìpínlẹ̀ rẹ pamọ́ dáadáa!',
    deleteProfileBtn: 'Pa Àkọsílẹ̀ Rẹ́',
    profileDeletedMsg: 'A ti yọ àlàyé fóònù & ímeèlì rẹ kúrò nínú àkójọ.',
    saveCheckupBtn: 'Fi pamọ́',
    savedCheckupDone: 'Ti pamọ́',
    savingCheckup: 'Ń fi pamọ́...',
    emptyCheckupsTitle: 'Kò sí àyẹ̀wò kankan lọ́wọ́lọ́wọ́',
    emptyCheckupsDesc: 'Tẹ "Fi pamọ́" lẹ́yìn àyẹ̀wò àmì àìsàn láti tọ́jú rẹ̀ fún ilé-ìwòsàn.',
    signInCheckupsHint: 'Wọlé lọ́fẹ̀ẹ́ pẹ̀lú Google láti rí àwọn àyẹ̀wò tí o ti fi pamọ́.',
    loadCheckupBtn: 'Ṣí i',
    deleteCheckupBtn: 'Pa rẹ́',
    chatGate: {
      composerNotice: 'Jọ̀wọ́ wọlé tàbí forúkọsílẹ̀ lọ́fẹ̀ẹ́ lákọ̀ọ́kọ́ láti ní àkáǹtì tirẹ kí o lè sọ̀rọ̀ nígbàkúgbà.',
      composerActionBtn: 'Wọlé / Forúkọsílẹ̀',
      activeBadge: 'Àkáǹtì rẹ wà lórí ayélujára — sọ̀rọ̀ nígbàkúgbà',
      inlineTitle: 'Jọ̀wọ́ Wọlé Tàbí Forúkọsílẹ̀ Kí O Tó Sọ̀rọ̀',
      inlineBody: 'Ṣẹ̀dá àkáǹtì NaijaHealth ọ̀fẹ́ tirẹ ($0) lákọ̀ọ́kọ́ kí o lè bá olùrànlọ́wọ́ ìlera wa sọ̀rọ̀ nígbàkígbà tí o bá fẹ́.',
      pendingPrefix: 'Ìbéèrè rẹ ti ṣetán:',
      inlineCta: 'Wọlé / Forúkọsílẹ̀ Lọ́fẹ̀ẹ́ ($0)',
      modalTitle: 'Wọlé Tàbí Forúkọsílẹ̀ Lọ́fẹ̀ẹ́ Láti Sọ̀rọ̀',
      modalSubtitle: 'Ní àkáǹtì ọ̀fẹ́ tirẹ ($0) kí o lè máa bá wa sọ̀rọ̀ nígbàkúgbà tí o bá fẹ́.',
      modalBannerDesc: 'Wọlé kíákíá pẹ̀lú Google nísàlẹ̀ tàbí kọ orúkọ, ímeèlì & nọ́mbà fóònù rẹ láti bẹ̀rẹ̀ ìjíròrò lẹ́sẹ̀kẹsẹ̀!',
      modalPendingVoice: 'Gbígba ohùn yóò bẹ̀rẹ̀ lẹ́sẹ̀kẹsẹ̀ lẹ́yìn tí o bá wọlé.',
      loginAndChatCta: 'Wọlé pẹ̀lú Google & Bẹ̀rẹ̀ Ìjíròrò',
      createAndChatCta: 'Ṣẹ̀dá Àkáǹtì Ọ̀fẹ́ & Sọ̀rọ̀',
    },
    errors: {
      invalidName: 'Ẹ jọ̀wọ́ kọ orúkọ rẹ (lẹ́tà 1 sí 80).',
      invalidEmail: 'Ẹ jọ̀wọ́ kọ àdírẹ́sì ímeèlì tó péye.',
      invalidPhone: 'Ẹ jọ̀wọ́ ṣàyẹ̀wò nọ́mbà fóònù rẹ (nọ́mbà 7–20).',
      invalidEmergencyPhone: 'Ẹ ṣàyẹ̀wò nọ́mbà fóònù pàjáwìrì tàbí kí ẹ fi sílẹ̀ ní òfo.',
      invalidState: 'Ẹ jọ̀wọ́ yan ìpínlẹ̀ rẹ.',
      unverified: 'A gbọ́dọ̀ fìdí ímeèlì múlẹ̀ kí a tó fi pamọ́.',
      popupClosed: 'O ti ti fèrèsé wíwọlé Google. Gbìyànjú lẹ́ẹ̀kan sí i.',
      popupBlocked: 'Ẹ̀rọ ìwòran dènà fèrèsé wíwọlé. Yọ̀ọ̀da popups kí o sì tún gbìyànjú.',
      quotaExceeded: 'Ààyè ọ̀fẹ́ òní ti kún. Yóò tún bẹ̀rẹ̀ lọ́la!',
      permission: 'Ìṣòro àṣẹ wáyé. Ẹ tún wọlé kí ẹ sì gbìyànjú.',
      unknown: 'Àìlè sopọ̀ báyìí. Ẹ jọ̀wọ́ gbìyànjú lẹ́ẹ̀kan sí i.',
    },
  },
  igbo: {
    headerButtonSignedOut: 'Banye / Debanye Aha',
    headerButtonSignedInFallback: 'Akaụntụ M',
    heroTitle: 'Nweta akaụntụ ahụike gị n’efu ($0) ka i wee na-akparịta ụka mgbe ọ bụla',
    heroSub: 'Banye ma ọ bụ debanye aha n’efu iji nweta akaụntụ nke gị, chekwaa ekwentị & email, ma kparịta ụka mgbe ọ bụla.',
    heroBtnSignedOut: 'Banye / Debanye Aha',
    heroBtnSignedIn: 'Akaụntụ M',
    modalTitle: 'Akaụntụ Ahụike N’efu & Nọmba Nkpọtụrụ',
    modalSubtitle: 'Ọ bụ n’efu ($0 Spark tier) · Enyemaka mberede anaghị achọ nbanye.',
    freeTierBadge: 'N’efu 100% ($0)',
    privacyNote: 'Naanị nkọwa nkpọtụrụ gị na nyocha nkịtị i chekwara ka a na-edobe. Nlekọta Nzuzo (HIV/PEP) anaghị aba na nchekwa data.',
    noSmsChargeNote: 'A na-echekwa nọmba ekwentị Naịjirịa gị n’efu n’enweghị ụgwọ SMS OTP.',
    signInCta: 'Jiri Google Banye / Debanye (N’efu)',
    saveAndSignInCta: 'Mepụta Akaụntụ & Chekwaa',
    signingIn: 'Na-ejikọta Google...',
    signOutCta: 'Pụọ',
    signedInLabel: 'Banyere dị ka',
    emailPasswordTip: 'Ị chọrọ iji Email & Okwuntụghe banye? Ọ bụkwa n’efu ($0) — onye nwe ngwa nwere ike ịgbanye ya na Firebase Console.',
    tabProfile: 'Ekwentị & Email',
    tabCheckups: 'Nyocha E Chekwara',
    displayNameLabel: 'Aha Gị Ma Ọ Bụ Aha Otutu',
    displayNamePlaceholder: 'dị ka: Ngozi Eze',
    emailLabel: 'Adreesị Email',
    emailPlaceholder: 'dị ka: aha@gmail.com',
    phoneLabel: 'Nọmba Ekwentị (Naịjirịa / Mba Ọzọ)',
    phonePlaceholder: 'dị ka: +234 803 123 4567 ma ọ bụ 08031234567',
    phoneHelp: 'Echekwara na profaịlụ gị maka iji mee ihe n’ụlọ ọgwụ.',
    emergencyPhoneLabel: 'Ekwentị Mberede (Onye Ezinụlọ)',
    emergencyPhonePlaceholder: 'dị ka: 0802 987 6543',
    emergencyPhoneHelp: 'Nọmba onye ezinụlọ maka oge mberede.',
    stateLabel: 'Steeti Gị',
    langLabel: 'Asụsụ Ị Họọrọ',
    saveProfileBtn: 'Chekwaa Ekwentị & Email',
    savingBtn: 'Na-echekwa...',
    profileSavedMsg: 'E chekwaala nọmba ekwentị gị, email na steeti n’udo!',
    deleteProfileBtn: 'Hichapụ Profaịlụ',
    profileDeletedMsg: 'Ehichapụla ozi ekwentị na email gị na nchekwa data.',
    saveCheckupBtn: 'Chekwaa',
    savedCheckupDone: 'Echekwara',
    savingCheckup: 'Na-echekwa...',
    emptyCheckupsTitle: 'Enwebeghị nyocha e chekwara',
    emptyCheckupsDesc: 'Mgbe i nyochara ahụike gị, pịa "Chekwaa" iji debe ya maka dọkịta.',
    signInCheckupsHint: 'Jiri Google banye n’efu iji hụ ma jikwaa nyocha ahụike gị n’ngwaọrụ ọ bụla.',
    loadCheckupBtn: 'Mepee',
    deleteCheckupBtn: 'Hichapụ',
    chatGate: {
      composerNotice: 'Biko banye ma ọ bụ debanye aha n’efu buru ụzọ ka i nweta akaụntụ nke gị iji kparịta ụka mgbe ọ bụla.',
      composerActionBtn: 'Banye / Debanye',
      activeBadge: 'Akaụntụ gị na-arụ ọrụ — kparịta ụka mgbe ọ bụla',
      inlineTitle: 'Biko Banye Ma Ọ Bụ Debanye Aha Tupu Ị Kparịta Ụka',
      inlineBody: 'Mepụta akaụntụ NaijaHealth gị n’efu ($0) tupu ị bido, ka i wee nwee ike ịkparịta ụka mgbe ọ bụla ị chọrọ.',
      pendingPrefix: 'Ajụjụ gị dị njikere:',
      inlineCta: 'Banye / Debanye Aha N’efu ($0)',
      modalTitle: 'Banye Ma Ọ Bụ Debanye Aha N’efu Iji Kparịta Ụka',
      modalSubtitle: 'Nweta akaụntụ nke gị n’efu ($0) ka i wee na-akparịta ụka mgbe ọ bụla ị chọrọ.',
      modalBannerDesc: 'Jiri Google banye ozugbo ma ọ bụ tinye aha gị, email & ekwentị n’okpuru iji mepụta akaụntụ gị ma ziga ajụjụ gị ozugbo!',
      modalPendingVoice: 'Ndekọ olu ga-ebido ozugbo i banyere.',
      loginAndChatCta: 'Jiri Google Banye & Bido Ụka',
      createAndChatCta: 'Mepụta Akaụntụ N’efu & Bido Ụka',
    },
    errors: {
      invalidName: 'Biko tinye aha gị (mkpụrụedemede 1 ruo 80).',
      invalidEmail: 'Biko tinye ezigbo adreesị email.',
      invalidPhone: 'Biko lelee nọmba ekwentị gị (nọmba 7–20).',
      invalidEmergencyPhone: 'Biko lelee nọmba ekwentị mberede ma ọ bụ hapụ ya efu.',
      invalidState: 'Biko họrọ steeti gị.',
      unverified: 'A ghaghị ikwenye email tupu e chekwaa ozi.',
      popupClosed: 'E mechiri windo nbanye Google. Pịa ọzọ.',
      popupBlocked: 'Ihe nchọgharị gbochiri popup nbanye. Biko kwe ka popup meghee.',
      quotaExceeded: 'Oke nchekwa n’efu nke taa ejula. Ọ ga-emegharị echi!',
      permission: 'Nsogbu ikike. Biko pụọ ma banye ọzọ.',
      unknown: 'Enweghị ike ijikọ ugbu a. Biko nwaa ọzọ.',
    },
  },
};
