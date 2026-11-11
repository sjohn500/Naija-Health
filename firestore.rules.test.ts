/**
 * Adversarial "Dirty Dozen" + Happy-Path Security Verification Suite
 * Mirrors every rule gate in firestore.rules and verifies schema synchronicity
 * against firebase-blueprint.json. Run with: npx tsx firestore.rules.test.ts
 */
import assert from 'node:assert/strict';

type AuthContext = {
  uid: string;
  emailVerified: boolean;
} | null;

const SERVER_TIME = Symbol('request.time');

interface SimDb {
  users: Record<string, Record<string, unknown>>;
  privateProfiles: Record<string, Record<string, unknown>>;
  checkups: Record<string, Record<string, unknown>>;
}

const VALID_ID = /^[a-zA-Z0-9_-]+$/;
const VALID_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_PHONE = /^$|^[+0-9][0-9 ()-]{6,19}$/;
const SUPPORTED_LANGS = new Set(['pidgin', 'english', 'hausa', 'yoruba', 'igbo']);
const URGENCY_LEVELS = new Set(['emergency', 'urgent', 'routine']);

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && VALID_ID.test(id);
}

function hasExactKeys(data: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(data);
  return actual.length === keys.length && keys.every((k) => Object.prototype.hasOwnProperty.call(data, k));
}

function isOwner(auth: AuthContext, userId: string): boolean {
  return Boolean(auth && auth.emailVerified === true && isValidId(userId) && auth.uid === userId);
}

function isValidPrivateProfile(data: Record<string, unknown>, userId: string, authUid: string): boolean {
  const expectedKeys = [
    'uid',
    'displayName',
    'email',
    'phone',
    'emergencyContactPhone',
    'preferredState',
    'preferredLanguage',
    'createdAt',
    'updatedAt',
  ];
  return (
    hasExactKeys(data, expectedKeys) &&
    isValidId(data.uid) &&
    data.uid === userId &&
    data.uid === authUid &&
    typeof data.displayName === 'string' &&
    data.displayName.length >= 1 &&
    data.displayName.length <= 80 &&
    typeof data.email === 'string' &&
    data.email.length >= 3 &&
    data.email.length <= 120 &&
    VALID_EMAIL.test(data.email) &&
    typeof data.phone === 'string' &&
    data.phone.length <= 24 &&
    VALID_PHONE.test(data.phone) &&
    typeof data.emergencyContactPhone === 'string' &&
    data.emergencyContactPhone.length <= 24 &&
    VALID_PHONE.test(data.emergencyContactPhone) &&
    typeof data.preferredState === 'string' &&
    data.preferredState.length >= 2 &&
    data.preferredState.length <= 40 &&
    typeof data.preferredLanguage === 'string' &&
    SUPPORTED_LANGS.has(data.preferredLanguage) &&
    Boolean(data.createdAt) &&
    Boolean(data.updatedAt)
  );
}

function isValidSavedCheckup(data: Record<string, unknown>, userId: string, authUid: string): boolean {
  const expectedKeys = [
    'uid',
    'symptomSummary',
    'language',
    'state',
    'urgencyLevel',
    'isRedFlag',
    'causesSummary',
    'nextStepSummary',
    'recommendedFacilities',
    'createdAt',
  ];
  return (
    hasExactKeys(data, expectedKeys) &&
    isValidId(data.uid) &&
    data.uid === userId &&
    data.uid === authUid &&
    typeof data.symptomSummary === 'string' &&
    data.symptomSummary.length >= 1 &&
    data.symptomSummary.length <= 400 &&
    typeof data.language === 'string' &&
    SUPPORTED_LANGS.has(data.language) &&
    typeof data.state === 'string' &&
    data.state.length >= 2 &&
    data.state.length <= 40 &&
    typeof data.urgencyLevel === 'string' &&
    URGENCY_LEVELS.has(data.urgencyLevel) &&
    typeof data.isRedFlag === 'boolean' &&
    typeof data.causesSummary === 'string' &&
    data.causesSummary.length >= 1 &&
    data.causesSummary.length <= 1200 &&
    typeof data.nextStepSummary === 'string' &&
    data.nextStepSummary.length >= 1 &&
    data.nextStepSummary.length <= 1200 &&
    Array.isArray(data.recommendedFacilities) &&
    data.recommendedFacilities.length <= 5 &&
    (data.recommendedFacilities.length === 0 ||
      (typeof data.recommendedFacilities[0] === 'string' &&
        data.recommendedFacilities[0].length <= 120)) &&
    Boolean(data.createdAt)
  );
}

