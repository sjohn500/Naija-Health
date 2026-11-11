import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  PhoneCall,
  Search,
  Building2,
  Clock,
  Flag,
  Check,
  Loader2,
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import {
  directoryCoverage,
  formatHours,
  lgasForState,
  searchFacilities,
  daysSince,
} from '../data/facilityDirectory';
import {
  ALL_CAPABILITIES,
  CORRECTION_ISSUES,
  CorrectionIssue,
  FACILITY_LEVELS,
  FACILITY_LEVEL_LABEL,
  FacilityCapability,
  FacilityLevel,
  FacilityRecord,
} from '../types/facility';
import { SupportedLanguage } from '../types/triage';
import { Reveal } from './Reveal';

interface FacilityDirectoryProps {
  defaultState: string;
  lang?: SupportedLanguage;
}

const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 650;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{shown}</>;
};

const LEVEL_CLASS: Record<FacilityLevel, string> = {
  PHC: 'is-phc',
  General: 'is-general',
  FMC: 'is-fmc',
  Teaching: 'is-teaching',
  Specialist: 'is-specialist',
};

/* ------------------------------------------------------------------ */
/* Correction report dialog                                            */
/* ------------------------------------------------------------------ */

const CorrectionDialog: React.FC<{
  facility: FacilityRecord;
  onClose: () => void;
  onDone: (count: number) => void;
}> = ({ facility, onClose, onDone }) => {
  const [issue, setIssue] = useState<CorrectionIssue | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!issue) return;
    setBusy(true);
    try {
      const res = await fetch('/api/facility-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          state: facility.state,
          issue,
          note: note.trim().slice(0, 300),
        }),
      });
      const data = res.ok ? await res.json() : { count: 1 };
      setSent(true);
      onDone(data.count ?? 1);
      window.setTimeout(onClose, 1200);
    } catch {
      setSent(true);
      onDone(1);
      window.setTimeout(onClose, 1200);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{ zIndex: 95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="ico" aria-hidden="true">
            <Flag className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2>Correct this facility</h2>
            <p className="sub">{facility.name}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal-body">
          <div className="chip-row">
            {CORRECTION_ISSUES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="chip"
                aria-pressed={issue === opt.id}
                onClick={() => setIssue(opt.id)}
                title={opt.hint}
              >
                {issue === opt.id && <Check className="w-3 h-3" strokeWidth={2.6} />}
                {opt.label}
              </button>
            ))}
          </div>

          <textarea
            className="search-field"
            style={{ minHeight: 64, height: 'auto', padding: '10px 12px', resize: 'none', font: 'inherit' }}
            placeholder="Anything else? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
          />

          <p style={{ fontSize: 11, color: 'var(--muted)' }}>
            No name, no phone number, nothing that identifies you is stored. This report only
            changes what we show other people about this facility.
          </p>

          {sent ? (
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 620,
                color: 'var(--brand)',
              }}
            >
              <Check className="w-4 h-4" strokeWidth={2.6} />
              Thank you — recorded.
            </p>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={submit}
              disabled={!issue || busy}
              style={{ alignSelf: 'flex-start' }}
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" strokeWidth={2.2} />}
              Send report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Directory                                                           */
/* ------------------------------------------------------------------ */

