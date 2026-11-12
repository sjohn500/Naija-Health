import React from 'react';
import {
  AlertTriangle,
  Building2,
  BookOpen,
  MapPin,
  Globe,
  Share2,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Lock,
  Pill,
  User,
  LogOut,
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { TRANSLATIONS } from '../data/localization';
import { privateUi } from '../data/privateCare';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/triage';
import { AppUser } from '../types/auth';
import { BrandMark } from './BrandMark';

interface HeaderProps {
  selectedState: string;
  onSelectState: (state: string) => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenEmergency: () => void;
  onOpenHospitals: () => void;
  onOpenFirstAid: () => void;
  onOpenPrivate: () => void;
  onOpenPharmacy?: () => void;
  currentUser?: AppUser | null;
  onSignOut?: () => void;
  onOpenAuth?: () => void;
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
  onOpenPrivate,
  onOpenPharmacy,
  currentUser,
  onSignOut,
  onOpenAuth,
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
  const pui = privateUi(selectedLanguage);
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
          <BrandMark size="sm" />
          <span className="brand-name">
            <b>NaijaHealth</b>
            <span>AI Triage</span>
          </span>
        </a>

        <nav className="nav" aria-label="Primary">
          <button type="button" onClick={onOpenHospitals}>
            {t.hospitals}
          </button>
          <button type="button" onClick={onOpenFirstAid}>
            {t.firstAid}
          </button>
          {onOpenPharmacy && (
            <button type="button" onClick={onOpenPharmacy}>
              {t.pharmacy}
            </button>
          )}
          <button type="button" onClick={onOpenPrivate}>
            {pui.entryTitle}
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
              <Globe className="w-3.5 h-3.5" strokeWidth={2} style={{ opacity: 0.7 }} />
              <span className="select-value">{currentLang.localName}</span>
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
              <MapPin className="w-3.5 h-3.5" strokeWidth={2} style={{ opacity: 0.7 }} />
              <span className="select-value">{selectedState}</span>
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
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" strokeWidth={2} />
            ) : (
              <Moon className="w-4 h-4" strokeWidth={2} />
            )}
          </button>

          {currentUser ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 8,
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                fontSize: 12.5,
                color: 'var(--ink)',
              }}
            >
              <User className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
              <span
                style={{
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {currentUser.phone || currentUser.displayName || currentUser.email || 'User'}
              </span>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign out / Exit"
                  aria-label="Sign out"
                  style={{
                    color: 'var(--muted)',
                    marginLeft: 2,
                    padding: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : onOpenAuth ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 8, padding: '5px 12px', fontSize: 12.5, fontWeight: 650 }}
            >
              Sign In
            </button>
          ) : null}

          <button
            type="button"
            className="btn-emg"
            onClick={onOpenEmergency}
            aria-label={t.emergencyBtn}
            title={t.emergencyBtn}
          >
            <AlertTriangle className="w-4 h-4" strokeWidth={2.2} />
            <span className="emg-label">{t.emergencyBtn}</span>
          </button>

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
        {currentUser ? (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              <div>
                <b style={{ fontSize: 13, color: 'var(--ink)', display: 'block' }}>
                  {currentUser.phone || currentUser.displayName || currentUser.email || 'User'}
                </b>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Active {currentUser.authMethod.toUpperCase()} Session
                </span>
              </div>
            </div>
            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  setMobileOpen(false);
                }}
                className="btn btn-outline btn-sm"
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                Sign Out
              </button>
            )}
          </div>
        ) : onOpenAuth ? (
          <button
            type="button"
            className="mobile-nav-item"
            style={{ color: 'var(--brand)', fontWeight: 700 }}
            onClick={() => {
              onOpenAuth();
              setMobileOpen(false);
            }}
          >
            <User className="w-4 h-4" strokeWidth={2.2} />
            Sign In / Register Free
          </button>
        ) : null}

        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => {
            onOpenHospitals();
            setMobileOpen(false);
          }}
        >
          <Building2 className="w-4 h-4" strokeWidth={2} />
          {t.hospitals}
        </button>
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => {
            onOpenFirstAid();
            setMobileOpen(false);
          }}
        >
          <BookOpen className="w-4 h-4" strokeWidth={2} />
          {t.firstAid}
        </button>
        {onOpenPharmacy && (
          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => {
              onOpenPharmacy();
              setMobileOpen(false);
            }}
          >
            <Pill className="w-4 h-4" strokeWidth={2} />
            {t.pharmacy}
          </button>
        )}
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => {
            onOpenPrivate();
            setMobileOpen(false);
          }}
        >
          <Lock className="w-4 h-4" strokeWidth={2} />
          {pui.entryTitle}
        </button>
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => {
            onOpenEmergency();
            setMobileOpen(false);
          }}
        >
          <AlertTriangle className="w-4 h-4" strokeWidth={2} style={{ color: 'var(--danger)' }} />
          {t.emergencyBtn}
        </button>
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => {
            handleCopyAppUrl();
            setMobileOpen(false);
          }}
        >
          <Share2 className="w-4 h-4" strokeWidth={2} />
          {copied ? t.linkCopied : t.shareApp}
        </button>

        <div className="row">
          <div
            className="select"
            data-open={openMenu === 'lang' ? 'true' : 'false'}
            onClick={stop}
          >
            <button
              type="button"
              className="select-btn"
              aria-expanded={openMenu === 'lang'}
              onClick={() => setOpenMenu(openMenu === 'lang' ? null : 'lang')}
            >
              <span className="select-value">{currentLang.localName}</span>
              <ChevronDown className="chev" width={14} height={14} strokeWidth={2.4} />
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
              <ChevronDown className="chev" width={14} height={14} strokeWidth={2.4} />
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
