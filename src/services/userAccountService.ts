import { User, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  deleteDoc,
  writeBatch,
  updateDoc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  firebaseConfig,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  TriageResult,
  UrgencyLevel,
} from '../types/triage';

/**
 * Validation constants strictly synchronized with firebase-blueprint.json & firestore.rules
 */
export const SCHEMA_LIMITS = {
  uidRegex: /^[a-zA-Z0-9_-]+$/,
  uidMax: 128,
  displayNameMin: 1,
  displayNameMax: 80,
  emailMin: 3,
  emailMax: 120,
  emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phoneMax: 24,
  phoneRegex: /^$|^[+0-9][0-9 ()-]{6,19}$/,
  stateMin: 2,
  stateMax: 40,
  symptomSummaryMax: 400,
  causesSummaryMax: 1200,
  nextStepSummaryMax: 1200,
  maxFacilities: 5,
  facilityNameMax: 120,
} as const;

export interface UserPrivateProfile {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  emergencyContactPhone: string;
  preferredState: string;
  preferredLanguage: SupportedLanguage;
  createdAtMs: number | null;
  updatedAtMs: number | null;
}

export interface SaveProfileInput {
  displayName: string;
  email: string;
  phone: string;
  emergencyContactPhone: string;
  preferredState: string;
  preferredLanguage: SupportedLanguage;
}

export interface SavedCheckupRecord {
  id: string;
  uid: string;
  symptomSummary: string;
  language: SupportedLanguage;
  state: string;
  urgencyLevel: UrgencyLevel;
  isRedFlag: boolean;
  causesSummary: string;
  nextStepSummary: string;
  recommendedFacilities: string[];
  createdAtMs: number;
}

const VALID_LANGUAGES = new Set<SupportedLanguage>(SUPPORTED_LANGUAGES.map((l) => l.code));
const VALID_URGENCIES = new Set<UrgencyLevel>(['emergency', 'urgent', 'routine']);

function clampText(value: string, max: number, fallback = ''): string {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) return fallback;
  return cleaned.slice(0, max);
}

export function normalizePhoneInput(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, SCHEMA_LIMITS.phoneMax);
}

export function validateProfileInput(input: SaveProfileInput): {
  valid: boolean;
  errorKey?: 'invalidName' | 'invalidEmail' | 'invalidPhone' | 'invalidEmergencyPhone' | 'invalidState';
  sanitized: SaveProfileInput;
} {
  const displayName = clampText(input.displayName, SCHEMA_LIMITS.displayNameMax);
  const email = input.email.trim().toLowerCase().slice(0, SCHEMA_LIMITS.emailMax);
  const phone = normalizePhoneInput(input.phone);
  const emergencyContactPhone = normalizePhoneInput(input.emergencyContactPhone);
  const preferredState = clampText(input.preferredState, SCHEMA_LIMITS.stateMax, 'Lagos');
  const preferredLanguage: SupportedLanguage = VALID_LANGUAGES.has(input.preferredLanguage)
    ? input.preferredLanguage
    : 'pidgin';

  if (displayName.length < SCHEMA_LIMITS.displayNameMin) {
    return {
      valid: false,
      errorKey: 'invalidName',
      sanitized: { displayName, email, phone, emergencyContactPhone, preferredState, preferredLanguage },
    };
  }

  if (
    email.length < SCHEMA_LIMITS.emailMin ||
    email.length > SCHEMA_LIMITS.emailMax ||
    !SCHEMA_LIMITS.emailRegex.test(email)
  ) {
    return {
      valid: false,
      errorKey: 'invalidEmail',
      sanitized: { displayName, email, phone, emergencyContactPhone, preferredState, preferredLanguage },
    };
  }

  if (!SCHEMA_LIMITS.phoneRegex.test(phone)) {
    return {
      valid: false,
      errorKey: 'invalidPhone',
      sanitized: { displayName, email, phone, emergencyContactPhone, preferredState, preferredLanguage },
    };
  }

  if (!SCHEMA_LIMITS.phoneRegex.test(emergencyContactPhone)) {
    return {
      valid: false,
      errorKey: 'invalidEmergencyPhone',
      sanitized: { displayName, email, phone, emergencyContactPhone, preferredState, preferredLanguage },
    };
  }

  if (preferredState.length < SCHEMA_LIMITS.stateMin) {
    return {
      valid: false,
      errorKey: 'invalidState',
      sanitized: { displayName, email, phone, emergencyContactPhone, preferredState, preferredLanguage },
    };
  }

  return {
    valid: true,
    sanitized: {
      displayName,
      email,
      phone,
      emergencyContactPhone,
      preferredState,
      preferredLanguage,
    },
  };
}

