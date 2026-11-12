/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  RefreshCw,
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  CheckCheck,
  PhoneCall,
  Sparkles,
  Thermometer,
  Droplet,
  Zap,
  Wind,
  Heart,
  Activity,
  Loader2,
  ArrowRight,
  Baby,
  Lock,
  X,
} from 'lucide-react';
import { Header } from './components/Header';
import { BrandMark } from './components/BrandMark';
import { EmergencyModal } from './components/EmergencyModal';
import { HospitalDirectoryModal } from './components/HospitalDirectoryModal';
import { FirstAidModal } from './components/FirstAidModal';
import { PharmacyGuideModal } from './components/PharmacyGuideModal';
import { PrivateChatView } from './components/PrivateChatView';
import { ArtDirectory } from './components/ArtDirectory';
import { TriageResultView } from './components/TriageResultView';
import { ResilientImage } from './components/ResilientImage';
import { OpeningLandingView } from './components/OpeningLandingView';
import { AuthModal } from './components/AuthModal';
import { AppUser } from './types/auth';
import {
  getStoredUser,
  subscribeToAuth,
  signOutUser,
  signInAsGuest,
} from './services/authService';
import { ChatMessage, TriageResult, SupportedLanguage, SUPPORTED_LANGUAGES } from './types/triage';
import { NIGERIAN_STATES_DATA } from './data/nigeriaHealthcareData';
import { facilitiesForState, lgasForState } from './data/facilityDirectory';
import { TRANSLATIONS } from './data/localization';
import { VISUAL_ASSETS } from './data/visualAssets';
import { privateUi } from './data/privateCare';

type ViewMode = 'clinic' | 'whatsapp';

