import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  X, 
  Search, 
  MapPin, 
  PhoneCall, 
  ExternalLink, 
  Filter 
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { ResilientImage } from './ResilientImage';
import { VISUAL_ASSETS } from '../data/visualAssets';

interface HospitalDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultState: string;
}

export const HospitalDirectoryModal: React.FC<HospitalDirectoryModalProps> = ({
  isOpen,
  onClose,
  defaultState
}) => {
  const [selectedState, setSelectedState] = useState(defaultState);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Teaching' | 'FMC' | 'General'>('ALL');

  useEffect(() => {
    if (isOpen) {
      setSelectedState(defaultState);
    }
  }, [isOpen, defaultState]);

  if (!isOpen) return null;

  const states = Object.keys(NIGERIAN_STATES_DATA);
  const currentStateData = NIGERIAN_STATES_DATA[selectedState] || NIGERIAN_STATES_DATA['Lagos'];

  const filteredFacilities = currentStateData.facilities.filter((facility) => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (facility.address && facility.address.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (typeFilter === 'Teaching') return facility.type.includes('Teaching');
    if (typeFilter === 'FMC') return facility.type.includes('Federal Medical Centre');
    if (typeFilter === 'General') return facility.type.includes('General');

    return true;
  });

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        style={{ maxWidth: 768 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hospital-directory-title"
      >
        {/* Header */}
        <div className="bg-[#05472A] px-6 py-5 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/15">
              <Building2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-semibold text-[10px] uppercase tracking-wider mb-0.5">
                Verified Healthcare Directory
              </span>
              <h2 id="hospital-directory-title" className="text-xl sm:text-2xl font-bold tracking-tight">
                Nigeria Hospital Directory
              </h2>
              <p className="text-emerald-200/80 text-xs mt-0.5">
                Locate General Hospitals, FMCs, and Teaching Hospitals across Nigeria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            aria-label="Close directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="p-4 bg-[color:var(--surface-2)] border-b border-[color:var(--line)] space-y-3">
          {/* Compact Hospital Visual Overview */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-2.5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--line)]">
            <ResilientImage
              src={VISUAL_ASSETS.hospital.src}
              alt={`${selectedState} Verified Nigerian Healthcare Facilities`}
              variant="hospital"
              className="w-full sm:w-40 aspect-video rounded-xl shrink-0 border border-[color:var(--line)]"
            />
            <div className="flex-1 text-left">
              <div className="text-xs sm:text-sm font-bold text-[color:var(--ink)]">
                {selectedState} State Referral Network ({currentStateData.facilities.length} listed hubs)
              </div>
              <p className="text-[11px] sm:text-xs text-[color:var(--ink-2)] mt-0.5 leading-relaxed">
                Search verified Federal Medical Centres, Teaching Hospitals, and General Hospitals with direct map directions.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* State Picker */}
            <div className="sm:w-1/3 relative">
              <label htmlFor="hospital-state-select" className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider block mb-1">
                State in Nigeria
              </label>
              <div className="relative flex items-center bg-[color:var(--surface)] border border-[color:var(--line-strong)] rounded-xl px-3 py-2 text-xs font-semibold text-[color:var(--ink)] focus-within:ring-2 focus-within:ring-emerald-500">
                <MapPin className="w-4 h-4 text-[color:var(--brand)] mr-2 shrink-0" />
                <select
                  id="hospital-state-select"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-transparent focus:outline-none cursor-pointer"
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st} State
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="sm:w-2/3">
              <label htmlFor="hospital-search-input" className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider block mb-1">
                Search facility or town
              </label>
              <div className="relative flex items-center bg-[color:var(--surface)] border border-[color:var(--line-strong)] rounded-xl px-3 py-2 text-xs text-[color:var(--ink)] focus-within:ring-2 focus-within:ring-emerald-500">
                <Search className="w-4 h-4 text-[color:var(--muted)] mr-2 shrink-0" />
                <input
                  id="hospital-search-input"
                  type="text"
                  placeholder="e.g. UCH, LUTH, Ikeja, Gbagada, Asaba..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-[color:var(--muted)] hover:text-[color:var(--ink-2)] text-xs px-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-medium text-[color:var(--muted)] flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-[color:var(--brand)] text-white'
                  : 'bg-[color:var(--surface)] text-[color:var(--ink-2)] border border-[color:var(--line)] hover:bg-[color:var(--surface-3)]'
              }`}
            >
              All Facilities ({currentStateData.facilities.length})
            </button>
            <button
              onClick={() => setTypeFilter('Teaching')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                typeFilter === 'Teaching'
                  ? 'bg-[color:var(--brand)] text-white'
                  : 'bg-[color:var(--surface)] text-[color:var(--ink-2)] border border-[color:var(--line)] hover:bg-[color:var(--surface-3)]'
              }`}
            >
              Teaching Hospitals
            </button>
            <button
              onClick={() => setTypeFilter('FMC')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                typeFilter === 'FMC'
                  ? 'bg-[color:var(--brand)] text-white'
                  : 'bg-[color:var(--surface)] text-[color:var(--ink-2)] border border-[color:var(--line)] hover:bg-[color:var(--surface-3)]'
              }`}
            >
              Federal Medical Centres (FMC)
            </button>
            <button
              onClick={() => setTypeFilter('General')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                typeFilter === 'General'
                  ? 'bg-[color:var(--brand)] text-white'
                  : 'bg-[color:var(--surface)] text-[color:var(--ink-2)] border border-[color:var(--line)] hover:bg-[color:var(--surface-3)]'
              }`}
            >
              General Hospitals
            </button>
          </div>
        </div>

        {/* Facilities List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-10 text-[color:var(--muted)]">
              <Building2 className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold">No facilities found matching your search</p>
              <p className="text-xs text-[color:var(--muted)] mt-1">Try switching state or clearing the filter.</p>
            </div>
          ) : (
            filteredFacilities.map((facility, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--line-strong)] hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-[color:var(--ink)]">
                      {facility.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      facility.type.includes('Teaching')
                        ? 'bg-purple-100 text-purple-800'
                        : facility.type.includes('Federal')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-[color:var(--brand-soft)] text-[color:var(--brand-ink)]'
                    }`}>
                      {facility.type}
                    </span>
                  </div>
                  <div className="text-xs text-[color:var(--ink-2)] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[color:var(--muted)] shrink-0" />
                    <span>{facility.city}, {facility.state} State</span>
                    {facility.address && (
                      <span className="text-[color:var(--muted)] hidden md:inline">• {facility.address}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${facility.name} ${facility.city} ${facility.state} Nigeria`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[color:var(--line)] hover:border-emerald-400 hover:bg-[color:var(--brand-soft)] text-xs font-semibold text-[color:var(--ink-2)] hover:text-[color:var(--brand-ink)] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[color:var(--brand)] hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Emergency</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[color:var(--surface-3)] border-t border-[color:var(--line)] flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--ink-2)]">
          <span>In extreme critical danger, proceed straight to the nearest emergency ward without waiting.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
