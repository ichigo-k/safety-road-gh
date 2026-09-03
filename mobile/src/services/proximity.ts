/* ─── Proximity alert engine ───────────────────────────────────────────────
 *
 * Decides whether a driver should be warned about a hotspot right now.
 *
 * The old MapScreen fired an Alert.alert() for any report within a fixed
 * ~1.5 km box, once per report per app session. Three problems, all of which
 * end with the user turning alerts off:
 *
 *   1. It warned about hazards *behind* you, because it ignored heading.
 *   2. A fixed radius is wrong at every speed. 500 m is 18 seconds of warning
 *      at 100 km/h and nearly a minute of nagging at 30 km/h.
 *   3. Nothing re-armed, so a hotspot you pass daily warned you once, ever.
 *
 * This module is pure — no I/O, no React, no Expo — so the rules below can be
 * tested directly and reused by both the foreground watcher and the
 * background task.
 * ------------------------------------------------------------------------ */

import { bearingDegrees, bearingDelta, distanceMeters, type LatLng } from './geo';

export interface Hotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  riskScore: number;
  currentRisk?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  dominantType: string;
  incidentCount: number;
  status?: string;
}

export interface Fix {
  latitude: number;
  longitude: number;
  /** Metres per second. Negative or null when unknown. */
  speed?: number | null;
  /** Degrees clockwise from north. Negative or null when unknown. */
  heading?: number | null;
  timestamp: number;
}

export type AlertLevel = 'critical' | 'warning' | 'info';

export interface ProximityAlert {
  hotspot: Hotspot;
  distanceM: number;
  /** Seconds until arrival at current speed, null when stationary. */
  etaSeconds: number | null;
  level: AlertLevel;
  title: string;
  body: string;
  /** What the phone should say out loud. Empty when it should stay silent. */
  spoken: string;
}

/* ── Tuning ──────────────────────────────────────────────────────────────── */

/** Aim to warn this many seconds before arrival. */
const LEAD_SECONDS = 20;

/** Warning distance never shrinks below this, however slow you are going. */
const MIN_LEAD_M = 150;

/** ...nor grows beyond this, however fast. */
const MAX_LEAD_M = 1200;

/**
 * Below this speed heading is noise — a phone sitting still reports a
 * meaningless bearing, so the direction filter is skipped.
 */
const HEADING_RELIABLE_ABOVE_MPS = 2.8; // ~10 km/h

/** A hotspot more than this far off your heading is not ahead of you. */
const AHEAD_CONE_DEGREES = 75;

/** Do not repeat the same hotspot within this window. */
const COOLDOWN_MS = 15 * 60 * 1000;

/** Hotspots below this risk never interrupt; they stay on the map only. */
const MIN_RISK_TO_ALERT = 15;

/* ── Rules ───────────────────────────────────────────────────────────────── */

/**
 * How far out to start warning, given current speed.
 *
 * Distance is derived from time-to-arrival rather than fixed, so the warning
 * lands roughly LEAD_SECONDS ahead whether you are crawling through Circle or
 * doing 110 on the Tema Motorway.
 */
export function alertRadiusFor(speedMps: number | null | undefined, hotspotRadiusM: number): number {
  const speed = typeof speedMps === 'number' && speedMps > 0 ? speedMps : 0;
  const lead = Math.min(MAX_LEAD_M, Math.max(MIN_LEAD_M, speed * LEAD_SECONDS));
  return hotspotRadiusM + lead;
}

/**
 * Is the hotspot ahead of us rather than behind or beside?
 *
 * Returns true when heading is unknown or unreliable: refusing to warn
 * because we cannot confirm direction would be the wrong failure mode for a
 * safety feature.
 */
export function isAhead(fix: Fix, hotspot: LatLng): boolean {
  const speed = typeof fix.speed === 'number' ? fix.speed : 0;
  const heading = typeof fix.heading === 'number' && fix.heading >= 0 ? fix.heading : null;

  if (heading === null || speed < HEADING_RELIABLE_ABOVE_MPS) return true;

  return bearingDelta(heading, bearingDegrees(fix, hotspot)) <= AHEAD_CONE_DEGREES;
}

function levelFor(hotspot: Hotspot, risk: number): AlertLevel {
  if (hotspot.severity === 'CRITICAL' || risk >= 70) return 'critical';
  if (hotspot.severity === 'HIGH' || risk >= 45) return 'warning';
  return 'info';
}