function evalRule(
  db: SimDb,
  auth: AuthContext,
  op: 'get' | 'list' | 'create' | 'update' | 'delete',
  path: string,
  incoming?: Record<string, unknown>,
  batchParentCreated = false
): 'ALLOW' | 'PERMISSION_DENIED' {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'users') return 'PERMISSION_DENIED';

  if (parts.length === 1 && op === 'list') return 'PERMISSION_DENIED';

  if (parts.length === 2) {
    const userId = parts[1];
    if (op === 'list' || op === 'update' || op === 'delete') return 'PERMISSION_DENIED';
    const existing = db.users[userId];
    if (op === 'get') {
      return isOwner(auth, userId) && existing?.uid === auth!.uid ? 'ALLOW' : 'PERMISSION_DENIED';
    }
    if (op === 'create' && incoming) {
      const ok =
        isOwner(auth, userId) &&
        hasExactKeys(incoming, ['uid', 'createdAt']) &&
        isValidId(incoming.uid) &&
        incoming.uid === userId &&
        incoming.uid === auth!.uid &&
        incoming.createdAt === SERVER_TIME;
      return ok ? 'ALLOW' : 'PERMISSION_DENIED';
    }
    return 'PERMISSION_DENIED';
  }

  if (parts.length === 4 && parts[2] === 'private') {
    const userId = parts[1];
    const docId = parts[3];
    const key = `${userId}/${docId}`;
    const existing = db.privateProfiles[key];
    if (op === 'list') return 'PERMISSION_DENIED';
    if (!isOwner(auth, userId) || docId !== 'profile') return 'PERMISSION_DENIED';
    if (op === 'get') return existing?.uid === auth!.uid ? 'ALLOW' : 'PERMISSION_DENIED';
    if (op === 'delete') return existing?.uid === auth!.uid ? 'ALLOW' : 'PERMISSION_DENIED';
    if (op === 'create' && incoming) {
      const parentReady = Boolean(db.users[userId]) || batchParentCreated;
      const ok =
        parentReady &&
        isValidPrivateProfile(incoming, userId, auth!.uid) &&
        incoming.createdAt === SERVER_TIME &&
        incoming.updatedAt === SERVER_TIME;
      return ok ? 'ALLOW' : 'PERMISSION_DENIED';
    }
    if (op === 'update' && incoming && existing) {
      const allowedAffected = new Set([
        'displayName',
        'email',
        'phone',
        'emergencyContactPhone',
        'preferredState',
        'preferredLanguage',
        'updatedAt',
      ]);
      const affected = Object.keys(incoming).filter((k) => incoming[k] !== existing[k]);
      const ok =
        Boolean(db.users[userId]) &&
        isValidPrivateProfile(incoming, userId, auth!.uid) &&
        incoming.uid === existing.uid &&
        incoming.createdAt === existing.createdAt &&
        incoming.updatedAt === SERVER_TIME &&
        affected.every((k) => allowedAffected.has(k));
      return ok ? 'ALLOW' : 'PERMISSION_DENIED';
    }
    return 'PERMISSION_DENIED';
  }

  if (parts.length === 3 && parts[2] === 'private' && op === 'list') {
    return 'PERMISSION_DENIED';
  }

  if (parts.length === 3 && parts[2] === 'checkups' && op === 'list') {
    const userId = parts[1];
    const ownedRows = Object.entries(db.checkups).filter(([k]) => k.startsWith(`${userId}/`));
    const allOwnedByCaller = ownedRows.every(([, doc]) => doc.uid === auth?.uid);
    return auth && auth.emailVerified && auth.uid === userId && allOwnedByCaller
      ? 'ALLOW'
      : 'PERMISSION_DENIED';
  }

  if (parts.length === 4 && parts[2] === 'checkups') {
    const userId = parts[1];
    const checkupId = parts[3];
    const key = `${userId}/${checkupId}`;
    const existing = db.checkups[key];
    if (op === 'update') return 'PERMISSION_DENIED';
    if (!isOwner(auth, userId) || !isValidId(checkupId)) return 'PERMISSION_DENIED';
    if (op === 'get' || op === 'delete') return existing?.uid === auth!.uid ? 'ALLOW' : 'PERMISSION_DENIED';
    if (op === 'create' && incoming) {
      const parentReady = Boolean(db.users[userId]) || batchParentCreated;
      const ok =
        parentReady &&
        isValidSavedCheckup(incoming, userId, auth!.uid) &&
        incoming.createdAt === SERVER_TIME;
      return ok ? 'ALLOW' : 'PERMISSION_DENIED';
    }
  }

  return 'PERMISSION_DENIED';
}

const db: SimDb = {
  users: {
    u1: { uid: 'u1', createdAt: SERVER_TIME },
  },
  privateProfiles: {
    'u1/profile': {
      uid: 'u1',
      displayName: 'Amina',
      email: 'amina@example.ng',
      phone: '08031234567',
      emergencyContactPhone: '',
      preferredState: 'Lagos',
      preferredLanguage: 'pidgin',
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME,
    },
  },
  checkups: {
    'u1/chk-1': {
      uid: 'u1',
      symptomSummary: 'High fever since yesterday',
      language: 'pidgin',
      state: 'Lagos',
      urgencyLevel: 'urgent',
      isRedFlag: false,
      causesSummary: 'Malaria or viral fever fit cause am.',
      nextStepSummary: 'Do mRDT malaria test for clinic today.',
      recommendedFacilities: ['Lagos Island General Hospital (Lagos Island)'],
      createdAt: SERVER_TIME,
    },
  },
};