function timestampToMs(val: unknown): number | null {
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'toMillis' in val && typeof (val as { toMillis: () => number }).toMillis === 'function') {
    return (val as { toMillis: () => number }).toMillis();
  }
  return null;
}

export async function signInWithGooglePopup(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function ensureUserAccountAnchor(user: User): Promise<void> {
  if (!user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }
  if (!SCHEMA_LIMITS.uidRegex.test(user.uid)) return;
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);

  let exists = false;
  try {
    const snap = await getDoc(userRef);
    exists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!exists) {
    try {
      const batch = writeBatch(db);
      batch.set(userRef, {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  }
}

export async function loadPrivateProfile(uid: string): Promise<UserPrivateProfile | null> {
  if (!SCHEMA_LIMITS.uidRegex.test(uid)) return null;
  const profilePath = `users/${uid}/private/profile`;
  const profileRef = doc(db, 'users', uid, 'private', 'profile');

  try {
    const snap = await getDoc(profileRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: String(data.uid || uid),
      displayName: String(data.displayName || ''),
      email: String(data.email || ''),
      phone: String(data.phone || ''),
      emergencyContactPhone: String(data.emergencyContactPhone || ''),
      preferredState: String(data.preferredState || 'Lagos'),
      preferredLanguage: VALID_LANGUAGES.has(data.preferredLanguage)
        ? (data.preferredLanguage as SupportedLanguage)
        : 'pidgin',
      createdAtMs: timestampToMs(data.createdAt),
      updatedAtMs: timestampToMs(data.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
  }
}

export async function ensureAccountAndSaveProfile(
  user: User,
  input: SaveProfileInput
): Promise<UserPrivateProfile> {
  if (!user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  const check = validateProfileInput(input);
  if (!check.valid) {
    throw new Error(`VALIDATION_${check.errorKey || 'invalid'}`);
  }

  const { sanitized } = check;
  const userPath = `users/${user.uid}`;
  const profilePath = `users/${user.uid}/private/profile`;
  const userRef = doc(db, 'users', user.uid);
  const profileRef = doc(db, 'users', user.uid, 'private', 'profile');

  let userExists = false;
  try {
    const userSnap = await getDoc(userRef);
    userExists = userSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  let profileExists = false;
  try {
    const profileSnap = await getDoc(profileRef);
    profileExists = profileSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
  }

  if (!profileExists) {
    const batch = writeBatch(db);
    if (!userExists) {
      batch.set(userRef, {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
    }
    batch.set(profileRef, {
      uid: user.uid,
      displayName: sanitized.displayName,
      email: sanitized.email,
      phone: sanitized.phone,
      emergencyContactPhone: sanitized.emergencyContactPhone,
      preferredState: sanitized.preferredState,
      preferredLanguage: sanitized.preferredLanguage,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, profilePath);
    }
  } else {
    if (!userExists) {
      const batch = writeBatch(db);
      batch.set(userRef, {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      batch.update(profileRef, {
        displayName: sanitized.displayName,
        email: sanitized.email,
        phone: sanitized.phone,
        emergencyContactPhone: sanitized.emergencyContactPhone,
        preferredState: sanitized.preferredState,
        preferredLanguage: sanitized.preferredLanguage,
        updatedAt: serverTimestamp(),
      });
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, profilePath);
      }
    } else {
      try {
        await updateDoc(profileRef, {
          displayName: sanitized.displayName,
          email: sanitized.email,
          phone: sanitized.phone,
          emergencyContactPhone: sanitized.emergencyContactPhone,
          preferredState: sanitized.preferredState,
          preferredLanguage: sanitized.preferredLanguage,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, profilePath);
      }
    }
  }

  const now = Date.now();
  return {
    uid: user.uid,
    displayName: sanitized.displayName,
    email: sanitized.email,
    phone: sanitized.phone,
    emergencyContactPhone: sanitized.emergencyContactPhone,
    preferredState: sanitized.preferredState,
    preferredLanguage: sanitized.preferredLanguage,
    createdAtMs: now,
    updatedAtMs: now,
  };
}

export async function deletePrivateProfile(uid: string): Promise<void> {
  const profilePath = `users/${uid}/private/profile`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'private', 'profile'));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, profilePath);
  }
}

export async function savePublicCheckup(
  user: User,
  symptomText: string,
  triage: TriageResult,
  fallbackState: string,
  fallbackLanguage: SupportedLanguage
): Promise<string> {
  if (!user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  const checkupId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const userPath = `users/${user.uid}`;
  const checkupPath = `users/${user.uid}/checkups/${checkupId}`;
  const userRef = doc(db, 'users', user.uid);
  const checkupRef = doc(db, 'users', user.uid, 'checkups', checkupId);

  let userExists = false;
  try {
    const userSnap = await getDoc(userRef);
    userExists = userSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  const langCandidate = triage.language || fallbackLanguage;
  const language: SupportedLanguage = VALID_LANGUAGES.has(langCandidate) ? langCandidate : 'pidgin';
  const urgencyLevel: UrgencyLevel = VALID_URGENCIES.has(triage.urgencyLevel)
    ? triage.urgencyLevel
    : triage.isRedFlag
    ? 'emergency'
    : 'routine';

  const facilities = (triage.recommendedFacilities || [])
    .map((f) => clampText(String(f), SCHEMA_LIMITS.facilityNameMax))
    .filter((f) => f.length > 0)
    .slice(0, SCHEMA_LIMITS.maxFacilities);

  const payload = {
    uid: user.uid,
    symptomSummary: clampText(symptomText, SCHEMA_LIMITS.symptomSummaryMax, 'Symptom checkup'),
    language,
    state: clampText(triage.detectedLocation || fallbackState, SCHEMA_LIMITS.stateMax, 'Lagos'),
    urgencyLevel,
    isRedFlag: Boolean(triage.isRedFlag),
    causesSummary: clampText(
      triage.wetinFitDeyHappen || triage.potentialCauses || 'Medical triage evaluation',
      SCHEMA_LIMITS.causesSummaryMax,
      'Medical triage evaluation'
    ),
    nextStepSummary: clampText(
      triage.nextStep || triage.actionPlan || 'Consult a qualified clinician or hospital in Nigeria.',
      SCHEMA_LIMITS.nextStepSummaryMax,
      'Consult a qualified clinician or hospital in Nigeria.'
    ),
    recommendedFacilities: facilities,
    createdAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  if (!userExists) {
    batch.set(userRef, {
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
  }
  batch.set(checkupRef, payload);

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, checkupPath);
  }

  return checkupId;
}

export function subscribeToUserCheckups(
  uid: string,
  onData: (records: SavedCheckupRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const checkupsPath = `users/${uid}/checkups`;
  const q = query(
    collection(db, 'users', uid, 'checkups'),
    where('uid', '==', uid),
    limit(25)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedCheckupRecord[] = snapshot.docs.map((snapDoc) => {
        const data = snapDoc.data();
        return {
          id: snapDoc.id,
          uid: String(data.uid || uid),
          symptomSummary: String(data.symptomSummary || ''),
          language: VALID_LANGUAGES.has(data.language)
            ? (data.language as SupportedLanguage)
            : 'pidgin',
          state: String(data.state || 'Lagos'),
          urgencyLevel: VALID_URGENCIES.has(data.urgencyLevel)
            ? (data.urgencyLevel as UrgencyLevel)
            : 'routine',
          isRedFlag: Boolean(data.isRedFlag),
          causesSummary: String(data.causesSummary || ''),
          nextStepSummary: String(data.nextStepSummary || ''),
          recommendedFacilities: Array.isArray(data.recommendedFacilities)
            ? data.recommendedFacilities.map((f) => String(f)).slice(0, SCHEMA_LIMITS.maxFacilities)
            : [],
          createdAtMs: timestampToMs(data.createdAt) ?? 0,
        };
      });
      items.sort((a, b) => b.createdAtMs - a.createdAtMs);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, checkupsPath);
      } catch (formatted) {
        onError?.(formatted instanceof Error ? formatted : new Error(String(formatted)));
      }
    }
  );
}

export async function deleteSavedCheckup(uid: string, checkupId: string): Promise<void> {
  if (!SCHEMA_LIMITS.uidRegex.test(checkupId)) return;
  const checkupPath = `users/${uid}/checkups/${checkupId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'checkups', checkupId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, checkupPath);
  }
}

export function getQuotaUpgradeUrl(): string {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;
}

export function parseFirebaseErrorMessage(error: unknown): {
  kind: 'quota' | 'popup_closed' | 'popup_blocked' | 'unverified' | 'permission' | 'unknown';
  detail: string;
} {
  let raw = error instanceof Error ? error.message : String(error);
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.error === 'string') {
      raw = parsed.error;
    }
  } catch {
    // plain error string
  }

  const lower = raw.toLowerCase();
  if (lower.includes('quota exceeded')) {
    return { kind: 'quota', detail: raw };
  }
  if (lower.includes('popup-closed-by-user') || lower.includes('cancelled-popup-request')) {
    return { kind: 'popup_closed', detail: raw };
  }
  if (lower.includes('popup-blocked')) {
    return { kind: 'popup_blocked', detail: raw };
  }
  if (lower.includes('email_not_verified')) {
    return { kind: 'unverified', detail: raw };
  }
  if (lower.includes('permission') || lower.includes('insufficient')) {
    return { kind: 'permission', detail: raw };
  }
  return { kind: 'unknown', detail: raw };
}
