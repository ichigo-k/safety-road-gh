import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1');

const TOKEN_KEY = 'safety_road_gh_jwt_token';
const USER_KEY = 'safety_road_gh_user_data';

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  } else {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {}
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
    } catch (e) {}
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {}
  }
}

export async function saveAuthToken(token: string) {
  await setStorageItem(TOKEN_KEY, token);
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
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}
