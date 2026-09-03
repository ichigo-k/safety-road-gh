import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1');

const TOKEN_KEY = 'safety_road_gh_jwt_token';
const USER_KEY = 'safety_road_gh_user_data';

/* A write that fails must throw.
 *
 * This used to swallow the error. A failed SecureStore write then left the
 * app in the worst possible state: saveAuthToken() resolved, the login screen
 * called onLoginSuccess(), HOME rendered — and every request after it went out
 * with no Authorization header, earning a 401 that bounced the user straight
 * back to the login screen with nothing logged to say why.
 *
 * Failing here instead means the login screen shows a real error and the user
 * stays put. */
async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  } else {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  }
}

async function removeStorageItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) { }
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) { }
  }
}

export async function saveAuthToken(token: string) {
  await setStorageItem(TOKEN_KEY, token);
  // Read it back: on some devices SecureStore resolves without persisting.
  // Better to fail the sign-in here than to let the session die on the next
  // request with no explanation.
  const stored = await getStorageItem(TOKEN_KEY);
  if (stored !== token) {
    throw new Error('Could not save your session on this device. Please try again.');
  }
}

export async function getAuthToken(): Promise<string | null> {
  return await getStorageItem(TOKEN_KEY);
}

export async function removeAuthToken() {
  await removeStorageItem(TOKEN_KEY);
}

export async function saveUserData(user: any) {
  await setStorageItem(USER_KEY, JSON.stringify(user));
}

export async function getUserData(): Promise<any | null> {
  const data = await getStorageItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function removeUserData() {
  await removeStorageItem(USER_KEY);
}

/* ── Global 401 callback ────────────────────────────────────────────────
 * Set by App.tsx on mount. When apiFetch decides a 401 means "the session we
 * were holding is no longer good", it calls this so the app can wipe the
 * session and send the user back to AUTH from anywhere.
 *
 * The narrowing matters. This used to fire on every 401 from every endpoint,
 * which meant a mistyped password on the login screen - /auth/login answers a
 * bad credential with 401 - wiped storage and re-navigated to AUTH, and any
 * request made with no token at all was read as "your session expired"
 * rather than "you were never signed in".
 *
 * A .catch() at the call site does not hold this back: the callback runs
 * inside apiFetch before the error is thrown, so a screen that degrades
 * gracefully on failure still had its session destroyed underneath it.
 * ---------------------------------------------------------------------- */
let _onUnauthorized: (() => void) | null = null;

/* Endpoints where a 401 is an answer about the credentials just supplied,
 * not a verdict on a stored session. */
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

const isAuthEndpoint = (endpoint: string) =>
  AUTH_ENDPOINTS.some((path) => endpoint.split('?')[0] === path);

export function setUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError: any) {
    throw new Error(
      networkError.message === 'Network request failed'
        ? 'Cannot reach server. Check your internet connection or API URL.'
        : networkError.message || 'Network request failed'
    );
  }

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    // A 401 ends the session only when we actually presented a token to a
    // non-auth endpoint and the server rejected it. With no token there is no
    // session to expire, and on /auth/* a 401 just means "wrong password".
    const sessionRejected =
      response.status === 401 && !!token && !isAuthEndpoint(endpoint);

    if (sessionRejected && _onUnauthorized) {
      _onUnauthorized();
    }
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}
