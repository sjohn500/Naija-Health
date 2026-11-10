import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Filter,
  Check,
  Loader2,
  Info,
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { SupportedLanguage } from '../types/triage';
import { ArtCapability, artSitesForState, privateUi, NAFDAC_NOTE } from '../data/privateCare';

interface ArtDirectoryProps {
  isOpen: boolean;
  onClose: () => void;
  defaultState: string;
  lang: SupportedLanguage;
}

type FilterValue = 'ALL' | ArtCapability;

const FILTERS: FilterValue[] = ['ALL', 'ART', 'PEP', 'PMTCT', 'VL testing'];

export const ArtDirectory: React.FC<ArtDirectoryProps> = ({
  isOpen,
  onClose,
  defaultState,
  lang,
}) => {
  const ui = privateUi(lang);
  const [selectedState, setSelectedState] = useState(defaultState);
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [reports, setReports] = useState<Record<string, number>>({});
  const [busySite, setBusySite] = useState<string | null>(null);
  const [justReported, setJustReported] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setSelectedState(defaultState);
  }, [isOpen, defaultState]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch(`/api/stockout-report?state=${encodeURIComponent(selectedState)}`)
      .then((r) => (r.ok ? r.json() : { reports: {} }))
      .then((d) => {
        if (cancelled) return;
        const counts: Record<string, number> = {};
        Object.entries(d.reports || {}).forEach(([id, v]: [string, any]) => {
          counts[id] = typeof v === 'number' ? v : v?.count || 0;
        });
        setReports(counts);
      })
      .catch(() => setReports({}));
    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedState]);

  const sites = useMemo(() => {
    const all = artSitesForState(selectedState);
    return filter === 'ALL' ? all : all.filter((s) => s.capabilities.includes(filter));
  }, [selectedState, filter]);

  const reportStockout = async (siteId: string, siteName: string) => {
    setBusySite(siteId);
    try {
      const res = await fetch('/api/stockout-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, siteName, state: selectedState }),
      });
      if (res.ok) {
        const d = await res.json();
        setReports((prev) => ({ ...prev, [siteId]: d.count ?? (prev[siteId] || 0) + 1 }));
        setJustReported(siteId);
        window.setTimeout(() => setJustReported(null), 2500);
      }
    } catch {
      /* silent: a failed report must never look like a failed search */
    } finally {
      setBusySite(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 720 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="art-directory-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="ico" aria-hidden="true">
            <Building2 className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2 id="art-directory-title">{ui.artTitle}</h2>
            <p className="sub">{ui.artSub}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal-body">
          <div className="sheet" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <ShieldCheck
              className="w-4 h-4"
              strokeWidth={2.2}
              style={{ color: 'var(--brand)', marginTop: 2, flex: 'none' }}
            />
            <p style={{ marginTop: 0 }}>{ui.confirmStock}</p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <label className="search-field" style={{ flex: '1 1 200px' }}>
              <MapPin className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
              <select
                aria-label="State"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 0,
                  font: 'inherit',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  width: '100%',
                }}
              >
                {Object.keys(NIGERIAN_STATES_DATA).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="chip-row" role="group" aria-label="Capability filter">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className="chip"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {filter === f && <Check className="w-3 h-3" strokeWidth={2.6} />}
                {f === 'ALL' ? (lang === 'pidgin' ? 'Everything' : 'All') : f}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {sites.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                {lang === 'pidgin'
                  ? 'No site match this filter for this state.'
                  : 'No facility matches this filter in this state.'}
              </p>
            )}

            {sites.map((site) => {
              const count = reports[site.id] || 0;
              return (
                <div key={site.id} className="row-card" style={{ alignItems: 'flex-start', cursor: 'default' }}>
                  <div className="rc-body">
                    <b>{site.name}</b>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin className="w-3 h-3" strokeWidth={2.2} />
                      {site.city} · {site.type}
                    </span>
                    <div className="chip-row" style={{ marginTop: 7 }}>
                      {site.capabilities.map((c) => (
                        <span key={c} className="chip" style={{ fontSize: 10.5, padding: '3px 8px' }}>
                          {c}
                        </span>
                      ))}
                    </div>

                    {count > 0 && (
                      <p
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--amber)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Info className="w-3 h-3" strokeWidth={2.4} />
                        {lang === 'pidgin'
                          ? `${count} recent report say e fit don finish`
                          : `${count} recent report(s) of low stock`}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
                      {site.phone ? (
                        <a
                          className="btn btn-primary btn-sm"
                          href={`tel:${site.phone.replace(/\s+/g, '')}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
                          {ui.callConfirm}
                        </a>
                      ) : (
                        <span
                          className="chip"
                          style={{ fontSize: 11, color: 'var(--muted)', cursor: 'default' }}
                          title="No direct line on file — call 112"
                        >
                          {lang === 'pidgin' ? 'No line on file' : 'No line on file'}
                        </span>
                      )}

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => reportStockout(site.id, site.name)}
                        disabled={busySite === site.id}
                      >
                        {busySite === site.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : justReported === site.id ? (
                          <Check className="w-3.5 h-3.5" strokeWidth={2.6} style={{ color: 'var(--brand)' }} />
                        ) : (
                          <Filter className="w-3.5 h-3.5" strokeWidth={2.2} />
                        )}
                        {justReported === site.id ? ui.reported : ui.stockout}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sheet">
            <h3>{lang === 'pidgin' ? 'Check the pack' : 'Check the pack'}</h3>
            <p>{NAFDAC_NOTE[lang === 'pidgin' ? 'pidgin' : 'en']}</p>
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            {ui.reportNote} ·{' '}
            {lang === 'pidgin'
              ? 'Reports no get expiry date; dem reset when server restart.'
              : 'Reports are not permanent; counts reset when the server restarts.'}
          </p>
        </div>
      </div>
    </div>
  );
};
