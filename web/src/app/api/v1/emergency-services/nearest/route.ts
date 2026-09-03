import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { distanceMeters } from '@/lib/geo';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/emergency-services/nearest?lat=&lng=&type=&limit=
 *
 * At a crash scene the question is never "list every hospital in Ghana", it
 * is "which one is closest and what is its number". This answers that.
 *
 * The whole table is scanned and sorted rather than bounding-boxed: the
 * emergency services list is small and fixed, and a box risks returning
 * nothing at all in a sparsely covered region — the one situation where an
 * empty result is least acceptable.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const lat = Number(sp.get('lat'));
    const lng = Number(sp.get('lng'));
    const type = sp.get('type');
    const limit = Math.min(20, Math.max(1, Number(sp.get('limit')) || 5));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const services = await prisma.emergencyService.findMany({
      where: type ? { type } : undefined,
    });

    const ranked = services
      .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
      .map((s) => {
        const distanceM = Math.round(
          distanceMeters({ latitude: lat, longitude: lng }, { latitude: s.latitude, longitude: s.longitude })
        );
        return {
          id: s.id,
          name: s.name,
          type: s.type,
          phone: s.phone,
          address: s.address,
          latitude: s.latitude,
          longitude: s.longitude,
          distanceM,
          // Rough drive time at 35 km/h — realistic for Accra traffic, and
          // presented as an estimate rather than a promise.
          etaMinutes: Math.max(1, Math.round(distanceM / 1000 / 35 * 60)),
        };
      })
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, limit);

    return NextResponse.json({ services: ranked });
  } catch {
    return NextResponse.json({ error: 'Failed to find nearby services' }, { status: 500 });
  }
}
