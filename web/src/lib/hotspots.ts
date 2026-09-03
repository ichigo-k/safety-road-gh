/* ─── Hotspot derivation ───────────────────────────────────────────────────
 *
 * Turns raw incident reports into scored accident-prone areas.
 *
 * The mobile app previously clustered raw reports on the device every time
 * the map opened. That meant every phone recomputed the same answer, the
 * clustering used flat degree arithmetic, and "hotspot" meant nothing more
 * than "two pins near each other" — a single fender-bender from a year ago
 * scored the same as a junction that kills someone monthly.
 *
 * Scoring model, in one place so it can be argued with:
 *
 *   contribution = recency x type x casualties
 *
 *   recency    exponential decay, half-life 90 days. A crash last week says
 *              far more about a junction today than one from 2019.
 *   type       an accident weighs more than a pothole report.
 *   casualties injuries are the strongest signal that a place is lethal
 *              rather than merely busy, but the term saturates so one mass
 *              -casualty event does not permanently pin a junction at 100.
 *
 * The sum is passed through a saturating curve to 0-100 so the scale stays
 * meaningful as the dataset grows.
 * ------------------------------------------------------------------------ */

import { centroid, distanceMeters, type LatLng } from './geo';

/** Incidents within this distance of each other belong to one hotspot. */
const CLUSTER_RADIUS_M = 350;

/** Days after which an incident contributes half of its original weight. */
const RECENCY_HALF_LIFE_DAYS = 90;

/** Sum of contributions that maps to a score of ~63. Tunes the curve's knee. */
const SATURATION = 6;

const MIN_RADIUS_M = 250;
const MAX_RADIUS_M = 1200;

const TYPE_WEIGHT: Record<string, number> = {
  ACCIDENT: 1,
  HAZARD: 0.55,
};

export interface IncidentInput {
  id: string;
  type: 'ACCIDENT' | 'HAZARD';
  latitude: number;
  longitude: number;
  location: string;
  injuredCount?: number;
  createdAt: Date;
}

export interface DerivedHotspot {
  name: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  riskScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dominantType: 'ACCIDENT' | 'HAZARD';
  incidentCount: number;
  casualtyCount: number;
  hourProfile: number[];
  lastIncidentAt: Date;
}

function recencyWeight(createdAt: Date, now: Date): number {
  const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / 86_400_000);
  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
}

function casualtyWeight(injured: number): number {
  // Saturates: 0 injured -> 1.0, 2 -> ~1.6, 10 -> ~2.2, and it keeps climbing
  // only slowly after that.
  return 1 + Math.log1p(Math.max(0, injured)) * 0.55;
}

function severityFor(score: number): DerivedHotspot['severity'] {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

/**
 * Greedy single-pass clustering. Incidents are sorted strongest-first so a
 * cluster forms around its most significant incident rather than around
 * whichever row the database happened to return first — otherwise the same
 * data can produce different hotspots run to run.
 */
function clusterIncidents(incidents: IncidentInput[], now: Date): IncidentInput[][] {
  const ranked = [...incidents].sort((a, b) => {
    const wa = recencyWeight(a.createdAt, now) * (TYPE_WEIGHT[a.type] ?? 0.5);
    const wb = recencyWeight(b.createdAt, now) * (TYPE_WEIGHT[b.type] ?? 0.5);
    return wb - wa;
  });

  const claimed = new Set<string>();
  const clusters: IncidentInput[][] = [];

  for (const seed of ranked) {
    if (claimed.has(seed.id)) continue;
    claimed.add(seed.id);

    const group = [seed];
    for (const other of ranked) {
      if (claimed.has(other.id)) continue;
      if (distanceMeters(seed, other) <= CLUSTER_RADIUS_M) {
        claimed.add(other.id);
        group.push(other);
      }
    }
    clusters.push(group);
  }

  return clusters;
}

/**
 * Radius that covers the cluster's actual spread, so the alert geofence
 * matches the real footprint of the danger rather than a fixed guess.
 */
function radiusFor(center: LatLng, group: IncidentInput[]): number {
  const spread = Math.max(...group.map((i) => distanceMeters(center, i)), 0);
  // Pad past the outermost incident so a driver is warned before entering it.
  return Math.round(Math.min(MAX_RADIUS_M, Math.max(MIN_RADIUS_M, spread + 200)));
}

/** 24 buckets, normalised 0-1, showing when in the day this place is dangerous. */
function hourProfileFor(group: IncidentInput[]): number[] {
  const buckets = new Array(24).fill(0);
  for (const incident of group) {
    buckets[incident.createdAt.getHours()] += 1;
  }
  const peak = Math.max(...buckets);
  return peak === 0 ? buckets : buckets.map((n) => Number((n / peak).toFixed(3)));
}

/** Most common non-empty location string, for a human-readable name. */
function nameFor(group: IncidentInput[]): string {
  const tally = new Map<string, number>();
  for (const incident of group) {
    const label = incident.location?.trim();
    if (label) tally.set(label, (tally.get(label) ?? 0) + 1);
  }
  if (tally.size === 0) return 'Unnamed location';
  return [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function deriveHotspots(
  incidents: IncidentInput[],
  now: Date = new Date()
): DerivedHotspot[] {
  const usable = incidents.filter(
    (i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude)
  );

  return clusterIncidents(usable, now)
    .map((group) => {
      const center = centroid(group);

      const rawScore = group.reduce((sum, incident) => {
        const recency = recencyWeight(incident.createdAt, now);
        const type = TYPE_WEIGHT[incident.type] ?? 0.5;
        const casualties = casualtyWeight(incident.injuredCount ?? 0);
        return sum + recency * type * casualties;
      }, 0);

      // Saturating curve: grows quickly at first, then flattens, so a busy
      // corridor cannot run away with an unbounded score.
      const riskScore = Number((100 * (1 - Math.exp(-rawScore / SATURATION))).toFixed(1));

      const accidents = group.filter((i) => i.type === 'ACCIDENT').length;
      const casualtyCount = group.reduce((s, i) => s + (i.injuredCount ?? 0), 0);
      const lastIncidentAt = group.reduce(
        (latest, i) => (i.createdAt > latest ? i.createdAt : latest),
        group[0].createdAt
      );

      return {
        name: nameFor(group),
        latitude: center.latitude,
        longitude: center.longitude,
        radiusM: radiusFor(center, group),
        riskScore,
        severity: severityFor(riskScore),
        dominantType: accidents >= group.length / 2 ? ('ACCIDENT' as const) : ('HAZARD' as const),
        incidentCount: group.length,
        casualtyCount,
        hourProfile: hourProfileFor(group),
        lastIncidentAt,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Risk right now, given the hotspot's time-of-day profile.
 *
 * A junction that only kills at night should not shout at noon. The profile
 * scales the base score but never fully silences it — floored at 45% so a
 * genuinely dangerous place still registers outside its worst hours.
 */
export function riskAtHour(riskScore: number, hourProfile: number[], hour: number): number {
  if (!Array.isArray(hourProfile) || hourProfile.length !== 24) return riskScore;

  // Blend the hour with its neighbours: incidents cluster around a time, they
  // do not respect bucket boundaries.
  const at = (h: number) => hourProfile[(h + 24) % 24] ?? 0;
  const smoothed = at(hour - 1) * 0.25 + at(hour) * 0.5 + at(hour + 1) * 0.25;

  return Number((riskScore * (0.45 + 0.55 * smoothed)).toFixed(1));
}

export function parseHourProfile(raw: string): number[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length === 24 ? parsed : new Array(24).fill(0);
  } catch {
    return new Array(24).fill(0);
  }
}
