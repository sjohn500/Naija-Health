import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Volume2,
  VolumeX,
  Check,
  Building2,
  ArrowRight,
  Share2,
  MapPin,
  PhoneCall,
  Loader2,
  BookOpen,
  HeartPulse,
  ShieldAlert,
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

  const severityLabel = triage.isRedFlag
    ? tc.emergencyEval
    : triage.urgencyLevel === 'urgent'
    ? tc.urgentReview
    : tc.routineCare;

  const sevClass = triage.isRedFlag ? 'is-danger' : triage.urgencyLevel === 'urgent' ? '' : 'is-ok';

  return (
    <div className="answer" aria-live="polite">
      <div className="answer-head">
        <span
          className="brand-mark"
          style={{ width: 24, height: 24, borderRadius: 8 }}
          aria-hidden="true"
        >
          <HeartPulse className="w-3.5 h-3.5" strokeWidth={2.4} />
        </span>
        <span className="who">NaijaHealth AI</span>
        {triage.detectedLocation && (
          <span className="time" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <MapPin className="w-3 h-3" strokeWidth={2.2} />
            {triage.detectedLocation}
          </span>
        )}
        <span className={`sev ${sevClass}`}>
          <i aria-hidden="true" />
          {severityLabel}
        </span>
      </div>

      {triage.empathyNote && (
        <p style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>
          💚 {triage.empathyNote}
        </p>
      )}

      {triage.isRedFlag && (
        <div className="sheet is-danger" style={{ marginBottom: 12 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
            <AlertTriangle className="w-4 h-4" strokeWidth={2.2} />
            {tc.immediateAttention}
          </h3>
          <p style={{ color: 'var(--ink-2)' }}>
            {triage.emergencyWarning || tc.defaultEmergencyWarning}
          </p>
          <a
            href="tel:112"
            className="btn btn-danger btn-sm"
            style={{ marginTop: 10, textDecoration: 'none' }}
          >
            <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
            {tc.call112Free}
          </a>
        </div>
      )}

      <div className="answer-body">
        <ol>
          <li>
            <span className="n">1</span>
            <div>
              <b style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 650 }}>
                {tc.causesTitle}
              </b>
              <p style={{ whiteSpace: 'pre-line', fontSize: 13.5 }}>{causesText}</p>
            </div>
          </li>
          <li>
            <span className="n">2</span>
            <div>
              <b style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 650 }}>
                {tc.homeTitle}
              </b>
              {triage.isRedFlag && (
                <span className="sev is-danger" style={{ marginLeft: 8, marginTop: 0 }}>
                  <i aria-hidden="true" />
                  {tc.bypassedBadge}
                </span>
              )}
              <p
                style={{
                  whiteSpace: 'pre-line',
                  fontSize: 13.5,
                  color: triage.isRedFlag ? 'var(--danger)' : 'var(--ink-2)',
                  fontStyle: triage.isRedFlag ? 'italic' : 'normal',
                }}
              >
                {homeText || (triage.isRedFlag ? tc.homeWithheld : tc.defaultHomeRest)}
              </p>
            </div>
          </li>
          <li>
            <span className="n">3</span>
            <div>
              <b style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 650 }}>
                {tc.actionTitle}
              </b>
              <p style={{ whiteSpace: 'pre-line', fontSize: 13.5 }}>{nextStepText}</p>

              {triage.recommendedFacilities && triage.recommendedFacilities.length > 0 && (
                <div className="chip-row" style={{ marginTop: 8 }}>
                  {triage.recommendedFacilities.map((fac, i) => (
                    <span className="chip" key={i}>
                      <Building2 className="w-3 h-3" strokeWidth={2.2} />
                      {fac}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        </ol>
      </div>

      {/* Contextual Nigerian photo guide */}
      <div className="row-card" style={{ marginTop: 14, cursor: 'default' }}>
        <ResilientImage
          src={visualMeta.src}
          alt={visualCopy.title}
          variant={visualMeta.key}
          className="w-20 shrink-0 rounded-lg overflow-hidden"
          imgClassName="w-full h-full object-cover object-[50%_20%]"
        />
        <div className="rc-body">
          <b>{visualCopy.title}</b>
          <span style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {visualCopy.caption}
          </span>
          {visualMeta.key === 'hospital' ? (
            <button
              type="button"
              onClick={onOpenHospitals}
              className="go"
              style={{
                marginTop: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                fontWeight: 620,
                color: 'var(--brand)',
              }}
            >
              <Building2 className="w-3 h-3" strokeWidth={2.2} />
              {tv.hospitalsCta}
              <ArrowRight className="w-3 h-3" strokeWidth={2.2} />
            </button>
          ) : visualMeta.linkedGuideId && onOpenFirstAid ? (
            <button
              type="button"
              onClick={() => onOpenFirstAid(visualMeta.linkedGuideId!)}
              className="go"
              style={{
                marginTop: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                fontWeight: 620,
                color: 'var(--brand)',
              }}
            >
              <BookOpen className="w-3 h-3" strokeWidth={2.2} />
              {tv.openGuideCta}
              <ArrowRight className="w-3 h-3" strokeWidth={2.2} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Clarifying questions */}
      {triage.clarifyingQuestions && triage.clarifyingQuestions.length > 0 && (
        <div className="sheet is-warn" style={{ marginTop: 12 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)' }}>
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.2} />
            {tc.clarifyingTitle}
          </h3>
          <div className="chip-row" style={{ marginTop: 8 }}>
            {triage.clarifyingQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectClarifyingQuestion(`${tc.clarifyPrefix} ${q}`)}
                className="chip"
              >
                {q}
                <ArrowRight className="w-3 h-3" strokeWidth={2.2} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="answer-actions">
        <button
          type="button"
          onClick={handleToggleSpeech}
          className={`btn btn-sm ${isPlayingAudio ? 'btn-danger' : 'btn-primary'}`}
          title={tc.listen}
        >
          {isLoadingAudio ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {tc.preparingAudio}
            </>
          ) : isPlayingAudio ? (
            <>
              <VolumeX className="w-3.5 h-3.5" strokeWidth={2.2} />
              {tc.stopAudio}
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" strokeWidth={2.2} />
              {tc.listen}
            </>
          )}
        </button>

        <button type="button" onClick={onOpenHospitals} className="btn btn-outline btn-sm">
          <Building2 className="w-3.5 h-3.5" strokeWidth={2.2} />
          {tc.browseHospitals}
        </button>

        <button type="button" onClick={handleCopyWhatsApp} className="btn btn-ghost btn-sm">
          {copied ? (
            <Check className="w-3.5 h-3.5" strokeWidth={2.4} style={{ color: 'var(--brand)' }} />
          ) : (
            <Share2 className="w-3.5 h-3.5" strokeWidth={2.2} />
          )}
          {copied ? tc.copied : tc.share}
        </button>
      </div>

      <p className="answer-note">{triage.disclaimer || tc.defaultDisclaimer}</p>
    </div>
  );
};
