import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AppUser } from '../types/auth';

const STORAGE_KEY = 'nh_active_user_session';

export function getStoredUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUser(user: AppUser | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Normalizes and validates Nigerian phone numbers
 * e.g. 08031234567, 090..., 070..., +2348031234567
 */
export function validateNigerianPhone(input: string): { valid: boolean; formatted: string; error?: string } {
  const cleaned = input.replace(/\s+/g, '').replace(/[-()]/g, '');
  if (!cleaned) {
    return { valid: false, formatted: '', error: 'Please enter your phone number' };
  }

  // International format +234...
  if (cleaned.startsWith('+234') && cleaned.length === 14) {
    return { valid: true, formatted: cleaned };
  }

  // 234 without +
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return { valid: true, formatted: `+${cleaned}` };
  }

  // Standard Nigerian 11-digit local format: 080..., 081..., 090..., 091..., 070...
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const intl = `+234${cleaned.slice(1)}`;
    return { valid: true, formatted: intl };
  }

  return {
    valid: false,
    formatted: cleaned,
    error: 'Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)',
  };
}

/**
 * Sign in or register with Phone Number
 */
export async function signInWithPhone(phoneNumber: string, fullName?: string, state?: string): Promise<AppUser> {
  const check = validateNigerianPhone(phoneNumber);
  if (!check.valid) {
    throw new Error(check.error || 'Invalid Nigerian phone number');
  }

  // Try anonymous Firebase session if available to obtain a real UID
  let uid = `phone_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    const cred = await signInAnonymously(auth);
    if (cred.user) {
      uid = cred.user.uid;
    }
  } catch {
    // offline or anonymous auth not enabled; fallback to secure generated UID
  }

  const appUser: AppUser = {
    uid,
    authMethod: 'phone',
    phone: check.formatted,
    displayName: fullName?.trim() || `User (${phoneNumber.slice(-4)})`,
    preferredState: state || 'Lagos',
    createdAt: Date.now(),
  };

  saveStoredUser(appUser);
  return appUser;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const appUser: AppUser = {
      uid: cred.user.uid,
      authMethod: 'email',
      email: cred.user.email || cleanEmail,
      displayName: cred.user.displayName || cleanEmail.split('@')[0],
      createdAt: Date.now(),
    };
    saveStoredUser(appUser);
    return appUser;
  } catch (err: any) {
    // If user not found, suggest registering or try create
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      throw new Error('Incorrect email or password. If you are new, tap Create Account.');
    }
    throw new Error(err.message || 'Unable to sign in. Please check your details.');
  }
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  fullName?: string,
  state?: string
): Promise<AppUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const appUser: AppUser = {
      uid: cred.user.uid,
      authMethod: 'email',
      email: cred.user.email || cleanEmail,
      displayName: fullName?.trim() || cleanEmail.split('@')[0],
      preferredState: state || 'Lagos',
      createdAt: Date.now(),
    };
    saveStoredUser(appUser);
    return appUser;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please tap Sign In.');
    }
    throw new Error(err.message || 'Registration failed. Please try again.');
  }
}

/**
 * 1-Click Fast Guest Entry
 */
export async function signInAsGuest(state?: string): Promise<AppUser> {
  let uid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    const cred = await signInAnonymously(auth);
    if (cred.user) {
      uid = cred.user.uid;
    }
  } catch {
    /* fallback to local guest session */
  }

  const appUser: AppUser = {
    uid,
    authMethod: 'guest',
    displayName: 'Guest Patient',
    preferredState: state || 'Lagos',
    createdAt: Date.now(),
  };

  saveStoredUser(appUser);
  return appUser;
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {
    /* ignore */
  }
  saveStoredUser(null);
}

/**
 * Listen for auth updates
 */
export function subscribeToAuth(callback: (user: AppUser | null) => void): () => void {
  // First check local stored session
  const stored = getStoredUser();
  if (stored) {
    callback(stored);
  }

  const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      const currentStored = getStoredUser();
      const updatedUser: AppUser = {
        uid: fbUser.uid,
        authMethod: fbUser.isAnonymous ? 'guest' : fbUser.email ? 'email' : 'phone',
        email: fbUser.email || currentStored?.email,
        phone: fbUser.phoneNumber || currentStored?.phone,
        displayName: fbUser.displayName || currentStored?.displayName || (fbUser.isAnonymous ? 'Guest Patient' : 'User'),
        preferredState: currentStored?.preferredState || 'Lagos',
        createdAt: currentStored?.createdAt || Date.now(),
      };
      saveStoredUser(updatedUser);
      callback(updatedUser);
    } else {
      const currentStored = getStoredUser();
      if (!currentStored) {
        callback(null);
      }
    }
  });

  return unsubscribe;
}
