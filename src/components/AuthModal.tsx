import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Lock,
  User,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { SupportedLanguage } from '../types/triage';
import { AppUser } from '../types/auth';
import {
  signInWithPhone,
  signInWithEmail,
  registerWithEmail,
  signInAsGuest,
} from '../services/authService';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { BrandMark } from './BrandMark';
import { useModalBehavior } from '../lib/useModalBehavior';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AppUser) => void;
  selectedLanguage: SupportedLanguage;
  defaultState?: string;
  initialMode?: 'signin' | 'register';
  featureHint?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedLanguage,
  defaultState = 'Lagos',
  initialMode = 'signin',
  featureHint,
}) => {
  const [authTab, setAuthTab] = useState<'phone' | 'email' | 'guest'>('phone');
  const [isRegister, setIsRegister] = useState<boolean>(initialMode === 'register');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedState, setSelectedState] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useModalBehavior(isOpen, onClose);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessNotice(null);
      if (initialMode) {
        setIsRegister(initialMode === 'register');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const states = Object.keys(NIGERIAN_STATES_DATA);

  const t = {
    pidgin: {
      title: isRegister ? 'Create Free Account' : 'Sign In to NaijaHealth',
      subtitle: 'Unlock free AI triage, 774 LGA hospital routing, and chemist drug guide',
      tabPhone: 'Phone Number',
      tabEmail: 'Email & Password',
      tabGuest: 'Quick 1-Tap Entry',
      phoneLabel: 'Nigerian Phone Number',
      phonePlaceholder: 'e.g. 08012345678 or 09033445566',
      nameLabel: 'Your Name (Optional)',
      namePlaceholder: 'e.g. Chinedu or Amina',
      emailLabel: 'Email Address',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      stateLabel: 'Your Nigerian State',
      submitPhone: isRegister ? 'Register with Phone' : 'Sign In with Phone',
      submitEmail: isRegister ? 'Create My Account' : 'Sign In Now',
      submitGuest: 'Enter Instantly as Guest',
      guestDesc: 'Want to test or have an urgent health question right now? Jump straight in with one tap.',
      toggleToRegister: "Don't have an account yet? Create free account",
      toggleToSignIn: 'Already have an account? Sign in here',
      freeNotice: '100% Free · No ATM Card Required · Fast & Private',
    },
    english: {
      title: isRegister ? 'Create Free Patient Account' : 'Sign In to NaijaHealth AI',
      subtitle: 'Access 24/7 multilingual symptom triage, verified hospitals & medicine guide',
      tabPhone: 'Phone Number',
      tabEmail: 'Email & Password',
      tabGuest: '1-Click Guest',
      phoneLabel: 'Nigerian Mobile Number',
      phonePlaceholder: 'e.g. 08012345678 or +2348012345678',
      nameLabel: 'Full Name (Optional)',
      namePlaceholder: 'e.g. Emeka Bello',
      emailLabel: 'Email Address',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Minimum 6 characters',
      stateLabel: 'Primary State',
      submitPhone: isRegister ? 'Register Phone Account' : 'Sign In with Phone',
      submitEmail: isRegister ? 'Create Account' : 'Sign In',
      submitGuest: 'Enter Instantly as Guest',
      guestDesc: 'Immediate symptom check needed? Start right away with one click.',
      toggleToRegister: "New to NaijaHealth AI? Create a free account",
      toggleToSignIn: 'Already registered? Sign in here',
      freeNotice: '100% Free Public Service · No payment required · NDPA Compliant',
    },
    hausa: {
      title: isRegister ? 'Bude Sabon Asusun Kyauta' : 'Shiga NaijaHealth AI',
      subtitle: 'Samun cikakken taimakon lafiya, asibitocin jihohi da magunguna',
      tabPhone: 'Lambar Wayar Salula',
      tabEmail: 'Imel da Kalmar Sirri',
      tabGuest: 'Shiga Kai Tsaye',
      phoneLabel: 'Lambar Wayar Najeriya',
      phonePlaceholder: 'Misali: 08012345678',
      nameLabel: 'Sunanka (Ba dole ba)',
      namePlaceholder: 'Misali: Ibrahim ko Fatima',
      emailLabel: 'Adireshin Imel',
      emailPlaceholder: 'suna@misali.com',
      passwordLabel: 'Kalmar Sirri',
      passwordPlaceholder: 'Aƙalla haruffa 6',
      stateLabel: 'Jiharka',
      submitPhone: isRegister ? 'Bude Asusu da Waya' : 'Shiga da Waya',
      submitEmail: isRegister ? 'Bude Asusu' : 'Shiga Yanzu',
      submitGuest: 'Shiga Kai Tsaye Nan Take',
      guestDesc: 'Kuna son duba lafiya da gaggawa? Danna don shiga nan take.',
      toggleToRegister: 'Ba ka da asusu? Bude sabo kyauta',
      toggleToSignIn: 'Kuna da asusu a baya? Shiga nan',
      freeNotice: 'Kyauta 100% · Ba a bukatar katin kudi',
    },
    yoruba: {
      title: isRegister ? 'Ṣẹda Akọọlẹ Ọfẹ' : 'Wọle si NaijaHealth AI',
      subtitle: 'Ṣii gbogbo awọn ẹya ìtọ́jú ìlera, ilé-ìwòsàn ati oogun ọfẹ',
      tabPhone: 'Nọmba Foonu',
      tabEmail: 'Imeeli & Ọrọigbaniwọle',
      tabGuest: 'Wọle Lẹsẹkẹsẹ',
      phoneLabel: 'Nọmba Foonu Naijiria',
      phonePlaceholder: 'Àpẹẹrẹ: 08012345678',
      nameLabel: 'Orukọ Rẹ (Ti o ba fẹ)',
      namePlaceholder: 'Àpẹẹrẹ: Adebayo tabi Folake',
      emailLabel: 'Adirẹsi Imeeli',
      emailPlaceholder: 'oruko@apere.com',
      passwordLabel: 'Ọrọigbaniwọle',
      passwordPlaceholder: 'O kere ju lẹta 6',
      stateLabel: 'Ìpínlẹ̀ Rẹ',
      submitPhone: isRegister ? 'Forukọsilẹ pẹlu Foonu' : 'Wọle pẹlu Foonu',
      submitEmail: isRegister ? 'Ṣẹda Akọọlẹ' : 'Wọle Bayi',
      submitGuest: 'Wọle Lẹsẹkẹsẹ lai Duro',
      guestDesc: 'Ṣe o nilo ayẹwo ara pajawiri? Wọle lẹsẹkẹsẹ pẹlu tẹ ẹyọkan.',
      toggleToRegister: 'Ṣe o jẹ tuntun? Ṣẹda akọọlẹ ọfẹ nibi',
      toggleToSignIn: 'Ṣe o ti ni akọọlẹ tẹlẹ? Wọle nibi',
      freeNotice: 'Ọfẹ 100% · Ko si owo kankan',
    },
    igbo: {
      title: isRegister ? 'Mepụta Akaụntụ N\'efu' : 'Banye na NaijaHealth AI',
      subtitle: 'Nweta nlekọta ahụike niile, ụlọ ọgwụ na ọgwụ akwadoro n\'efu',
      tabPhone: 'Nọmba Ekwentị',
      tabEmail: 'Email na Okwuntụkwasị',
      tabGuest: 'Banye Ozugbo',
      phoneLabel: 'Nọmba Ekwentị Naịjirịa',
      phonePlaceholder: 'Dịka: 08012345678',
      nameLabel: 'Aha Gị (Ọ bụrụ na ị chọrọ)',
      namePlaceholder: 'Dịka: Obinna ma ọ bụ Ngozi',
      emailLabel: 'Adreesị Email',
      emailPlaceholder: 'aha@ihe.com',
      passwordLabel: 'Okwuntụkwasị',
      passwordPlaceholder: 'Ọ dịkarịa ala mkpụrụedemede 6',
      stateLabel: 'Steeti Gị',
      submitPhone: isRegister ? 'Debanye aha na Ekwentị' : 'Banye na Ekwentị',
      submitEmail: isRegister ? 'Mepụta Akaụntụ' : 'Banye Ugbu A',
      submitGuest: 'Banye Ozugbo n\'Enweghị Nchekasị',
      guestDesc: 'Ị chọrọ inyocha ahụike ngwa ngwa? Pịa banye ozugbo.',
      toggleToRegister: 'Ị nwebeghị akaụntụ? Mepụta otu n\'efu',
      toggleToSignIn: 'Ị nwere akaụntụ ugbua? Banye ebe a',
      freeNotice: 'N\'efu 100% · Enweghị kaadị akụ achọrọ',
    },
  }[selectedLanguage] || {
    title: 'Sign In to NaijaHealth AI',
    subtitle: 'Unlock free AI triage, 774 LGA hospital routing, and chemist drug guide',
    tabPhone: 'Phone Number',
    tabEmail: 'Email & Password',
    tabGuest: 'Quick 1-Tap Entry',
    phoneLabel: 'Nigerian Phone Number',
    phonePlaceholder: 'e.g. 08012345678',
    nameLabel: 'Your Name (Optional)',
    namePlaceholder: 'e.g. Chinedu',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    stateLabel: 'Your Nigerian State',
    submitPhone: 'Sign In with Phone',
    submitEmail: 'Sign In',
    submitGuest: 'Enter Instantly as Guest',
    guestDesc: 'Want to test or have an urgent question? Start right away with one click.',
    toggleToRegister: "Don't have an account? Create one free",
    toggleToSignIn: 'Already have an account? Sign in',
    freeNotice: '100% Free · Fast & Private',
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = await signInWithPhone(phoneNumber, fullName, selectedState);
      setSuccessNotice('Signed in successfully! Unlocking full application...');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Phone sign-in failed. Please verify your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = isRegister
        ? await registerWithEmail(email, password, fullName, selectedState)
        : await signInWithEmail(email, password);

      setSuccessNotice('Welcome! Unlocking full application...');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = await signInAsGuest(selectedState);
      setSuccessNotice('Guest session activated! Welcome...');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to start guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 500 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Head */}
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandMark size="sm" />
            <div>
              <h2 id="auth-modal-title" style={{ fontSize: 18, color: 'var(--ink)' }}>
                {t.title}
              </h2>
              <p className="sub" style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
                {t.subtitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close" aria-label="Close dialog">
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        {/* Feature Hint Banner if opened from specific feature click */}
        {featureHint && (
          <div
            style={{
              margin: '0 20px 10px',
              padding: '8px 12px',
              background: 'var(--brand-soft)',
              border: '1px solid var(--brand)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--brand-ink)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-brand" />
            <span>
              Sign in or enter as guest to access: <b>{featureHint}</b>
            </span>
          </div>
        )}

        {/* Tabs for Phone vs Email vs Guest */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--line)',
            background: 'var(--surface-2)',
            padding: '4px 16px',
            gap: 6,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthTab('phone');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '9px 10px',
              fontSize: 12.5,
              fontWeight: 650,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 8,
              border: authTab === 'phone' ? '1px solid var(--brand)' : '1px solid transparent',
              background: authTab === 'phone' ? 'var(--surface)' : 'transparent',
              color: authTab === 'phone' ? 'var(--brand-ink)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Phone className="w-3.5 h-3.5" />
            {t.tabPhone}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab('email');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '9px 10px',
              fontSize: 12.5,
              fontWeight: 650,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 8,
              border: authTab === 'email' ? '1px solid var(--brand)' : '1px solid transparent',
              background: authTab === 'email' ? 'var(--surface)' : 'transparent',
              color: authTab === 'email' ? 'var(--brand-ink)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Mail className="w-3.5 h-3.5" />
            {t.tabEmail}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab('guest');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '9px 10px',
              fontSize: 12.5,
              fontWeight: 650,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 8,
              border: authTab === 'guest' ? '1px solid var(--brand)' : '1px solid transparent',
              background: authTab === 'guest' ? 'var(--surface)' : 'transparent',
              color: authTab === 'guest' ? 'var(--brand-ink)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.tabGuest}
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px' }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: 14,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--danger-soft)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div
              style={{
                marginBottom: 14,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--brand-soft)',
                border: '1px solid var(--brand)',
                color: 'var(--brand-ink)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Phone Tab */}
          {authTab === 'phone' && (
            <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 5 }}>
                  {t.phoneLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    className="w-4 h-4"
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }}
                  />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="input"
                    style={{
                      width: '100%',
                      paddingLeft: 38,
                      height: 42,
                      fontSize: 14,
                      borderRadius: 8,
                      border: '1px solid var(--line-strong)',
                      background: 'var(--surface)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 5 }}>
                  {t.nameLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    className="w-4 h-4"
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }}
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="input"
                    style={{
                      width: '100%',
                      paddingLeft: 38,
                      height: 42,
                      fontSize: 14,
                      borderRadius: 8,
                      border: '1px solid var(--line-strong)',
                      background: 'var(--surface)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 5 }}>
                  {t.stateLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    className="w-4 h-4"
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }}
                  />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="input"
                    style={{
                      width: '100%',
                      paddingLeft: 38,
                      height: 42,
                      fontSize: 14,
                      borderRadius: 8,
                      border: '1px solid var(--line-strong)',
                      background: 'var(--surface)',
                    }}
                  >
                    {states.map((st) => (
                      <option key={st} value={st}>
                        {st} State
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: 44,
                  fontSize: 14,
                  fontWeight: 650,
                  marginTop: 6,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t.submitPhone}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Email Tab */}
          {authTab === 'email' && (
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 5 }}>
                    {t.nameLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      className="w-4 h-4"
                      style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }}
                    />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="input"
                      style={{
                        width: '100%',
                        paddingLeft: 38,
                        height: 42,
                        fontSize: 14,
                        borderRadius: 8,
                        border: '1px solid var(--line-strong)',
                        background: 'var(--surface)',
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 5 }}>
                  {t.emailLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    className="w-4 h-4"
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="input"
                    style={{
                      width: '100%',
                      paddingLeft: 38,
                      height: 42,
                      fontSize: 14,
                      borderRadius: 8,
                      border: '1px solid var(--line-strong)',
                      background: 'var(--surface)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 5 }}>
                  {t.passwordLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    className="w-4 h-4"
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }}
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="input"
                    style={{
                      width: '100%',
                      paddingLeft: 38,
                      height: 42,
                      fontSize: 14,
                      borderRadius: 8,
                      border: '1px solid var(--line-strong)',
                      background: 'var(--surface)',
                    }}
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 5 }}>
                    {t.stateLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin
                      className="w-4 h-4"
                      style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }}
                    />
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="input"
                      style={{
                        width: '100%',
                        paddingLeft: 38,
                        height: 42,
                        fontSize: 14,
                        borderRadius: 8,
                        border: '1px solid var(--line-strong)',
                        background: 'var(--surface)',
                      }}
                    >
                      {states.map((st) => (
                        <option key={st} value={st}>
                          {st} State
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: 44,
                  fontSize: 14,
                  fontWeight: 650,
                  marginTop: 6,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t.submitEmail}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg(null);
                }}
                style={{
                  fontSize: 12.5,
                  color: 'var(--brand)',
                  fontWeight: 600,
                  textAlign: 'center',
                  padding: 4,
                  cursor: 'pointer',
                }}
              >
                {isRegister ? t.toggleToSignIn : t.toggleToRegister}
              </button>
            </form>
          )}

          {/* Quick Guest Tab */}
          {authTab === 'guest' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
              <div
                style={{
                  padding: '16px',
                  background: 'var(--surface-2)',
                  borderRadius: 12,
                  border: '1px solid var(--line)',
                }}
              >
                <Sparkles className="w-8 h-8 text-brand" style={{ margin: '0 auto 8px', color: 'var(--brand)' }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                  Instant Guest Access
                </h4>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  {t.guestDesc}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 5, textAlign: 'left' }}>
                  {t.stateLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    className="w-4 h-4"
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }}
                  />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="input"
                    style={{
                      width: '100%',
                      paddingLeft: 38,
                      height: 42,
                      fontSize: 14,
                      borderRadius: 8,
                      border: '1px solid var(--line-strong)',
                      background: 'var(--surface)',
                    }}
                  >
                    {states.map((st) => (
                      <option key={st} value={st}>
                        {st} State
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleGuestSubmit}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: 44,
                  fontSize: 14,
                  fontWeight: 650,
                  marginTop: 6,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t.submitGuest}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Modal Foot */}
        <div
          style={{
            borderTop: '1px solid var(--line)',
            padding: '12px 20px',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--muted)',
          }}
        >
          <ShieldCheck className="w-4 h-4 text-brand" style={{ color: 'var(--brand)' }} />
          <span>{t.freeNotice}</span>
        </div>
      </div>
    </div>
  );
};
