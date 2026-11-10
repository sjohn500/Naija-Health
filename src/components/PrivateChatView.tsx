import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Lock,
  Mic,
  MicOff,
  Send,
  Loader2,
  AlertTriangle,
  Building2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { SupportedLanguage, TriageResult } from '../types/triage';
import {
  OFFLINE_GUIDES,
  OfflineGuide,
  guideText,
  offlineTextAvailable,
  privateUi,
  redactForSend,
  HIV_DANGER_SIGNS,
  PEP_WINDOW_HOURS,
  matchPrivateTopic,
  LOCAL_ANSWER_NOTE,
} from '../data/privateCare';
import { TriageResultView } from './TriageResultView';
import { ExposureClock } from './ExposureClock';

interface PrivateChatViewProps {
  isOpen: boolean;
  onClose: () => void;
  state: string;
  lang: SupportedLanguage;
  onOpenArt: () => void;
}

type Entry =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; triage: TriageResult }
  | { id: string; role: 'guide'; guideId: string }
  | { id: string; role: 'note'; text: string };

const TOPIC_ORDER = ['exposure', 'missed_dose', 'side_effects', 'stockout', 'test_result', 'disclosure'];

export const PrivateChatView: React.FC<PrivateChatViewProps> = ({
  isOpen,
  onClose,
  state,
  lang,
  onOpenArt,
}) => {
  const ui = privateUi(lang);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [view, setView] = useState<'chat' | 'clock'>('chat');
  const [isBusy, setIsBusy] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [offline, setOffline] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Wipe everything whenever the sheet closes — including on unmount.
  useEffect(() => {
    if (!isOpen) {
      setEntries([]);
      setInput('');
      setView('chat');
      setOffline(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [entries, isBusy, isOpen]);

  const pushGuide = (guideId: string, asNewTopic = true) => {
    const id = `guide-${guideId}-${Date.now()}`;
    setEntries((prev) => [
      ...(asNewTopic && prev.length > 0 ? prev : []),
      { id, role: 'guide', guideId },
    ]);
  };

  const askAi = async (rawText: string) => {
    const text = redactForSend(rawText.trim());
    if (!text) return;

    setEntries((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setInput('');
    setOffline(false);

    // Six core topics are answered on the device. No network, no model, no
    // chance of a stockout question being answered with "rest and drink water".
    const topic = matchPrivateTopic(text);
    if (topic) {
      const note = LOCAL_ANSWER_NOTE[lang === 'pidgin' ? 'pidgin' : 'en'];
      setEntries((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, role: 'note', text: note },
        { id: `guide-local-${Date.now()}`, role: 'guide', guideId: topic },
      ]);
      return;
    }

    setIsBusy(true);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: lang,
          languageLocked: true,
          privateMode: true,
          conversationHistory: [],
          userLocation: { state },
        }),
      });
      if (!res.ok) throw new Error('triage failed');
      const data: TriageResult = await res.json();
      setEntries((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', triage: { ...data, language: lang } },
      ]);
    } catch {
      setOffline(true);
      setEntries((prev) => [
        ...prev,
        {
          id: `note-${Date.now()}`,
          role: 'note',
          text: ui.offline,
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  };

  const startRecording = async () => {
    if (isTranscribing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data?.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        if (blob.size < 400) return;
        setIsTranscribing(true);
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              const i = result.indexOf(',');
              resolve(i >= 0 ? result.slice(i + 1) : result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: rec.mimeType || 'audio/webm',
              language: lang,
            }),
          });
          if (!res.ok) throw new Error('transcribe failed');
          const data = await res.json();
          if (data?.text) {
            // Never auto-send in private mode: the user reads it before it leaves the phone.
            setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
          }
        } catch {
          setEntries((prev) => [
            ...prev,
            { id: `mic-${Date.now()}`, role: 'note', text: ui.offline },
          ]);
        } finally {
          setIsTranscribing(false);
        }
      };
      recorderRef.current = rec;
      rec.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const wipe = () => {
    setEntries([]);
    setInput('');
    setOffline(false);
    setView('chat');
    onClose();
  };

  if (!isOpen) return null;

  const renderGuide = (guideId: string) => {
    const guide: OfflineGuide | undefined = OFFLINE_GUIDES.find((g) => g.id === guideId);
    if (!guide) return null;
    const copy = guideText(guide, lang);
    return (
      <div className="answer" key={guideId}>
        <div className="answer-head">
          <span className="brand-mark" style={{ width: 24, height: 24, borderRadius: 8 }} aria-hidden="true">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.4} />
          </span>
          <span className="who">{copy.title}</span>
          <span className="sev is-ok">
            <i aria-hidden="true" />
            {lang === 'pidgin' ? 'Saved guide' : 'Saved guide'}
          </span>
        </div>
        <p>{copy.body}</p>
        <ol>
          {copy.steps.map((s, i) => (
            <li key={i}>
              <span className="n">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        {!offlineTextAvailable(lang) && (
          <p className="answer-note">
            <Info className="w-3 h-3 inline" strokeWidth={2.4} /> Offline guide is in English for this
            language. Ask below to get the answer in your language.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 720, maxHeight: '94vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="private-chat-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="ico" aria-hidden="true">
            <Lock className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2 id="private-chat-title">{ui.title}</h2>
            <p className="sub">{ui.sub}</p>
          </div>
          <button className="modal-close" onClick={wipe} aria-label={ui.quickExit} title={ui.quickExit}>
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: 12 }}>
          <div
            className="sheet"
            style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--surface-2)' }}
          >
            <Lock
              className="w-3.5 h-3.5"
              strokeWidth={2.2}
              style={{ color: 'var(--brand)', marginTop: 3, flex: 'none' }}
            />
            <p style={{ marginTop: 0, fontSize: 11.5, color: 'var(--muted)' }}>{ui.disclosure}</p>
          </div>

          {view === 'clock' ? (
            <ExposureClock state={state} lang={lang} onOpenArt={onOpenArt} />
          ) : (
            <>
              <div>
                <b style={{ fontSize: 12, color: 'var(--ink-2)' }}>{ui.topicsTitle}</b>
                <div className="chip-row" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setView('clock')}
                    style={{ borderColor: 'color-mix(in srgb, var(--danger) 32%, transparent)' }}
                  >
                    <Clock className="w-3 h-3" strokeWidth={2.4} style={{ color: 'var(--danger)' }} />
                    {ui.pepTitle}
                    <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 700 }}>
                      {PEP_WINDOW_HOURS}h
                    </span>
                  </button>
                  {TOPIC_ORDER.filter((id) => id !== 'exposure').map((id) => {
                    const g = OFFLINE_GUIDES.find((x) => x.id === id)!;
                    return (
                      <button key={id} type="button" className="chip" onClick={() => pushGuide(id)}>
                        {guideText(g, lang).title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {entries.length > 0 && (
                <div style={{ display: 'grid', gap: 10 }}>
                  {entries.map((entry) => {
                    if (entry.role === 'user') {
                      return (
                        <div className="bubble-row" key={entry.id}>
                          <div className="bubble-user">{entry.text}</div>
                        </div>
                      );
                    }
                    if (entry.role === 'note') {
                      return (
                        <p className="answer-note" key={entry.id} style={{ borderTop: 0, marginTop: 0 }}>
                          {entry.text}
                        </p>
                      );
                    }
                    if (entry.role === 'guide') {
                      return <React.Fragment key={entry.id}>{renderGuide(entry.guideId)}</React.Fragment>;
                    }
                    return (
                      <TriageResultView
                        key={entry.id}
                        triage={entry.triage}
                        discreet
                        onSelectClarifyingQuestion={(q) => askAi(q)}
                        onOpenHospitals={onOpenArt}
                        onOpenFirstAid={() => {
                          /* first-aid modals stay in the public surface */
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {isBusy && (
                <div className="answer">
                  <div className="answer-head">
                    <span className="brand-mark" style={{ width: 24, height: 24, borderRadius: 8 }} aria-hidden="true">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={2.4} />
                    </span>
                    <span className="who">{ui.looking}</span>
                  </div>
                  <div className="typing" aria-label={ui.looking}>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              )}

              {offline && (
                <p className="answer-note" style={{ borderTop: 0 }}>
                  {ui.offline}
                </p>
              )}
            </>
          )}

          {view === 'chat' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim() || isBusy) return;
                askAi(input);
              }}
              style={{ display: 'grid', gap: 8 }}
            >
              <textarea
                className="search-field"
                style={{ minHeight: 62, height: 'auto', padding: '10px 12px', resize: 'none', font: 'inherit' }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isBusy) askAi(input);
                  }
                }}
                placeholder={ui.placeholder}
                aria-label={ui.placeholder}
                disabled={isBusy || isTranscribing}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing || isBusy}
                  aria-pressed={isRecording}
                >
                  {isTranscribing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: 'var(--danger)' }} />
                  ) : (
                    <Mic className="w-3.5 h-3.5" strokeWidth={2.2} />
                  )}
                  {isRecording
                    ? ui.listening
                    : isTranscribing
                    ? lang === 'pidgin'
                      ? 'I dey write wetin you talk…'
                      : 'Writing what you said…'
                    : ui.speak}
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ marginLeft: 'auto', height: 38 }}
                  disabled={!input.trim() || isBusy || isTranscribing}
                >
                  {ui.send}
                  <Send className="w-3.5 h-3.5" strokeWidth={2.2} />
                </button>
              </div>
            </form>
          )}

          <div className="sheet is-danger">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.2} />
              {ui.dangerTitle}
            </h3>
            <ul style={{ margin: '6px 0 0', paddingLeft: 16, fontSize: 12.5, color: 'var(--ink-2)' }}>
              {HIV_DANGER_SIGNS[lang === 'pidgin' ? 'pidgin' : 'en'].map((s) => (
                <li key={s} style={{ marginTop: 3 }}>
                  {s}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <a className="btn btn-danger btn-sm" href="tel:112" style={{ textDecoration: 'none' }}>
                112
              </a>
              <button type="button" className="btn btn-outline btn-sm" onClick={onOpenArt}>
                <Building2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                {ui.artTitle}
              </button>
              {view === 'chat' && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView('clock')}>
                  {ui.pepTitle}
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
                </button>
              )}
            </div>
          </div>

          <p style={{ fontSize: 11, color: 'var(--muted)' }}>{ui.notDiagnosis}</p>
        </div>
      </div>
    </div>
  );
};
