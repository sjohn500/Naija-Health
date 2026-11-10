import React from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Building2,
  BookOpen,
  MapPin,
  Globe,
  Share2,
  Check,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { TRANSLATIONS } from '../data/localization';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/triage';

interface HeaderProps {
  selectedState: string;
  onSelectState: (state: string) => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenEmergency: () => void;
  onOpenHospitals: () => void;
  onOpenFirstAid: () => void;
}

const Tick: React.FC = () => (
  <span className="tick">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </span>
);

export const Header: React.FC<HeaderProps> = ({
  selectedState,
  onSelectState,
  selectedLanguage,
  onSelectLanguage,
  onOpenEmergency,
  onOpenHospitals,
  onOpenFirstAid,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<'lang' | 'state' | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = window.localStorage.getItem('nh-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignore */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const states = Object.keys(NIGERIAN_STATES_DATA);
  const t = TRANSLATIONS[selectedLanguage]?.header || TRANSLATIONS.pidgin.header;
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('nh-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  React.useEffect(() => {
    const close = () => setOpenMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleCopyAppUrl = () => {
    const url = window.location.href.split('?')[0];
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <header className="site-header">
      <div className="hdr">
        <a className="brand" href="#main" aria-label="NaijaHealth AI home">
          <span className="brand-mark" aria-hidden="true">
            <HeartPulse className="w-5 h-5" strokeWidth={2.1} />
          </span>
          <span className="brand-name">
            <b>NaijaHealth</b>
            <span>AI Triage</span>
          </span>
        </a>

        <span className="hdr-sep" aria-hidden="true" />
        <span className="badge-gov">
          <i aria-hidden="true" />
          {t.badge}
        </span>

        <nav className="nav" aria-label="Primary">
          <button type="button" onClick={onOpenHospitals}>
            {t.hospitals}
          </button>
          <button type="button" onClick={onOpenFirstAid}>
            {t.firstAid}
          </button>
          <button type="button" onClick={handleCopyAppUrl}>
            {copied ? t.linkCopied : t.shareApp}
          </button>
        </nav>

        <div className="hdr-right">
          {/* Language */}
          <div
            className="select"
            data-open={openMenu === 'lang' ? 'true' : 'false'}
            onClick={stop}
          >
            <button
              type="button"
              className="select-btn"
              aria-haspopup="listbox"
              aria-expanded={openMenu === 'lang'}
              aria-label={`Language: ${currentLang.name}`}
              onClick={() => setOpenMenu(openMenu === 'lang' ? null : 'lang')}
            >
              <Globe className="w-4 h-4" strokeWidth={2} style={{ opacity: 0.65 }} />
              <span className="select-value">{currentLang.name}</span>
              <ChevronDown className="chev" width={14} height={14} strokeWidth={2.4} />
            </button>
            <div className="select-menu" role="listbox" aria-label="Choose language">
              <div className="menu-label">Choose language</div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={lang.code === selectedLanguage}
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    setOpenMenu(null);
                  }}
                >
                  <span aria-hidden="true">{lang.flag}</span>
                  {lang.name}
                  {lang.code === selectedLanguage && <Tick />}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div
            className="select"
            data-open={openMenu === 'state' ? 'true' : 'false'}
            onClick={stop}
          >
            <button
              type="button"
              className="select-btn"
              aria-haspopup="listbox"
              aria-expanded={openMenu === 'state'}
              aria-label={`State: ${selectedState}`}
              onClick={() => setOpenMenu(openMenu === 'state' ? null : 'state')}
            >
              <MapPin className="w-4 h-4" strokeWidth={2} style={{ opacity: 0.65 }} />
              <span className="select-value">
                {selectedState} {t.stateSuffix}
              </span>
              <ChevronDown className="chev" width={14} height={14} strokeWidth={2.4} />
            </button>
            <div className="select-menu" role="listbox" aria-label="Choose state">
              <div className="menu-label">All 36 states + FCT</div>
              {states.map((st) => (
                <button
                  key={st}
                  type="button"
                  role="option"
                  aria-selected={st === selectedState}
                  onClick={() => {
                    onSelectState(st);
                    setOpenMenu(null);
                  }}
                >
                  {st} {t.stateSuffix}
                  {st === selectedState && <Tick />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4" strokeWidth={2} />
            ) : (
              <Sun className="w-4 h-4" strokeWidth={2} />
            )}
          </button>

          <a className="btn-emg" href="tel:112" title={t.emergencyBtn}>
            <AlertTriangle className="w-4 h-4" strokeWidth={2.2} />
            <span className="emg-label">{t.emergencyBtn}</span>
          </a>

          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-4 h-4" strokeWidth={2.2} />
            ) : (
              <Menu className="w-4 h-4" strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>

      <div className="mobile-panel" data-open={mobileOpen ? 'true' : 'false'}>
        <button
          type="button"
          onClick={() => {
            onOpenHospitals();
            setMobileOpen(false);
          }}
        >
          <Building2 className="w-4 h-4 inline mr-2" strokeWidth={2} />
          {t.hospitals}
        </button>
        <button
          type="button"
          onClick={() => {
            onOpenFirstAid();
            setMobileOpen(false);
          }}
        >
          <BookOpen className="w-4 h-4 inline mr-2" strokeWidth={2} />
          {t.firstAid}
        </button>
        <button
          type="button"
          onClick={() => {
            onOpenEmergency();
            setMobileOpen(false);
          }}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" strokeWidth={2} />
          {t.emergencyBtn}
        </button>
        <button
          type="button"
          onClick={() => {
            handleCopyAppUrl();
            setMobileOpen(false);
          }}
        >
          <Share2 className="w-4 h-4 inline mr-2" strokeWidth={2} />
          {copied ? t.linkCopied : t.shareApp}
        </button>

        <div className="row">
          <div
            className="select"
            data-open={openMenu === 'lang' ? 'true' : 'false'}
            style={{ flex: 1 }}
            onClick={stop}
          >
            <button
              type="button"
              className="select-btn"
              aria-expanded={openMenu === 'lang'}
              onClick={() => setOpenMenu(openMenu === 'lang' ? null : 'lang')}
            >
              <span className="select-value">{currentLang.name}</span>
              <span style={{ marginLeft: 'auto', opacity: 0.55 }}>Language</span>
            </button>
            <div className="select-menu" role="listbox">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={lang.code === selectedLanguage}
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    setOpenMenu(null);
                  }}
                >
                  <span aria-hidden="true">{lang.flag}</span>
                  {lang.name}
                  {lang.code === selectedLanguage && <Tick />}
                </button>
              ))}
            </div>
          </div>

          <div
            className="select"
            data-open={openMenu === 'state' ? 'true' : 'false'}
            style={{ flex: 1 }}
            onClick={stop}
          >
            <button
              type="button"
              className="select-btn"
              aria-expanded={openMenu === 'state'}
              onClick={() => setOpenMenu(openMenu === 'state' ? null : 'state')}
            >
              <span className="select-value">
                {selectedState} {t.stateSuffix}
              </span>
              <span style={{ marginLeft: 'auto', opacity: 0.55 }}>State</span>
            </button>
            <div className="select-menu" role="listbox">
              {states.map((st) => (
                <button
                  key={st}
                  type="button"
                  role="option"
                  aria-selected={st === selectedState}
                  onClick={() => {
                    onSelectState(st);
                    setOpenMenu(null);
                  }}
                >
                  {st} {t.stateSuffix}
                  {st === selectedState && <Tick />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
