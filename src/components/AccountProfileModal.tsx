import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  UserCheck,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  Globe,
  CheckCircle2,
  Trash2,
  LogOut,
  LogIn,
  ClipboardList,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Building2,
  Lock,
  MessageSquare,
  Mic,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/triage';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { ACCOUNT_LOCALIZATION } from '../data/accountLocalization';
import {
  UserPrivateProfile,
  SavedCheckupRecord,
  SCHEMA_LIMITS,
  validateProfileInput,
  signInWithGooglePopup,
  signOutUser,
  ensureUserAccountAnchor,
  ensureAccountAndSaveProfile,
  deletePrivateProfile,
  deleteSavedCheckup,
  parseFirebaseErrorMessage,
  getQuotaUpgradeUrl,
  SaveProfileInput,
} from '../services/userAccountService';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isAuthReady: boolean;
  profile: UserPrivateProfile | null;
  savedCheckups: SavedCheckupRecord[];
  selectedState: string;
  selectedLanguage: SupportedLanguage;
  initialTab?: 'profile' | 'checkups';
  externalError?: string | null;
  chatGateActive?: boolean;
  pendingChatPrompt?: string | null;
  pendingVoice?: boolean;
  onContinueChatAfterAuth?: (authenticatedUser: User) => void;
  onProfileSaved: (saved: UserPrivateProfile) => void;
  onProfileDeleted: () => void;
  onLoadCheckup: (record: SavedCheckupRecord) => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  isAuthReady,
  profile,
  savedCheckups,
  selectedState,
  selectedLanguage,
  initialTab = 'profile',
  externalError = null,
  chatGateActive = false,
  pendingChatPrompt = null,
  pendingVoice = false,
  onContinueChatAfterAuth,
  onProfileSaved,
  onProfileDeleted,
  onLoadCheckup,
}) => {
  const al = ACCOUNT_LOCALIZATION[selectedLanguage] || ACCOUNT_LOCALIZATION.pidgin;
  const states = Object.keys(NIGERIAN_STATES_DATA);

  const [activeTab, setActiveTab] = useState<'profile' | 'checkups'>(initialTab);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [preferredState, setPreferredState] = useState(selectedState);
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>(selectedLanguage);

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [deletingCheckupId, setDeletingCheckupId] = useState<string | null>(null);

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFeedbackError(null);
      setFeedbackSuccess(null);
      setIsQuotaError(false);
    }
  }, [isOpen, initialTab]);

  // Populate form from Firestore profile or Auth user when modal opens or profile arrives
  useEffect(() => {
    if (!isOpen) return;
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setEmail(profile.email || user?.email || '');
      setPhone((prev) => profile.phone || prev || '');
      setEmergencyContactPhone((prev) => profile.emergencyContactPhone || prev || '');
      setPreferredState(
        NIGERIAN_STATES_DATA[profile.preferredState] ? profile.preferredState : selectedState
      );
      setPreferredLanguage(profile.preferredLanguage || selectedLanguage);
    } else if (user) {
      setDisplayName((prev) => prev || user.displayName || '');
      setEmail((prev) => prev || user.email || '');
      setPreferredState((prev) => prev || selectedState);
      setPreferredLanguage((prev) => prev || selectedLanguage);
    } else {
      setPreferredState(selectedState);
      setPreferredLanguage(selectedLanguage);
    }
  }, [isOpen, profile, user, selectedState, selectedLanguage]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mapServiceError = (err: unknown): string => {
    if (err instanceof Error && err.message.startsWith('VALIDATION_')) {
      const key = err.message.replace('VALIDATION_', '') as keyof typeof al.errors;
      return al.errors[key] || al.errors.unknown;
    }
    const parsed = parseFirebaseErrorMessage(err);
    if (parsed.kind === 'quota') {
      setIsQuotaError(true);
      return al.errors.quotaExceeded;
    }
    if (parsed.kind === 'popup_closed') return al.errors.popupClosed;
    if (parsed.kind === 'popup_blocked') return al.errors.popupBlocked;
    if (parsed.kind === 'unverified') return al.errors.unverified;
    if (parsed.kind === 'permission') return al.errors.permission;
    return al.errors.unknown;
  };

  const handleGoogleSignIn = async (alsoSaveDraft: boolean) => {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setIsQuotaError(false);

    if (alsoSaveDraft) {
      const check = validateProfileInput({
        displayName: displayName.trim() || 'NaijaHealth User',
        email: email.trim() || 'placeholder@example.com',
        phone,
        emergencyContactPhone,
        preferredState,
        preferredLanguage,
      });
      if (!check.valid) {
        setFeedbackError(al.errors[check.errorKey || 'invalidPhone']);
        return;
      }
    }

    setIsSigningIn(true);
    try {
      const signedInUser = await signInWithGooglePopup();
      if (alsoSaveDraft) {
        const draftPayload: SaveProfileInput = {
          displayName: displayName.trim() || signedInUser.displayName || 'NaijaHealth User',
          email: email.trim() || signedInUser.email || '',
          phone,
          emergencyContactPhone,
          preferredState,
          preferredLanguage,
        };
        const saved = await ensureAccountAndSaveProfile(signedInUser, draftPayload);
        onProfileSaved(saved);
        if (chatGateActive && onContinueChatAfterAuth) {
          onContinueChatAfterAuth(signedInUser);
          return;
        }
        setFeedbackSuccess(al.profileSavedMsg);
      } else {
        await ensureUserAccountAnchor(signedInUser);
        if (chatGateActive && onContinueChatAfterAuth) {
          onContinueChatAfterAuth(signedInUser);
          return;
        }
      }
    } catch (err) {
      setFeedbackError(mapServiceError(err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setIsQuotaError(false);

    if (!user) {
      await handleGoogleSignIn(true);
      return;
    }

    const input: SaveProfileInput = {
      displayName: displayName.trim() || user.displayName || '',
      email: email.trim() || user.email || '',
      phone,
      emergencyContactPhone,
      preferredState,
      preferredLanguage,
    };

    const validation = validateProfileInput(input);
    if (!validation.valid) {
      setFeedbackError(al.errors[validation.errorKey || 'invalidEmail']);
      return;
    }

    setIsSaving(true);
    try {
      const saved = await ensureAccountAndSaveProfile(user, input);
      onProfileSaved(saved);
      if (chatGateActive && onContinueChatAfterAuth) {
        onContinueChatAfterAuth(user);
        return;
      }
      setFeedbackSuccess(al.profileSavedMsg);
    } catch (err) {
      setFeedbackError(mapServiceError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setIsQuotaError(false);
    setIsDeletingProfile(true);
    try {
      await deletePrivateProfile(user.uid);
      setPhone('');
      setEmergencyContactPhone('');
      onProfileDeleted();
      setFeedbackSuccess(al.profileDeletedMsg);
    } catch (err) {
      setFeedbackError(mapServiceError(err));
    } finally {
      setIsDeletingProfile(false);
    }
  };

  const handleSignOut = async () => {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setDisplayName('');
    setEmail('');
    setPhone('');
    setEmergencyContactPhone('');
    await signOutUser();
  };

  const handleDeleteCheckup = async (checkupId: string) => {
    if (!user) return;
    setFeedbackError(null);
    setDeletingCheckupId(checkupId);
    try {
      await deleteSavedCheckup(user.uid, checkupId);
    } catch (err) {
      setFeedbackError(mapServiceError(err));
    } finally {
      setDeletingCheckupId(null);
    }
  };

  const externalQuotaDetected =
    Boolean(externalError && externalError.toLowerCase().includes('quota exceeded')) || isQuotaError;

  const hasDraftFields = Boolean(email.trim() || phone.trim() || emergencyContactPhone.trim());

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 660 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="ico" aria-hidden="true">
            <UserCheck className="w-5 h-5" strokeWidth={2} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 id="account-modal-title">
                {!user && chatGateActive ? al.chatGate.modalTitle : al.modalTitle}
              </h2>
              <span
                className="sev is-ok"
                style={{ marginLeft: 0, fontSize: 10.5, padding: '2px 8px' }}
              >
                {al.freeTierBadge}
              </span>
            </div>
            <p className="sub">
              {!user && chatGateActive ? al.chatGate.modalSubtitle : al.modalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label="Close account dialog"
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal-body">
          {/* Chat Gate Prompt when triggered by unauthenticated chat attempt */}
          {!user && chatGateActive && (
            <div
              className="sheet"
              style={{
                background: 'var(--brand-soft)',
                borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)',
              }}
            >
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--brand-ink)' }}>
                <MessageSquare className="w-4 h-4" style={{ color: 'var(--brand)' }} strokeWidth={2.2} />
                {al.chatGate.inlineTitle}
              </h3>
              <p style={{ color: 'var(--ink-2)' }}>{al.chatGate.modalBannerDesc}</p>
              {pendingChatPrompt ? (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 10px',
                    borderRadius: 9,
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    fontSize: 12.5,
                    color: 'var(--ink)',
                  }}
                >
                  <span style={{ color: 'var(--muted)', fontWeight: 600, marginRight: 6 }}>
                    {al.chatGate.pendingPrefix}
                  </span>
                  “{pendingChatPrompt}”
                </div>
              ) : pendingVoice ? (
                <div
                  style={{
                    marginTop: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--brand)',
                  }}
                >
                  <Mic className="w-3.5 h-3.5" strokeWidth={2.2} />
                  {al.chatGate.modalPendingVoice}
                </div>
              ) : null}
            </div>
          )}

          {/* Cost + Privacy Banner */}
          <div className="sheet">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--brand)' }}>
              <ShieldCheck className="w-4 h-4" strokeWidth={2.2} />
              {al.freeTierBadge}
            </h3>
            <p>{al.privacyNote}</p>
            <p style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
              <Lock className="w-3 h-3 inline mr-1" strokeWidth={2.2} />
              {al.noSmsChargeNote}
            </p>
          </div>

          {/* Auth Status Strip */}
          {!isAuthReady ? (
            <div className="row-card" style={{ cursor: 'default' }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--brand)' }} />
              <div className="rc-body">
                <b>Checking session...</b>
              </div>
            </div>
          ) : user ? (
            <div
              className="row-card"
              style={{
                cursor: 'default',
                background: 'var(--brand-soft)',
                borderColor: 'color-mix(in srgb, var(--brand) 25%, transparent)',
                flexWrap: 'wrap',
              }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--brand)', flex: 'none' }} />
              <div className="rc-body">
                <b>
                  {al.signedInLabel}: {user.displayName || user.email}
                </b>
                <span>{user.email}</span>
              </div>
              <button type="button" onClick={handleSignOut} className="btn btn-outline btn-sm">
                <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
                {al.signOutCta}
              </button>
            </div>
          ) : (
            <div className="sheet" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(false)}
                  disabled={isSigningIn}
                  className="btn btn-primary btn-sm"
                  style={{ minHeight: 42 }}
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {al.signingIn}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" strokeWidth={2.2} />
                      {chatGateActive ? al.chatGate.loginAndChatCta : al.signInCta}
                    </>
                  )}
                </button>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Google Sign-In · $0 Spark Tier
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: 0 }}>
                {al.emailPasswordTip}
              </p>
            </div>
          )}

          {/* Quota / Error Alerts */}
          {(feedbackError || externalError) && (
            <div className="sheet is-danger">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
                <AlertTriangle className="w-4 h-4" strokeWidth={2.2} />
                {feedbackError || al.errors.quotaExceeded}
              </h3>
              {externalQuotaDetected && (
                <p style={{ marginTop: 6 }}>
                  <a
                    href={getQuotaUpgradeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      color: 'var(--brand)',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    Open Firebase Firestore Quota &amp; Plan Details
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </p>
              )}
            </div>
          )}

          {feedbackSuccess && (
            <div
              className="sheet"
              style={{
                background: 'var(--brand-soft)',
                borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)',
              }}
            >
              <h3
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--brand-ink)',
                }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                {feedbackSuccess}
              </h3>
            </div>
          )}

          {/* Tabs */}
          <div className="tab-row" role="tablist" aria-label="Account sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'profile'}
              aria-pressed={activeTab === 'profile'}
              className="chip"
              onClick={() => setActiveTab('profile')}
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={2.2} />
              {al.tabProfile}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'checkups'}
              aria-pressed={activeTab === 'checkups'}
              className="chip"
              onClick={() => setActiveTab('checkups')}
            >
              <ClipboardList className="w-3.5 h-3.5" strokeWidth={2.2} />
              {al.tabCheckups}
              {user && savedCheckups.length > 0 ? ` (${savedCheckups.length})` : ''}
            </button>
          </div>

          {activeTab === 'profile' ? (
            <form onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label
                  htmlFor="acct-display-name"
                  style={{ display: 'block', fontSize: 12.5, fontWeight: 620, marginBottom: 5 }}
                >
                  {al.displayNameLabel}
                </label>
                <div className="search-field">
                  <UserCheck className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <input
                    id="acct-display-name"
                    type="text"
                    className="mobile-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={al.displayNamePlaceholder}
                    maxLength={SCHEMA_LIMITS.displayNameMax}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="acct-email"
                  style={{ display: 'block', fontSize: 12.5, fontWeight: 620, marginBottom: 5 }}
                >
                  {al.emailLabel}
                </label>
                <div className="search-field">
                  <Mail className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <input
                    id="acct-email"
                    type="email"
                    inputMode="email"
                    className="mobile-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={al.emailPlaceholder}
                    maxLength={SCHEMA_LIMITS.emailMax}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="acct-phone"
                  style={{ display: 'block', fontSize: 12.5, fontWeight: 620, marginBottom: 5 }}
                >
                  {al.phoneLabel}
                </label>
                <div className="search-field">
                  <Phone className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                  <input
                    id="acct-phone"
                    type="tel"
                    inputMode="tel"
                    className="mobile-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={al.phonePlaceholder}
                    maxLength={SCHEMA_LIMITS.phoneMax}
                    autoComplete="tel"
                  />
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{al.phoneHelp}</p>
              </div>

              <div>
                <label
                  htmlFor="acct-emergency-phone"
                  style={{ display: 'block', fontSize: 12.5, fontWeight: 620, marginBottom: 5 }}
                >
                  {al.emergencyPhoneLabel}
                </label>
                <div className="search-field">
                  <Phone className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                  <input
                    id="acct-emergency-phone"
                    type="tel"
                    inputMode="tel"
                    className="mobile-input"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder={al.emergencyPhonePlaceholder}
                    maxLength={SCHEMA_LIMITS.phoneMax}
                    autoComplete="tel"
                  />
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
                  {al.emergencyPhoneHelp}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 10,
                }}
              >
                <div>
                  <label
                    htmlFor="acct-state"
                    style={{ display: 'block', fontSize: 12.5, fontWeight: 620, marginBottom: 5 }}
                  >
                    {al.stateLabel}
                  </label>
                  <div className="search-field">
                    <MapPin className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                    <select
                      id="acct-state"
                      className="mobile-input"
                      value={preferredState}
                      onChange={(e) => setPreferredState(e.target.value)}
                    >
                      {states.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="acct-lang"
                    style={{ display: 'block', fontSize: 12.5, fontWeight: 620, marginBottom: 5 }}
                  >
                    {al.langLabel}
                  </label>
                  <div className="search-field">
                    <Globe className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                    <select
                      id="acct-lang"
                      className="mobile-input"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value as SupportedLanguage)}
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.name} ({l.localName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving || isSigningIn}
                  style={{ flex: '1 1 220px' }}
                >
                  {isSaving || isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {user ? al.savingBtn : al.signingIn}
                    </>
                  ) : user ? (
                    al.saveProfileBtn
                  ) : chatGateActive ? (
                    hasDraftFields ? al.chatGate.createAndChatCta : al.chatGate.loginAndChatCta
                  ) : hasDraftFields ? (
                    al.saveAndSignInCta
                  ) : (
                    al.signInCta
                  )}
                </button>

                {user && profile && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={isDeletingProfile || isSaving}
                    onClick={handleDeleteProfile}
                    style={{ color: 'var(--danger)' }}
                  >
                    {isDeletingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    )}
                    {al.deleteProfileBtn}
                  </button>
                )}
              </div>
            </form>
          ) : !user ? (
            <div className="sheet" style={{ textAlign: 'center', padding: 22 }}>
              <ClipboardList
                className="w-8 h-8"
                style={{ margin: '0 auto 10px', color: 'var(--brand)' }}
              />
              <h3>{al.emptyCheckupsTitle}</h3>
              <p>{al.signInCheckupsHint}</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: 14 }}
                disabled={isSigningIn}
                onClick={() => handleGoogleSignIn(false)}
              >
                <LogIn className="w-4 h-4" />
                {chatGateActive ? al.chatGate.loginAndChatCta : al.signInCta}
              </button>
            </div>
          ) : savedCheckups.length === 0 ? (
            <div className="sheet" style={{ textAlign: 'center', padding: 22 }}>
              <ClipboardList
                className="w-8 h-8"
                style={{ margin: '0 auto 10px', color: 'var(--muted)' }}
              />
              <h3>{al.emptyCheckupsTitle}</h3>
              <p>{al.emptyCheckupsDesc}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {savedCheckups.map((item) => {
                const sevClass = item.isRedFlag
                  ? 'is-danger'
                  : item.urgencyLevel === 'urgent'
                  ? ''
                  : 'is-ok';
                const formattedDate = item.createdAtMs
                  ? new Date(item.createdAtMs).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={item.id}
                    className="sheet"
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span className={`sev ${sevClass}`} style={{ marginLeft: 0 }}>
                        <i aria-hidden="true" />
                        {item.urgencyLevel.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {item.state} · {formattedDate}
                      </span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-soft btn-sm"
                          onClick={() => {
                            onLoadCheckup(item);
                            onClose();
                          }}
                        >
                          {al.loadCheckupBtn}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)' }}
                          disabled={deletingCheckupId === item.id}
                          onClick={() => handleDeleteCheckup(item.id)}
                          aria-label={al.deleteCheckupBtn}
                        >
                          {deletingCheckupId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontWeight: 620, color: 'var(--ink)' }}>
                      {item.symptomSummary}
                    </p>
                    <p style={{ margin: 0, fontSize: 12.5 }}>{item.nextStepSummary}</p>
                    {item.recommendedFacilities.length > 0 && (
                      <div className="chip-row">
                        {item.recommendedFacilities.map((fac, idx) => (
                          <span className="chip" key={idx}>
                            <Building2 className="w-3 h-3" />
                            {fac}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
