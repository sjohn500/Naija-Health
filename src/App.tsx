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
  Building2, 
  User, 
  MessageSquare, 
  CheckCheck,
  Languages,
  Volume2,
  PhoneCall,
  Sparkles,
  Thermometer,
  Droplet,
  Zap,
  Wind,
  Heart,
  Activity
} from 'lucide-react';
import { Header } from './components/Header';
import { EmergencyModal } from './components/EmergencyModal';
import { HospitalDirectoryModal } from './components/HospitalDirectoryModal';
import { FirstAidModal } from './components/FirstAidModal';
import { TriageResultView } from './components/TriageResultView';
import { ChatMessage, TriageResult, SupportedLanguage, SUPPORTED_LANGUAGES } from './types/triage';
import { COMMON_SYMPTOM_PROMPTS, NIGERIAN_STATES_DATA } from './data/nigeriaHealthcareData';

type ViewMode = 'clinic' | 'whatsapp';

const GREETINGS: Record<SupportedLanguage, string> = {
  pidgin: `Ayaah, Pele o! Sannu! Ndewo! 💚

I be **NaijaHealth AI**, your empathetic medical triage assistant. I clear my mind of any big big medical grammar make ordinary person for market understand everything clearly.

I go break down everything give you inside 3 simple parts:
1. **[Wetin Fit Dey Happen]** - Simple explanation of the symptoms.
2. **[Wetin You Fit Do For House]** - Safe, practical first-aid (like ORS for purging or tepid sponging).
3. **[Next Step]** - When and which hospital for your state you need waka go.

*Tip: You fit tap the green microphone button to speak your symptoms, or tap the speaker button on any advice to listen!*

Abeg tell me: **How your body dey do you right now, and which state or town you dey inside Nigeria?**`,

  english: `Hello and welcome! Sannu, Ndewo, Bawo ni! 💚

I am **NaijaHealth AI**, your empathetic medical triage assistant for Nigeria. I provide clear, evidence-based guidance in simple terms without complicated medical jargon.

I provide structured guidance in 3 parts:
1. **[Potential Causes]** - Clear explanation of common reasons for your symptoms.
2. **[Home Management]** - Safe, practical first-aid and home care steps.
3. **[Action Plan]** - Exactly when and where to visit physical hospitals in your state.

*Tip: Tap the microphone button to dictate symptoms, or tap the speaker button on any message to listen aloud!*

Please tell me: **What symptoms are you experiencing, and what state or city in Nigeria are you located in?**`,

  hausa: `Sannu da zuwa! Allah Ya sauwake! 💚

Ni ne **NaijaHealth AI**, mataimakin ku na kiwon lafiya a Najeriya. Zan bayyana muku komai a saukake yadda kowa zai gane ba tare da dogon maganar likitanci ba.

Zan raba bayanin gida uku:
1. **[Abubuwan Da Ka Iya Kawo Shi]** - Bayanin abin da ke damun ka.
2. **[Maganin Gida]** - Abubuwan da zaka iya yi a gida lafiya (kamar ruwan gishiri da sukari na zawo).
3. **[Mataki Na Gaba / Asibiti]** - Lokacin da ya kamata ka tafi asibiti kusa da kai.

*Tukwici: Danna hoton lasifika don sauraron bayanin da murya, ko danna makirufo don yin magana!*

Fada min: **Yaya jikin ka ke yi maka a yanzu, kuma a wacce jiha ko gari kake a Najeriya?**`,

  yoruba: `Ẹ káàbọ̀! Pẹlẹ o! 💚

Èmi ni **NaijaHealth AI**, olùrànlọ́wọ́ ìtọ́jú ìlera yín ní Nàìjíríà. Màá ṣàlàyé gbogbo rẹ̀ ní kedere ní èdè tó rọrùn láìsí àwọn ọ̀rọ̀ dọ́kítà tó le koko.

Màá pín ìtọ́sọ́nà náà sí apá mẹ́ta:
1. **[Kini O Le Fa E]** - Àlàyé ohun tó ń fa àwọn àmì àìsàn rẹ.
2. **[Ohun Ti O Le Se Ni Ile]** - Ìtọ́jú àkọ́kọ́ tó láàbò ní ilé.
3. **[Igbese To Kan / Ile Iwosan]** - Ìgbà tí ó yẹ kí ẹ lọ sí ilé-ìwòsàn ní ìpínlẹ̀ yín.

*Àkíyèsí: Ẹ tẹ bọ́tìnì agbóhùnsáféfẹ́ láti gbọ́ ọ̀rọ̀ náà pẹ̀lú ohùn, tàbí kí ẹ tẹ maikirofoonu láti sọ̀rọ̀!*

Ẹ sọ fún mi: **Báwo ni ara ṣe ń ṣe yín báyìí, àti pé ìpínlẹ̀ tàbí ìlú wo ni ẹ wà ní Nàìjíríà?**`,

  igbo: `Nnọọ! Ndewo! Ndo nu! 💚

Abụ m **NaijaHealth AI**, onye inyeaka ahụike gị na Naịjirịa. Agaghị m eji nnukwu okwu dọkịta siri ike kwuo okwu, m ga-akọwa ihe niile n'ụzọ dị mfe ka onye ọ bụla wee ghọta ya nke ọma.

M ga-ekewa ya ụzọ atọ:
1. **[Ihe Nwere Ike Na-ebute Ya]** - Nkọwa dị mfe gbasara ihe na-eme gị.
2. **[Ihe I Nwere Ike Ime n'Ulo]** - Ọgwụgwọ ụlọ dị mma.
3. **[Ihe I Ga-eme Na-esonụ / Hospital]** - Mgbe ị ga-aga ụlọ ọgwụ dị na steeti gị.

*Ndụmọdụ: Pịa bọtịnụ igwe okwu iji gee ntị n'olu, ma ọ bụ pịa igwe okwu ka i jiri ọnụ kwuo okwu!*

Biko gwa m: **Kedu ka ahụ dị gị ugbu a, ma kedu steeti ma ọ bụ obodo ị nọ na Naịjirịa?**`
};

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('pidgin');
  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [cityInput, setCityInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome-1',
    sender: 'assistant',
    text: GREETINGS['pidgin'],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('clinic');

  // Modals state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isHospitalsModalOpen, setIsHospitalsModalOpen] = useState<boolean>(false);
  const [isFirstAidModalOpen, setIsFirstAidModalOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle language switch
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setSelectedLanguage(newLang);
    if (messages.length === 1 && messages[0].id === 'welcome-1') {
      setMessages([{
        id: 'welcome-1',
        sender: 'assistant',
        text: GREETINGS[newLang],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  // Web Speech Recognition for voice input
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      if (selectedLanguage === 'hausa') recognition.lang = 'ha';
      else if (selectedLanguage === 'yoruba') recognition.lang = 'yo';
      else if (selectedLanguage === 'igbo') recognition.lang = 'ig';
      else recognition.lang = 'en-NG';

      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setRecognitionError('Voice input error. Please type or try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Your browser does not support voice typing. Please type your symptoms.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setRecognitionError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          language: selectedLanguage,
          conversationHistory: historyPayload,
          userLocation: {
            state: selectedState,
            city: cityInput.trim() || undefined
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: TriageResult = await res.json();

      if (data.detectedLocation && NIGERIAN_STATES_DATA[data.detectedLocation]) {
        setSelectedState(data.detectedLocation);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.fullFormattedResponse || `${data.wetinFitDeyHappen || data.potentialCauses}\n\n${data.wetinYouFitDoForHouse || data.homeManagement}\n\n${data.nextStep || data.actionPlan}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageData: data,
        isEmergencyAlert: data.isRedFlag
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Failed to get triage response:', error);
      const fallbackText = selectedLanguage === 'english'
        ? `We had trouble connecting to the network. If you feel very unwell, please visit the nearest General Hospital in ${selectedState} State or dial 112 immediately.`
        : `Ayaah, network hold my hand small. But if your body no do you well at all, abeg waka go the nearest General Hospital for ${selectedState} State or dial 112 for emergency!`;

      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([{
      id: 'welcome-1',
      sender: 'assistant',
      text: GREETINGS[selectedLanguage],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

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
        onOpenFirstAid={() => setIsFirstAidModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col gap-3.5">
        {/* Sleek Context & Accessibility Bar */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Region Chip */}
            <div className="flex items-center gap-1.5 font-medium text-stone-700 bg-stone-50 border border-stone-200/70 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-[#008751]" />
              <span className="font-bold text-stone-900">{selectedState} State</span>
              <span className="text-stone-400 hidden sm:inline">• Health routing active</span>
            </div>

            {/* Language & Voice badge */}
            <div className="flex items-center gap-1.5 font-medium text-[#05472A] bg-emerald-50/70 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
              <span>{currentLangMeta.flag}</span>
              <span className="font-semibold">{currentLangMeta.localName}</span>
              <span className="text-emerald-400">•</span>
              <Volume2 className="w-3.5 h-3.5 text-[#008751]" />
              <span className="text-[11px] font-semibold text-[#008751] hidden sm:inline">Voice Assisted</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200/80 text-[11px]">
              <button
                onClick={() => setViewMode('clinic')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  viewMode === 'clinic'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Clinical
              </button>
              <button
                onClick={() => setViewMode('whatsapp')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  viewMode === 'whatsapp'
                    ? 'bg-[#008069] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                WhatsApp
              </button>
            </div>

            {/* Reset Session */}
            <button
              onClick={handleResetChat}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium transition-colors"
              title="Reset conversation session"
            >
              <RefreshCw className="w-3 h-3 text-stone-500" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          </div>
        </div>

        {/* Conversation Area */}
        <div className={`flex-1 border rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-[490px] transition-all ${
          viewMode === 'whatsapp'
            ? 'bg-[#EFEAE2] border-[#D1D7DB]'
            : 'bg-white border-stone-200/90'
        }`}>
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
                    online • Nigerian Medical Triage
                  </span>
                </div>
              </div>
              <a
                href="tel:112"
                className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call 112</span>
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
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isAssistant 
                      ? 'bg-[#008751] text-white' 
                      : 'bg-[#05472A] text-white'
                  }`}>
                    {isAssistant ? <HeartPulse className="w-4 h-4 text-emerald-100" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`max-w-[94%] sm:max-w-[85%] space-y-1 ${
                    isAssistant ? 'text-left' : 'text-right'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-medium px-1">
                      <span>{isAssistant ? 'NaijaHealth AI' : 'You'}</span>
                      <span>•</span>
                      <span>{message.timestamp}</span>
                      {!isAssistant && <CheckCheck className="w-3 h-3 text-[#008751] inline" />}
                    </div>

                    {message.triageData ? (
                      <TriageResultView
                        triage={message.triageData}
                        onSelectClarifyingQuestion={(q) => handleSendMessage(`Answer: ${q}`)}
                        onOpenHospitals={() => setIsHospitalsModalOpen(true)}
                      />
                    ) : (
                      <div className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-left shadow-2xs ${
                        isAssistant
                          ? viewMode === 'whatsapp'
                            ? 'bg-white text-stone-900 border border-stone-200/80 rounded-tl-xs'
                            : 'bg-stone-50/90 text-stone-800 border border-stone-200/80'
                          : viewMode === 'whatsapp'
                          ? 'bg-[#D9FDD3] text-stone-900 border border-[#C1E8B7] rounded-tr-xs font-medium ml-auto'
                          : 'bg-[#008751] text-white font-medium ml-auto shadow-xs'
                      }`}>
                        {message.text}
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
                  <span>Evaluating symptoms and checking verified Nigerian clinical protocols...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Symptom Chips with Vibrant Category Colors */}
          <div className="px-3.5 py-2.5 bg-white border-t border-stone-200/80">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <span>⚡ Common Symptoms (Tap to triage):</span>
              </span>
              <span className="text-[10px] text-stone-400 hidden sm:inline">
                Scroll to see all →
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {COMMON_SYMPTOM_PROMPTS.map((item, idx) => {
                const renderIcon = () => {
                  switch (item.iconName) {
                    case 'thermometer': return <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
                    case 'droplet': return <Droplet className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
                    case 'zap': return <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
                    case 'wind': return <Wind className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
                    case 'heart': return <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
                    case 'activity': return <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
                    case 'alert': return <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 animate-pulse" />;
                    default: return <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
                  }
                };

                return (
                  <button
                    key={idx}
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
            <div className="px-4 py-1 text-xs text-red-600 font-medium">
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
                className={`p-2 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'text-[#008751] hover:bg-emerald-100/70 bg-emerald-50 border border-emerald-200/60'
                }`}
                title={isListening ? 'Stop recording' : 'Dictate your symptoms using your voice'}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
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
                  isListening 
                    ? 'Listening to your voice...' 
                    : selectedLanguage === 'english'
                    ? 'Type your symptoms (e.g. fever for 2 days, purging, Ikeja Lagos)...'
                    : selectedLanguage === 'hausa'
                    ? 'Bayyana abin da ke damun ka (misali: zazzabi, zawo, Kano)...'
                    : selectedLanguage === 'yoruba'
                    ? 'Kọ bí ara ṣe ń ṣe yín (àpẹẹrẹ: ibà, ìgbẹ́ gbuuru, Ibadan)...'
                    : 'Describe how body dey do you (e.g. 2 days hot body, purging, Ikeja Lagos)...'
                }
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none px-2"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="p-2 sm:px-3 rounded-xl bg-[#008751] hover:bg-[#05603A] text-white disabled:opacity-30 disabled:hover:bg-[#008751] transition-all shadow-xs active:scale-95 font-semibold text-xs flex items-center gap-1.5"
                aria-label="Submit symptoms for medical triage"
              >
                <span className="hidden sm:inline">Triage</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Discreet Professional Footer Disclaimer */}
        <div className="px-2 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#008751] shrink-0" />
            <span>NaijaHealth AI provides informational medical triage. For emergencies, please call <strong>112</strong> immediately.</span>
          </div>
          <span className="text-stone-400 text-[10px]">
            Federal Ministry of Health & NCDC Aligned Guidelines
          </span>
        </div>
      </main>

      {/* Modals */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        selectedState={selectedState}
        onSelectSymptomForTriage={(symptom) => handleSendMessage(`EMERGENCY CHECK: ${symptom}`)}
      />

      <HospitalDirectoryModal
        isOpen={isHospitalsModalOpen}
        onClose={() => setIsHospitalsModalOpen(false)}
        defaultState={selectedState}
      />

      <FirstAidModal
        isOpen={isFirstAidModalOpen}
        onClose={() => setIsFirstAidModalOpen(false)}
      />
    </div>
  );
}
