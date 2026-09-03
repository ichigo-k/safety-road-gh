import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';
import { boundingBox, distanceMeters } from '@/lib/geo';
import { parseHourProfile, riskAtHour } from '@/lib/hotspots';

export const dynamic = 'force-dynamic';

type HotspotRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  risk_score: number;
  severity: string;
  dominant_type: string;
  incident_count: number;
  casualty_count: number;
  hour_profile: string;
  status: string;
  source: string;
  notes: string | null;
  last_incident_at: Date | null;
  updated_at: Date;
};

function serialize(row: HotspotRow, atHour: number | null) {
  const hourProfile = parseHourProfile(row.hour_profile);
  return {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusM: row.radius_m,
    riskScore: row.risk_score,
    // Risk adjusted for the requested hour, so a junction that is only
    // dangerous at night does not shout at midday.
    currentRisk: atHour === null ? row.risk_score : riskAtHour(row.risk_score, hourProfile, atHour),
    severity: row.severity,
    dominantType: row.dominant_type,
    incidentCount: row.incident_count,
    casualtyCount: row.casualty_count,
    hourProfile,
    status: row.status,
    source: row.source,
    notes: row.notes,
    lastIncidentAt: row.last_incident_at,
    updatedAt: row.updated_at,
  };
}

/**
 * GET /api/v1/hotspots
 *
 * Query params:
 *   lat, lng, radiusM  restrict to a circle (mobile: what is near me)
 *   minLat/maxLat/minLng/maxLng  restrict to a viewport (admin map panning)
 *   hour               0-23, evaluate time-of-day risk at this hour
 *   since              ISO timestamp; only hotspots changed since then, so
 *                      the mobile offline cache can sync deltas rather than
 *                      redownloading the whole set on a weak connection
 *   includeInactive    admin only — mitigated hotspots are hidden by default
 */
/**
 * Absent params must not read as zero. `searchParams.get()` returns null when
 * a param is missing and `Number(null)` is 0, which passes Number.isFinite —
 * so an unfiltered request would otherwise look like a query at (0,0) with a
 * zero radius and silently match nothing.
 */
function numParam(sp: URLSearchParams, key: string): number | null {
  const raw = sp.get(key);
  if (raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const lat = numParam(sp, 'lat');
    const lng = numParam(sp, 'lng');
    const radiusM = numParam(sp, 'radiusM');
    const hasCircle = lat !== null && lng !== null && radiusM !== null && radiusM > 0;

    const hourParam = numParam(sp, 'hour');
    const hour =
      hourParam === null ? new Date().getHours() : Math.min(23, Math.max(0, Math.trunc(hourParam)));

    const since = sp.get('since');
    const includeInactive = sp.get('includeInactive') === 'true';

    const where: Record<string, unknown> = {};

    if (!includeInactive) {
      // A mitigated hotspot should stop alerting drivers.
      where.status = { in: ['ACTIVE', 'MONITORING', 'UNDER_REPAIR'] };
    }

    if (since) {
      const sinceDate = new Date(since);
      if (!Number.isNaN(sinceDate.getTime())) where.updated_at = { gt: sinceDate };
    }

    // Bounding box narrows the scan before the exact distance pass. A circle
    // query and an explicit viewport both reduce to the same box filter.
    if (hasCircle) {
      const box = boundingBox({ latitude: lat, longitude: lng }, radiusM);
      where.latitude = { gte: box.minLat, lte: box.maxLat };
      where.longitude = { gte: box.minLng, lte: box.maxLng };
    } else {
      const minLat = numParam(sp, 'minLat');
      const maxLat = numParam(sp, 'maxLat');
      const minLng = numParam(sp, 'minLng');
      const maxLng = numParam(sp, 'maxLng');
      // Only apply a viewport filter when all four corners were actually sent.
      if (minLat !== null && maxLat !== null && minLng !== null && maxLng !== null) {
        where.latitude = { gte: minLat, lte: maxLat };
        where.longitude = { gte: minLng, lte: maxLng };
      }
    }

    const rows = (await prisma.hotspot.findMany({
      where,
      orderBy: { risk_score: 'desc' },
      take: 500,
    })) as HotspotRow[];

    let hotspots = rows.map((row) => serialize(row, hour));

    // The box is a rectangle; trim the corners so "within 5 km" means it.
    if (hasCircle && lat !== null && lng !== null && radiusM !== null) {
      const origin = { latitude: lat, longitude: lng };
      hotspots = hotspots
        .map((h) => ({
          ...h,
          distanceM: Math.round(
            distanceMeters(origin, { latitude: h.latitude, longitude: h.longitude })
          ),
        }))
        .filter((h) => h.distanceM <= radiusM)
        .sort((a, b) => a.distanceM - b.distanceM);
    }

    return NextResponse.json({
      hotspots,
      // Clients store this and pass it back as `since` on the next sync.
      syncedAt: new Date().toISOString(),
      evaluatedHour: hour,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch hotspots' }, { status: 500 });
  }
}

/**
 * POST /api/v1/hotspots — create an OFFICIAL hotspot.
 *
 * MTTD knows about dangerous places that citizen reports have not caught up
 * with yet. Official rows survive a recompute; derived ones do not.
 */
export async function POST(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser || authUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, latitude, longitude, radiusM, severity, dominantType, notes } = body;

    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { error: 'name, latitude and longitude are required' },
        { status: 400 }
      );
    }

    const severityScore: Record<string, number> = {
      LOW: 20,
      MEDIUM: 45,
      HIGH: 65,
      CRITICAL: 85,
    };
    const band = String(severity ?? 'HIGH').toUpperCase();

    const hotspot = await prisma.hotspot.create({
      data: {
        name: String(name),
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius_m: Number.isFinite(radiusM) ? Math.round(Number(radiusM)) : 400,
        // An official hotspot has no incident history to score, so its risk
        // comes from the severity the operator assigned.
        risk_score: severityScore[band] ?? 65,
        severity: band,
        dominant_type: String(dominantType ?? 'ACCIDENT').toUpperCase(),
        // Flat profile: without incident timestamps we cannot claim to know
        // which hours are worse, and inventing a curve would be a lie.
        hour_profile: JSON.stringify(new Array(24).fill(1)),
        source: 'OFFICIAL',
        status: 'ACTIVE',
        notes: notes ? String(notes) : null,
      },
    });

    return NextResponse.json({ hotspot }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create hotspot' }, { status: 500 });
  }
}
