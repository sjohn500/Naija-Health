import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Check, 
  Building2, 
  Stethoscope, 
  Home, 
  ArrowRight, 
  ShieldAlert, 
  Share2, 
  MapPin, 
  Compass, 
  PhoneCall
} from 'lucide-react';
import { TriageResult, SupportedLanguage } from '../types/triage';

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

  const lang = triage.language || 'pidgin';

  const getSectionTitles = (language: SupportedLanguage) => {
    switch (language) {
      case 'english':
        return { causes: 'Potential Causes', home: 'Home Management', action: 'Action Plan', listen: 'Listen Aloud' };
      case 'hausa':
        return { causes: 'Abubuwan Da Ka Iya Kawo Shi', home: 'Maganin Gida', action: 'Mataki Na Gaba', listen: 'Saurara da Murya' };
      case 'yoruba':
        return { causes: 'Kini O Le Fa E', home: 'Ohun Ti O Le Se Ni Ile', action: 'Igbese To Kan', listen: 'Gbọ́ àsọyé' };
      case 'igbo':
        return { causes: 'Ihe Nwere Ike Na-ebute Ya', home: 'Ihe I Nwere Ike Ime n\'Ulo', action: 'Ihe I Ga-eme Na-esonụ', listen: 'Ge nti' };
      case 'pidgin':
      default:
        return { causes: 'Wetin Fit Dey Happen', home: 'Wetin You Fit Do For House', action: 'Next Step', listen: 'Listen (Gbo am)' };
    }
  };

  const titles = getSectionTitles(lang);

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
      ? `${triage.empathyNote || ''}. Emergency alert! ${triage.emergencyWarning || ''}. Action: ${triage.nextStep || triage.actionPlan}.`
      : `${triage.empathyNote || ''}. ${titles.causes}: ${triage.wetinFitDeyHappen || triage.potentialCauses}. ${titles.home}: ${triage.wetinYouFitDoForHouse || triage.homeManagement}. ${titles.action}: ${triage.nextStep || triage.actionPlan}.`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCopyWhatsApp = () => {
    const causes = triage.wetinFitDeyHappen || triage.potentialCauses || '';
    const home = triage.wetinYouFitDoForHouse || triage.homeManagement || '';
    const next = triage.nextStep || triage.actionPlan || '';

    const whatsappFormat = `*🟢 NAIJAHEALTH AI TRIAGE REPORT*
*Location:* ${triage.detectedLocation || 'Nigeria'}
*Urgency:* ${triage.isRedFlag ? '🚨 RED-FLAG EMERGENCY' : triage.urgencyLevel === 'urgent' ? '🟡 ATTENTION NEEDED' : '🟢 STABLE'}

${triage.empathyNote ? `_${triage.empathyNote}_\n\n` : ''}*1. [${titles.causes}]*
${causes}

*2. [${titles.home}]*
${triage.isRedFlag ? '❌ ALL HOME REMEDIES CANCELLED! RUSH TO HOSPITAL IMMEDIATELY!' : home}

*3. [${titles.action}]*
${next}

---------------------------------
_${triage.disclaimer}_`;

    navigator.clipboard.writeText(whatsappFormat).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const causesText = triage.wetinFitDeyHappen || triage.potentialCauses;
  const homeText = triage.wetinYouFitDoForHouse || triage.homeManagement;
  const nextStepText = triage.nextStep || triage.actionPlan;

  return (
    <div className={`rounded-2xl bg-white border transition-all overflow-hidden ${
      triage.isRedFlag 
        ? 'border-red-400 shadow-[0_4px_24px_rgba(220,38,38,0.08)] ring-1 ring-red-400/40' 
        : triage.urgencyLevel === 'urgent'
        ? 'border-amber-300 shadow-[0_4px_20px_rgba(217,119,6,0.06)]'
        : 'border-emerald-200/90 shadow-[0_4px_20px_rgba(0,135,81,0.06)]'
    }`}>
      {/* Sleek Top Clinical Ribbon */}
      <div className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
        triage.isRedFlag 
          ? 'bg-red-50/90 border-red-200 text-red-900' 
          : triage.urgencyLevel === 'urgent'
          ? 'bg-amber-50/80 border-amber-200/80 text-amber-900'
          : 'bg-[#F4F9F6] border-emerald-100 text-[#05472A]'
      }`}>
        <div className="flex items-center gap-2">
          {triage.isRedFlag ? (
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          ) : triage.urgencyLevel === 'urgent' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0" />
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs tracking-wider uppercase">
              {triage.isRedFlag 
                ? 'Emergency Evaluation' 
                : triage.urgencyLevel === 'urgent'
                ? 'Clinical Review Advised'
                : 'Routine Care / Safe at Home'}
            </span>
            {triage.detectedLocation && (
              <span className="text-[11px] font-medium text-stone-500 flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-[#008751]" />
                {triage.detectedLocation}
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSpeech}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isPlayingAudio 
                ? 'bg-red-600 text-white' 
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs'
            }`}
            title="Read out loud"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#008751]" />
                <span>{titles.listen}</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleCopyWhatsApp}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold shadow-2xs transition-colors"
            title="Share via WhatsApp"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Empathy Note */}
      {triage.empathyNote && (
        <div className="px-5 pt-4 text-xs sm:text-sm font-semibold text-[#008751] flex items-center gap-1.5">
          <span>💚</span>
          <span>{triage.empathyNote}</span>
        </div>
      )}

      {/* Red-Flag Urgent Callout if Active */}
      {triage.isRedFlag && (
        <div className="m-4 p-4 rounded-xl bg-red-600 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Immediate Medical Attention Required</span>
            </h4>
            <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
              {triage.emergencyWarning || 'Red-flag symptoms detected. Do not attempt home treatment.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href="tel:112"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-red-700 font-bold text-xs hover:bg-red-50 transition-colors shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>Call 112 Free</span>
            </a>
          </div>
        </div>
      )}

      {/* 3 Structured Sections - Clean Medical Style */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* 1. Potential Causes */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100 text-[#008751] font-bold text-xs">
              1
            </span>
            <span className="text-[#05472A] tracking-tight">[{titles.causes}]</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-7 whitespace-pre-line">
            {causesText}
          </p>
        </div>

        <div className="border-t border-stone-100" />

        {/* 2. Home Management */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
            <span className={`flex items-center justify-center w-5 h-5 rounded-md font-bold text-xs ${
              triage.isRedFlag ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-[#008751]'
            }`}>
              2
            </span>
            <span className="text-[#05472A] tracking-tight">[{titles.home}]</span>
            {triage.isRedFlag && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 ml-auto">
                Bypassed
              </span>
            )}
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed pl-7 whitespace-pre-line ${
            triage.isRedFlag ? 'text-red-700 font-medium italic' : 'text-stone-700'
          }`}>
            {homeText || (triage.isRedFlag ? 'Home remedies are withheld due to emergency warning signs. Rush immediately to emergency care.' : 'Ensure adequate rest and hydration with clean drinking water.')}
          </p>
        </div>

        <div className="border-t border-stone-100" />

        {/* 3. Action Plan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100 text-[#008751] font-bold text-xs">
                3
              </span>
              <span className="text-[#05472A] tracking-tight">[{titles.action}]</span>
            </div>
            <button
              onClick={onOpenHospitals}
              className="text-[11px] font-semibold text-[#008751] hover:underline flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Browse Hospitals</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-7 whitespace-pre-line">
            {nextStepText}
          </p>

          {/* Recommended Facilities Chips */}
          {triage.recommendedFacilities && triage.recommendedFacilities.length > 0 && (
            <div className="pl-7 pt-2 flex flex-wrap gap-1.5">
              {triage.recommendedFacilities.map((fac, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 text-stone-800 text-[11px] font-medium border border-stone-200"
                >
                  <Building2 className="w-3 h-3 text-[#008751]" />
                  <span>{fac}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Follow-up / Clarifying Questions */}
        {triage.clarifyingQuestions && triage.clarifyingQuestions.length > 0 && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Clarifying details:</span>
            </div>
            <div className="space-y-1">
              {triage.clarifyingQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectClarifyingQuestion(q)}
                  className="w-full text-left p-2 rounded-lg bg-white hover:bg-amber-100/40 border border-amber-200/50 text-xs text-stone-700 hover:text-stone-900 transition-colors flex items-center justify-between gap-2 group"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtle Disclaimer Footer */}
        <div className="pt-2 text-[10px] text-stone-400 leading-normal border-t border-stone-100">
          {triage.disclaimer || '⚠️ Medical Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, visit the nearest hospital or call 112 immediately.'}
        </div>
      </div>
    </div>
  );
};
