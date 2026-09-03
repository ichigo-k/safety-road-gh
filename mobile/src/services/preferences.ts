/* ─── Preferences ──────────────────────────────────────────────────────────
 *
 * Persisted settings that actually change behaviour.
 *
 * The settings screen previously held these in plain component state: every
 * switch reset on navigation and none of them affected anything. A toggle
 * that does nothing is worse than no toggle — it tells the user they have
 * control they do not have, and in a safety app that matters (someone who
 * turns off "high-priority broadcasts" has a right to expect quiet).
 *
 * Everything here is read by the alert pipeline. If a preference cannot be
 * honoured, it does not belong in this file or on that screen.
 * ------------------------------------------------------------------------ */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const KEY = '@safetyroad/preferences';

export interface Preferences {
  /** Master switch for OS notifications. */
  notifications: boolean;
  /** Spoken warnings — the primary channel while driving. */
  spokenAlerts: boolean;
  /** Vibration alongside a warning. */
  haptics: boolean;
  /** Accident hotspot proximity warnings. */
  hazardAlerts: boolean;
  /** Weather-driven advisories (flooding, heavy rain). */
  weatherAlerts: boolean;
  /** Fine GPS. Costs battery; improves how precisely alerts trigger. */
  highAccuracyGps: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  notifications: true,
  spokenAlerts: true,
  haptics: true,
  hazardAlerts: true,
  weatherAlerts: true,
  highAccuracyGps: true,
};

// Cached so the background task can read preferences synchronously-ish
// without an AsyncStorage round trip on every location fix.
let cache: Preferences | null = null;

export async function loadPreferences(): Promise<Preferences> {
  if (cache) return cache;
  let loaded: Preferences;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    loaded = raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : { ...DEFAULT_PREFERENCES };
  } catch {
    loaded = { ...DEFAULT_PREFERENCES };
  }
  cache = loaded;
  return loaded;
}

export async function savePreferences(next: Partial<Preferences>): Promise<Preferences> {
  const current = await loadPreferences();
  const merged = { ...current, ...next };
  cache = merged;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* the in-memory value still applies for this session */
  }
  return merged;
}

/** Synchronous read for hot paths. Falls back to defaults before first load. */
export function peekPreferences(): Preferences {
  return cache ?? DEFAULT_PREFERENCES;
}

/**
 * GPS accuracy actually used by the watchers.
 *
 * Balanced is roughly 100 m and cheap; High is roughly 10 m and is what makes
 * a 250 m hotspot radius trigger where it should rather than a street early.
 */
export function locationAccuracy(prefs: Preferences): Location.LocationAccuracy {
  return prefs.highAccuracyGps ? Location.Accuracy.High : Location.Accuracy.Balanced;
}

/**
 * Should this alert be delivered at all, given the user's categories?
 *
 * Weather advisories and hazard warnings are separately switchable because
 * they interrupt for different reasons — someone may want flood warnings but
 * not every pothole cluster.
 */
export function isCategoryEnabled(
  prefs: Preferences,
  category: 'hazard' | 'weather'
): boolean {
  return category === 'weather' ? prefs.weatherAlerts : prefs.hazardAlerts;
}
