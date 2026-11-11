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
  ExternalLink,
  X,
  ChevronDown,
  Info,
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import {
  formatHours,
  lgaFacilityCounts,
  lgasForState,
  searchFacilities,
} from '../data/facilityDirectory';
import {
  CORRECTION_ISSUES,
  CorrectionIssue,
  FACILITY_LEVELS,
  FACILITY_LEVEL_LABEL,
  FacilityCapability,
  FacilityLevel,
  FacilityRecord,
} from '../types/facility';
import { SupportedLanguage } from '../types/triage';
import { useModalBehavior } from '../lib/useModalBehavior';

interface FacilityDirectoryProps {
  defaultState: string;
  defaultLga?: string;
  lang?: SupportedLanguage;
}

const LEVEL_CLASS: Record<FacilityLevel, string> = {
  PHC: 'is-phc',
  General: 'is-general',
  FMC: 'is-fmc',
  Teaching: 'is-teaching',
  Specialist: 'is-specialist',
};

const QUICK_CAPABILITIES: FacilityCapability[] = ['Emergency', 'Maternity', 'Paediatrics', 'ART', 'PEP'];
const INITIAL_STATE_BATCH = 24;

const DIR_COPY: Record<
  SupportedLanguage,
  {
    searchPlaceholder: string;
    allLevels: string;
    allLgAs: string;
    notice: (count: number, state: string, lgaCount: number, selectedLga: string) => string;
    showAll: (total: number, lgaCount: number) => string;
    emptyState: (state: string, selectedLga: string) => string;
    clearFilters: string;
    directions: string;
    emergency112: string;
    reportIssue: string;
    recentReports: (n: number) => string;
    reportTitle: string;
    reportPlaceholder: string;
    reportPrivacy: string;
    reportThanks: string;
    sendReport: string;
    toastSaved: string;
  }
