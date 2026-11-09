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
  Sparkles, 
  HeartPulse, 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  Building2, 
  BookOpen, 
  FileText, 
  User, 
  Bot,
  HelpCircle
} from 'lucide-react';
import { Header } from './components/Header';
import { EmergencyModal } from './components/EmergencyModal';
import { HospitalDirectoryModal } from './components/HospitalDirectoryModal';
import { FirstAidModal } from './components/FirstAidModal';
import { TriageResultView } from './components/TriageResultView';
import { ChatMessage, TriageResult } from './types/triage';
import { COMMON_SYMPTOM_PROMPTS, NIGERIAN_STATES_DATA } from './data/nigeriaHealthcareData';

const INITIAL_GREETING: ChatMessage = {
  id: 'welcome-1',
  sender: 'assistant',
  text: `Sannu, Ndewo, Bawo ni! Welcome to **NaijaHealth AI**, your dedicated medical triage assistant developed to support communities across Nigeria.

I am here to listen carefully to your symptoms, ask clarifying questions if details are missing, and provide structured guidance tailored to your location in Nigeria:
- **[Potential Causes]** explained simply with local health awareness
- **[Home Management]** with safe, practical first-aid steps
- **[Action Plan]** specifying exactly when and where to seek physical care

Tell me: **What symptoms are you or your loved one experiencing, and what state or city are you currently located in?**`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export default function App() {
  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [cityInput, setCityInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Modals state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isHospitalsModalOpen, setIsHospitalsModalOpen] = useState<boolean>(false);
  const [isFirstAidModalOpen, setIsFirstAidModalOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Setup Web Speech Recognition for voice input if supported
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-NG'; // Nigerian English

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
          setRecognitionError('Voice input error. Please type your symptoms.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your symptoms.');
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
      // Prepare conversation history for the server
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

      // If state was detected from user's message, update state selection automatically
      if (data.detectedLocation && NIGERIAN_STATES_DATA[data.detectedLocation]) {
        setSelectedState(data.detectedLocation);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.fullFormattedResponse || `${data.potentialCauses}\n\n${data.homeManagement}\n\n${data.actionPlan}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageData: data,
        isEmergencyAlert: data.isRedFlag
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Failed to get triage response:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `I had trouble connecting to the triage engine. Please visit the nearest General Hospital or Comprehensive Health Centre in ${selectedState} State if you feel unwell, or dial 112 for emergencies.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
      {/* Top Navigation & Emergency Hotlines */}
      <Header
        selectedState={selectedState}
        onSelectState={setSelectedState}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenHospitals={() => setIsHospitalsModalOpen(true)}
        onOpenFirstAid={() => setIsFirstAidModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* State Banner / Context helper */}
        <div className="bg-white border border-stone-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Current Location:
                </span>
                <span className="font-extrabold text-stone-900 text-sm">
                  {selectedState} State
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Facility recommendations will route to General Hospitals & Teaching Centres in {selectedState}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Red-Flag Symptoms</span>
            </button>
            <button
              onClick={handleResetChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-medium transition-colors"
              title="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 bg-white border border-stone-200 rounded-3xl shadow-sm p-4 sm:p-6 flex flex-col overflow-hidden min-h-[460px]">
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {messages.map((message) => {
              const isAssistant = message.sender === 'assistant';

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 sm:gap-4 ${
                    isAssistant ? 'items-start' : 'items-start flex-row-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isAssistant 
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white' 
                      : 'bg-stone-800 text-white'
                  }`}>
                    {isAssistant ? (
                      <HeartPulse className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>

                  {/* Message Bubble & Content */}
                  <div className={`max-w-[90%] sm:max-w-[85%] space-y-2 ${
                    isAssistant ? 'text-left' : 'text-right'
                  }`}>
                    {/* Timestamp & Sender */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium px-1">
                      <span>{isAssistant ? 'NaijaHealth AI Assistant' : 'You'}</span>
                      <span>•</span>
                      <span>{message.timestamp}</span>
                    </div>

                    {/* Standard text or structured triage output */}
                    {message.triageData ? (
                      <TriageResultView
                        triage={message.triageData}
                        onSelectClarifyingQuestion={(q) => handleSendMessage(`Regarding: ${q}`)}
                        onOpenHospitals={() => setIsHospitalsModalOpen(true)}
                      />
                    ) : (
                      <div className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-left ${
                        isAssistant
                          ? 'bg-stone-50 border border-stone-200 text-stone-800 shadow-2xs'
                          : 'bg-emerald-700 text-white font-medium ml-auto shadow-xs'
                      }`}>
                        {message.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center animate-pulse">
                  <HeartPulse className="w-5 h-5 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>Evaluating symptoms and checking Nigerian clinical guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Symptom Chips */}
          <div className="pt-4 border-t border-stone-100 mt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Common Nigerian Symptoms (Tap to triage):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {COMMON_SYMPTOM_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.text)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-stone-200 text-xs font-medium text-stone-700 whitespace-nowrap transition-colors disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice recognition error note */}
          {recognitionError && (
            <div className="text-xs text-red-600 py-1 font-medium">
              {recognitionError}
            </div>
          )}

          {/* Input Box */}
          <div className="mt-2 relative flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-2xs">
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2.5 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200'
              }`}
              title={isListening ? 'Stop voice recording' : 'Dictate symptoms in Nigerian English'}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
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
              placeholder={isListening ? 'Listening to your symptoms...' : 'Describe symptoms (e.g. fever for 2 days, purging, body pain, city)...'}
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none px-2"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 disabled:hover:bg-emerald-700 transition-colors shadow-2xs active:scale-95"
              aria-label="Send symptoms for triage"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Permanent Bottom Disclaimer Banner */}
        <div className="bg-stone-100 rounded-2xl p-3.5 border border-stone-200 text-stone-600 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="leading-snug">
              <strong>Medical Disclaimer:</strong> NaijaHealth AI is an informational triage support assistant and does not provide formal medical diagnoses or prescriptions. For acute emergencies, visit the nearest General Hospital or dial <strong>112</strong>.
            </span>
          </div>
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="text-red-700 font-bold hover:underline shrink-0 text-xs hidden sm:inline"
          >
            Emergency Protocols →
          </button>
        </div>
      </main>

      {/* Modals */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        selectedState={selectedState}
        onSelectSymptomForTriage={(symptom) => handleSendMessage(`EMERGENCY RED-FLAG CHECK: ${symptom}`)}
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
