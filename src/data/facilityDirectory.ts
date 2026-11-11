/**
 * Facility directory — national 37-state & 774-LGA model.
 *
 * Combines curated flagship teaching/specialist/general hospitals from
 * `NIGERIAN_STATES_DATA` with all 774 LGAs and verified public facilities from
 * `nigeriaLgaHospitals.json`, deduplicating entries inside each (state, LGA)
 * while transferring GPS coordinates and ward details onto curated rows.
 */
import { NIGERIAN_STATES_DATA } from './nigeriaHealthcareData';
import rawLgaHospitals from './nigeriaLgaHospitals.json';
import {
  FacilityCapability,
  FacilityLevel,
  FacilityRecord,
} from '../types/facility';

type RawLevelCode = 'T' | 'F' | 'S' | 'G' | 'P';
type RawFacilityTuple = [
  name: string,
  levelCode: RawLevelCode,
  ward: string,
  ownerShort: string,
  lat: number | null,
  lng: number | null
];
type RawLgaMap = Record<string, Record<string, RawFacilityTuple[]>>;

const LGA_HOSPITALS_DATA = rawLgaHospitals as unknown as RawLgaMap;

const LEVEL_BY_LEGACY_TYPE: Record<string, FacilityLevel> = {
  'Teaching Hospital': 'Teaching',
  'Federal Medical Centre': 'FMC',
  'General Hospital': 'General',
  'Specialist Hospital': 'Specialist',
};

const LEVEL_BY_CODE: Record<RawLevelCode, FacilityLevel> = {
  T: 'Teaching',
  F: 'FMC',
  S: 'Specialist',
  G: 'General',
  P: 'PHC',
};

const LEVEL_SORT_ORDER: Record<FacilityLevel, number> = {
  Teaching: 0,
  FMC: 1,
  Specialist: 2,
  General: 3,
  PHC: 4,
};

