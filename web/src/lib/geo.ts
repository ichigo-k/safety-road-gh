/* ─── Geodesy ──────────────────────────────────────────────────────────────
 *
 * Shared by the hotspot engine, the nearby API and the mobile geofence.
 *
 * The previous map code compared raw latitude/longitude deltas with
 * Math.sqrt, which treats a degree of longitude as a degree of latitude. That
 * is only true at the equator; the error grows with cos(latitude) and it
 * silently under- or over-triggers proximity alerts. Everything here is
 * metres on a sphere.
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

/** Initial bearing from `a` to `b`, in degrees clockwise from north (0-360). */
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

/** Centroid of a set of points. Fine for the small, tight clusters here. */
export function centroid(points: LatLng[]): LatLng {
  if (points.length === 0) return { latitude: 0, longitude: 0 };
  const lat = points.reduce((s, p) => s + p.latitude, 0) / points.length;
  const lng = points.reduce((s, p) => s + p.longitude, 0) / points.length;
  return { latitude: lat, longitude: lng };
}

/**
 * Degrees of latitude/longitude covering `meters` at a given latitude.
 * Used to turn a radius query into a cheap bounding box before the exact
 * haversine pass — an index-friendly pre-filter, not the final answer.
 */
export function boundingBox(center: LatLng, meters: number) {
  const latDelta = toDeg(meters / EARTH_RADIUS_M);
  const cosLat = Math.cos(toRad(center.latitude));
  // Near the poles cos(lat) approaches 0 and the longitude span explodes;
  // clamp so we never produce an infinite or inverted box.
  const lngDelta = toDeg(meters / (EARTH_RADIUS_M * Math.max(cosLat, 0.01)));

  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  };
}
