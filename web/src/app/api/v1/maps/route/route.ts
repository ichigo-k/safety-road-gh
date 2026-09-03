import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { distanceMeters, type LatLng } from '@/lib/geo';
import { parseHourProfile, riskAtHour } from '@/lib/hotspots';

export const dynamic = 'force-dynamic';

/**
 * Azure Maps routing proxy.
 *
 * The subscription key lives server-side (AZURE_MAPS_KEY) and never reaches a
 * client bundle. Map *tiles* still need a browser-visible key, but the Route
 * and Search APIs are billed per transaction, so proxying them here keeps a
 * scraped key from running up someone else's bill.
 *
 * On top of Azure's route this returns the hotspots the route actually passes
 * through, which is the part a driver cares about.
 */

const AZURE_ROUTE_URL = 'https://atlas.microsoft.com/route/directions/json';

/** How far off the polyline a hotspot can sit and still count as "on route". */
const CORRIDOR_M = 500;

interface RoutePoint {
  latitude: number;
  longitude: number;
}

/**
 * Hotspots within the corridor around a route.
 *
 * The polyline is sampled rather than tested point-by-point: Azure returns
 * thousands of vertices for a long route and checking every hotspot against
 * every vertex is needless work when consecutive vertices are metres apart.
 */
function hotspotsOnRoute(
  points: RoutePoint[],
  hotspots: { latitude: number; longitude: number; radiusM: number }[]
): number[] {
  if (points.length === 0) return [];

  const stride = Math.max(1, Math.floor(points.length / 400));
  const sampled: LatLng[] = [];
  for (let i = 0; i < points.length; i += stride) sampled.push(points[i]);
  sampled.push(points[points.length - 1]);

  const hitIndexes: number[] = [];
  hotspots.forEach((hotspot, index) => {
    const threshold = CORRIDOR_M + hotspot.radiusM;
    for (const point of sampled) {
      if (distanceMeters(point, hotspot) <= threshold) {
        hitIndexes.push(index);
        return;
      }
    }
  });

  return hitIndexes;
}

export async function GET(req: NextRequest) {
  const key = process.env.AZURE_MAPS_KEY;
  const sp = req.nextUrl.searchParams;

  const fromLat = Number(sp.get('fromLat'));
  const fromLng = Number(sp.get('fromLng'));
  const toLat = Number(sp.get('toLat'));
  const toLng = Number(sp.get('toLng'));

  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
    return NextResponse.json(
      { error: 'fromLat, fromLng, toLat and toLng are required' },
      { status: 400 }
    );
  }

  if (!key) {
    return NextResponse.json(
      {
        error: 'Routing is not configured.',
        detail: 'Set AZURE_MAPS_KEY in web/.env to enable route planning.',
      },
      { status: 503 }
    );
  }

  try {
    const url = new URL(AZURE_ROUTE_URL);
    url.searchParams.set('api-version', '1.0');
    url.searchParams.set('subscription-key', key);
    url.searchParams.set('query', `${fromLat},${fromLng}:${toLat},${toLng}`);
    url.searchParams.set('travelMode', sp.get('travelMode') ?? 'car');
    url.searchParams.set('traffic', 'true');
    url.searchParams.set('instructionsType', 'text');

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Azure Maps rejected the route request', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) {
      return NextResponse.json({ error: 'No route found between those points' }, { status: 404 });
    }

    const points: RoutePoint[] = (route.legs ?? []).flatMap(
      (leg: { points?: { latitude: number; longitude: number }[] }) =>
        (leg.points ?? []).map((p) => ({ latitude: p.latitude, longitude: p.longitude }))
    );

    // Only hotspots that still alert — a mitigated one should not scare
    // someone off a road that has since been fixed.
    const rows = await prisma.hotspot.findMany({
      where: { status: { in: ['ACTIVE', 'MONITORING', 'UNDER_REPAIR'] } },
      orderBy: { risk_score: 'desc' },
      take: 500,
    });

    const candidates = rows.map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      radiusM: r.radius_m,
      riskScore: r.risk_score,
      severity: r.severity,
      dominantType: r.dominant_type,
      incidentCount: r.incident_count,
      hourProfile: parseHourProfile(r.hour_profile),
    }));

    const hour = new Date().getHours();
    const onRoute = hotspotsOnRoute(points, candidates)
      .map((i) => {
        const h = candidates[i];
        return {
          id: h.id,
          name: h.name,
          latitude: h.latitude,
          longitude: h.longitude,
          radiusM: h.radiusM,
          riskScore: h.riskScore,
          currentRisk: riskAtHour(h.riskScore, h.hourProfile, hour),
          severity: h.severity,
          dominantType: h.dominantType,
          incidentCount: h.incidentCount,
        };
      })
      .sort((a, b) => b.currentRisk - a.currentRisk);

    const summary = route.summary ?? {};

    return NextResponse.json({
      route: {
        distanceM: summary.lengthInMeters ?? null,
        durationS: summary.travelTimeInSeconds ?? null,
        trafficDelayS: summary.trafficDelayInSeconds ?? 0,
        points,
      },
      hotspots: onRoute,
      // A single headline number the mobile screen can lead with.
      riskSummary: {
        count: onRoute.length,
        highest: onRoute[0]?.currentRisk ?? 0,
        criticalCount: onRoute.filter((h) => h.severity === 'CRITICAL').length,
      },
      evaluatedHour: hour,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to plan route' }, { status: 500 });
  }
}