/**
 * Capability inferred from LEVEL. This describes what each tier of public
 * facility is normally equipped to handle — always call ahead to confirm
 * current staffing and stock.
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

function normalizeNameTokens(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\bcentres?\b/g, 'center')
    .replace(/\bdiagonistic\b/g, 'diagnostic')
    .replace(/\bspecialists\b/g, 'specialist')
    .replace(/\bhospitals\b/g, 'hospital')
    .replace(/\bmohammed\b/g, 'muhammad')
    .replace(/\buthman\s+dan\s*fodio\b/g, 'usmanu danfodiyo')
    .replace(/\borthopedic\b/g, 'orthopaedic')
    .replace(/\bneuro[\s-]*psychiatric\b/g, 'neuropsychiatric')
    .replace(/\bp\.?h\.?c\.?\b/g, 'primary health center')
    .replace(/\bprimary health care center\b/g, 'primary health center')
    .replace(/\bprimary healthcare center\b/g, 'primary health center')
    .replace(/\bcomprehensive health care center\b/g, 'comprehensive health center')
    .replace(/\bfmc\b/g, 'federal medical center')
    .replace(/\band\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');
}

function aliasGroupKeys(state: string, lga: string, rawName: string): string[] {
  const keys = [normalizeNameTokens(rawName)];
  const low = rawName.toLowerCase();

  // Explicit renamed/curated federal/state hospital equivalences within (state, lga)
  if (low.includes('modibbo adama') || (state === 'Adamawa' && lga === 'Yola South' && low.includes('federal medical'))) {
    keys.push('alias:mauth-yola');
  }
  if (low.includes('alex ekwueme') || low.includes('abakaliki federal teaching') || low.includes('ebonyi state university teaching')) {
    keys.push('alias:ae-futha');
  }
  if (low.includes('ido federal') || low.includes('federal teaching hospital ido')) {
    keys.push('alias:fth-ido-ekiti');
  }
  if (low.includes('enugu state university')) {
    keys.push('alias:esut-enugu');
  }
  if (low.includes('gombe federal medical') || low.includes('federal teaching hospital gombe')) {
    keys.push('alias:fth-gombe');
  }
  if (low.includes('owerri federal medical') || low.includes('federal university teaching hospital owerri')) {
    keys.push('alias:futh-owerri');
  }
  if (low.includes('katsina federal medical') || low.includes('federal teaching hospital katsina')) {
    keys.push('alias:fth-katsina');
  }
  if (low.includes('lokoja federal medical') || low.includes('federal teaching hospital lokoja')) {
    keys.push('alias:fth-lokoja');
  }
  if (low.includes('barau dikko')) {
    keys.push('alias:barau-dikko');
  }
  if (low.includes('abdullahi wase')) {
    keys.push('alias:wase-kano');
  }
  if (low.includes('adeoyo')) {
    keys.push('alias:adeoyo-ibadan');
  }
  if (low.includes('braithwaite') || low.includes('rivers state university teaching')) {
    keys.push('alias:rsuth-ph');
  }
  if (low.includes('dalhatu araf')) {
    keys.push('alias:dash-lafia');
  }
  if (low.includes('yariman bakura')) {
    keys.push('alias:yariman-bakura');
  }
  if (low.includes('gusau') && low.includes('federal medical')) {
    keys.push('alias:fmc-gusau');
  }
  if (state === 'Zamfara' && lga === 'Gusau' && low.includes('new site federal medical')) {
    keys.push('alias:fmc-gusau');
  }
  if (low.includes('olabisi onabanjo')) {
    keys.push('alias:oouth-sagamu');
  }
  if (low.includes('obafemi awolowo university teaching')) {
    keys.push('alias:oauthc-ife');
  }
  if (low.includes('diete') && low.includes('koki')) {
    keys.push('alias:diete-koki');
  }
  if (low.includes('nnamdi azikiwe') && low.includes('teaching hospital')) {
    keys.push(`alias:nauth-${slug(lga)}`);
  }
  if (low.includes('itas') && low.includes('general hospital') && state === 'Bauchi') {
    keys.push('alias:itas-gh');
  }
  if ((low.includes('edagberi') || low.includes('edegberi')) && low.includes('cottage')) {
    keys.push('alias:edegberi-ch');
  }
  if (state === 'Nasarawa' && lga === 'Karu' && low.includes('uke general hospital')) {
    keys.push('alias:uke-gh');
  }
  if (state === 'Ondo' && lga === 'Akure South' && low.includes('state specialist hospital')) {
    keys.push('alias:akure-ssh');
  }

  return Array.from(new Set(keys.filter(Boolean)));
}

function cleanCityName(ward: string | null | undefined, lga: string): string {
  const w = (ward || '').trim();
  if (!w) return lga;
  if (w.toLowerCase() === lga.toLowerCase()) return lga;
  if (/^(ward|urban)\s*[0-9ivx]+$/i.test(w)) return lga;
  return w;
}

/** Official sorted LGA list per state (all 36 states + FCT = 774 LGAs). */
export const STATE_LGAS: Record<string, string[]> = Object.fromEntries(
  Object.keys(NIGERIAN_STATES_DATA).map((stateName) => {
    const lgaObj = LGA_HOSPITALS_DATA[stateName] || {};
    return [stateName, Object.keys(lgaObj).sort((a, b) => a.localeCompare(b))];
  })
);

