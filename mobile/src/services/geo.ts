/* ─── Geodesy ──────────────────────────────────────────────────────────────
 *
 * Mirrors web/src/lib/geo.ts. The two packages have no shared module setup,
 * so this is a deliberate duplicate rather than an accident — if you change
 * the maths here, change it there too.
 *
 * The map screen previously compared raw degree deltas with Math.sqrt, which
 * treats a degree of longitude as a degree of latitude. That is only true at
 * the equator, and it silently mis-triggers proximity alerts. Everything here
 * is metres on a sphere.
 * ------------------------------------------------------------------------ */

export const EARTH_RADIUS_M = 6_371_000;

export interface LatLng {
  latitude: number;
  longitude: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in metres. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing from `a` to `b`, degrees clockwise from north (0-360). */
export function bearingDegrees(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Smallest absolute angle between two bearings, 0-180. */
export function bearingDelta(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/** Metres per second to km/h. */
export const mpsToKmh = (mps: number) => mps * 3.6;

export function formatDistance(meters: number): string {
  if (meters < 950) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