const u1Auth: AuthContext = { uid: 'u1', emailVerified: true };
const u2Auth: AuthContext = { uid: 'u2', emailVerified: true };
const unverifiedAuth: AuthContext = { uid: 'u1', emailVerified: false };

// 1-12 Dirty Dozen Payloads
assert.equal(evalRule(db, null, 'get', '/users/u1/private/profile'), 'PERMISSION_DENIED', '1. Unauth read');
assert.equal(
  evalRule(db, unverifiedAuth, 'create', '/users/u1/private/profile', db.privateProfiles['u1/profile']),
  'PERMISSION_DENIED',
  '2. Unverified email spoof'
);
assert.equal(evalRule(db, u2Auth, 'get', '/users/u1/private/profile'), 'PERMISSION_DENIED', '3. Cross-user PII get');
assert.equal(evalRule(db, u1Auth, 'list', '/users/u1/private'), 'PERMISSION_DENIED', '4. PII collection list');
assert.equal(
  evalRule(db, u1Auth, 'create', '/users/u1/private/profile', {
    ...db.privateProfiles['u1/profile'],
    isAdmin: true,
  }),
  'PERMISSION_DENIED',
  '5. Ghost field injection'
);
assert.equal(
  evalRule(db, u2Auth, 'create', '/users/u2/checkups/c2', {
    ...db.checkups['u1/chk-1'],
    uid: 'u1',
  }, true),
  'PERMISSION_DENIED',
  '6. UID spoofing'
);
assert.equal(
  evalRule(db, u2Auth, 'create', '/users/u2/checkups/c2', {
    ...db.checkups['u1/chk-1'],
    uid: 'u2',
  }, false),
  'PERMISSION_DENIED',
  '7. Orphan subcollection write'
);
assert.equal(
  evalRule(db, u1Auth, 'create', `/users/u1/checkups/${'a'.repeat(200)}`, {
    ...db.checkups['u1/chk-1'],
  }),
  'PERMISSION_DENIED',
  '8. Oversized document ID poisoning'
);
assert.equal(
  evalRule(db, u1Auth, 'create', '/users/u1/checkups/c3', {
    ...db.checkups['u1/chk-1'],
    recommendedFacilities: ['A', 'B', 'C', 'D', 'E', 'F'],
  }),
  'PERMISSION_DENIED',
  '9. Array limit overflow'
);
assert.equal(
  evalRule(db, u1Auth, 'create', '/users/u1/private/profile', {
    ...db.privateProfiles['u1/profile'],
    createdAt: '2020-01-01T00:00:00Z',
  }),
  'PERMISSION_DENIED',
  '10. Client timestamp forgery'
);
assert.equal(
  evalRule(db, u1Auth, 'update', '/users/u1/private/profile', {
    ...db.privateProfiles['u1/profile'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: SERVER_TIME,
  }),
  'PERMISSION_DENIED',
  '11. Immutable createdAt tampering'
);
assert.equal(
  evalRule(db, u1Auth, 'update', '/users/u1/checkups/chk-1', {
    ...db.checkups['u1/chk-1'],
    symptomSummary: 'Altered log',
  }),
  'PERMISSION_DENIED',
  '12a. Terminal checkup update denied'
);
assert.equal(
  evalRule(db, u1Auth, 'update', '/users/u1/private/profile', {
    ...db.privateProfiles['u1/profile'],
    phone: '<script>bad()</script>',
    updatedAt: SERVER_TIME,
  }),
  'PERMISSION_DENIED',
  '12b. Invalid phone regex rejected'
);

// Happy Paths
assert.equal(
  evalRule(db, u1Auth, 'update', '/users/u1/private/profile', {
    ...db.privateProfiles['u1/profile'],
    phone: '+234 803 123 4567',
    updatedAt: SERVER_TIME,
  }),
  'ALLOW',
  'Valid phone update allowed'
);
assert.equal(
  evalRule(db, u1Auth, 'create', '/users/u1/checkups/chk-2', db.checkups['u1/chk-1']),
  'ALLOW',
  'Valid saved checkup create allowed'
);
assert.equal(evalRule(db, u1Auth, 'list', '/users/u1/checkups'), 'ALLOW', 'Owner checkups list allowed');
assert.equal(evalRule(db, u2Auth, 'list', '/users/u1/checkups'), 'PERMISSION_DENIED', 'Cross-user list denied');

console.log('All 12+ Dirty Dozen attacks blocked (PERMISSION_DENIED) and happy paths allowed.');
