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
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { lgasForState } from '../data/facilityDirectory';
import { SupportedLanguage } from '../types/triage';
import { ArtCapability, artSitesForState, privateUi, NAFDAC_NOTE } from '../data/privateCare';
import { useModalBehavior } from '../lib/useModalBehavior';

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
  const [selectedLga, setSelectedLga] = useState('');
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [reports, setReports] = useState<Record<string, number>>({});
  const [busySite, setBusySite] = useState<string | null>(null);
  const [justReported, setJustReported] = useState<string | null>(null);

  useModalBehavior(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setSelectedState(defaultState);
      setSelectedLga('');
    }
  }, [isOpen, defaultState]);

  useEffect(() => {
    setSelectedLga('');
  }, [selectedState]);

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

  const lgas = useMemo(() => lgasForState(selectedState), [selectedState]);

  const sites = useMemo(() => {
    const all = artSitesForState(selectedState);
    const byLga = selectedLga ? all.filter((s) => s.lga === selectedLga) : all;
    return filter === 'ALL' ? byLga : byLga.filter((s) => s.capabilities.includes(filter));
  }, [selectedState, selectedLga, filter]);

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
      /* silent */
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
          <div className="sheet" style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <ShieldCheck
              className="w-4 h-4 shrink-0"
              strokeWidth={2.2}
              style={{ color: 'var(--brand)', marginTop: 2 }}
            />
            <p style={{ marginTop: 0 }}>{ui.confirmStock}</p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <label className="search-field select-field" style={{ flex: '1 1 180px' }}>
              <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
              <select
                aria-label="State"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
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
              <label className="search-field select-field" style={{ flex: '1 1 190px' }}>
                <Building2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} style={{ color: 'var(--brand)' }} />
                <select
                  aria-label="LGA"
                  value={selectedLga}
                  onChange={(e) => setSelectedLga(e.target.value)}
                  className="native-select"
                >
                  <option value="">{lang === 'pidgin' ? `All LGAs (${lgas.length})` : `All LGAs (${lgas.length})`}</option>
                  {lgas.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-caret w-3.5 h-3.5" strokeWidth={2.4} />
              </label>
            )}
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
                  ? 'No site match this filter for this state/LGA.'
                  : 'No ART/PEP hospital matches this filter for the selected location.'}
              </p>
            )}

            {sites.map((site) => {
              const count = reports[site.id] || 0;
              const mapsUrl =
                site.latitude != null && site.longitude != null
                  ? `https://maps.google.com/?q=${site.latitude},${site.longitude}`
                  : `https://maps.google.com/?q=${encodeURIComponent(
                      `${site.name}, ${site.city}, ${site.state}, Nigeria`
                    )}`;
              return (
                <div key={site.id} className="facility">
                  <div className="facility-head">
                    <h3>{site.name}</h3>
                  </div>
                  <div className="facility-meta">
                    <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span>
                      {site.lga ? `${site.lga} LGA · ` : ''}
                      {site.city && site.city !== site.lga ? `${site.city} · ` : ''}
                      {site.type}
                    </span>
                  </div>
                  <div className="facility-caps">{site.capabilities.join(' · ')}</div>

                  {count > 0 && (
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
                      <Info className="w-3 h-3" strokeWidth={2.4} />
                      {lang === 'pidgin'
                        ? `${count} recent report say e fit don finish`
                        : `${count} recent report(s) of low stock`}
                    </p>
                  )}

                  <div className="facility-actions">
                    {site.phone ? (
                      <a
                        className="btn btn-primary btn-sm"
                        href={`tel:${site.phone.replace(/\s+/g, '')}`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
                        {ui.callConfirm}
                      </a>
                    ) : (
                      <a
                        className="btn btn-soft btn-sm"
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.2} />
                        Directions
                      </a>
                    )}

                    <a className="btn btn-outline btn-sm tnum" href="tel:112">
                      <PhoneCall className="w-3.5 h-3.5" strokeWidth={2.2} />
                      112
                    </a>

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
              );
            })}
          </div>

          <div className="sheet">
            <h3>Check the pack</h3>
            <p>{NAFDAC_NOTE[lang === 'pidgin' ? 'pidgin' : 'en']}</p>
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            {ui.reportNote} · Reports reset on server restart.
          </p>
        </div>
      </div>
    </div>
  );
};
