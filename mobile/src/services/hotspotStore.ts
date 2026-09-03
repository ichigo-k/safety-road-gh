/* ─── Hotspot store ────────────────────────────────────────────────────────
 *
 * Fetches server-scored hotspots and keeps them on disk.
 *
 * Ghanaian mobile coverage is patchy, and the moment you most need a hazard
 * warning is often the moment you have no signal — a rural stretch of the
 * Accra-Kumasi road is exactly where both the danger and the dead zone are.
 * So hotspots are cached locally and the alert engine always reads from the
 * cache; the network only refreshes it.
 *
 * Sync fetches the full active set and replaces the cache outright.
 *
 * An earlier version synced incrementally with a `?since=` cursor and merged
 * deltas by id. That was wrong: a delta response can say what changed but not
 * what was *deleted*, and `recompute` drops every derived hotspot and rebuilds
 * it with fresh UUIDs. So each recompute left the previous generation stranded
 * in the cache and the device drifted further from the server every time —
 * four hotspots on the server showed as eight on the phone.
 *
 * Hotspots are a small bounded set (hundreds nationally) and a recompute
 * rewrites all of them, so a delta would save almost nothing anyway. Correct
 * beats clever here.
 * ------------------------------------------------------------------------ */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';
import type { Hotspot } from './proximity';
import type { CooldownState } from './proximity';
import { emptyCooldownState } from './proximity';

const HOTSPOTS_KEY = '@safetyroad/hotspots';
const CURSOR_KEY = '@safetyroad/hotspots:cursor';
const COOLDOWN_KEY = '@safetyroad/hotspots:cooldown';

/** Refresh no more often than this, even if something asks repeatedly. */
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

let lastRefreshAt = 0;
let memoryCache: Hotspot[] | null = null;

/* ── Read ────────────────────────────────────────────────────────────────── */

export async function getCachedHotspots(): Promise<Hotspot[]> {
  if (memoryCache) return memoryCache;
  try {
    const raw = await AsyncStorage.getItem(HOTSPOTS_KEY);
    memoryCache = raw ? (JSON.parse(raw) as Hotspot[]) : [];
  } catch {
    memoryCache = [];
  }
  return memoryCache;
}

/* ── Sync ────────────────────────────────────────────────────────────────── */

export interface SyncResult {
  hotspots: Hotspot[];
  fromCache: boolean;
  /** Null when the refresh was skipped or failed. */
  syncedAt: string | null;
}

/**
 * Refresh from the server, falling back to the cache on any failure.
 *
 * `force` bypasses the rate limit — used by pull-to-refresh, where the user
 * has explicitly asked and expects something to happen.
 */
export async function syncHotspots(force = false): Promise<SyncResult> {
  const cached = await getCachedHotspots();

  if (!force && Date.now() - lastRefreshAt < MIN_REFRESH_INTERVAL_MS && cached.length > 0) {
    return { hotspots: cached, fromCache: true, syncedAt: null };
  }

  try {
    const res = await apiFetch('/hotspots');
    const incoming: Hotspot[] = Array.isArray(res.hotspots) ? res.hotspots : [];

    // The server response is authoritative: anything not in it no longer
    // warns drivers, whether it was mitigated, deleted or rebuilt under a new
    // id. Replacing wholesale is the only way a deletion can reach the device.
    memoryCache = incoming;
    lastRefreshAt = Date.now();

    await AsyncStorage.multiSet([
      [HOTSPOTS_KEY, JSON.stringify(incoming)],
      [CURSOR_KEY, String(res.syncedAt ?? new Date().toISOString())],
    ]);

    return { hotspots: incoming, fromCache: false, syncedAt: res.syncedAt ?? null };
  } catch {
    // Offline, or the API is down. The cache is the whole point.
    return { hotspots: cached, fromCache: true, syncedAt: null };
  }
}

/** Drop everything — used on sign-out so one user's cache is not another's. */
export async function clearHotspotCache(): Promise<void> {
  memoryCache = null;
  lastRefreshAt = 0;
  await AsyncStorage.multiRemove([HOTSPOTS_KEY, CURSOR_KEY, COOLDOWN_KEY]);
}

/* ── Cooldown persistence ────────────────────────────────────────────────── */

/**
 * The cooldown state has to survive the app being killed, otherwise every
 * cold start re-announces every hotspot you are sitting next to.
 */
export async function loadCooldownState(): Promise<CooldownState> {
  try {
    const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
    if (!raw) return emptyCooldownState();
    const parsed = JSON.parse(raw) as CooldownState;
    return {
      lastAlertedAt: parsed.lastAlertedAt ?? {},
      inside: Array.isArray(parsed.inside) ? parsed.inside : [],
    };
  } catch {
    return emptyCooldownState();
  }
}

export async function saveCooldownState(state: CooldownState): Promise<void> {
  try {
    // Prune entries older than a day so the map cannot grow without bound
    // on a device that has driven past thousands of hotspots.
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const lastAlertedAt = Object.fromEntries(
      Object.entries(state.lastAlertedAt).filter(([, at]) => at > cutoff)
    );
    await AsyncStorage.setItem(
      COOLDOWN_KEY,
      JSON.stringify({ lastAlertedAt, inside: state.inside })
    );
  } catch {
    /* a failed cooldown write costs a duplicate alert, not correctness */
  }
}