> = {
  pidgin: {
    searchPlaceholder: 'Search hospital, LGA, ward or area...',
    allLevels: 'All levels',
    allLgAs: 'All LGAs',
    notice: (count, state, lgaCount, lga) =>
      lga
        ? `${count} public ${count === 1 ? 'facility' : 'facilities'} for ${lga} LGA, ${state}. Call ahead or dial 112 to confirm hours and doctors on seat.`
        : `${count} public facilities across ${lgaCount} LGAs inside ${state}. Pick your LGA above or filter by hospital level.`,
    showAll: (total, lgaCount) => `Show all ${total} facilities across ${lgaCount} LGAs`,
    emptyState: (state, lga) =>
      lga
        ? `No facility match that filter inside ${lga} LGA, ${state}.`
        : `No facility match that filter inside ${state} State.`,
    clearFilters: 'Clear filters',
    directions: 'Directions',
    emergency112: 'Call 112',
    reportIssue: 'Report update',
    recentReports: (n) => `${n} user ${n === 1 ? 'report' : 'reports'} submitted`,
    reportTitle: 'Report facility update',
    reportPlaceholder: 'Add helpful note (optional)',
    reportPrivacy: 'Anonymous update only — no name or phone number is stored.',
    reportThanks: 'Thank you — update recorded.',
    sendReport: 'Send report',
    toastSaved: 'Facility update recorded. Thank you.',
  },
  english: {
    searchPlaceholder: 'Search by hospital, LGA, ward or area...',
    allLevels: 'All levels',
    allLgAs: 'All LGAs',
    notice: (count, state, lgaCount, lga) =>
      lga
        ? `Showing ${count} public ${count === 1 ? 'facility' : 'facilities'} in ${lga} LGA, ${state}. Call ahead or dial 112 to confirm hours and staffing.`
        : `Showing ${count} public facilities across all ${lgaCount} LGAs in ${state}. Select your LGA above or filter by level below.`,
    showAll: (total, lgaCount) => `Show all ${total} facilities across ${lgaCount} LGAs`,
    emptyState: (state, lga) =>
      lga
        ? `No facilities match those filters in ${lga} LGA, ${state}.`
        : `No facilities match those filters in ${state} State.`,
    clearFilters: 'Clear filters',
    directions: 'Directions',
    emergency112: 'Call 112',
    reportIssue: 'Report update',
    recentReports: (n) => `${n} recent user ${n === 1 ? 'update' : 'updates'}`,
    reportTitle: 'Report facility update',
    reportPlaceholder: 'Optional details (max 300 chars)',
    reportPrivacy: 'Anonymous report only — no name or phone number is stored.',
    reportThanks: 'Thank you — update recorded.',
    sendReport: 'Send report',
    toastSaved: 'Update recorded. Thank you.',
  },
  hausa: {
    searchPlaceholder: 'Nemo asibiti, karamar hukuma ko gari...',
    allLevels: 'Duk matakai',
    allLgAs: 'Duk kananan hukumomi',
    notice: (count, state, lgaCount, lga) =>
      lga
        ? `Asibitoci da cibiyoyin lafiya ${count} a karamar hukumar ${lga}, jihar ${state}. A kira kafin tafiya ko 112.`
        : `Cibiyoyin lafiya ${count} a duk kananan hukumomi ${lgaCount} na jihar ${state}. Zabi karamar hukumarka a sama.`,
    showAll: (total, lgaCount) => `Nuna dukkan cibiyoyi ${total} a kananan hukumomi ${lgaCount}`,
    emptyState: (state, lga) =>
      lga
        ? `Babu asibitin da ya dace da bincikenka a ${lga}, jihar ${state}.`
        : `Babu asibitin da ya dace da bincikenka a jihar ${state}.`,
    clearFilters: 'Share tacewa',
    directions: 'Taswira',
    emergency112: 'Kira 112',
    reportIssue: 'Gyara bayani',
    recentReports: (n) => `Rahotanni ${n} da aka aiko`,
    reportTitle: 'Gyara bayanin asibiti',
    reportPlaceholder: 'Karin bayani (na zabi)',
    reportPrivacy: 'Babu suna ko lambar waya da ake adanawa.',
    reportThanks: 'Na gode — an adana rahoto.',
    sendReport: 'Aika rahoto',
    toastSaved: 'An adana rahoto. Na gode.',
  },
  yoruba: {
    searchPlaceholder: 'Wá ilé-ìwòsàn, ìjọba ìbílẹ̀ tàbí agbègbè...',
    allLevels: 'Gbogbo ìpele',
    allLgAs: 'Gbogbo ìjọba ìbílẹ̀',
    notice: (count, state, lgaCount, lga) =>
      lga
        ? `Àwọn ilé-ìwòsàn ${count} ní ìjọba ìbílẹ̀ ${lga}, Ìpínlẹ̀ ${state}. Pe tẹ́lẹ̀ tàbí pe 112.`
        : `Àwọn ilé-ìwòsàn ${count} káàkiri gbogbo ìjọba ìbílẹ̀ ${lgaCount} ní Ìpínlẹ̀ ${state}. Yan ìjọba ìbílẹ̀ rẹ lókè.`,
    showAll: (total, lgaCount) => `Fi gbogbo ilé-ìwòsàn ${total} hàn ní ìjọba ìbílẹ̀ ${lgaCount}`,
    emptyState: (state, lga) =>
      lga
        ? `Kò sí ilé-ìwòsàn tó bá àyẹ̀wò rẹ mu ní ${lga}, Ìpínlẹ̀ ${state}.`
        : `Kò sí ilé-ìwòsàn tó bá àyẹ̀wò rẹ mu ní Ìpínlẹ̀ ${state}.`,
    clearFilters: 'Mú àlẹ̀mọ́ kúrò',
    directions: 'Ọ̀nà lórí máàpù',
    emergency112: 'Pe 112',
    reportIssue: 'Ròyìn àtúnṣe',
    recentReports: (n) => `Àtúnṣe ${n} láti ọ̀dọ̀ àwọn olùmúlò`,
    reportTitle: 'Ròyìn àtúnṣe ilé-ìwòsàn',
    reportPlaceholder: 'Àlàyé síwájú (tí o bá fẹ́)',
    reportPrivacy: 'Ìròyìn àìlórúkọ nìkan — a kò fi orúkọ tàbí fọ́n fọ́n pamọ́.',
    reportThanks: 'Ẹ ṣé — a ti gbà á.',
    sendReport: 'Fi ìròyìn ránṣẹ́',
    toastSaved: 'A ti gba àtúnṣe. Ẹ ṣé.',
  },
  igbo: {
    searchPlaceholder: 'Chọọ ụlọ ọgwụ, LGA, ma ọ bụ obodo...',
    allLevels: 'Ọkwa niile',
    allLgAs: 'LGA niile',
    notice: (count, state, lgaCount, lga) =>
      lga
        ? `Na-egosi ụlọ ọgwụ ${count} na ${lga} LGA, Steeti ${state}. Kpọọ tupu ị gaa ma ọ bụ kpọọ 112.`
        : `Ụlọ ọgwụ ${count} n’ofe LGA ${lgaCount} niile dị na Steeti ${state}. Họrọ LGA gị n’elu.`,
    showAll: (total, lgaCount) => `Gosi ụlọ ọgwụ ${total} niile n’ime LGA ${lgaCount}`,
    emptyState: (state, lga) =>
      lga
        ? `Ọ dịghị ụlọ ọgwụ dabara na nzacha gị na ${lga} LGA, Steeti ${state}.`
        : `Ọ dịghị ụlọ ọgwụ dabara na nzacha gị na Steeti ${state}.`,
    clearFilters: 'Hichapụ nzacha',
    directions: 'Ụzọ Map',
    emergency112: 'Kpọọ 112',
    reportIssue: 'Kọọ mgbanwe',
    recentReports: (n) => `Mkpesa ${n} e zigara n'oge na-adịbeghị anya`,
    reportTitle: 'Kọọ mgbanwe ụlọ ọgwụ',
    reportPlaceholder: 'Nkọwa ọzọ (nhọrọ)',
    reportPrivacy: 'Ọ dịghị aha ma ọ bụ nọmba ekwentị a na-echekwa.',
    reportThanks: 'Daalụ — e debanyere ya.',
    sendReport: 'Ziga mkpesa',
    toastSaved: 'E debanyere mgbanwe ahụ. Daalụ.',
  },
};

