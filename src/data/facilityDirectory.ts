/**
 * Facility directory — national model, migrated from the legacy state data.
 *
 * The legacy dataset has name / type / city / address only: no LGA, no phone,
 * no hours, no verification dates. This module maps each record into the new
 * nationwide shape WITHOUT inventing any of the missing values, and exposes the
 * helpers the UI needs (LGA grouping, level filters, capability filters).
 */
import { NIGERIAN_STATES_DATA } from './nigeriaHealthcareData';
import {
  FacilityCapability,
  FacilityLevel,
  FacilityRecord,
  FacilityLevel as _FacilityLevel,
} from '../types/facility';

const LEVEL_BY_LEGACY_TYPE: Record<string, FacilityLevel> = {
  'Teaching Hospital': 'Teaching',
  'Federal Medical Centre': 'FMC',
  'General Hospital': 'General',
  'Specialist Hospital': 'Specialist',
};

/**
 * Capability inferred from LEVEL. This is a statement about what that tier of
 * public facility is normally equipped to do — it is NOT a claim about today's
 * stock or staffing, which is why every row still says "call to confirm".
 */
const CAPABILITIES_BY_LEVEL: Record<FacilityLevel, FacilityCapability[]> = {
  Teaching: [
    'Emergency',
    'Maternity',
    'Paediatrics',
    'Surgery',
    'Laboratory',
    'ART',
    'PEP',
    'PMTCT',
    'VL testing',
  ],
  FMC: ['Emergency', 'Maternity', 'Paediatrics', 'Surgery', 'Laboratory', 'ART', 'PEP', 'PMTCT'],
  General: ['Emergency', 'Maternity', 'Laboratory', 'ART', 'PEP'],
  Specialist: ['Emergency', 'Laboratory', 'ART', 'PEP'],
  PHC: ['Immunisation', 'Maternity'],
};

export function capabilitiesForLevel(level: FacilityLevel): FacilityCapability[] {
  return CAPABILITIES_BY_LEVEL[level] || ['Emergency'];
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Build the national directory once at module load. */
export const FACILITY_DIRECTORY: FacilityRecord[] = Object.entries(NIGERIAN_STATES_DATA).flatMap(
  ([stateName, stateData]) =>
    (stateData.facilities || []).map((facility, index) => {
      const level = LEVEL_BY_LEGACY_TYPE[facility.type] || 'General';
      return {
        id: `${slug(stateName)}-${index}-${slug(facility.name)}`,
        name: facility.name,
        level,
        state: stateName,
        // Deliberately null: the legacy data has no LGA, and guessing one
        // (Mubi → Mubi North or Mubi South?) is how a directory becomes wrong.
        lga: (facility as any).lga ?? null,
        city: facility.city,
        address: facility.address,
        phone: (facility as any).phone ?? (facility as any).emergencyPhone ?? null,
        hours: (facility as any).hours ?? null,
        capabilities: capabilitiesForLevel(level),
        capabilityBasis: 'inferred-from-level',
        lastVerified: (facility as any).lastVerified ?? null,
        verification: 'unverified',
      } as FacilityRecord;
    })
);

export function facilitiesForState(state: string): FacilityRecord[] {
  return FACILITY_DIRECTORY.filter((f) => f.state === state);
}

export function lgasForState(state: string): string[] {
  const set = new Set<string>();
  facilitiesForState(state).forEach((f) => {
    if (f.lga) set.add(f.lga);
  });
  return Array.from(set).sort();
}

export function searchFacilities(options: {
  state?: string;
  lga?: string | null;
  level?: FacilityLevel | 'ALL';
  capability?: FacilityCapability | 'ALL';
  query?: string;
}): FacilityRecord[] {
  const { state, lga, level = 'ALL', capability = 'ALL', query = '' } = options;
  const q = query.trim().toLowerCase();

  return FACILITY_DIRECTORY.filter((f) => {
    if (state && f.state !== state) return false;
    if (lga && f.lga !== lga) return false;
    if (level !== 'ALL' && f.level !== level) return false;
    if (capability !== 'ALL' && !f.capabilities.includes(capability)) return false;
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q) ||
      (f.lga || '').toLowerCase().includes(q) ||
      (f.address || '').toLowerCase().includes(q)
    );
  });
}

export function getFacility(id: string): FacilityRecord | undefined {
  return FACILITY_DIRECTORY.find((f) => f.id === id);
}

export function facilitiesWithCapability(state: string, capability: FacilityCapability): FacilityRecord[] {
  return facilitiesForState(state).filter((f) => f.capabilities.includes(capability));
}

/** Counts used for the honest coverage summary at the top of the directory. */
export function directoryCoverage() {
  const states = new Set(FACILITY_DIRECTORY.map((f) => f.state));
  const withPhone = FACILITY_DIRECTORY.filter((f) => f.phone).length;
  const withLga = FACILITY_DIRECTORY.filter((f) => f.lga).length;
  const verified = FACILITY_DIRECTORY.filter((f) => f.verification === 'verified').length;
  return {
    total: FACILITY_DIRECTORY.length,
    states: states.size,
    withPhone,
    withLga,
    verified,
  };
}

/** "24 hours", "8:00–18:00", or an explicit null when nobody has recorded it. */
export function formatHours(hours: FacilityRecord['hours']): string | null {
  if (!hours) return null;
  if (hours.open24h) return '24 hours';
  if (hours.opens && hours.closes) return `${hours.opens}–${hours.closes}`;
  return hours.note || null;
}

/** Days since a verification, for a "verified 3 days ago" style chip. */
export function daysSince(dateIso: string | null): number | null {
  if (!dateIso) return null;
  const then = new Date(`${dateIso}T00:00:00`).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86400000));
}
