import React from 'react';
import {
  HeartPulse,
  Building2,
  BookOpen,
  Pill,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  Baby,
  Activity,
  CheckCircle2,
  Lock,
  Globe,
  MapPin,
  ChevronRight,
  Flame,
  Droplet,
  Thermometer,
  Wind,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/triage';
import { TRANSLATIONS } from '../data/localization';
import { BrandMark } from './BrandMark';
import { ResilientImage } from './ResilientImage';
import { VISUAL_ASSETS } from '../data/visualAssets';
import { facilitiesForState, lgasForState } from '../data/facilityDirectory';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';

interface OpeningLandingViewProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  selectedState: string;
  onSelectState: (state: string) => void;
  onOpenAuth: (mode?: 'signin' | 'register', featureHint?: string, onCompleteAction?: () => void) => void;
  onQuickGuestEnter: (onCompleteAction?: () => void) => void;
  onOpenEmergency: () => void;
}

export const OpeningLandingView: React.FC<OpeningLandingViewProps> = ({
  selectedLanguage,
  onSelectLanguage,
  selectedState,
  onSelectState,
  onOpenAuth,
  onQuickGuestEnter,
  onOpenEmergency,
}) => {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.pidgin;
  const states = Object.keys(NIGERIAN_STATES_DATA);
  const facilityCount = facilitiesForState(selectedState).length;
  const lgaCount = lgasForState(selectedState).length;

  const openingCopy = {
    pidgin: {
      heroBadge: 'Federal Health Navigation · 100% Free for Every Nigerian',
      heroTitle: 'Check Your Health Sharp-Sharp Before You Go Hospital',
      heroSub:
        'Speak or type any symptom inside Pidgin, Hausa, Yoruba, Igbo or English. Access all 774 LGA public hospitals, genuine chemist medicines with NAFDAC check, and pregnancy danger signs.',
      ctaPrimary: 'Sign In / Register Free',
      ctaGuest: '1-Click Quick Demo',
      ctaEmergency: 'Emergency Call (112)',
      featuresHeading: 'Everything You Get Once You Sign In Free:',
      feature1Title: 'Multilingual AI Symptom Triage',
      feature1Desc: 'Speak with your voice or type. Get instant 3-part medical guidance and emergency red-flag warnings in seconds.',
      feature2Title: 'All 774 LGA Public Hospitals',
      feature2Desc: 'Find verified General Hospitals, FMCs, and Teaching Clinics in every single Nigerian local government with GPS directions.',
      feature3Title: 'Pharmacy & OTC Medicine Guide',
      feature3Desc: 'Real photos of blister packs, exact adult/child dosages, what to ask your chemist, and free 38353 NAFDAC SMS check.',
      feature4Title: 'Maternal & Family First Aid',
      feature4Desc: 'Home ORS prep for acute purging, child fever cooling, and pregnancy danger signs to keep mother and child safe.',
      feature5Title: 'Private & Anonymous Care',
      feature5Desc: '72-hour PEP exposure clock, confidential HIV/ART guidance, and zero-trace chat clearing.',
      interactiveTeaserTitle: 'Try Checking A Symptom (Tap to test):',
      lockedBannerTitle: 'Sign In Or Test Demo to Unlock Full App Workspace',
      lockedBannerDesc: 'Takes only 5 seconds. Use your Nigerian phone number, email, or enter instantly as a guest.',
      statsFmt: {
        states: '36 States + FCT',
        lgas: '774 LGAs Verified',
        clinics: '4,166+ Public Clinics',
        cost: 'Free Public Service',
      },
    },
    english: {
      heroBadge: 'Federal Health Navigation · 100% Free Public Service',
      heroTitle: 'Instant Clinical Guidance in Your Native Tongue',
      heroSub:
        'AI triage across 5 Nigerian languages, 774 local government public hospital routing, genuine pharmacy medicines with NAFDAC verification, and antenatal maternal care.',
      ctaPrimary: 'Sign In / Register Free',
      ctaGuest: '1-Click Instant Access',
      ctaEmergency: 'Emergency Call (112)',
      featuresHeading: 'Complete Clinical Features Unlocked After Sign-In:',
      feature1Title: 'Multilingual Clinical Triage',
      feature1Desc: 'Voice or text triage in Pidgin, English, Hausa, Yoruba, or Igbo. Aligned with NCDC and Federal Ministry of Health protocols.',
      feature2Title: '774 LGA Hospital Directory',
      feature2Desc: 'Every LGA mapped with verified public facilities, emergency hotlines, and one-tap directions.',
      feature3Title: 'Pharmacy & OTC Drug Guide',
      feature3Desc: 'Genuine pharmaceutical images, dosing guidance, questions for your pharmacist, and NAFDAC MAS SMS authentication.',
      feature4Title: 'Maternal & Family First Aid',
      feature4Desc: 'Pediatric fever management, WHO-standard ORS rehydration, and antenatal red-flag alerts.',
      feature5Title: 'Confidential Care & PEP Clock',
      feature5Desc: 'Anonymous 72-hour exposure clock, discreet consultation mode, and zero-trace session wiping.',
      interactiveTeaserTitle: 'Interactive Preview (Tap any symptom to start):',
      lockedBannerTitle: 'Sign in to access your personalized clinic workspace',
      lockedBannerDesc: 'Enter using your Nigerian phone number, email, or explore immediately as a guest.',
      statsFmt: {
        states: '36 States + FCT',
        lgas: '774 LGAs Verified',
        clinics: '4,166+ Public Clinics',
        cost: 'Free Public Service',
      },
    },
    hausa: {
      heroBadge: 'Kiwon Lafiya Najeriya · Kyauta 100% Ga Kowane Dan Kasa',
      heroTitle: 'Duba Lafiyarka Cikin Harshenka Kafin Ka Je Asibiti',
      heroSub:
        'Taimakon gaggawa na kiwon lafiya a harshen Hausa, Pidgin, Turanci, Yoruba da Igbo. Binciken asibitocin dukkan kananan hukumomi 774 da magungunan sauki.',
      ctaPrimary: 'Shiga / Bude Asusu',
      ctaGuest: 'Shiga Kai Tsaye',
      ctaEmergency: 'Gaggawa (112)',
      featuresHeading: 'Abubuwan Da Zaka Samu Bayan Shiga:',
      feature1Title: 'Duba Alamun Cuta Da Murya Ko Rubutu',
      feature1Desc: 'Yi magana ko rubuta a harshenka domin samun shawarwari da alamun hatsari nan take.',
      feature2Title: 'Asibitocin Kananan Hukumomi 774',
      feature2Desc: 'Cikakkun asibitocin gwamnati a dukkan jihohi 36 da Abuja tare da lambobin gaggawa.',
      feature3Title: 'Jagoran Magunguna da NAFDAC',
      feature3Desc: 'Hotunan magunguna na gaskiya, adadin da ya kamata a sha, da lambar goge-ka-aika ta 38353.',
      feature4Title: 'Kulawa Ga Masu Juna Biyu da Yara',
      feature4Desc: 'Hada ruwan ORS da gishiri da sukari, kula da zazzabi, da kiyaye lafiyar mai ciki.',
      feature5Title: 'Sirri da Tsaro',
      feature5Desc: 'Kare bayanan lafiya da kiyaye sirri ba tare da wani ya sani ba.',
      interactiveTeaserTitle: 'Gwada Duba Wani Ciwo:',
      lockedBannerTitle: 'Bude Asusu Ko Shiga Don Fara Aiki',
      lockedBannerDesc: 'Yana daukar dakiku kadan kawai. Yi amfani da lambar waya ko shiga kai tsaye.',
      statsFmt: {
        states: 'Jihohi 36 + Abuja',
        lgas: 'Kananan Hukumomi 774',
        clinics: 'Asibitoci 4,166+',
        cost: 'Kyauta 100%',
      },
    },
    yoruba: {
      heroBadge: 'Ìtọ́sọ́nà Ìlera Nàìjíríà · Ọ̀fẹ́ 100% Fun Gbogbo Ara Ilu',
      heroTitle: 'Ṣàyẹ̀wò Ìlera Rẹ Ní Èdè Rẹ Kí O Tó Lọ Ilé-ìwòsàn',
      heroSub:
        'Ìtọ́sọ́nà ìlera pẹ̀lú ohùn tàbí àkọsílẹ̀ ní Yorùbá, Pidgin, Gẹ̀ẹ́sì, Hausa ati Igbo. Wo gbogbo ilé-ìwòsàn ìjọba ní ìjọba ìbílẹ̀ 774 àti àwọn oògùn tó láàbò.',
      ctaPrimary: 'Wọle / Ṣẹda Akọọlẹ',
      ctaGuest: 'Wọle Lẹsẹkẹsẹ',
      ctaEmergency: 'Pàjáwìrì (112)',
      featuresHeading: 'Gbogbo Ohun Ti O Wa Lẹhin Ti O Ba Wọle:',
      feature1Title: 'Àyẹ̀wò Àìsàn Pẹ̀lú Ohùn & Àkọsílẹ̀',
      feature1Desc: 'Sọ bí ara ṣe ń ṣe ọ́ ní èdè rẹ, kí o sì gba ìtọ́sọ́nà tó péye lẹ́sẹ̀kẹsẹ̀.',
      feature2Title: 'Ilé-ìwòsàn Ní Gbogbo Ìjọba Ìbílẹ̀ 774',
      feature2Desc: 'Gbogbo ilé-ìwòsàn ìjọba pẹ̀lú nọ́mbà pàjáwìrì àti ìtọ́sọ́nà ọ̀nà.',
      feature3Title: 'Itọsọna Oogun ati Ijẹrisi NAFDAC',
      feature3Desc: 'Àwòrán oògùn gidi, ìwọ̀n tó tọ́ láti mu, àti ifọwọsi ọfẹ lori 38353.',
      feature4Title: 'Ìtọ́jú Ọmọdé & Aláboyún',
      feature4Desc: 'Bí a ṣe ń da omi ORS, dídín ibà kù nínú ọmọdé, àti àmì ewu oyún.',
      feature5Title: 'Àbójútó Ní Ìkọ̀kọ̀ Pátápátá',
      feature5Desc: 'Ṣíṣe ìtọ́jú ní ìkọ̀kọ̀ lai fi àmì kankan sílẹ̀.',
      interactiveTeaserTitle: 'Gbìyànjú Àmì Àìsàn Kankan:',
      lockedBannerTitle: 'Wọle tàbí Ṣẹda Akọọlẹ Lati Ṣii Gbogbo Ẹya',
      lockedBannerDesc: 'Kò gba ju ìṣẹ́jú àáyá marun lọ. Lo nọ́mbà foonu rẹ tàbí wọle lẹ́sẹ̀kẹsẹ̀.',
      statsFmt: {
        states: 'Ìpínlẹ̀ 36 + Abuja',
        lgas: 'Ìjọba Ìbílẹ̀ 774',
        clinics: 'Ilé-ìwòsàn 4,166+',
        cost: 'Ọ̀fẹ́ 100%',
      },
    },
    igbo: {
      heroBadge: 'Nnyemaaka Ahụike Naịjirịa · N\'efu 100% Maka Onye Ọ bụla',
      heroTitle: 'Nyochaa Ahụike Gị N\'asụsụ Gị Tupu Ị Gaa Ụlọ Ọgwụ',
      heroSub:
        'Nyocha ngwa ngwa n\'asụsụ Igbo, Pidgin, Bekee, Hausa na Yoruba. Nweta ụlọ ọgwụ gọọmentị niile dị na LGA 774, ọgwụ akwadoro na nlekọta ndị dị ime.',
      ctaPrimary: 'Banye / Mepụta Akaụntụ',
      ctaGuest: 'Banye Ozugbo',
      ctaEmergency: 'Mberede (112)',
      featuresHeading: 'Ihe Niile Ị Ga-enweta Mgbe Ị Banyere:',
      feature1Title: 'Nyocha Ahụike Site n\'Olu Ma Ọ bụ Edemede',
      feature1Desc: 'Jiri olu gị gwa anyị ihe na-eme gị ma nweta ndụmọdụ doro anya n\'ime nkeji ole na ole.',
      feature2Title: 'Ụlọ Ọgwụ Dị na LGA 774 Niile',
      feature2Desc: 'Ụlọ ọgwụ gọọmentị niile nwere akara na nọmba ekwentị mberede.',
      feature3Title: 'Ntuziaka Ọgwụ na Nlele NAFDAC',
      feature3Desc: 'Foto ọgwụ dị mma, otu esi aṅụ ya, na nkwenye efu site na SMS 38353.',
      feature4Title: 'Nlekọta Ndị Dị Ime na Ụmụaka',
      feature4Desc: 'Ngwakọta mmiri ORS, ibelata ahụ ọkụ ụmụaka, na ịrịba ama ihe ize ndụ nke ime.',
      feature5Title: 'Nchedo Nzuzo Pụrụ Iche',
      feature5Desc: 'Nyocha nzuzo na-enweghị onye ọzọ maara ihe gị na anyị kwurịtara.',
      interactiveTeaserTitle: 'Nwalee Nyocha Ahụike:',
      lockedBannerTitle: 'Banye Ma Ọ Bụ Mepee Akaụntụ Iji Nweta Ihe Niile',
      lockedBannerDesc: 'Ọ na-ewe naanị obere oge. Jiri nọmba ekwentị gị ma ọ bụ banye ozugbo.',
      statsFmt: {
        states: 'Steeti 36 + Abuja',
        lgas: 'LGA 774 A Kwadoro',
        clinics: 'Ụlọ Ọgwụ 4,166+',
        cost: 'Ọrụ Ọha N\'efu',
      },
    },
  }[selectedLanguage] || {
    heroBadge: 'Federal Health Navigation · 100% Free Public Service',
    heroTitle: 'Instant Medical Guidance in Your Mother Tongue',
    heroSub:
      'AI triage across 5 Nigerian languages, 774 LGA public hospital directory, genuine pharmacy medicines with NAFDAC check, and pregnancy care.',
    ctaPrimary: 'Sign In / Register Free',
    ctaGuest: '1-Click Quick Demo',
    ctaEmergency: 'Emergency Call (112)',
    featuresHeading: 'Everything You Get Once You Sign In Free:',
    feature1Title: 'Multilingual AI Symptom Triage',
    feature1Desc: 'Speak or type in your language and get 3-part clinical guidance and emergency warnings.',
    feature2Title: 'All 774 LGA Public Hospitals',
    feature2Desc: 'Verified general hospitals and FMCs across every Nigerian LGA with phone numbers.',
    feature3Title: 'Pharmacy & OTC Drug Guide',
    feature3Desc: 'Real photos of medicines, dosages, pharmacist questions, and free 38353 NAFDAC SMS check.',
    feature4Title: 'Maternal & Family First Aid',
    feature4Desc: 'Home ORS prep, pediatric fever cooling, and antenatal danger signs.',
    feature5Title: 'Private & Anonymous Care',
    feature5Desc: '72-hour exposure clock and zero-trace discreet consultation.',
    interactiveTeaserTitle: 'Interactive Preview (Tap to start):',
    lockedBannerTitle: 'Sign in to access your clinic workspace',
    lockedBannerDesc: 'Enter using your Nigerian phone number, email, or guest demo.',
    statsFmt: {
      states: '36 States + FCT',
      lgas: '774 LGAs Verified',
      clinics: '4,166+ Public Clinics',
      cost: 'Free Public Service',
    },
  };

  const sampleSymptoms = [
    {
      label: selectedLanguage === 'pidgin' ? 'Hot body & headache' : 'Fever & headache',
      text: 'My body dey hot well-well and body dey pain me for 3 days',
      icon: <Thermometer className="w-4 h-4 text-amber-500" />,
    },
    {
      label: selectedLanguage === 'pidgin' ? 'Belle bite & purging' : 'Diarrhea & vomiting',
      text: 'My belle dey bite me and I dey purge watery stool since yesterday morning',
      icon: <Droplet className="w-4 h-4 text-blue-500" />,
    },
    {
      label: selectedLanguage === 'pidgin' ? 'Dry cough & catarrh' : 'Cough & chest tightness',
      text: 'Dry cough dey worry me with catarrh and sore throat for 4 days',
      icon: <Wind className="w-4 h-4 text-teal-500" />,
    },
    {
      label: selectedLanguage === 'pidgin' ? 'Belle check (Pregnancy)' : 'Pregnancy checkup',
      text: 'I get belle (pregnancy) and I dey feel dizzy with swelling for leg',
      icon: <Baby className="w-4 h-4 text-rose-500" />,
    },
  ];

  return (
    <div className="opening-portal" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top Banner Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--line)',
          background: 'var(--surface)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="wrap"
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandMark size="sm" />
            <div className="brand-name">
              <b style={{ fontSize: 16 }}>NaijaHealth</b>
              <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>
                AI Triage · Nigeria
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Language Quick Dropdown */}
            <div className="select" style={{ minWidth: 120 }}>
              <select
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
                className="select-btn"
                aria-label="Language selector"
                style={{ height: 36, fontSize: 12.5, fontWeight: 600, padding: '0 10px' }}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.localName}
                  </option>
                ))}
              </select>
            </div>

            {/* Emergency 112 button */}
            <button
              type="button"
              onClick={onOpenEmergency}
              className="btn-emg"
              style={{ height: 36, padding: '0 12px', fontSize: 12.5 }}
              title="Emergency Hotlines"
            >
              <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.4} />
              <span>112</span>
            </button>

            {/* Sign in Button */}
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 8, height: 36, padding: '0 16px', fontSize: 13, fontWeight: 650 }}
            >
              {openingCopy.ctaPrimary}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section
        style={{
          padding: '48px 0 36px',
          borderBottom: '1px solid var(--line)',
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
        }}
      >
        <div className="wrap">
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
            {/* Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'var(--brand-soft)',
                border: '1px solid var(--brand)',
                color: 'var(--brand-ink)',
                fontSize: 12.5,
                fontWeight: 650,
                marginBottom: 18,
              }}
            >
              <ShieldCheck className="w-4 h-4 text-brand" />
              <span>{openingCopy.heroBadge}</span>
            </div>

            {/* Hero Headline */}
            <h1
              style={{
                fontSize: 'clamp(28px, 4.5vw, 44px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: 'var(--ink)',
                marginBottom: 16,
              }}
            >
              {openingCopy.heroTitle}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: 'var(--ink-2)',
                lineHeight: 1.6,
                maxWidth: 680,
                margin: '0 auto 28px',
              }}
            >
              {openingCopy.heroSub}
            </p>

            {/* State & Facility Live Counter */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 16px',
                borderRadius: 12,
                background: 'var(--surface)',
                border: '1px solid var(--line-strong)',
                boxShadow: 'var(--shadow-xs)',
                marginBottom: 28,
                fontSize: 13,
                color: 'var(--ink)',
              }}
            >
              <MapPin className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              <span>
                Active State:{' '}
                <select
                  value={selectedState}
                  onChange={(e) => onSelectState(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontWeight: 700,
                    color: 'var(--brand-ink)',
                    fontSize: 13,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st} State
                    </option>
                  ))}
                </select>
              </span>
              <span style={{ color: 'var(--line-strong)' }}>·</span>
              <span style={{ color: 'var(--muted)', fontWeight: 600 }}>
                {lgaCount} LGAs · {facilityCount} Verified Hospitals
              </span>
            </div>

            {/* CTAs Group */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary"
                style={{
                  height: 48,
                  padding: '0 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{openingCopy.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
              </button>

              <button
                type="button"
                onClick={() => onQuickGuestEnter()}
                className="btn btn-outline"
                style={{
                  height: 48,
                  padding: '0 22px',
                  fontSize: 14.5,
                  fontWeight: 650,
                  borderRadius: 12,
                  background: 'var(--surface)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Sparkles className="w-4 h-4 text-brand" />
                <span>{openingCopy.ctaGuest}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Bar */}
      <section
        style={{
          borderBottom: '1px solid var(--line)',
          background: 'var(--surface)',
          padding: '16px 0',
        }}
      >
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              textAlign: 'center',
            }}
          >
            <div>
              <b style={{ display: 'block', fontSize: 18, color: 'var(--brand)' }}>
                {openingCopy.statsFmt.states}
              </b>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Full National Coverage</span>
            </div>
            <div>
              <b style={{ display: 'block', fontSize: 18, color: 'var(--brand)' }}>
                {openingCopy.statsFmt.lgas}
              </b>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Public Facility Mappings</span>
            </div>
            <div>
              <b style={{ display: 'block', fontSize: 18, color: 'var(--brand)' }}>
                {openingCopy.statsFmt.clinics}
              </b>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Teaching & General Hospitals</span>
            </div>
            <div>
              <b style={{ display: 'block', fontSize: 18, color: 'var(--brand)' }}>
                {openingCopy.statsFmt.cost}
              </b>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>No Card · No Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Teaser Section */}
      <section style={{ padding: '40px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Activity className="w-4 h-4 text-brand" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                {openingCopy.interactiveTeaserTitle}
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
                marginBottom: 18,
              }}
            >
              {sampleSymptoms.map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onOpenAuth('signin', sym.label, () => {
                      // action will execute in App.tsx
                    })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: 'var(--surface-2)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ flexShrink: 0 }}>{sym.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 13, color: 'var(--ink)' }}>
                      {sym.label}
                    </b>
                    <span style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block' }}>
                      Tap to check
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                </button>
              ))}
            </div>

            {/* Sign in to unlock notification */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 10,
                background: 'var(--brand-soft)',
                border: '1px solid var(--brand)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock className="w-4 h-4 text-brand" />
                <div>
                  <b style={{ fontSize: 13, color: 'var(--brand-ink)', display: 'block' }}>
                    {openingCopy.lockedBannerTitle}
                  </b>
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                    {openingCopy.lockedBannerDesc}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 8, padding: '6px 16px', fontSize: 12.5 }}
              >
                Sign In Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ padding: '48px 0 60px' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 10,
              }}
            >
              {openingCopy.featuresHeading}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 600, margin: '0 auto' }}>
              Designed specifically for everyday Nigerian health challenges with verified public resources.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {/* Feature 1: AI Triage */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--brand-soft)',
                  color: 'var(--brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <HeartPulse className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                {openingCopy.feature1Title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                {openingCopy.feature1Desc}
              </p>
            </div>

            {/* Feature 2: 774 LGA Hospitals */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--danger-soft)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Building2 className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                {openingCopy.feature2Title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                {openingCopy.feature2Desc}
              </p>
            </div>

            {/* Feature 3: Pharmacy OTC Guide */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--blue-soft)',
                  color: 'var(--blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Pill className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                {openingCopy.feature3Title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                {openingCopy.feature3Desc}
              </p>
            </div>

            {/* Feature 4: Maternal & Family Care */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--rose-soft)',
                  color: 'var(--rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Baby className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                {openingCopy.feature4Title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                {openingCopy.feature4Desc}
              </p>
            </div>

            {/* Feature 5: Discreet HIV/PEP Care */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--violet-soft)',
                  color: 'var(--violet)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Lock className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                {openingCopy.feature5Title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                {openingCopy.feature5Desc}
              </p>
            </div>

            {/* Quick Guest Action card */}
            <div
              style={{
                background: 'var(--brand-soft)',
                border: '1px solid var(--brand)',
                borderRadius: 14,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <b style={{ display: 'block', fontSize: 17, color: 'var(--brand-ink)', marginBottom: 6 }}>
                  Ready to check your symptoms?
                </b>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  Click below to open the full app workspace instantly with 1-tap guest access or your phone number.
                </p>
              </div>

              <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => onQuickGuestEnter()}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 8, padding: '8px 16px', fontSize: 13 }}
                >
                  Enter As Guest
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: 8, padding: '8px 16px', fontSize: 13, background: 'var(--surface)' }}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opening Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--line)',
          background: 'var(--surface)',
          padding: '24px 0',
          textAlign: 'center',
          fontSize: 12.5,
          color: 'var(--muted)',
        }}
      >
        <div className="wrap">
          <p style={{ marginBottom: 6 }}>
            <b>NaijaHealth AI</b> · Federal Health Triage &amp; Navigation Support Tool
          </p>
          <p>
            In life-threatening emergencies, dial <b>112</b>, <b>767</b>, or visit the nearest General Hospital Emergency Ward immediately.
          </p>
        </div>
      </footer>
    </div>
  );
};