/* ------------------------------------------------------------------ */
/* Correction report dialog                                            */
/* ------------------------------------------------------------------ */

const CorrectionDialog: React.FC<{
  facility: FacilityRecord;
  copy: (typeof DIR_COPY)['english'];
  onClose: () => void;
  onDone: (count: number) => void;
}> = ({ facility, copy, onClose, onDone }) => {
  const [issue, setIssue] = useState<CorrectionIssue | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useModalBehavior(true, onClose);

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
      window.setTimeout(onClose, 1000);
    } catch {
      setSent(true);
      onDone(1);
      window.setTimeout(onClose, 1000);
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
            <h2>{copy.reportTitle}</h2>
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
            className="field-textarea"
            placeholder={copy.reportPlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
          />

          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{copy.reportPrivacy}</p>

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
              {copy.reportThanks}
            </p>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={submit}
              disabled={!issue || busy}
              style={{ alignSelf: 'flex-start' }}
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Flag className="w-3.5 h-3.5" strokeWidth={2.2} />
              )}
              {copy.sendReport}
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

export const FacilityDirectory: React.FC<FacilityDirectoryProps> = ({
  defaultState,
  defaultLga = '',
  lang = 'pidgin',
}) => {
  const copy = DIR_COPY[lang] || DIR_COPY.english;
  const [selectedState, setSelectedState] = useState(defaultState);
  const [selectedLga, setSelectedLga] = useState<string>(defaultLga);
  const [level, setLevel] = useState<FacilityLevel | 'ALL'>('ALL');
  const [capability, setCapability] = useState<FacilityCapability | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [expandedAll, setExpandedAll] = useState(false);
  const [reports, setReports] = useState<Record<string, number>>({});
  const [reporting, setReporting] = useState<FacilityRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const lgas = useMemo(() => lgasForState(selectedState), [selectedState]);
  const lgaCounts = useMemo(() => lgaFacilityCounts(selectedState), [selectedState]);

  useEffect(() => {
    setSelectedState(defaultState);
    const nextLgas = lgasForState(defaultState);
    setSelectedLga(defaultLga && nextLgas.includes(defaultLga) ? defaultLga : '');
  }, [defaultState, defaultLga]);

  useEffect(() => {
    setExpandedAll(false);
  }, [selectedState, selectedLga, level, capability, query]);

  useEffect(() => {
    let cancelled = false;
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
      .catch(() => {
        /* non-blocking */
      });
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

  const handleStateSelect = (nextState: string) => {
    setSelectedState(nextState);
    setSelectedLga('');
  };

  const toggleLevel = (value: FacilityLevel) => setLevel(level === value ? 'ALL' : value);
  const toggleCapability = (value: FacilityCapability) =>
    setCapability(capability === value ? 'ALL' : value);

  const hasFilters = level !== 'ALL' || capability !== 'ALL' || Boolean(query.trim()) || Boolean(selectedLga);

  const shouldPaginate = !hasFilters && !expandedAll && results.length > INITIAL_STATE_BATCH;
  const visibleResults = shouldPaginate ? results.slice(0, INITIAL_STATE_BATCH) : results;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Clean clinical notice */}
      <div
        className="sheet"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px' }}
      >
        <Info className="w-4 h-4 shrink-0" strokeWidth={2} style={{ color: 'var(--brand)' }} />
        <p className="tnum" style={{ marginTop: 0, fontSize: 12.5 }}>
          {copy.notice(results.length, selectedState, lgas.length, selectedLga)}
        </p>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label className="search-field select-field" style={{ flex: '1 1 160px' }}>
          <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
          <select
            aria-label="State"
            value={selectedState}
            onChange={(e) => handleStateSelect(e.target.value)}
            className="native-select"
          >
            {Object.keys(NIGERIAN_STATES_DATA).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="select-caret w-3.5 h-3.5" strokeWidth={2.4} />
        </label>

        {lgas.length > 0 && (
          <label className="search-field select-field" style={{ flex: '1.2 1 190px' }}>
            <Building2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
            <select
              aria-label="Local Government Area"
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              className="native-select tnum"
            >
              <option value="">
                {copy.allLgAs} ({lgas.length})
              </option>
              {lgas.map((l) => (
                <option key={l} value={l}>
                  {l} ({lgaCounts[l] || 0})
                </option>
              ))}
            </select>
            <ChevronDown className="select-caret w-3.5 h-3.5" strokeWidth={2.4} />
          </label>
        )}

        <label className="search-field" style={{ flex: '2 1 210px' }}>
          <Search className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} style={{ color: 'var(--muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              style={{ color: 'var(--muted)', display: 'grid', placeItems: 'center' }}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.2} />
            </button>
          )}
        </label>
      </div>

      {/* Filter buttons */}
      <div className="chip-row" role="group" aria-label="Facility filters">
        <button
          type="button"
          className="chip"
          aria-pressed={!hasFilters}
          onClick={() => {
            setLevel('ALL');
            setCapability('ALL');
            setSelectedLga('');
            setQuery('');
          }}
        >
          {copy.allLevels}
        </button>
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
        {QUICK_CAPABILITIES.map((c) => (
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

      {/* Facility list */}
      {results.length === 0 ? (
        <div className="sheet" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <p style={{ marginTop: 0, fontSize: 13.5, color: 'var(--muted)' }}>
            {copy.emptyState(selectedState, selectedLga)}
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              setLevel('ALL');
              setCapability('ALL');
              setSelectedLga('');
              setQuery('');
            }}
          >
            {copy.clearFilters}
          </button>
        </div>
      ) : (
        <div className="facility-list">
          {visibleResults.map((facility) => {
            const hours = formatHours(facility.hours);
            const reportCount = reports[facility.id] || 0;
            const mapsUrl =
              facility.latitude != null && facility.longitude != null
                ? `https://maps.google.com/?q=${facility.latitude},${facility.longitude}`
                : `https://maps.google.com/?q=${encodeURIComponent(
                    `${facility.name}, ${facility.lga || facility.city}, ${facility.state}, Nigeria`
                  )}`;

            return (
              <article className="facility" key={facility.id}>
                <div className="facility-head">
                  <h3>{facility.name}</h3>
                  <span className={`level-badge ${LEVEL_CLASS[facility.level]}`}>
                    {facility.level}
                  </span>
                </div>

                <div className="facility-meta">
                  <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <span>
                    {facility.lga ? `${facility.lga} LGA · ` : ''}
                    {facility.city && facility.city !== facility.lga ? `${facility.city} · ` : ''}
                    {facility.state}
                    {facility.ownerType ? ` · ${facility.ownerType}` : ''}
                  </span>
                  {hours && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      · <Clock className="w-3 h-3" strokeWidth={2} />
                      {hours}
                    </span>
                  )}
                </div>

                {facility.address && (
                  <div className="facility-meta" style={{ marginTop: 3 }}>
                    {facility.address}
                  </div>
                )}

                <div className="facility-caps">
                  {facility.capabilities.slice(0, 5).join(' · ')}
                </div>

                {reportCount > 0 && (
                  <p
                    style={{
                      marginTop: 7,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--amber)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Flag className="w-3 h-3" strokeWidth={2.2} />
                    {copy.recentReports(reportCount)}
                  </p>
                )}

                <div className="facility-actions">
                  {facility.phone && (
                    <a
                      className="btn btn-primary btn-sm"
                      href={`tel:${facility.phone.replace(/\s+/g, '')}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
                      {facility.phone}
                    </a>
                  )}

                  <a
                    className={facility.phone ? 'btn btn-outline btn-sm' : 'btn btn-soft btn-sm'}
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.2} />
                    {copy.directions}
                  </a>

                  <a className="btn btn-outline btn-sm tnum" href="tel:112">
                    <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
                    {copy.emergency112}
                  </a>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setReporting(facility)}
                  >
                    <Flag className="w-3.5 h-3.5" strokeWidth={2.1} />
                    {copy.reportIssue}
                  </button>
                </div>
              </article>
            );
          })}

          {shouldPaginate && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm tnum"
                onClick={() => setExpandedAll(true)}
              >
                {copy.showAll(results.length, lgas.length)}
              </button>
            </div>
          )}
        </div>
      )}

      {reporting && (
        <CorrectionDialog
          facility={reporting}
          copy={copy}
          onClose={() => setReporting(null)}
          onDone={(count) => {
            setReports((prev) => ({ ...prev, [reporting.id]: count }));
            setToast(copy.toastSaved);
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
