/**
 * Nationwide facility model.
 *
 * Design rules:
 *  - Every field a user might act on is optional, and a missing field is
 *    SHOWN as missing ("Hours not recorded"), never quietly omitted.
 *  - `lastVerified` is the trust anchor. A row without a date is labelled
 *    "Unverified — call first". We never imply freshness we do not have.
 *  - `capabilities` may be inferred from facility level. Inferences are marked
 *    `capabilityBasis: 'inferred-from-level'` so the UI can say so.
 *  - LGAs are never guessed. A facility without an LGA record says so, and the
 *    correction flow is how LGA data arrives.
 */

export type FacilityLevel = 'PHC' | 'General' | 'FMC' | 'Teaching' | 'Specialist';

export const FACILITY_LEVELS: FacilityLevel[] = ['PHC', 'General', 'FMC', 'Teaching', 'Specialist'];

export const FACILITY_LEVEL_LABEL: Record<FacilityLevel, string> = {
  PHC: 'Primary health centre',
  General: 'General hospital',
  FMC: 'Federal medical centre',
  Teaching: 'Teaching hospital',
  Specialist: 'Specialist hospital',
};

export type FacilityCapability =
  | 'ART'
  | 'PEP'
  | 'PMTCT'
  | 'VL testing'
  | 'Emergency'
  | 'Maternity'
  | 'Paediatrics'
  | 'Surgery'
  | 'Laboratory'
  | 'Immunisation';

export const ALL_CAPABILITIES: FacilityCapability[] = [
  'Emergency',
  'Maternity',
  'Paediatrics',
  'Laboratory',
  'Surgery',
  'ART',
  'PEP',
  'PMTCT',
  'VL testing',
  'Immunisation',
];

/** 24-hour facilities are the ones that matter at 2am, so they get a real flag. */
export interface OpeningHours {
  open24h?: boolean;
  opens?: string;
  closes?: string;
  days?: string;
  note?: string;
}

export type VerificationState = 'unverified' | 'reported' | 'verified';

export interface FacilityRecord {
  id: string;
  name: string;
  level: FacilityLevel;
  state: string;
  /** null means "not recorded", never "unknown location". */
  lga: string | null;
  city: string;
  address?: string;
  /** null means no direct line is on file. */
  phone: string | null;
  hours: OpeningHours | null;
  capabilities: FacilityCapability[];
  capabilityBasis: 'inferred-from-level' | 'verified';
  /** ISO date (YYYY-MM-DD) of last human/bulk verification, or null. */
  lastVerified: string | null;
  verification: VerificationState;
}

export type CorrectionIssue =
  | 'wrong-details'
  | 'closed'
  | 'no-staff'
  | 'phone-changed'
  | 'wrong-lga'
  | 'cannot-find';

export const CORRECTION_ISSUES: { id: CorrectionIssue; label: string; hint: string }[] = [
  { id: 'wrong-details', label: 'Wrong details', hint: 'Name, address or level is wrong' },
  { id: 'closed', label: 'Closed down', hint: 'Facility no longer exists' },
  { id: 'no-staff', label: 'No staff when I went', hint: 'Nobody was there, or no doctor on duty' },
  { id: 'phone-changed', label: 'Phone is wrong', hint: 'The number did not connect' },
  { id: 'wrong-lga', label: 'Wrong LGA', hint: 'This facility is in a different LGA' },
  { id: 'cannot-find', label: "Can't find it", hint: 'The address could not be located' },
];
