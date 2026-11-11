# NaijaHealth AI Firestore Security Specification

## 1. Data Invariants
1. **Default Deny**: Every unmatched path (`/test/connection`, legacy paths, unknown subcollections) MUST fail closed (`false`).
2. **Verified Identity Ownership**: Only authenticated users whose token has `request.auth.token.email_verified == true` may access `/users/{userId}`, `/users/{userId}/private/profile`, or `/users/{userId}/checkups/{checkupId}`, and ONLY when `request.auth.uid == userId`.
3. **Strict PII Isolation (Split Collection)**: Contact PII (`email`, `phone`, `emergencyContactPhone`) exists ONLY under `/users/{userId}/private/profile` (`docId == 'profile'`), where `list` is permanently disabled (`false`) and `get` enforces `request.auth.uid == userId && resource.data.uid == request.auth.uid`.
4. **Master Gate & Atomicity**: Writing to `/users/{userId}/private/profile` or `/users/{userId}/checkups/{checkupId}` requires `/users/{userId}` to exist (`exists(...)`) or be atomically created in the same batch (`existsAfter(...)`).
5. **Strict Schema & Bounds**: Every document enforces exact `hasAll` + `hasOnly` keys, field types, regex patterns (`uid`, `email`, `phone`), string length ceilings, enum allowlists, and `recommendedFacilities.size() <= 5`.
6. **Temporal Integrity & Immutability**: `createdAt` MUST equal `request.time` on create and remain identical to `existing().createdAt` on update; `updatedAt` MUST equal `request.time` on create and update; `uid` is immutable; checkups are terminal after creation (`update: if false`).
7. **Zero Private-Care Persistence**: Private Care (HIV/PEP/ART) sessions NEVER write to Firestore.

## 2. The "Dirty Dozen" Adversarial Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Profile Read**: Unauthenticated caller attempts `get` on `/users/u1/private/profile`.
2. **Email Spoofing / Unverified Token**: Authenticated caller with `email_verified: false` attempts `create` on `/users/u1/private/profile`.
3. **Cross-User PII Exfiltration**: Verified user `u2` attempts `get` on `/users/u1/private/profile`.
4. **PII Collection Listing**: Verified user `u1` attempts `list` on `/users/u1/private` or `/users`.
5. **Shadow / Ghost Field Injection**: User `u1` creates `/users/u1/private/profile` with valid fields plus `"role": "admin"` or `"isVerified": true`.
6. **UID Ownership Spoofing**: User `u2` creates `/users/u2/checkups/c1` with payload `uid: "u1"`.
7. **Orphan Subcollection Write**: User `u1` creates `/users/u1/checkups/c1` when parent `/users/u1` does not exist (nor batch-created).
8. **Document ID Poisoning**: User `u1` creates `/users/u1/checkups/<1500-char string with slashes or $>`.
9. **Denial-of-Wallet Oversized String / Unbounded Array**: User `u1` writes a 10,000-char `symptomSummary` or 25-item `recommendedFacilities` list.
10. **Client Timestamp Forgery**: User `u1` creates profile with `createdAt` set in the past instead of `request.time`.
11. **Immutable Field Tampering**: User `u1` updates `/users/u1/private/profile` attempting to alter `uid` or `createdAt`.
12. **Terminal Checkup Mutation / Invalid Phone Regex**: User `u1` attempts `update` on `/users/u1/checkups/c1`, or saves `"phone": "<script>alert(1)</script>"`.