const HERO_QUICK_SYMPTOM_INDICES = [0, 1, 4, 6];

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('pidgin');
  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: TRANSLATIONS['pidgin'].greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('clinic');
  const [composerShake, setComposerShake] = useState<boolean>(false);

  // Modals state
  const [selectedLga, setSelectedLga] = useState<string>('');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isHospitalsModalOpen, setIsHospitalsModalOpen] = useState<boolean>(false);
  const [isFirstAidModalOpen, setIsFirstAidModalOpen] = useState<boolean>(false);
  const [isPrivateChatOpen, setIsPrivateChatOpen] = useState<boolean>(false);
  const [isArtDirectoryOpen, setIsArtDirectoryOpen] = useState<boolean>(false);
  const [firstAidGuideId, setFirstAidGuideId] = useState<string>('ors');
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState<boolean>(false);
  const [pharmacyCategory, setPharmacyCategory] = useState<string>('all');

  // User Authentication & Opening Portal State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');
  const [authFeatureHint, setAuthFeatureHint] = useState<string | undefined>(undefined);
  const [pendingActionAfterAuth, setPendingActionAfterAuth] = useState<(() => void) | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const openAuthModal = (
    mode: 'signin' | 'register' = 'signin',
    featureHint?: string,
    onComplete?: () => void
  ) => {
    setAuthModalMode(mode);
    setAuthFeatureHint(featureHint);
    setPendingActionAfterAuth(onComplete ? () => onComplete : null);
    setIsAuthModalOpen(true);
  };

  const handleQuickGuestEnter = (onComplete?: () => void) => {
    signInAsGuest(selectedState).then((user) => {
      setCurrentUser(user);
      if (onComplete) {
        onComplete();
      }
    });
  };

  const handleSignOut = () => {
    signOutUser().then(() => {
      setCurrentUser(null);
    });
  };

  const handleAuthSuccess = (user: AppUser) => {
    setCurrentUser(user);
    if (pendingActionAfterAuth) {
      pendingActionAfterAuth();
      setPendingActionAfterAuth(null);
    }
  };

  const handleStateSelect = (nextState: string) => {
    setSelectedState(nextState);
    setSelectedLga('');
  };

  const openHospitalsDirectory = (stateOverride?: string, lgaOverride?: string) => {
    if (stateOverride && NIGERIAN_STATES_DATA[stateOverride]) {
      setSelectedState(stateOverride);
    }
    if (lgaOverride !== undefined) {
      setSelectedLga(lgaOverride);
    }
    setIsHospitalsModalOpen(true);
  };

  const openFirstAidGuide = (guideId?: string) => {
    if (guideId) {
      setFirstAidGuideId(guideId);
    }
    setIsFirstAidModalOpen(true);
  };

  const openPharmacyGuide = (category: string = 'all') => {
    setPharmacyCategory(category);
    setIsPharmacyModalOpen(true);
  };

  const convRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const wasInputEmptyBeforeVoiceRef = useRef<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.pidgin;

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={idx} style={{ fontWeight: 700, color: 'var(--ink)' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const renderHeroHeadline = (headline: string) => {
    const parts = headline.split(/\s+[—–]\s+/);
    if (parts.length < 2) return headline;
    return (
      <>
        {parts[0]}
        <span className="accent">{parts.slice(1).join(' ')}</span>
      </>
    );
  };

  // Smoothly scroll conversation only when new messages arrive
  const prevMessageCountRef = useRef<number>(messages.length);
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading]);

  // Keep textarea height synced cleanly on type, voice append, clear, or reset
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (inputText) {
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  }, [inputText]);

  // Cleanup active mic stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    if (newLang === selectedLanguage) return;
    setSelectedLanguage(newLang);
    setRecognitionError(null);

    const langStrings = TRANSLATIONS[newLang];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (messages.length === 1 && messages[0].id === 'welcome-1') {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: langStrings.greeting,
          timestamp: nowTime,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `lang-switch-${Date.now()}`,
          sender: 'assistant',
          text: langStrings.switchNotice,
          timestamp: nowTime,
        },
      ]);
    }
  };

  const startBrowserSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError(t.chat.voiceUnsupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (selectedLanguage === 'hausa') recognition.lang = 'ha-NG';
    else if (selectedLanguage === 'yoruba') recognition.lang = 'yo-NG';
    else if (selectedLanguage === 'igbo') recognition.lang = 'ig-NG';
    else recognition.lang = 'en-NG';

    recognition.onstart = () => {
      setIsListening(true);
      setRecognitionError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      setIsListening(false);
      if (transcript) {
        if (wasInputEmptyBeforeVoiceRef.current) {
          void handleSendMessage(transcript, selectedLanguage);
        } else {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setRecognitionError(t.chat.micDenied);
      } else if (event.error !== 'no-speech') {
        setRecognitionError(t.chat.transcribeFailed);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setRecognitionError(t.chat.voiceUnsupported);
      setIsListening(false);
    }
  };

  const stopMediaRecorderAndTranscribe = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleVoiceRecording = async () => {
    setRecognitionError(null);

    if (isTranscribing) return;

    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        stopMediaRecorderAndTranscribe();
      } else if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* ignore */
        }
        setIsListening(false);
      }
      return;
    }

    wasInputEmptyBeforeVoiceRef.current = !inputText.trim();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof MediaRecorder !== 'undefined') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const preferredMime = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        const recorder = preferredMime
          ? new MediaRecorder(stream, { mimeType: preferredMime })
          : new MediaRecorder(stream);

        audioChunksRef.current = [];

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            audioChunksRef.current.push(ev.data);
          }
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((tr) => tr.stop());
          mediaStreamRef.current = null;

          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });

          if (audioBlob.size < 400) {
            setIsListening(false);
            return;
          }

          setIsTranscribing(true);
          try {
            const base64Audio = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                const commaIdx = result.indexOf(',');
                resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
              };
              reader.onerror = reject;
              reader.readAsDataURL(audioBlob);
            });

            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType: recorder.mimeType || 'audio/webm',
                language: selectedLanguage,
              }),
            });

            if (!res.ok) {
              throw new Error(`Transcribe failed with status ${res.status}`);
            }

            const data = await res.json();
            if (data.text) {
              const spokenLang: SupportedLanguage =
                data.detectedLanguage &&
                SUPPORTED_LANGUAGES.some((l) => l.code === data.detectedLanguage)
                  ? data.detectedLanguage
                  : selectedLanguage;

              if (spokenLang !== selectedLanguage) {
                setSelectedLanguage(spokenLang);
              }

              if (wasInputEmptyBeforeVoiceRef.current) {
                setIsTranscribing(false);
                await handleSendMessage(data.text, spokenLang);
                return;
              } else {
                setInputText((prev) => (prev ? `${prev} ${data.text}` : data.text));
              }
            } else {
              setRecognitionError(t.chat.transcribeFailed);
            }
          } catch {
            setRecognitionError(t.chat.transcribeFailed);
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsListening(true);
        return;
      } catch (err: any) {
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setRecognitionError(t.chat.micDenied);
          return;
        }
        startBrowserSpeechRecognition();
        return;
      }
    }

    startBrowserSpeechRecognition();
  };

  const handleSendMessage = async (
    textToSend?: string,
    overrideLang?: SupportedLanguage,
    scrollToThread = false
  ) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    const requestLang = overrideLang || selectedLanguage;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) {
      setInputText('');
    }
    setRecognitionError(null);
    setIsLoading(true);

    if (scrollToThread) {
      window.setTimeout(() => {
        convRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1' && !m.id.startsWith('lang-switch-'))
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          language: requestLang,
          conversationHistory: historyPayload,
          userLocation: { state: selectedState, lga: selectedLga || undefined },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: TriageResult = await res.json();

      if (data.detectedLocation && NIGERIAN_STATES_DATA[data.detectedLocation]) {
        setSelectedState(data.detectedLocation);
        setSelectedLga(data.detectedLga || '');
      } else if (data.detectedLga) {
        setSelectedLga(data.detectedLga);
      }

      const resolvedLang: SupportedLanguage =
        data.language && SUPPORTED_LANGUAGES.some((l) => l.code === data.language)
          ? data.language
          : requestLang;

      if (resolvedLang !== selectedLanguage) {
        setSelectedLanguage(resolvedLang);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text:
          data.fullFormattedResponse ||
          `${data.wetinFitDeyHappen || data.potentialCauses}\n\n${data.wetinYouFitDoForHouse || data.homeManagement}\n\n${data.nextStep || data.actionPlan}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageData: { ...data, language: resolvedLang },
        isEmergencyAlert: data.isRedFlag,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Failed to get triage response:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: t.chat.networkError(selectedState),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: TRANSLATIONS[selectedLanguage].greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');
    setRecognitionError(null);
  };

  const facilityCount = facilitiesForState(selectedState).length;
  const lgaCount = lgasForState(selectedState).length;
  const pui = privateUi(selectedLanguage);

  const guideCards = [
    { id: 'ors', meta: VISUAL_ASSETS.ors, copy: t.visuals.cards.ors },
    { id: 'tepid-sponging', meta: VISUAL_ASSETS.sponging, copy: t.visuals.cards.sponging },
    { id: 'pregnancy', meta: VISUAL_ASSETS.pregnancy, copy: t.visuals.cards.pregnancy },
    { id: 'choking', meta: VISUAL_ASSETS.choking, copy: t.visuals.cards.choking },
  ];

  const heroQuickSymptoms = HERO_QUICK_SYMPTOM_INDICES
    .map((idx) => t.symptoms[idx])
    .filter(Boolean);

  const toneFor = (name: string) => {
    switch (name) {
      case 'thermometer':
        return 'i-amber';
      case 'droplet':
        return 'i-blue';
      case 'zap':
        return 'i-violet';
      case 'wind':
        return 'i-teal';
      case 'heart':
      case 'baby':
      case 'alert':
        return 'i-rose';
      default:
        return 'i-green';
    }
  };

  const iconFor = (name: string) => {
    switch (name) {
      case 'thermometer':
        return <Thermometer className="w-4 h-4" strokeWidth={2} />;
      case 'droplet':
        return <Droplet className="w-4 h-4" strokeWidth={2} />;
      case 'zap':
        return <Zap className="w-4 h-4" strokeWidth={2} />;
      case 'wind':
        return <Wind className="w-4 h-4" strokeWidth={2} />;
      case 'heart':
        return <Heart className="w-4 h-4" strokeWidth={2} />;
      case 'baby':
        return <Baby className="w-4 h-4" strokeWidth={2} />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" strokeWidth={2} />;
      case 'activity':
        return <Activity className="w-4 h-4" strokeWidth={2} />;
      default:
        return <Sparkles className="w-4 h-4" strokeWidth={2} />;
    }
  };

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const composerHint = isTranscribing
    ? t.chat.placeholderTranscribing
    : isListening
    ? mediaRecorderRef.current
      ? t.chat.placeholderRecording
      : t.chat.placeholderListening
    : currentLangMeta.localName;

  const whatsapp = viewMode === 'whatsapp';
  const hasConversation = messages.length > 1;

  if (!currentUser) {
    return (
      <div>
        <OpeningLandingView
          selectedLanguage={selectedLanguage}
          onSelectLanguage={handleLanguageChange}
          selectedState={selectedState}
          onSelectState={handleStateSelect}
          onOpenAuth={(mode, hint, onComplete) => openAuthModal(mode, hint, onComplete)}
          onQuickGuestEnter={handleQuickGuestEnter}
          onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          selectedLanguage={selectedLanguage}
          defaultState={selectedState}
          initialMode={authModalMode}
          featureHint={authFeatureHint}
        />

        <EmergencyModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
          selectedState={selectedState}
          onSelectSymptomForTriage={(symptom) => {
            handleQuickGuestEnter(() => {
              handleSendMessage(`${t.emergencyPrefix} ${symptom}`, selectedLanguage, true);
            });
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <Header
        selectedState={selectedState}
        onSelectState={handleStateSelect}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageChange}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenHospitals={() => openHospitalsDirectory()}
        onOpenFirstAid={() => openFirstAidGuide('ors')}
        onOpenPrivate={() => setIsPrivateChatOpen(true)}
        onOpenPharmacy={() => openPharmacyGuide('all')}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenAuth={() => openAuthModal('signin')}
      />

      <main id="main">
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="eyebrow-line">
                  {t.header.badge} · {selectedState} {t.header.stateSuffix}
                </div>

                <h1>{renderHeroHeadline(t.welcomeShowcase.headline)}</h1>
                <p className="lede">{t.welcomeShowcase.tagline}</p>

                <form
                  className={`composer${composerShake ? ' shake' : ''}`}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!inputText.trim()) {
                      setComposerShake(true);
                      setTimeout(() => setComposerShake(false), 380);
                      return;
                    }
                    handleSendMessage();
                  }}
                >
                  <label className="sr-only" htmlFor="symptom-input">
                    {t.chat.placeholderIdle}
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="symptom-input"
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!inputText.trim()) return;
                        handleSendMessage();
                      }
                    }}
                    placeholder={t.chat.placeholderIdle}
                    disabled={isLoading || isTranscribing}
                  />

                  <div className="composer-bar">
                    <button
                      type="button"
                      className="mic-btn"
                      aria-pressed={isListening}
                      aria-label={isListening ? t.chat.tapToStopRecording : t.chat.tapToSpeak}
                      onClick={toggleVoiceRecording}
                      disabled={isTranscribing || isLoading}
                    >
                      <span className="mic-ico" aria-hidden="true">
                        {isTranscribing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isListening ? (
                          <MicOff className="w-3.5 h-3.5" strokeWidth={2.3} />
                        ) : (
                          <Mic className="w-3.5 h-3.5" strokeWidth={2.3} />
                        )}
                      </span>
                      <span>
                        {isTranscribing
                          ? t.chat.placeholderTranscribing
                          : isListening
                          ? t.chat.tapToStopRecording
                          : t.welcomeShowcase.voiceCta}
                      </span>
                    </button>

                    <span className="composer-hint">{composerHint}</span>

                    <div className="composer-actions">
                      {inputText.trim().length > 0 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setInputText('');
                            setRecognitionError(null);
                            textareaRef.current?.focus();
                          }}
                          aria-label="Clear text"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2.2} />
                        </button>
                      )}
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={isLoading || isTranscribing}
                      >
                        {t.chat.triageBtn}
                        <ArrowRight className="arr w-4 h-4" strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                </form>

                <div className="quick-tags">
                  <span className="tag-lbl">Quick checks:</span>
                  {heroQuickSymptoms.map((item, idx) => (
                    <button
                      key={`quick-${selectedLanguage}-${idx}`}
                      type="button"
                      className="tag"
                      disabled={isLoading}
                      onClick={() => handleSendMessage(item.text)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {recognitionError && (
                  <p className="answer-note is-danger" style={{ marginTop: 10 }}>
                    {recognitionError}
                  </p>
                )}

                {/* ================= CONVERSATION ================= */}
                <div ref={convRef} className={`conv${whatsapp ? ' is-wa' : ''}`}>
                  {whatsapp && (
                    <div className="wa-ribbon">
                      <div>
                        <b>NaijaHealth AI</b>
                        <span className="sub">{t.contextBar.whatsappStatus}</span>
                      </div>
                      <a href="tel:112">
                        <PhoneCall className="w-3 h-3" strokeWidth={2.2} />
                        {t.contextBar.call112}
                      </a>
                    </div>
                  )}

                  {messages.map((message) => {
                    const isAssistant = message.sender === 'assistant';

                    if (isAssistant && message.triageData) {
                      return (
                        <TriageResultView
                          key={message.id}
                          triage={message.triageData}
                          onSelectClarifyingQuestion={(q) => handleSendMessage(q)}
                          onOpenHospitals={(st, lga) => openHospitalsDirectory(st, lga)}
                          onOpenFirstAid={(guideId) => openFirstAidGuide(guideId)}
                          onOpenPharmacy={() => openPharmacyGuide('all')}
                        />
                      );
                    }

                    if (isAssistant) {
                      return (
                        <div className={whatsapp ? 'bubble-wa' : 'answer'} key={message.id}>
                          <div className="answer-head">
                            <BrandMark size="xs" />
                            <span className="who">NaijaHealth AI</span>
                            <span className="time">{message.timestamp}</span>
                          </div>
                          <p style={{ whiteSpace: 'pre-line' }}>
                            {renderFormattedText(message.text)}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="bubble-row" key={message.id}>
                        <div className="bubble-meta">
                          {t.chat.you} · {message.timestamp}{' '}
                          <CheckCheck
                            className="w-3 h-3 inline"
                            strokeWidth={2.2}
                            style={{ color: 'var(--brand)' }}
                          />
                        </div>
                        <div className={whatsapp ? 'bubble-wa user-wa' : 'bubble-user'}>
                          {message.text}
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="answer">
                      <div className="answer-head">
                        <BrandMark size="xs" />
                        <span className="who">NaijaHealth AI</span>
                        <span className="time">{t.chat.evaluating}</span>
                      </div>
                      <div className="typing" aria-label={t.chat.evaluating}>
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ================= CONVERSATION TOOLBAR ================= */}
                <div className="conv-toolbar">
                  <div className="seg" role="group" aria-label="Conversation view mode">
                    <button
                      type="button"
                      aria-pressed={viewMode === 'clinic'}
                      onClick={() => setViewMode('clinic')}
                    >
                      {t.contextBar.clinicalMode}
                    </button>
                    <button
                      type="button"
                      aria-pressed={viewMode === 'whatsapp'}
                      onClick={() => setViewMode('whatsapp')}
                    >
                      {t.contextBar.whatsappMode}
                    </button>
                  </div>

                  {hasConversation && (
                    <button
                      type="button"
                      className="chip"
                      onClick={handleResetChat}
                      title={t.contextBar.newSession}
                    >
                      <RefreshCw className="w-3 h-3" strokeWidth={2.2} />
                      {t.contextBar.newSession}
                    </button>
                  )}

                  <span className="spacer" />

                  <span className="composer-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
                    {t.chat.footerNcdc}
                  </span>
                </div>

                <div className="private-link-bar">
                  <span className="pl-ico" aria-hidden="true">
                    <Lock className="w-4 h-4" strokeWidth={2} />
                  </span>
                  <div className="pl-body">
                    <b>{pui.entryTitle}</b>
                    <span>{pui.entrySub}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setIsPrivateChatOpen(true)}
                  >
                    {pui.entryTitle}
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              {/* Clean Hero visual without floating card distractions */}
              <div className="hero-visual">
                <figure className="figure">
                  <ResilientImage
                    src={VISUAL_ASSETS.welcome.src}
                    alt={t.welcomeShowcase.headline}
                    variant="welcome"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover"
                  />
                  <figcaption className="figure-caption">
                    <span className="ava" aria-hidden="true">
                      <HeartPulse className="w-4 h-4" strokeWidth={2} />
                    </span>
                    <span>
                      <b className="tnum">
                        {selectedState} {t.header.stateSuffix} · {lgaCount} LGAs · {facilityCount}{' '}
                        {t.header.hospitals}
                      </b>
                      <span>{t.header.subtitle}</span>
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COMMON SYMPTOMS ================= */}
        <section className="sec" id="symptoms">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="kicker">{t.chat.commonSymptomsTitle}</div>
                <h2>{t.sectionHeadings.symptoms}</h2>
              </div>
            </div>

            <div className="sym-grid">
              {t.symptoms.map((item, idx) => (
                <button
                  key={`sym-${selectedLanguage}-${idx}`}
                  type="button"
                  className="sym"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(item.text, selectedLanguage, true)}
                >
                  <span className={`ico ${toneFor(item.iconName)}`} aria-hidden="true">
                    {iconFor(item.iconName)}
                  </span>
                  <span>
                    <b>{item.label}</b>
                    <span className="sub">{item.text}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PRACTICAL CARE GUIDES (Balanced 4-card Grid) ================= */}
        <section className="sec" id="guides">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="kicker">{t.visuals.guidesTitle}</div>
                <h2>{t.sectionHeadings.guides}</h2>
                <p>{t.visuals.guidesSubtitle}</p>
              </div>
              <button
                type="button"
                className="link"
                onClick={() => setIsHospitalsModalOpen(true)}
              >
                {selectedState} {t.header.hospitals}
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
              </button>
            </div>

            <div className="guide-grid">
              {guideCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className="guide-card"
                  onClick={() => openFirstAidGuide(card.id)}
                >
                  <span className="shot">
                    <ResilientImage
                      src={card.meta.src}
                      alt={card.copy.title}
                      variant={card.meta.key}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                  </span>
                  <span className="body">
                    <h3>{card.copy.title}</h3>
                    <p>{card.copy.caption}</p>
                    <span className="go">
                      {t.visuals.openGuideCta}
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS + EMERGENCY STRIP ================= */}
        <section className="sec" id="how">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="kicker">{t.header.badge}</div>
                <h2>{t.sectionHeadings.how}</h2>
              </div>
            </div>

            <div className="steps">
              {t.welcomeShowcase.pillars.map((pillar, i) => (
                <div className="step" key={i}>
                  <span className="num">{i + 1}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                </div>
              ))}
            </div>

            <div className="emg-band" id="emergency">
              <span className="ico" aria-hidden="true">
                <AlertTriangle className="w-5 h-5" strokeWidth={2.1} />
              </span>
              <div>
                <h3>{t.triageCard.immediateAttention}</h3>
                <p>{t.triageCard.defaultEmergencyWarning}</p>
              </div>
              <a className="btn" href="tel:112">
                <PhoneCall className="w-4 h-4" strokeWidth={2.2} />
                {t.contextBar.call112}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="site-footer">
        <div className="wrap">
          <div className="f-grid">
            <div className="f-brand">
              <a className="brand" href="#main" aria-label="NaijaHealth AI">
                <BrandMark size="sm" />
                <span className="brand-name">
                  <b>NaijaHealth</b>
                  <span>AI Triage</span>
                </span>
              </a>
              <p>{t.header.subtitle}</p>
            </div>

            <div className="f-col">
              <h4>{t.header.hospitals}</h4>
              <button type="button" onClick={() => setIsHospitalsModalOpen(true)}>
                {t.welcomeShowcase.hospitalsCta}
              </button>
              <button type="button" onClick={() => setIsArtDirectoryOpen(true)}>
                {pui.artTitle}
              </button>
              <button type="button" onClick={() => setIsPrivateChatOpen(true)}>
                {pui.entryTitle}
              </button>
            </div>

            <div className="f-col">
              <h4>{t.header.firstAid}</h4>
              <button type="button" onClick={() => openFirstAidGuide('ors')}>
                {t.visuals.cards.ors.title}
              </button>
              <button type="button" onClick={() => openPharmacyGuide('all')}>
                {t.header.pharmacy || 'Chemist & OTC Drugs'}
              </button>
              <button type="button" onClick={() => openFirstAidGuide('pregnancy')}>
                {t.welcomeShowcase.pregnancyCta}
              </button>
              <button type="button" onClick={() => openFirstAidGuide('choking')}>
                {t.visuals.cards.choking.title}
              </button>
            </div>

            <div className="f-col">
              <h4>{t.contextBar.call112}</h4>
              <a className="tnum" href="tel:112">112 · Emergency</a>
              <a className="tnum" href="tel:6232">6232 · NCDC</a>
              <a className="tnum" href="tel:767">767 · Lagos Emergency</a>
            </div>
          </div>

          <div className="f-bottom">
            <p className="disc">
              <b>{t.triageCard.defaultEmergencyWarning}</b> {t.chat.footerDisclaimerPrefix}{' '}
              {t.chat.footerCall112} {t.chat.footerImmediate}
            </p>
            <p>
              {t.chat.footerNcdc} · © {new Date().getFullYear()} NaijaHealth AI
            </p>
          </div>
        </div>
      </footer>

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        selectedState={selectedState}
        onSelectSymptomForTriage={(symptom) =>
          handleSendMessage(`${t.emergencyPrefix} ${symptom}`, selectedLanguage, true)
        }
      />

      <HospitalDirectoryModal
        isOpen={isHospitalsModalOpen}
        onClose={() => setIsHospitalsModalOpen(false)}
        defaultState={selectedState}
        defaultLga={selectedLga}
        lang={selectedLanguage}
      />

      <PrivateChatView
        isOpen={isPrivateChatOpen}
        onClose={() => setIsPrivateChatOpen(false)}
        state={selectedState}
        lang={selectedLanguage}
        onOpenArt={() => setIsArtDirectoryOpen(true)}
      />

      <ArtDirectory
        isOpen={isArtDirectoryOpen}
        onClose={() => setIsArtDirectoryOpen(false)}
        defaultState={selectedState}
        lang={selectedLanguage}
      />

      <FirstAidModal
        isOpen={isFirstAidModalOpen}
        onClose={() => setIsFirstAidModalOpen(false)}
        initialGuideId={firstAidGuideId}
        selectedLanguage={selectedLanguage}
      />

      <PharmacyGuideModal
        isOpen={isPharmacyModalOpen}
        onClose={() => setIsPharmacyModalOpen(false)}
        selectedLanguage={selectedLanguage}
        initialCategory={pharmacyCategory as any}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        selectedLanguage={selectedLanguage}
        defaultState={selectedState}
        initialMode={authModalMode}
        featureHint={authFeatureHint}
      />
    </div>
  );
}