function buildDirectory(): FacilityRecord[] {
  const allRecords: FacilityRecord[] = [];
  const stateNames = Array.from(
    new Set([...Object.keys(NIGERIAN_STATES_DATA), ...Object.keys(LGA_HOSPITALS_DATA)])
  );

  for (const stateName of stateNames) {
    const curated = NIGERIAN_STATES_DATA[stateName]?.facilities || [];
    const stateLgaMap = LGA_HOSPITALS_DATA[stateName] || {};

    const stateRecords: (FacilityRecord & { _flagship?: boolean })[] = [];
    const seenIndexByKey = new Map<string, number>();

    const registerKeys = (lga: string, name: string, idx: number) => {
      for (const k of aliasGroupKeys(stateName, lga, name)) {
        seenIndexByKey.set(`${slug(lga)}::${k}`, idx);
      }
    };

    const findExistingIndex = (lga: string, name: string): number | undefined => {
      for (const k of aliasGroupKeys(stateName, lga, name)) {
        const hit = seenIndexByKey.get(`${slug(lga)}::${k}`);
        if (hit !== undefined) return hit;
      }
      return undefined;
    };

    // 1. Seed curated flagship referral hospitals first so rich names & addresses win
    curated.forEach((fac, idx) => {
      const level = LEVEL_BY_LEGACY_TYPE[fac.type] || 'General';
      const lga = fac.lga ?? null;
      const rec: FacilityRecord & { _flagship?: boolean } = {
        id: `${slug(stateName)}-${idx}-${slug(fac.name)}`,
        name: fac.name,
        level,
        state: stateName,
        lga,
        city: fac.city,
        address: fac.address,
        phone: fac.emergencyPhone ?? null,
        hours: null,
        capabilities: capabilitiesForLevel(level),
        capabilityBasis: 'inferred-from-level',
        lastVerified: null,
        verification: 'unverified',
        latitude: fac.latitude ?? null,
        longitude: fac.longitude ?? null,
        ownerType: level === 'FMC' ? 'Federal' : 'Public',
        ward: null,
        _flagship: true,
      };
      const pos = stateRecords.length;
      stateRecords.push(rec);
      if (lga) {
        registerKeys(lga, fac.name, pos);
      }
    });

    // 2. Merge all 774-LGA facilities, deduplicating & enriching curated matches with GPS/ward
    Object.keys(stateLgaMap)
      .sort((a, b) => a.localeCompare(b))
      .forEach((lgaName) => {
        const rows = stateLgaMap[lgaName] || [];
        rows.forEach((tuple, idx) => {
          const [rawName, levelCode, ward, ownerShort, lat, lng] = tuple;
          const level = LEVEL_BY_CODE[levelCode] || 'PHC';
          const cleanName = rawName.trim().replace(/\bDiagonistic\b/gi, 'Diagnostic');
          if (!cleanName) return;

          const existingIdx = findExistingIndex(lgaName, cleanName);
          if (existingIdx !== undefined) {
            const existing = stateRecords[existingIdx];
            if (existing.latitude == null && lat != null) existing.latitude = lat;
            if (existing.longitude == null && lng != null) existing.longitude = lng;
            if (!existing.ward && ward) existing.ward = ward.trim();
            if ((!existing.ownerType || existing.ownerType === 'Public') && ownerShort) {
              existing.ownerType = ownerShort;
            }
            return;
          }

          const cleanWard = ward ? ward.trim() : null;
          const rec: FacilityRecord & { _flagship?: boolean } = {
            id: `${slug(stateName)}-${slug(lgaName)}-${idx}-${slug(cleanName).slice(0, 42)}`,
            name: cleanName,
            level,
            state: stateName,
            lga: lgaName,
            city: cleanCityName(cleanWard, lgaName),
            address: cleanWard && cleanWard.toLowerCase() !== lgaName.toLowerCase()
              ? `${cleanWard} Ward, ${lgaName} LGA`
              : `${lgaName} LGA`,
            phone: null,
            hours: null,
            capabilities: capabilitiesForLevel(level),
            capabilityBasis: 'inferred-from-level',
            lastVerified: null,
            verification: 'unverified',
            latitude: lat,
            longitude: lng,
            ownerType: ownerShort || 'Public',
            ward: cleanWard,
            _flagship: false,
          };

          const pos = stateRecords.length;
          stateRecords.push(rec);
          registerKeys(lgaName, cleanName, pos);
        });
      });

    // Sort cleanly within state: Tertiary -> FMC -> Specialist -> General -> PHC; flagships first
    stateRecords.sort((a, b) => {
      const rankDiff = LEVEL_SORT_ORDER[a.level] - LEVEL_SORT_ORDER[b.level];
      if (rankDiff !== 0) return rankDiff;
      if (Boolean(a._flagship) !== Boolean(b._flagship)) return a._flagship ? -1 : 1;
      const lgaDiff = (a.lga || '').localeCompare(b.lga || '');
      if (lgaDiff !== 0) return lgaDiff;
      return a.name.localeCompare(b.name);
    });

    for (const r of stateRecords) {
      delete r._flagship;
      allRecords.push(r);
    }
  }

  return allRecords;
}

