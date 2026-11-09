import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Share2, 
  Building2, 
  Stethoscope, 
  Home, 
  Compass, 
  MessageSquarePlus,
  ShieldAlert
} from 'lucide-react';
import { TriageResult } from '../types/triage';

interface TriageResultViewProps {
  triage: TriageResult;
  onSelectClarifyingQuestion: (question: string) => void;
  onOpenHospitals: () => void;
}

export const TriageResultView: React.FC<TriageResultViewProps> = ({
  triage,
  onSelectClarifyingQuestion,
  onOpenHospitals
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  // Text to speech narration for accessibility and patient comfort
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToRead = triage.isRedFlag
      ? `Emergency Alert. Red-flag symptoms detected. ${triage.emergencyWarning || ''}. Action plan: ${triage.actionPlan}.`
      : `Potential Causes: ${triage.potentialCauses}. Home Management: ${triage.homeManagement}. Action Plan: ${triage.actionPlan}.`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCopy = () => {
    const fullSummary = `NAIJAHEALTH AI MEDICAL TRIAGE REPORT
Urgency: ${triage.urgencyLevel.toUpperCase()}
Location: ${triage.detectedLocation || 'Nigeria'}

[Potential Causes]:
${triage.potentialCauses}

[Home Management]:
${triage.isRedFlag ? 'BYPASSED - IMMEDIATE HOSPITAL CARE REQUIRED' : triage.homeManagement}

[Action Plan]:
${triage.actionPlan}

${triage.disclaimer}`;

    navigator.clipboard.writeText(fullSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className={`rounded-3xl border shadow-sm overflow-hidden transition-all ${
      triage.isRedFlag 
        ? 'border-red-500 bg-red-50/20 shadow-red-500/10' 
        : triage.urgencyLevel === 'urgent'
        ? 'border-amber-300 bg-amber-50/20'
        : 'border-emerald-200 bg-emerald-50/20'
    }`}>
      {/* Urgency Badge Banner */}
      <div className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-white ${
        triage.isRedFlag 
          ? 'bg-gradient-to-r from-red-600 to-rose-700' 
          : triage.urgencyLevel === 'urgent'
          ? 'bg-gradient-to-r from-amber-600 to-yellow-600'
          : 'bg-gradient-to-r from-emerald-600 to-teal-700'
      }`}>
        <div className="flex items-center gap-2.5">
          {triage.isRedFlag ? (
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
          ) : triage.urgencyLevel === 'urgent' ? (
            <AlertTriangle className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-white" />
          )}
          <div>
            <span className="font-extrabold text-xs sm:text-sm tracking-wide uppercase">
              {triage.isRedFlag 
                ? '🔴 RED-FLAG EMERGENCY: SEEK IMMEDIATE PHYSICAL CARE' 
                : triage.urgencyLevel === 'urgent'
                ? '🟡 MODERATE URGENCY: CLINIC / HOSPITAL EVALUATION NEEDED'
                : '🟢 MILD / STABLE: SAFE HOME CARE & MONITORING'}
            </span>
            {triage.detectedLocation && (
              <span className="ml-2 text-[11px] opacity-90 font-medium">
                • {triage.detectedLocation}
              </span>
            )}
          </div>
        </div>

        {/* Action icons (Read aloud + copy) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSpeech}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
            title={isPlayingAudio ? 'Stop audio' : 'Listen to triage summary'}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 text-red-200" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPlayingAudio ? 'Stop' : 'Listen'}</span>
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
            title="Copy triage summary for your doctor or nurse"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share / Copy'}</span>
          </button>
        </div>
      </div>

      {/* Critical Red-Flag Warning Banner if Triggered */}
      {triage.isRedFlag && (
        <div className="m-4 p-4 rounded-2xl bg-red-100 border-2 border-red-400 text-red-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-red-900">
                CRITICAL SAFETY OVERRIDE: Home Remedies Bypassed
              </h4>
              <p className="text-xs text-red-800 mt-1 leading-relaxed">
                {triage.emergencyWarning || 
                  'Your symptoms indicate a serious medical emergency. Do not attempt home treatments or self-medication. Proceed immediately to the emergency unit of the nearest General Hospital or Teaching Hospital.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <a 
                  href="tel:112"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Dial National 112
                </a>
                <a 
                  href="tel:6232"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-red-300 text-red-800 hover:bg-red-50"
                >
                  NCDC Helpline 6232
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Concise Structured Sections */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Section 1: [Potential Causes] */}
        <div className="rounded-2xl p-4 bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-sm sm:text-base">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span>[Potential Causes]</span>
          </div>
          <div className="text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line pl-1">
            {triage.potentialCauses}
          </div>
        </div>

        {/* Section 2: [Home Management] */}
        <div className={`rounded-2xl p-4 border shadow-2xs ${
          triage.isRedFlag 
            ? 'bg-stone-50 border-stone-200 opacity-90' 
            : 'bg-white border-stone-200'
        }`}>
          <div className="flex items-center gap-2 mb-2 text-stone-800 font-bold text-sm sm:text-base">
            <div className={`p-1.5 rounded-lg ${triage.isRedFlag ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`}>
              <Home className="w-4 h-4" />
            </div>
            <span>[Home Management]</span>
            {triage.isRedFlag && (
              <span className="text-[11px] font-semibold text-red-600 ml-auto bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                Bypassed for Safety
              </span>
            )}
          </div>
          <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line pl-1 ${
            triage.isRedFlag ? 'text-stone-500 italic' : 'text-stone-700'
          }`}>
            {triage.homeManagement || (triage.isRedFlag ? 'Home remedies are withheld due to emergency warning signs. Rush immediately to emergency care.' : 'No special home management required beyond adequate rest and clean water.')}
          </div>
        </div>

        {/* Section 3: [Action Plan] */}
        <div className="rounded-2xl p-4 bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Compass className="w-4 h-4" />
              </div>
              <span>[Action Plan]</span>
            </div>
            <button
              onClick={onOpenHospitals}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Browse Hospitals</span>
            </button>
          </div>
          <div className="text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line pl-1">
            {triage.actionPlan}
          </div>

          {/* Recommended Local Facilities Chips */}
          {triage.recommendedFacilities && triage.recommendedFacilities.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                Target Facilities in {triage.detectedLocation || 'Your Area'}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {triage.recommendedFacilities.map((fac, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200"
                  >
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clarifying Questions (Follow-up chips) */}
        {triage.clarifyingQuestions && triage.clarifyingQuestions.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm mb-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Clarifying Questions to Better Help You:</span>
            </div>
            <div className="space-y-1.5">
              {triage.clarifyingQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectClarifyingQuestion(q)}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-200/60 text-xs text-stone-800 hover:text-amber-950 font-medium transition-colors flex items-center justify-between gap-2 group"
                >
                  <span>{q}</span>
                  <MessageSquarePlus className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Safety Disclaimer */}
        <div className="pt-2 text-[11px] text-stone-500 italic border-t border-stone-200/60 leading-normal">
          {triage.disclaimer || '⚠️ Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, please visit the nearest hospital or call 112 immediately.'}
        </div>
      </div>
    </div>
  );
};
