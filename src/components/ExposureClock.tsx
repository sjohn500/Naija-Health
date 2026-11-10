import React, { useEffect, useMemo, useState } from 'react';
import { Clock, PhoneCall, MapPin, AlertTriangle, Building2, ArrowRight } from 'lucide-react';
import { SupportedLanguage } from '../types/triage';
import { PEP_WINDOW_HOURS, guideText, pepSitesForState, privateUi, OFFLINE_GUIDES } from '../data/privateCare';

interface ExposureClockProps {
  state: string;
  lang: SupportedLanguage;
  onOpenArt?: () => void;
}

/** Local datetime string for <input type="datetime-local">. */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const ExposureClock: React.FC<ExposureClockProps> = ({ state, lang, onOpenArt }) => {
  const ui = privateUi(lang);
  const guide = OFFLINE_GUIDES.find((g) => g.id === 'exposure')!;
  const copy = guideText(guide, lang);

  // Default to one hour ago: recent enough to be urgent, old enough to be honest.
  const [exposureAt, setExposureAt] = useState<string>(() =>
    toLocalInputValue(new Date(Date.now() - 60 * 60 * 1000))
  );
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const { hoursLeft, pct, tone, expired } = useMemo(() => {
    const started = new Date(exposureAt).getTime();
    const elapsedMs = Math.max(0, now - started);
    const windowMs = PEP_WINDOW_HOURS * 3600 * 1000;
    const remainingMs = windowMs - elapsedMs;
    const pctUsed = Math.min(100, Math.max(0, (elapsedMs / windowMs) * 100));
    const left = remainingMs / 3600000;
    return {
      hoursLeft: Math.max(0, left),
      pct: pctUsed,
      expired: remainingMs <= 0,
      tone: remainingMs <= 0 ? 'danger' : left <= 12 ? 'danger' : left <= 48 ? 'amber' : 'ok',
    };
  }, [exposureAt, now]);

  const sites = pepSitesForState(state).slice(0, 4);
  const dangerColor =
    tone === 'danger' ? 'var(--danger)' : tone === 'amber' ? 'var(--amber)' : 'var(--brand)';
  const dangerSoft =
    tone === 'danger' ? 'var(--danger-soft)' : tone === 'amber' ? 'var(--amber-soft)' : 'var(--brand-soft)';

  const hh = Math.floor(hoursLeft);
  const mm = Math.floor((hoursLeft - hh) * 60);

  return (
    <div className="sheet" style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span
          className="ico"
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--danger-soft)',
            color: 'var(--danger)',
            flex: 'none',
          }}
          aria-hidden="true"
        >
          <Clock className="w-4 h-4" strokeWidth={2.2} />
        </span>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 660 }}>{ui.pepTitle}</h3>
          <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>{ui.pepSub}</p>
        </div>
      </div>

      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>
          {lang === 'pidgin' ? 'When the thing happen?' : 'When did it happen?'}
        </span>
        <input
          type="datetime-local"
          value={exposureAt}
          max={toLocalInputValue(new Date())}
          onChange={(e) => setExposureAt(e.target.value)}
          className="search-field"
          style={{ height: 42, padding: '0 12px', fontWeight: 600 }}
        />
      </label>

      <div
        className="sheet"
        style={{ background: dangerSoft, borderColor: `color-mix(in srgb, ${dangerColor} 24%, transparent)` }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '-.03em',
              color: dangerColor,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {expired ? '0h 00m' : `${hh}h ${String(mm).padStart(2, '0')}m`}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>
            {expired
              ? lang === 'pidgin'
                ? 'window don close — but still go today'
                : 'window closed — still go in today'
              : lang === 'pidgin'
              ? 'remain inside 72 hours'
              : 'left in the 72-hour window'}
          </span>
        </div>

        <div
          style={{
            marginTop: 10,
            height: 6,
            borderRadius: 99,
            background: 'color-mix(in srgb, var(--ink) 8%, transparent)',
            overflow: 'hidden',
          }}
        >
          <i
            style={{
              display: 'block',
              height: '100%',
              width: `${pct}%`,
              background: dangerColor,
              borderRadius: 99,
              transition: 'width .4s var(--ease)',
            }}
          />
        </div>
      </div>

      {expired && (
        <div className="sheet is-warn">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)' }}>
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.2} />
            {lang === 'pidgin' ? 'PEP window don pass' : 'PEP window has passed'}
          </h3>
          <p>
            {lang === 'pidgin'
              ? 'PEP no dey work after 72 hours, but you still need to see a health worker today. Dem go test you and tell you the correct next step.'
              : 'PEP is not effective after 72 hours, but you still need to be seen today. A clinician will test and advise on the correct next step.'}
          </p>
        </div>
      )}

      <div>
        <b style={{ fontSize: 12.5, color: 'var(--ink)' }}>{copy.title}</b>
        <ol className="ol-steps" style={{ marginTop: 8 }}>
          {copy.steps.map((s, i) => (
            <li key={i}>
              <span className="n">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Building2 className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
          <b style={{ fontSize: 12.5 }}>
            {lang === 'pidgin' ? 'PEP site near you' : 'PEP sites near you'} — {state}
          </b>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {sites.length === 0 && (
            <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {lang === 'pidgin'
                ? 'No site dey for this list. Call 112 or go the general hospital.'
                : 'No site in this list. Call 112 or go to the nearest general hospital.'}
            </p>
          )}
          {sites.map((s) => (
            <div className="row-card" key={s.id} style={{ cursor: 'default' }}>
              <div className="rc-body">
                <b>{s.name}</b>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin className="w-3 h-3" strokeWidth={2.2} />
                  {s.city} · {s.type}
                </span>
                <div className="chip-row" style={{ marginTop: 6 }}>
                  {s.capabilities.slice(0, 3).map((c) => (
                    <span className="chip" key={c} style={{ fontSize: 10.5, padding: '3px 8px' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {s.phone ? (
                <a className="btn btn-outline btn-sm" href={`tel:${s.phone.replace(/\s+/g, '')}`}>
                  <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
                </a>
              ) : (
                <span
                  className="chip"
                  style={{ fontSize: 10.5, color: 'var(--muted)', cursor: 'default' }}
                  title="No direct line on file — call 112"
                >
                  {lang === 'pidgin' ? 'No line' : 'No line'}
                </span>
              )}
            </div>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 11.5, color: 'var(--muted)' }}>{ui.confirmStock}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a className="btn btn-danger btn-sm" href="tel:112" style={{ textDecoration: 'none' }}>
          <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
          112
        </a>
        {onOpenArt && (
          <button type="button" className="btn btn-outline btn-sm" onClick={onOpenArt}>
            {ui.artTitle}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  );
};
