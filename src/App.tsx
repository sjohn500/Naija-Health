/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  RefreshCw,
  MapPin,
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  User,
  CheckCheck,
  Volume2,
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
} from 'lucide-react';
import { Header } from './components/Header';
import { EmergencyModal } from './components/EmergencyModal';
import { HospitalDirectoryModal } from './components/HospitalDirectoryModal';
import { FirstAidModal } from './components/FirstAidModal';
import { TriageResultView } from './components/TriageResultView';
import { ResilientImage } from './components/ResilientImage';
import { ChatMessage, TriageResult, SupportedLanguage, SUPPORTED_LANGUAGES } from './types/triage';
import { NIGERIAN_STATES_DATA } from './data/nigeriaHealthcareData';
import { TRANSLATIONS } from './data/localization';
import { VISUAL_ASSETS } from './data/visualAssets';

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
          <strong key={idx} className="font-bold text-stone-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9FAF9] text-stone-900">
      {/* Top Header */}
      <Header
        selectedState={selectedState}
        onSelectState={setSelectedState}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageChange}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenHospitals={() => setIsHospitalsModalOpen(true)}
        onOpenFirstAid={() => openFirstAidGuide('ors')}
      />

      {/* Main Responsive Workspace Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Primary Chat & Triage Column */}
        <section className="lg:col-span-8 flex flex-col gap-3.5 min-w-0">
          {/* Sleek Context & Accessibility Bar */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Region Chip */}
              <div className="flex items-center gap-1.5 font-medium text-stone-700 bg-stone-50 border border-stone-200/70 px-2.5 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-[#008751]" />
                <span className="font-bold text-stone-900">
                  {selectedState} {t.header.stateSuffix}
                </span>
                <span className="text-stone-400 hidden sm:inline">• {t.contextBar.routingActive}</span>
              </div>

              {/* Interactive Language & Voice badge */}
              <div className="flex items-center gap-1.5 font-medium text-[#05472A] bg-emerald-50/70 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
                <span>{currentLangMeta.flag}</span>
                <select
                  aria-label="Quick change language"
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="bg-transparent font-semibold text-[#05472A] focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.localName}
                    </option>
                  ))}
                </select>
                <span className="text-emerald-400">•</span>
                <Volume2 className="w-3.5 h-3.5 text-[#008751]" />
                <span className="text-[11px] font-semibold text-[#008751] hidden sm:inline">
                  {t.contextBar.voiceAssisted}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200/80 text-[11px]">
                <button
                  onClick={() => setViewMode('clinic')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    viewMode === 'clinic'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t.contextBar.clinicalMode}
                </button>
                <button
                  onClick={() => setViewMode('whatsapp')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    viewMode === 'whatsapp'
                      ? 'bg-[#008069] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t.contextBar.whatsappMode}
                </button>
              </div>

              {/* Reset Session */}
              <button
                onClick={handleResetChat}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium transition-colors cursor-pointer"
                title={t.contextBar.newSession}
              >
                <RefreshCw className="w-3 h-3 text-stone-500" />
                <span className="hidden sm:inline">{t.contextBar.newSession}</span>
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div
            className={`flex-1 border rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-[500px] lg:h-[calc(100vh-11.5rem)] lg:max-h-[760px] transition-all ${
              viewMode === 'whatsapp'
                ? 'bg-[#EFEAE2] border-[#D1D7DB]'
                : 'bg-white border-stone-200/90'
            }`}
          >
          {/* WhatsApp Header Ribbon if WhatsApp Mode */}
          {viewMode === 'whatsapp' && (
            <div className="bg-[#008069] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#006A57]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-xs">
                  🇳🇬
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                    <span>NaijaHealth AI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                  </div>
                  <span className="text-[10px] text-emerald-100 font-medium">
                    {t.contextBar.whatsappStatus}
                  </span>
                </div>
              </div>
              <a
                href="tel:112"
                className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
              >
                <PhoneCall className="w-3 h-3" />
                <span>{t.contextBar.call112}</span>
              </a>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((message) => {
              const isAssistant = message.sender === 'assistant';

              return (
                <div
                  key={message.id}
                  className={`flex gap-2.5 sm:gap-3 ${
                    isAssistant ? 'items-start' : 'items-start flex-row-reverse'
                  }`}
                >
                  {/* Subtle Professional Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isAssistant ? 'bg-[#008751] text-white' : 'bg-[#05472A] text-white'
                    }`}
                  >
                    {isAssistant ? (
                      <HeartPulse className="w-4 h-4 text-emerald-100" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[94%] sm:max-w-[85%] space-y-1 ${
                      isAssistant ? 'text-left' : 'text-right'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-medium px-1">
                      <span>{isAssistant ? 'NaijaHealth AI' : t.chat.you}</span>
                      <span>•</span>
                      <span>{message.timestamp}</span>
                      {!isAssistant && <CheckCheck className="w-3 h-3 text-[#008751] inline" />}
                    </div>

                    {message.triageData ? (
                      <TriageResultView
                        triage={message.triageData}
                        onSelectClarifyingQuestion={(q) => handleSendMessage(q)}
                        onOpenHospitals={() => setIsHospitalsModalOpen(true)}
                        onOpenFirstAid={(guideId) => openFirstAidGuide(guideId)}
                      />
                    ) : (
                      <div
                        className={`rounded-2xl overflow-hidden text-xs sm:text-sm leading-relaxed text-left shadow-2xs ${
                          isAssistant
                            ? viewMode === 'whatsapp'
                              ? 'bg-white text-stone-900 border border-stone-200/80 rounded-tl-xs'
                              : 'bg-stone-50/90 text-stone-800 border border-stone-200/80'
                            : viewMode === 'whatsapp'
                            ? 'bg-[#D9FDD3] text-stone-900 border border-[#C1E8B7] rounded-tr-xs font-medium ml-auto'
                            : 'bg-[#008751] text-white font-medium ml-auto shadow-xs'
                        }`}
                      >
                        {message.id === 'welcome-1' ? (
                          <div className="bg-white">
                            <div className="relative aspect-[16/9] max-h-60 w-full overflow-hidden border-b border-stone-200/70">
                              <ResilientImage
                                src={VISUAL_ASSETS.welcome.src}
                                alt={t.welcomeShowcase.headline}
                                variant="welcome"
                                className="w-full h-full"
                                imgClassName="w-full h-full object-cover object-[50%_22%]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
                                <h2 className="text-base sm:text-lg font-extrabold leading-tight tracking-tight font-display">
                                  {t.welcomeShowcase.headline}
                                </h2>
                                <p className="text-xs sm:text-[13px] text-emerald-100/95 mt-1 leading-snug max-w-xl">
                                  {t.welcomeShowcase.tagline}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 space-y-3.5">
                              {/* 3 Scannable Pillars */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {t.welcomeShowcase.pillars.map((pillar, pIdx) => {
                                  const PillarIcon =
                                    pIdx === 0 ? Volume2 : pIdx === 1 ? Baby : Building2;
                                  const iconTone =
                                    pIdx === 0
                                      ? 'text-[#008751]'
                                      : pIdx === 1
                                      ? 'text-pink-600'
                                      : 'text-emerald-700';

                                  return (
                                    <div
                                      key={pIdx}
                                      className="p-2.5 rounded-xl border border-stone-200/80 bg-[#F9FAF9]"
                                    >
                                      <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 mb-0.5">
                                        <PillarIcon className={`w-3.5 h-3.5 shrink-0 ${iconTone}`} />
                                        <span className="truncate">{pillar.title}</span>
                                      </div>
                                      <p className="text-[11px] text-stone-600 leading-snug">
                                        {pillar.desc}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Friendly Triage Greeting */}
                              <div className="whitespace-pre-line text-stone-700 text-xs sm:text-sm leading-relaxed">
                                {renderFormattedText(message.text)}
                              </div>

                              {/* Direct Interactive Launchers */}
                              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={toggleVoiceRecording}
                                  disabled={isTranscribing || isLoading}
                                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#05603A] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-40"
                                >
                                  <Mic className="w-3.5 h-3.5 shrink-0" />
                                  <span>{t.welcomeShowcase.voiceCta}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openFirstAidGuide('pregnancy')}
                                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Baby className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                                  <span>{t.welcomeShowcase.pregnancyCta}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsHospitalsModalOpen(true)}
                                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Building2 className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                                  <span>{t.welcomeShowcase.hospitalsCta}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 whitespace-pre-line">
                            {renderFormattedText(message.text)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Clean Loading State */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#008751] text-white flex items-center justify-center animate-pulse">
                  <HeartPulse className="w-4 h-4 animate-spin text-emerald-100" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-stone-700 text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#008751] animate-ping" />
                  <span>{t.chat.evaluating}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Symptom Chips with Vibrant Category Colors & Full Localization */}
          <div className="px-3.5 py-2.5 bg-white border-t border-stone-200/80">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <span>{t.chat.commonSymptomsTitle}</span>
              </span>
              <span className="text-[10px] text-stone-400 hidden sm:inline">
                {t.chat.scrollHint}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {t.symptoms.map((item, idx) => {
                const renderIcon = () => {
                  switch (item.iconName) {
                    case 'thermometer':
                      return <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
                    case 'droplet':
                      return <Droplet className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
                    case 'zap':
                      return <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
                    case 'wind':
                      return <Wind className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
                    case 'heart':
                      return <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
                    case 'activity':
                      return <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
                    case 'baby':
                      return <Baby className="w-3.5 h-3.5 text-pink-600 shrink-0" />;
                    case 'alert':
                      return (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 animate-pulse" />
                      );
                    default:
                      return <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
                  }
                };

                return (
                  <button
                    key={`${selectedLanguage}-${idx}`}
                    onClick={() => handleSendMessage(item.text)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer disabled:opacity-40 ${item.bgColor} ${item.textColor} ${item.borderColor} ${item.hoverColor}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} shrink-0`} />
                    {renderIcon()}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice recognition error note */}
          {recognitionError && (
            <div className="px-4 py-1 text-xs text-red-600 font-medium bg-red-50/60 border-t border-red-100">
              {recognitionError}
            </div>
          )}

          {/* Professional Docked Input Box */}
          <div className="p-3 bg-white border-t border-stone-200/80">
            <div className="relative flex items-center gap-2 bg-[#F6F8F6] border border-stone-200/90 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#008751]/20 focus-within:border-[#008751] focus-within:bg-white transition-all shadow-2xs">
              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                disabled={isTranscribing || isLoading}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : isTranscribing
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'text-[#008751] hover:bg-emerald-100/70 bg-emerald-50 border border-emerald-200/60'
                }`}
                title={isListening ? t.chat.tapToStopRecording : t.chat.tapToSpeak}
                aria-label="Voice input"
              >
                {isTranscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Text Input Field */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isTranscribing
                    ? t.chat.placeholderTranscribing
                    : isListening
                    ? mediaRecorderRef.current
                      ? t.chat.placeholderRecording
                      : t.chat.placeholderListening
                    : t.chat.placeholderIdle
                }
                disabled={isLoading || isTranscribing}
                className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none px-2"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading || isTranscribing}
                className="p-2 sm:px-3 rounded-xl bg-[#008751] hover:bg-[#05603A] text-white disabled:opacity-30 disabled:hover:bg-[#008751] transition-all shadow-xs active:scale-95 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                aria-label="Submit symptoms for medical triage"
              >
                <span className="hidden sm:inline">{t.chat.triageBtn}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

          {/* Discreet Professional Footer Disclaimer */}
          <div className="px-2 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#008751] shrink-0" />
              <span>
                {t.chat.footerDisclaimerPrefix} <strong>{t.chat.footerCall112}</strong>{' '}
                {t.chat.footerImmediate}
              </span>
            </div>
            <span className="text-stone-400 text-[10px]">{t.chat.footerNcdc}</span>
          </div>
        </section>

        {/* Illustrated Visual Care & Hospital Quick-Access Rail */}
        <aside className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-stone-200/90 rounded-3xl p-4 shadow-sm space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 font-display">
                  <BookOpen className="w-4 h-4 text-[#008751] shrink-0" />
                  <span>{t.visuals.guidesTitle}</span>
                </h2>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                {t.visuals.guidesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {/* Card 1: ORS Salt-Sugar Drink */}
              <button
                type="button"
                onClick={() => openFirstAidGuide('ors')}
                className="w-full text-left p-2.5 rounded-2xl border border-stone-200/80 bg-[#F9FAF9] hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-center gap-3 group cursor-pointer min-h-[44px]"
              >
                <ResilientImage
                  src={VISUAL_ASSETS.ors.src}
                  alt={t.visuals.cards.ors.title}
                  variant="ors"
                  className="w-24 aspect-[4/3] rounded-xl shrink-0 border border-stone-200/70"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-[#05472A] leading-snug flex items-center justify-between gap-1">
                    <span className="truncate">{t.visuals.cards.ors.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008751] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                    {t.visuals.cards.ors.caption}
                  </p>
                </div>
              </button>

              {/* Card 2: Fever Tepid Sponging */}
              <button
                type="button"
                onClick={() => openFirstAidGuide('tepid-sponging')}
                className="w-full text-left p-2.5 rounded-2xl border border-stone-200/80 bg-[#F9FAF9] hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-center gap-3 group cursor-pointer min-h-[44px]"
              >
                <ResilientImage
                  src={VISUAL_ASSETS.sponging.src}
                  alt={t.visuals.cards.sponging.title}
                  variant="sponging"
                  className="w-24 aspect-[4/3] rounded-xl shrink-0 border border-stone-200/70"
                  imgClassName="w-full h-full object-cover object-[50%_20%]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-[#05472A] leading-snug flex items-center justify-between gap-1">
                    <span className="truncate">{t.visuals.cards.sponging.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008751] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                    {t.visuals.cards.sponging.caption}
                  </p>
                </div>
              </button>

              {/* Card 3: Pregnancy & Antenatal Care */}
              <button
                type="button"
                onClick={() => openFirstAidGuide('pregnancy')}
                className="w-full text-left p-2.5 rounded-2xl border border-pink-200/80 bg-pink-50/40 hover:border-pink-300 hover:bg-pink-50/80 transition-all flex items-center gap-3 group cursor-pointer min-h-[44px]"
              >
                <ResilientImage
                  src={VISUAL_ASSETS.pregnancy.src}
                  alt={t.visuals.cards.pregnancy.title}
                  variant="pregnancy"
                  className="w-24 aspect-[4/3] rounded-xl shrink-0 border border-pink-200/70"
                  imgClassName="w-full h-full object-cover object-[50%_20%]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-pink-950 leading-snug flex items-center justify-between gap-1">
                    <span className="truncate">{t.visuals.cards.pregnancy.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-pink-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                    {t.visuals.cards.pregnancy.caption}
                  </p>
                </div>
              </button>

              {/* Card 4: Choking First Aid */}
              <button
                type="button"
                onClick={() => openFirstAidGuide('choking')}
                className="w-full text-left p-2.5 rounded-2xl border border-stone-200/80 bg-[#F9FAF9] hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-center gap-3 group cursor-pointer min-h-[44px]"
              >
                <ResilientImage
                  src={VISUAL_ASSETS.choking.src}
                  alt={t.visuals.cards.choking.title}
                  variant="choking"
                  className="w-24 aspect-[4/3] rounded-xl shrink-0 border border-stone-200/70"
                  imgClassName="w-full h-full object-cover object-[50%_20%]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-[#05472A] leading-snug flex items-center justify-between gap-1">
                    <span className="truncate">{t.visuals.cards.choking.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008751] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                    {t.visuals.cards.choking.caption}
                  </p>
                </div>
              </button>

              {/* Card 5: State Hospitals & Emergency Dispatch */}
              <button
                type="button"
                onClick={() => setIsHospitalsModalOpen(true)}
                className="w-full text-left p-2.5 rounded-2xl border border-stone-200/80 bg-[#F4F9F6] hover:border-emerald-400 hover:bg-emerald-50 transition-all flex items-center gap-3 group cursor-pointer min-h-[44px]"
              >
                <ResilientImage
                  src={VISUAL_ASSETS.hospital.src}
                  alt={t.visuals.cards.hospital.title}
                  variant="hospital"
                  className="w-24 aspect-video rounded-xl shrink-0 border border-emerald-200/70"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#05472A] leading-snug flex items-center justify-between gap-1">
                    <span className="truncate flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                      <span className="truncate">{selectedState} {t.header.hospitals}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008751] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                    {t.visuals.cards.hospital.caption}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Modals */}
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

      <FirstAidModal
        isOpen={isFirstAidModalOpen}
        onClose={() => setIsFirstAidModalOpen(false)}
        initialGuideId={firstAidGuideId}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
}