/** Complete national facility directory across all 36 states + FCT and 774 LGAs. */
export const FACILITY_DIRECTORY: FacilityRecord[] = buildDirectory();

const BY_STATE_CACHE = new Map<string, FacilityRecord[]>();
const BY_STATE_LGA_CACHE = new Map<string, FacilityRecord[]>();
const LGA_COUNTS_CACHE = new Map<string, Record<string, number>>();

for (const fac of FACILITY_DIRECTORY) {
  let stateList = BY_STATE_CACHE.get(fac.state);
  if (!stateList) {
    stateList = [];
    BY_STATE_CACHE.set(fac.state, stateList);
  }
  stateList.push(fac);

  if (fac.lga) {
    const pairKey = `${fac.state}::${fac.lga}`;
    let lgaList = BY_STATE_LGA_CACHE.get(pairKey);
    if (!lgaList) {
      lgaList = [];
      BY_STATE_LGA_CACHE.set(pairKey, lgaList);
    }
    lgaList.push(fac);

    let counts = LGA_COUNTS_CACHE.get(fac.state);
    if (!counts) {
      counts = {};
      LGA_COUNTS_CACHE.set(fac.state, counts);
    }
    counts[fac.lga] = (counts[fac.lga] || 0) + 1;
  }
}

export function facilitiesForState(state: string): FacilityRecord[] {
  return BY_STATE_CACHE.get(state) || [];
}

export function facilitiesForLga(state: string, lga: string): FacilityRecord[] {
  return BY_STATE_LGA_CACHE.get(`${state}::${lga}`) || [];
}

export function lgasForState(state: string): string[] {
  if (STATE_LGAS[state]) return STATE_LGAS[state];
  const set = new Set<string>();
  facilitiesForState(state).forEach((f) => {
    if (f.lga) set.add(f.lga);
  });
  return Array.from(set).sort();
}

export function lgaFacilityCounts(state: string): Record<string, number> {
  return LGA_COUNTS_CACHE.get(state) || {};
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

  const pool = state
    ? lga
      ? facilitiesForLga(state, lga)
      : facilitiesForState(state)
    : FACILITY_DIRECTORY;

  return pool.filter((f) => {
    if (!state && lga && f.lga !== lga) return false;
    if (level !== 'ALL' && f.level !== level) return false;
    if (capability !== 'ALL' && !f.capabilities.includes(capability)) return false;
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q) ||
      (f.lga || '').toLowerCase().includes(q) ||
      (f.ward || '').toLowerCase().includes(q) ||
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

/** Honest coverage summary across 36 states + FCT and all 774 LGAs. */
export function directoryCoverage() {
  const totalLgas = Object.values(STATE_LGAS).reduce((sum, list) => sum + list.length, 0);
  const withPhone = FACILITY_DIRECTORY.filter((f) => f.phone).length;
  const withLga = FACILITY_DIRECTORY.filter((f) => f.lga).length;
  const withCoords = FACILITY_DIRECTORY.filter((f) => f.latitude != null && f.longitude != null).length;
  const verified = FACILITY_DIRECTORY.filter((f) => f.verification === 'verified').length;
  return {
    total: FACILITY_DIRECTORY.length,
    states: Object.keys(STATE_LGAS).length,
    lgas: totalLgas,
    withPhone,
    withLga,
    withCoords,
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
