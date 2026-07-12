import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function updateUserProfile(user: User, displayName: string) {
  return updateProfile(user, { displayName });
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
  return signOut(auth);
}

export function deleteCurrentUser() {
  if (!auth.currentUser) return Promise.reject(new Error('No authenticated user'));
  return deleteUser(auth.currentUser);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

const AUTH_ERROR_MESSAGES: Record<string, { ko: string; en: string }> = {
  'auth/invalid-email': { ko: '이메일 형식이 올바르지 않습니다.', en: 'Please enter a valid email address.' },
  'auth/requires-recent-login': {
    ko: '보안을 위해 다시 로그인 후 시도해주세요.',
    en: 'For your security, please log in again and try.',
  },
  'auth/user-not-found': { ko: '가입되지 않은 이메일입니다.', en: 'No account found with this email.' },
  'auth/wrong-password': { ko: '비밀번호가 올바르지 않습니다.', en: 'Incorrect password.' },
  'auth/invalid-credential': { ko: '이메일 또는 비밀번호가 올바르지 않습니다.', en: 'Invalid email or password.' },
  'auth/email-already-in-use': { ko: '이미 사용 중인 이메일입니다.', en: 'This email is already in use.' },
  'auth/weak-password': { ko: '비밀번호는 6자 이상이어야 합니다.', en: 'Password should be at least 6 characters.' },
  'auth/too-many-requests': { ko: '잠시 후 다시 시도해주세요.', en: 'Too many attempts. Please try again later.' },
  'auth/popup-closed-by-user': { ko: '로그인 창이 닫혔습니다.', en: 'The sign-in window was closed.' },
  'auth/cancelled-popup-request': { ko: '로그인 창이 닫혔습니다.', en: 'The sign-in window was closed.' },
  'auth/network-request-failed': { ko: '네트워크 연결을 확인해주세요.', en: 'Please check your network connection.' },
};

const FALLBACK_ERROR_MESSAGE = { ko: '문제가 발생했습니다. 다시 시도해주세요.', en: 'Something went wrong. Please try again.' };

export function getAuthErrorMessage(error: unknown, language: 'ko' | 'en'): string {
  const code = (error as { code?: string } | null)?.code ?? '';
  return (AUTH_ERROR_MESSAGES[code] ?? FALLBACK_ERROR_MESSAGE)[language];
}