function describe(hotspot: Hotspot, distanceM: number, level: AlertLevel) {
  const isAccident = hotspot.dominantType === 'ACCIDENT';
  const distance =
    distanceM < 950 ? `${Math.round(distanceM / 50) * 50} metres` : `${(distanceM / 1000).toFixed(1)} kilometres`;

  const noun = isAccident ? 'accident hotspot' : 'road hazard area';
  const title = level === 'critical' ? `High-risk ${noun} ahead` : `${noun[0].toUpperCase()}${noun.slice(1)} ahead`;

  const body =
    `${hotspot.name} — ${distance} ahead. ` +
    `${hotspot.incidentCount} ${hotspot.incidentCount === 1 ? 'incident' : 'incidents'} recorded here.`;

  // Spoken copy is shorter and front-loads the action. A driver cannot look
  // at the screen, so the first three words have to carry it.
  const spoken =
    level === 'critical'
      ? `Caution. High risk ${isAccident ? 'accident' : 'hazard'} area ${distance} ahead. ${hotspot.name}.`
      : level === 'warning'
      ? `${isAccident ? 'Accident' : 'Hazard'} area ${distance} ahead.`
      : '';

  return { title, body, spoken };
}

/* ── Cooldown state ──────────────────────────────────────────────────────── */

export interface CooldownState {
  /** hotspot id -> timestamp we last alerted. */
  lastAlertedAt: Record<string, number>;
  /** hotspot ids we are currently inside; cleared on exit so they re-arm. */
  inside: string[];
}

export const emptyCooldownState = (): CooldownState => ({ lastAlertedAt: {}, inside: [] });

/**
 * Evaluate every hotspot against the current fix.
 *
 * Returns the alerts to raise plus the updated cooldown state — the caller
 * decides how to persist it, so this stays testable and side-effect free.
 */
export function evaluate(
  fix: Fix,
  hotspots: Hotspot[],
  state: CooldownState,
  now: number = Date.now()
): { alerts: ProximityAlert[]; state: CooldownState } {
  const insideNow: string[] = [];
  const alerts: ProximityAlert[] = [];
  const lastAlertedAt = { ...state.lastAlertedAt };

  for (const hotspot of hotspots) {
    if (hotspot.status && hotspot.status === 'MITIGATED') continue;
    if (!Number.isFinite(hotspot.latitude) || !Number.isFinite(hotspot.longitude)) continue;

    const risk = hotspot.currentRisk ?? hotspot.riskScore;
    const distanceM = distanceMeters(fix, hotspot);
    const radius = alertRadiusFor(fix.speed, hotspot.radiusM);

    if (distanceM > radius) continue;

    // Inside the trigger zone from here on.
    insideNow.push(hotspot.id);

    if (risk < MIN_RISK_TO_ALERT) continue;
    if (!isAhead(fix, hotspot)) continue;

    // Re-arm only after leaving, so sitting in traffic inside a hotspot does
    // not produce a stream of identical warnings.
    //
    // Note how this interacts with the cooldown below: entering the zone sets
    // the latch whether or not an alert actually fired. So if a re-entry is
    // suppressed by the cooldown and the driver then stays put until the
    // cooldown lapses, nothing fires — which is what we want. They are already
    // inside it; the warning was about the approach, and announcing a hazard
    // to someone sitting in it is noise.
    const wasInside = state.inside.includes(hotspot.id);
    if (wasInside) continue;

    const last = lastAlertedAt[hotspot.id] ?? 0;
    if (now - last < COOLDOWN_MS) continue;

    const speed = typeof fix.speed === 'number' && fix.speed > 1 ? fix.speed : null;
    const level = levelFor(hotspot, risk);
    const { title, body, spoken } = describe(hotspot, distanceM, level);

    alerts.push({
      hotspot,
      distanceM: Math.round(distanceM),
      etaSeconds: speed ? Math.round(distanceM / speed) : null,
      level,
      title,
      body,
      spoken,
    });

    lastAlertedAt[hotspot.id] = now;
  }

  // Most urgent first — if several fire at once, the critical one speaks.
  alerts.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    const byLevel = rank[a.level] - rank[b.level];
    return byLevel !== 0 ? byLevel : a.distanceM - b.distanceM;
  });

  return { alerts, state: { lastAlertedAt, inside: insideNow } };
}

export const TUNING = {
  LEAD_SECONDS,
  MIN_LEAD_M,
  MAX_LEAD_M,
  HEADING_RELIABLE_ABOVE_MPS,
  AHEAD_CONE_DEGREES,
  COOLDOWN_MS,
  MIN_RISK_TO_ALERT,
};