export const FacilityDirectory: React.FC<FacilityDirectoryProps> = ({ defaultState, lang = 'pidgin' }) => {
  const [selectedState, setSelectedState] = useState(defaultState);
  const [selectedLga, setSelectedLga] = useState<string>('');
  const [level, setLevel] = useState<FacilityLevel | 'ALL'>('ALL');
  const [capability, setCapability] = useState<FacilityCapability | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<Record<string, number> | null>(null);
  const [reporting, setReporting] = useState<FacilityRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const coverage = useMemo(() => directoryCoverage(), []);
  const lgas = useMemo(() => lgasForState(selectedState), [selectedState]);

  useEffect(() => setSelectedLga(''), [selectedState]);

  useEffect(() => {
    let cancelled = false;
    setReports(null);
    fetch(`/api/facility-report?state=${encodeURIComponent(selectedState)}`)
      .then((r) => (r.ok ? r.json() : { reports: {} }))
      .then((d) => {
        if (cancelled) return;
        const counts: Record<string, number> = {};
        Object.entries(d.reports || {}).forEach(([id, v]: [string, any]) => {
          counts[id] = typeof v === 'number' ? v : v?.count || 0;
        });
        setReports(counts);
      })
      .catch(() => !cancelled && setReports({}));
    return () => {
      cancelled = true;
    };
  }, [selectedState]);

  const results = useMemo(
    () =>
      searchFacilities({
        state: selectedState,
        lga: selectedLga || null,
        level,
        capability,
        query,
      }),
    [selectedState, selectedLga, level, capability, query]
  );

  const toggleLevel = (value: FacilityLevel) => setLevel(level === value ? 'ALL' : value);
  const toggleCapability = (value: FacilityCapability) =>
    setCapability(capability === value ? 'ALL' : value);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* honest coverage summary */}
      <Reveal className="stat-strip">
        <div className="stat">
          <b><CountUp value={coverage.total} /></b>
          <span>Facilities listed</span>
        </div>
        <div className="stat">
          <b><CountUp value={coverage.states} /></b>
          <span>States + FCT</span>
        </div>
        <div className="stat">
          <b><CountUp value={coverage.withPhone} /></b>
          <span>With a direct line</span>
        </div>
        <div className="stat">
          <b><CountUp value={coverage.verified} /></b>
          <span>Verified by a human</span>
        </div>
      </Reveal>

      {coverage.verified === 0 && (
        <div className="sheet is-warn" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertTriangle className="w-4 h-4" strokeWidth={2.2} style={{ color: 'var(--amber)', marginTop: 2, flex: 'none' }} />
          <p style={{ marginTop: 0 }}>
            <b>No facility in this list has been verified against a live source yet.</b> Levels and
            capabilities are inferred from facility type, and hours and phone numbers are missing for
            most rows. Always call before you travel, and use “Correct this facility” when something
            is wrong.
          </p>
        </div>
      )}

      {/* filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label className="search-field" style={{ flex: '1 1 170px' }}>
          <MapPin className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
          <select
            aria-label="State"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{ background: 'transparent', border: 0, font: 'inherit', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', width: '100%' }}
          >
            {Object.keys(NIGERIAN_STATES_DATA).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.4} style={{ opacity: 0.5 }} />
        </label>

        <label className="search-field" style={{ flex: '1 1 170px', opacity: lgas.length ? 1 : 0.65 }}>
          <Building2 className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
          <select
            aria-label="LGA"
            value={selectedLga}
            onChange={(e) => setSelectedLga(e.target.value)}
            disabled={lgas.length === 0}
            style={{ background: 'transparent', border: 0, font: 'inherit', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', width: '100%' }}
          >
            <option value="">{lgas.length ? 'All LGAs' : 'LGA not recorded yet'}</option>
            {lgas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.4} style={{ opacity: 0.5 }} />
        </label>
      </div>

      <label className="search-field">
        <Search className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: 'var(--muted)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by hospital, town or LGA"
          aria-label="Search facilities"
        />
      </label>

      <div className="chip-row" role="group" aria-label="Facility level">
        {FACILITY_LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            className="chip"
            aria-pressed={level === l}
            onClick={() => toggleLevel(l)}
            title={FACILITY_LEVEL_LABEL[l]}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="chip-row" role="group" aria-label="Capability">
        {ALL_CAPABILITIES.slice(0, 7).map((c) => (
          <button
            key={c}
            type="button"
            className="chip"
            aria-pressed={capability === c}
            onClick={() => toggleCapability(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* results */}
      {reports === null ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 96 }} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="sheet" style={{ textAlign: 'center', padding: '26px 16px' }}>
          <p style={{ marginTop: 0, fontSize: 13, color: 'var(--muted)' }}>
            Nothing matches those filters in {selectedState}.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setLevel('ALL');
              setCapability('ALL');
              setSelectedLga('');
              setQuery('');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <Reveal stagger className="facility-list" key={`${selectedState}-${level}-${capability}-${selectedLga}`}>
          {results.map((facility) => {
            const hours = formatHours(facility.hours);
            const verifiedDays = daysSince(facility.lastVerified);
            const reportCount = reports[facility.id] || 0;
            return (
              <article className="facility" key={facility.id} style={{ marginBottom: 10 }}>
                <div className="facility-head">
                  <h3 style={{ flex: '1 1 200px' }}>{facility.name}</h3>
                  <span className={`level-badge ${LEVEL_CLASS[facility.level]}`}>
                    {facility.level}
                  </span>
                  {facility.verification === 'verified' ? (
                    <span className="verify is-verified">
                      <Check className="w-3 h-3" strokeWidth={3} />
                      {verifiedDays === null
                        ? 'Verified'
                        : verifiedDays === 0
                        ? 'Verified today'
                        : `Verified ${verifiedDays}d ago`}
                    </span>
                  ) : (
                    <span className="verify is-unverified" title="No verification date on file">
                      <AlertTriangle className="w-3 h-3" strokeWidth={2.6} />
                      Unverified — call first
                    </span>
                  )}
                </div>

                <div className="facility-meta">
                  <MapPin className="w-3 h-3" strokeWidth={2.2} />
                  <span>
                    {facility.lga ? `${facility.lga} LGA` : 'LGA not recorded'}
                    <span className="dot" style={{ display: 'inline-block', margin: '0 5px' }} />
                    {facility.city}
                    <span className="dot" style={{ display: 'inline-block', margin: '0 5px' }} />
                    {facility.state}
                  </span>
                  <span className="dot" />
                  {hours ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock className="w-3 h-3" strokeWidth={2.2} />
                      {hours}
                    </span>
                  ) : (
                    <span className="facility-missing">
                      <Clock className="w-3 h-3" strokeWidth={2.4} />
                      Hours not recorded
                    </span>
                  )}
                </div>

                {facility.address && (
                  <div className="facility-meta" style={{ marginTop: 3 }}>
                    {facility.address}
                  </div>
                )}

                <div className="chip-row" style={{ marginTop: 9 }}>
                  {facility.capabilities.slice(0, 6).map((c) => (
                    <span
                      key={c}
                      className="chip"
                      style={{ fontSize: 10.5, padding: '3px 8px', cursor: 'default' }}
                      title={`Inferred from facility level (${FACILITY_LEVEL_LABEL[facility.level]})`}
                    >
                      {c}
                    </span>
                  ))}
                  {facility.capabilityBasis === 'inferred-from-level' && (
                    <span
                      style={{ fontSize: 10, color: 'var(--muted)', alignSelf: 'center' }}
                      title="Derived from facility tier, not confirmed with the facility"
                    >
                      inferred
                    </span>
                  )}
                </div>

                {reportCount > 0 && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      fontWeight: 650,
                      color: 'var(--danger)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Flag className="w-3 h-3" strokeWidth={2.4} />
                    {reportCount} recent correction{reportCount === 1 ? '' : 's'} from users
                  </p>
                )}

                <div className="facility-actions">
                  {facility.phone ? (
                    <a
                      className="btn btn-primary btn-sm"
                      href={`tel:${facility.phone.replace(/\s+/g, '')}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
                      {facility.phone}
                    </a>
                  ) : (
                    <span className="chip" style={{ fontSize: 11, color: 'var(--amber)' }}>
                      <PhoneCall className="w-3 h-3" strokeWidth={2.2} />
                      No line on file
                    </span>
                  )}

                  <a className="btn btn-outline btn-sm" href="tel:112" style={{ textDecoration: 'none' }}>
                    112
                  </a>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setReporting(facility)}
                  >
                    <Flag className="w-3.5 h-3.5" strokeWidth={2.2} />
                    Correct this facility
                  </button>
                </div>
              </article>
            );
          })}
        </Reveal>
      )}

      {reports && (
        <p style={{ fontSize: 11, color: 'var(--muted)' }}>
          {results.length} match{results.length === 1 ? '' : 'es'} in {selectedState}. Correction
          reports are anonymous and reset when the server restarts.
        </p>
      )}

      {reporting && (
        <CorrectionDialog
          facility={reporting}
          onClose={() => setReporting(null)}
          onDone={(count) => {
            setReports((prev) => ({ ...(prev || {}), [reporting.id]: count }));
            setToast('Correction recorded. Thank you.');
            window.setTimeout(() => setToast(null), 2600);
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <Check className="w-4 h-4" strokeWidth={2.6} />
          {toast}
        </div>
      )}
    </div>
  );
};
