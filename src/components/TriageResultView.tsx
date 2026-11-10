import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Volume2,
  VolumeX,
  Check,
  Building2,
  ArrowRight,
  ShieldAlert,
  Share2,
  MapPin,
  PhoneCall,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { TriageResult, SupportedLanguage } from '../types/triage';
import { TRANSLATIONS } from '../data/localization';
import { ResilientImage } from './ResilientImage';
import { resolveTriageVisual } from '../data/visualAssets';

interface TriageResultViewProps {
  triage: TriageResult;
  onSelectClarifyingQuestion: (question: string) => void;
  onOpenHospitals: () => void;
  onOpenFirstAid?: (guideId: string) => void;
}

export const TriageResultView: React.FC<TriageResultViewProps> = ({
  triage,
  onSelectClarifyingQuestion,
  onOpenHospitals,
  onOpenFirstAid,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cachedAudioUrlRef = useRef<string | null>(null);

  const lang: SupportedLanguage = triage.language || 'pidgin';
  const langBundle = TRANSLATIONS[lang] || TRANSLATIONS.pidgin;
  const tc = langBundle.triageCard;
  const tv = langBundle.visuals;
  const visualMeta = resolveTriageVisual(triage);
  const visualCopy = tv.cards[visualMeta.key];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (cachedAudioUrlRef.current) {
        URL.revokeObjectURL(cachedAudioUrlRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const causesText = triage.wetinFitDeyHappen || triage.potentialCauses || '';
  const homeText = triage.wetinYouFitDoForHouse || triage.homeManagement || '';
  const nextStepText = triage.nextStep || triage.actionPlan || '';

  const playBrowserSpeechFallback = (textToRead: string) => {
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const targetBcp47 =
      lang === 'hausa' ? 'ha-NG' : lang === 'yoruba' ? 'yo-NG' : lang === 'igbo' ? 'ig-NG' : 'en-NG';
    utterance.lang = targetBcp47;
    utterance.rate = 0.94;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice =
      voices.find((v) => v.lang.toLowerCase() === targetBcp47.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(targetBcp47.split('-')[0])) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const stopAnyPlayingAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsLoadingAudio(false);
  };

  const handleToggleSpeech = async () => {
    if (isPlayingAudio || isLoadingAudio) {
      stopAnyPlayingAudio();
      return;
    }

    const textToRead = triage.isRedFlag
      ? `${triage.empathyNote || ''}. ${triage.emergencyWarning || ''}. ${tc.actionTitle}: ${nextStepText}.`
      : `${triage.empathyNote || ''}. ${tc.causesTitle}: ${causesText}. ${tc.homeTitle}: ${homeText}. ${tc.actionTitle}: ${nextStepText}.`;

    // Play immediately from cache if already generated
    if (cachedAudioUrlRef.current) {
      try {
        const audio = new Audio(cachedAudioUrlRef.current);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => playBrowserSpeechFallback(textToRead);
        await audio.play();
        setIsPlayingAudio(true);
        return;
      } catch {
        // fallback below
      }
    }

    setIsLoadingAudio(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead, language: lang }),
      });

      if (!res.ok) {
        throw new Error('Server TTS unavailable');
      }

      const data = await res.json();
      if (!data.audioBase64) {
        throw new Error('Missing audio payload');
      }

      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      cachedAudioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => playBrowserSpeechFallback(textToRead);
      setIsLoadingAudio(false);
      await audio.play();
      setIsPlayingAudio(true);
    } catch {
      setIsLoadingAudio(false);
      playBrowserSpeechFallback(textToRead);
    }
  };

  const handleCopyWhatsApp = () => {
    const whatsappFormat = `${tc.whatsappHeader}
${tc.whatsappLocation} ${triage.detectedLocation || 'Nigeria'}
${tc.whatsappUrgency} ${
      triage.isRedFlag
        ? tc.whatsappEmergencyVal
        : triage.urgencyLevel === 'urgent'
        ? tc.whatsappUrgentVal
        : tc.whatsappStableVal
    }

${triage.empathyNote ? `_${triage.empathyNote}_\n\n` : ''}*1. [${tc.causesTitle}]*
${causesText}

*2. [${tc.homeTitle}]*
${triage.isRedFlag ? tc.whatsappHomeCancelled : homeText}

*3. [${tc.actionTitle}]*
${nextStepText}

---------------------------------
_${triage.disclaimer || tc.defaultDisclaimer}_`;

    navigator.clipboard.writeText(whatsappFormat).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className={`rounded-2xl bg-white border transition-all overflow-hidden ${
        triage.isRedFlag
          ? 'border-red-400 shadow-[0_4px_24px_rgba(220,38,38,0.08)] ring-1 ring-red-400/40'
          : triage.urgencyLevel === 'urgent'
          ? 'border-amber-300 shadow-[0_4px_20px_rgba(217,119,6,0.06)]'
          : 'border-emerald-200/90 shadow-[0_4px_20px_rgba(0,135,81,0.06)]'
      }`}
    >
      {/* Sleek Top Clinical Ribbon */}
      <div
        className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          triage.isRedFlag
            ? 'bg-red-50/90 border-red-200 text-red-900'
            : triage.urgencyLevel === 'urgent'
            ? 'bg-amber-50/80 border-amber-200/80 text-amber-900'
            : 'bg-[#F4F9F6] border-emerald-100 text-[#05472A]'
        }`}
      >
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
                ? tc.emergencyEval
                : triage.urgencyLevel === 'urgent'
                ? tc.urgentReview
                : tc.routineCare}
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
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-red-600 text-white'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs'
            }`}
            title={tc.listen}
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008751]" />
                <span>{tc.preparingAudio}</span>
              </>
            ) : isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>{tc.stopAudio}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#008751]" />
                <span>{tc.listen}</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyWhatsApp}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title={tc.share}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span className="hidden sm:inline">{copied ? tc.copied : tc.share}</span>
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
              <span>{tc.immediateAttention}</span>
            </h4>
            <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
              {triage.emergencyWarning || tc.defaultEmergencyWarning}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-red-700 font-bold text-xs hover:bg-red-50 transition-colors shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>{tc.call112Free}</span>
            </a>
          </div>
        </div>
      )}

      {/* Contextual Nigerian Healthcare Illustration Strip */}
      <div className="mx-4 sm:mx-5 mt-3.5 rounded-xl border border-stone-200/80 bg-[#F9FAF9] p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <ResilientImage
          src={visualMeta.src}
          alt={visualCopy.title}
          variant={visualMeta.key}
          className={`w-full sm:w-36 shrink-0 rounded-lg border border-stone-200/70 ${visualMeta.aspectClass}`}
          imgClassName="w-full h-full object-cover object-[50%_20%]"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
            {visualCopy.title}
          </h4>
          <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
            {visualCopy.caption}
          </p>
          <div className="pt-0.5">
            {visualMeta.key === 'hospital' ? (
              <button
                type="button"
                onClick={onOpenHospitals}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#008751] hover:text-[#05472A] transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{tv.hospitalsCta}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : visualMeta.linkedGuideId && onOpenFirstAid ? (
              <button
                type="button"
                onClick={() => onOpenFirstAid(visualMeta.linkedGuideId!)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#008751] hover:text-[#05472A] transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{tv.openGuideCta}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 3 Structured Sections */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* 1. Potential Causes */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100 text-[#008751] font-bold text-xs">
              1
            </span>
            <span className="text-[#05472A] tracking-tight">[{tc.causesTitle}]</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-7 whitespace-pre-line">
            {causesText}
          </p>
        </div>

        <div className="border-t border-stone-100" />

        {/* 2. Home Management */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-md font-bold text-xs ${
                triage.isRedFlag ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-[#008751]'
              }`}
            >
              2
            </span>
            <span className="text-[#05472A] tracking-tight">[{tc.homeTitle}]</span>
            {triage.isRedFlag && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 ml-auto">
                {tc.bypassedBadge}
              </span>
            )}
          </div>
          <p
            className={`text-xs sm:text-sm leading-relaxed pl-7 whitespace-pre-line ${
              triage.isRedFlag ? 'text-red-700 font-medium italic' : 'text-stone-700'
            }`}
          >
            {homeText || (triage.isRedFlag ? tc.homeWithheld : tc.defaultHomeRest)}
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
              <span className="text-[#05472A] tracking-tight">[{tc.actionTitle}]</span>
            </div>
            <button
              onClick={onOpenHospitals}
              className="text-[11px] font-semibold text-[#008751] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{tc.browseHospitals}</span>
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
              <span>{tc.clarifyingTitle}</span>
            </div>
            <div className="space-y-1">
              {triage.clarifyingQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectClarifyingQuestion(`${tc.clarifyPrefix} ${q}`)}
                  className="w-full text-left p-2 rounded-lg bg-white hover:bg-amber-100/40 border border-amber-200/50 text-xs text-stone-700 hover:text-stone-900 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
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
          {triage.disclaimer || tc.defaultDisclaimer}
        </div>
      </div>
    </div>
  );
};
