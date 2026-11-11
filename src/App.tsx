/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  RefreshCw,
  MapPin,
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
  BookOpen,
  ArrowRight,
  Building2,
  Baby,
  Lock,
} from 'lucide-react';
import { Header } from './components/Header';
import { EmergencyModal } from './components/EmergencyModal';
import { HospitalDirectoryModal } from './components/HospitalDirectoryModal';
import { FirstAidModal } from './components/FirstAidModal';
import { PrivateChatView } from './components/PrivateChatView';
import { ArtDirectory } from './components/ArtDirectory';
import { TriageResultView } from './components/TriageResultView';
import { ResilientImage } from './components/ResilientImage';
import { ChatMessage, TriageResult, SupportedLanguage, SUPPORTED_LANGUAGES } from './types/triage';
import { NIGERIAN_STATES_DATA } from './data/nigeriaHealthcareData';
import { TRANSLATIONS } from './data/localization';
import { VISUAL_ASSETS } from './data/visualAssets';
import { privateUi } from './data/privateCare';
import { useRevealOnScroll } from './lib/useRevealOnScroll';

type ViewMode = 'clinic' | 'whatsapp';

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

  // Modals state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isHospitalsModalOpen, setIsHospitalsModalOpen] = useState<boolean>(false);
  const [isFirstAidModalOpen, setIsFirstAidModalOpen] = useState<boolean>(false);
  const [isPrivateChatOpen, setIsPrivateChatOpen] = useState<boolean>(false);
  const [isArtDirectoryOpen, setIsArtDirectoryOpen] = useState<boolean>(false);
  const [firstAidGuideId, setFirstAidGuideId] = useState<string>('ors');

  const openFirstAidGuide = (guideId?: string) => {
    if (guideId) {
      setFirstAidGuideId(guideId);
    }
    setIsFirstAidModalOpen(true);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const wasInputEmptyBeforeVoiceRef = useRef<boolean>(true);

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

  /**
   * The prototype's H1 is two lines: a plain statement, then a coloured
   * accent clause. Split the localised headline on its em-dash so every
   * language keeps a natural break instead of a hard-coded English split.
   */
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

  // Auto scroll to the newest message only when one is added — never on first paint
  const prevMessageCountRef = useRef<number>(messages.length);
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading]);

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
          // ignore
        }
      }
    };
  }, []);

  // Handle language switch across all 5 languages
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

  // Fallback browser Web Speech Recognition helper
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
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setRecognitionError(t.chat.micDenied);
      } else if (event.error !== 'no-speech') {
        setRecognitionError(t.chat.transcribeFailed);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

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

    // Stop if already listening / recording
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        stopMediaRecorderAndTranscribe();
      } else if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        setIsListening(false);
      }
      return;
    }

    wasInputEmptyBeforeVoiceRef.current = !inputText.trim();

    // Prefer MediaRecorder + Gemini Transcribe (works across Hausa, Yoruba, Igbo, Pidgin, English!)
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
          } catch (err) {
            console.warn('Server transcribe unavailable, trying browser fallback:', err);
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
        console.warn('MediaRecorder error:', err);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setRecognitionError(t.chat.micDenied);
          return;
        }
        // Fallback to native SpeechRecognition if mic permissions aren't blocked
        startBrowserSpeechRecognition();
        return;
      }
    }

    startBrowserSpeechRecognition();
  };

  const handleSendMessage = async (textToSend?: string, overrideLang?: SupportedLanguage) => {
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
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1' && !m.id.startsWith('lang-switch-'))
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          language: requestLang,
          conversationHistory: historyPayload,
          userLocation: {
            state: selectedState,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: TriageResult = await res.json();

      if (data.detectedLocation && NIGERIAN_STATES_DATA[data.detectedLocation]) {
        setSelectedState(data.detectedLocation);
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
        triageData: {
          ...data,
          language: resolvedLang,
        },
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

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const facilityCount =
    NIGERIAN_STATES_DATA[selectedState]?.facilities?.length ?? 0;

  const pui = privateUi(selectedLanguage);

  useRevealOnScroll();

  const [composerShake, setComposerShake] = useState<boolean>(false);

  const guideCards = [
    { id: 'ors', meta: VISUAL_ASSETS.ors, copy: t.visuals.cards.ors },
    { id: 'tepid-sponging', meta: VISUAL_ASSETS.sponging, copy: t.visuals.cards.sponging },
    { id: 'pregnancy', meta: VISUAL_ASSETS.pregnancy, copy: t.visuals.cards.pregnancy },
    { id: 'choking', meta: VISUAL_ASSETS.choking, copy: t.visuals.cards.choking },
  ];

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
        return 'i-rose';
      case 'baby':
        return 'i-rose';
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

  // Prototype's hint lists the five supported languages — proper nouns, so it
  // stays correct in every locale without new copy.
  const supportedLanguageList = SUPPORTED_LANGUAGES.map((l) =>
    l.name === 'Nigerian Pidgin' ? 'Pidgin' : l.name
  ).join(', ');

  const composerHint = isTranscribing
    ? t.chat.placeholderTranscribing
    : isListening
    ? mediaRecorderRef.current
      ? t.chat.placeholderRecording
      : t.chat.placeholderListening
    : supportedLanguageList;

  const whatsapp = viewMode === 'whatsapp';

  return (
    <div>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <Header
        selectedState={selectedState}
        onSelectState={setSelectedState}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageChange}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenHospitals={() => setIsHospitalsModalOpen(true)}
        onOpenFirstAid={() => openFirstAidGuide('ors')}
      />

      <main id="main">
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-copy reveal" data-reveal>
                <span className="eyebrow">
                  <span className="pulse" aria-hidden="true" />
                  {t.header.badge} · {selectedState} {t.header.stateSuffix}
                </span>

                <h1>{renderHeroHeadline(t.welcomeShowcase.headline)}</h1>
                <p className="lede">{t.welcomeShowcase.tagline}</p>

                <form
                  className={`composer${composerShake ? ' shake' : ''}`}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!inputText.trim()) {
                      setComposerShake(true);
                      setTimeout(() => setComposerShake(false), 400);
                      return;
                    }
                    handleSendMessage();
                  }}
                >
                  <label className="sr-only" htmlFor="symptom-input">
                    {t.chat.placeholderIdle}
                  </label>
                  <textarea
                    id="symptom-input"
                    rows={2}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                    }}
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
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isListening ? (
                          <MicOff className="w-3 h-3" strokeWidth={2.4} />
                        ) : (
                          <Mic className="w-3 h-3" strokeWidth={2.4} />
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
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setInputText('');
                          setRecognitionError(null);
                        }}
                      >
                        {currentLangMeta.flag} {currentLangMeta.localName}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        style={{ height: 40 }}
                        disabled={isLoading || isTranscribing}
                      >
                        {t.chat.triageBtn}
                        <ArrowRight className="arr w-4 h-4" strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                </form>

                <div className="quick-tags">
                  <span className="tag-lbl">{t.chat.commonSymptomsTitle}:</span>
                  {t.symptoms.slice(0, 5).map((item, idx) => (
                    <button
                      key={`quick-${selectedLanguage}-${idx}`}
                      type="button"
                      className="tag"
                      aria-pressed={false}
                      disabled={isLoading}
                      onClick={() => handleSendMessage(item.text)}
                    >
                      <span className={`d ${item.dotColor}`} />
                      {item.label}
                    </button>
                  ))}
                </div>

                <ul className="trust">
                  {t.welcomeShowcase.pillars.map((pillar, i) => (
                    <li key={i}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {pillar.title}
                    </li>
                  ))}
                </ul>

                <div
                  className="row-card"
                  style={{ marginTop: 18, background: 'var(--surface-2)', alignItems: 'center' }}
                >
                  <span
                    className="ico"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      color: 'var(--brand)',
                      flex: 'none',
                    }}
                    aria-hidden="true"
                  >
                    <Lock className="w-4 h-4" strokeWidth={2} />
                  </span>
                  <div className="rc-body">
                    <b>{pui.entryTitle}</b>
                    <span>{pui.entrySub}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setIsPrivateChatOpen(true)}
                  >
                    {pui.entryTitle}
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                  </button>
                </div>

                {recognitionError && (
                  <p className="answer-note" style={{ color: 'var(--danger)', borderTop: 0, marginTop: 10 }}>
                    {recognitionError}
                  </p>
                )}

                {/* ================= CONVERSATION ================= */}
                <div className={`conv${whatsapp ? ' is-wa' : ''}`}>
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
                          onOpenHospitals={() => setIsHospitalsModalOpen(true)}
                          onOpenFirstAid={(guideId) => openFirstAidGuide(guideId)}
                        />
                      );
                    }

                    if (isAssistant) {
                      return (
                        <div className="answer" key={message.id}>
                          <div className="answer-head">
                            <span
                              className="brand-mark"
                              style={{ width: 24, height: 24, borderRadius: 8 }}
                              aria-hidden="true"
                            >
                              <HeartPulse className="w-3.5 h-3.5" strokeWidth={2.4} />
                            </span>
                            <span className="who">NaijaHealth AI</span>
                            <span className="time">{message.timestamp}</span>
                            <span className="sev is-ok">
                              <i aria-hidden="true" />
                              {t.contextBar.routingActive}
                            </span>
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
                        <span
                          className="brand-mark"
                          style={{ width: 24, height: 24, borderRadius: 8 }}
                          aria-hidden="true"
                        >
                          <HeartPulse className="w-3.5 h-3.5 animate-spin" strokeWidth={2.4} />
                        </span>
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
                  <div className="seg" role="group" aria-label="Conversation style">
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

                  <button
                    type="button"
                    className="chip"
                    onClick={handleResetChat}
                    title={t.contextBar.newSession}
                  >
                    <RefreshCw className="w-3 h-3" strokeWidth={2.2} />
                    {t.contextBar.newSession}
                  </button>

                  <span className="spacer" />

                  <span className="composer-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
                    {t.chat.footerNcdc}
                  </span>
                </div>
              </div>

              {/* Hero visual */}
              <div className="hero-visual reveal" data-reveal>
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
                      <b>{t.header.subtitle}</b>
                      <span>{t.welcomeShowcase.tagline}</span>
                    </span>
                  </figcaption>
                </figure>

                <div className="float-card" aria-hidden="true">
                  <div className="fc-top">
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--brand)',
                        display: 'inline-block',
                      }}
                    />
                    {t.contextBar.routingActive}
                  </div>
                  <div className="fc-main">
                    <MapPin className="pin w-4 h-4" strokeWidth={2.2} />
                    <span>
                      {selectedState} {t.header.stateSuffix}
                    </span>
                  </div>
                  <div className="fc-sub">
                    {facilityCount} {t.header.hospitals}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= THREE WAYS TO GET HELP ================= */}
        <section className="sec" id="actions">
          <div className="wrap">
            <div className="sec-head reveal" data-reveal>
              <div>
                <div className="kicker">{t.header.badge}</div>
                <h2>{t.sectionHeadings.ways}</h2>
                <p>{t.welcomeShowcase.tagline}</p>
              </div>
            </div>

            <div className="actions stagger" data-reveal>
              <button type="button" className="action" onClick={toggleVoiceRecording}>
                <span className="ico" aria-hidden="true">
                  <Mic className="w-5 h-5" strokeWidth={2} />
                </span>
                <h3>{t.welcomeShowcase.voiceCta}</h3>
                <p>{t.welcomeShowcase.pillars[0]?.desc}</p>
                <span className="go">
                  {t.chat.triageBtn}
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                </span>
              </button>

              <button
                type="button"
                className="action rose"
                onClick={() => openFirstAidGuide('pregnancy')}
              >
                <span className="ico" aria-hidden="true">
                  <Baby className="w-5 h-5" strokeWidth={2} />
                </span>
                <h3>{t.welcomeShowcase.pregnancyCta}</h3>
                <p>{t.visuals.cards.pregnancy.caption}</p>
                <span className="go">
                  {t.visuals.openGuideCta}
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                </span>
              </button>

              <button
                type="button"
                className="action blue"
                onClick={() => setIsHospitalsModalOpen(true)}
              >
                <span className="ico" aria-hidden="true">
                  <Building2 className="w-5 h-5" strokeWidth={2} />
                </span>
                <h3>{t.welcomeShowcase.hospitalsCta}</h3>
                <p>{t.visuals.cards.hospital.caption}</p>
                <span className="go">
                  {t.header.hospitals}
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= SYMPTOMS ================= */}
        <section className="sec" id="symptoms">
          <div className="wrap">
            <div className="sec-head reveal" data-reveal>
              <div>
                <div className="kicker">{t.chat.commonSymptomsTitle}</div>
                <h2>{t.sectionHeadings.symptoms}</h2>
                <p>{t.chat.scrollHint}</p>
              </div>
            </div>

            <div className="sym-grid stagger" data-reveal>
              {t.symptoms.map((item, idx) => (
                <button
                  key={`sym-${selectedLanguage}-${idx}`}
                  type="button"
                  className="sym"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(item.text)}
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

        {/* ================= VISUAL CARE GUIDES ================= */}
        <section className="sec" id="guides">
          <div className="wrap">
            <div className="sec-head reveal" data-reveal>
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
                {t.header.hospitals}
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
              </button>
            </div>

            <div className="guide-grid stagger" data-reveal>
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

              <button
                type="button"
                className="guide-card"
                onClick={() => setIsHospitalsModalOpen(true)}
              >
                <span className="shot">
                  <ResilientImage
                    src={VISUAL_ASSETS.hospital.src}
                    alt={t.visuals.cards.hospital.title}
                    variant="hospital"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover"
                  />
                </span>
                <span className="body">
                  <h3>
                    {selectedState} {t.header.hospitals}
                  </h3>
                  <p>{t.visuals.cards.hospital.caption}</p>
                  <span className="go">
                    {t.visuals.hospitalsCta}
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="sec" id="how">
          <div className="wrap">
            <div className="sec-head reveal" data-reveal>
              <div>
                <div className="kicker">{t.contextBar.routingActive}</div>
                <h2>{t.sectionHeadings.how}</h2>
              </div>
            </div>

            <div className="steps stagger" data-reveal>
              {t.welcomeShowcase.pillars.map((pillar, i) => (
                <div className="step" key={i}>
                  <span className="num">{i + 1}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                  <span className="meta">
                    <CheckCheck className="w-3 h-3" strokeWidth={2.2} />
                    {t.contextBar.voiceAssisted}
                  </span>
                </div>
              ))}
            </div>

            <div className="emg-band reveal" id="emergency" data-reveal>
              <span className="ico" aria-hidden="true">
                <AlertTriangle className="w-5 h-5" strokeWidth={2.1} />
              </span>
              <div>
                <h3>{t.triageCard.immediateAttention}</h3>
                <p>{t.triageCard.defaultEmergencyWarning}</p>
              </div>
              <a className="btn" href="tel:112">
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
                <span className="brand-mark" aria-hidden="true">
                  <HeartPulse className="w-5 h-5" strokeWidth={2.1} />
                </span>
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
              <button type="button" onClick={() => openFirstAidGuide('ors')}>
                {t.header.firstAid}
              </button>
            </div>

            <div className="f-col">
              <h4>{pui.entryTitle}</h4>
              <button type="button" onClick={() => setIsPrivateChatOpen(true)}>
                {pui.entryTitle}
              </button>
              <button type="button" onClick={() => openFirstAidGuide('pregnancy')}>
                {t.welcomeShowcase.pregnancyCta}
              </button>
              <button type="button" onClick={() => openFirstAidGuide('choking')}>
                {t.visuals.cards.choking.title}
              </button>
            </div>

            <div className="f-col">
              <h4>{t.chat.commonSymptomsTitle}</h4>
              {t.symptoms.slice(0, 4).map((item, idx) => (
                <button key={`foot-${idx}`} type="button" onClick={() => handleSendMessage(item.text)}>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="f-col">
              <h4>{t.contextBar.call112}</h4>
              <a href="tel:112">112</a>
              <a href="tel:6232">NCDC · 6232</a>
              <a href="tel:767">Lagos · 767</a>
            </div>
          </div>

          <div className="f-bottom">
            <p className="disc">
              <b>{t.triageCard.defaultEmergencyWarning}</b> {t.chat.footerDisclaimerPrefix}{' '}
              {t.chat.footerCall112} {t.chat.footerImmediate}
            </p>
            <p>
              {t.chat.footerNcdc}
              <br />© {new Date().getFullYear()} NaijaHealth AI
            </p>
          </div>
        </div>
      </footer>

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        selectedState={selectedState}
        onSelectSymptomForTriage={(symptom) => handleSendMessage(`${t.emergencyPrefix} ${symptom}`)}
      />

      <HospitalDirectoryModal
        isOpen={isHospitalsModalOpen}
        onClose={() => setIsHospitalsModalOpen(false)}
        defaultState={selectedState}
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
    </div>
  );
}
