import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';
import { distanceMeters } from '@/lib/geo';

/**
 * GET /api/v1/alerts?lat=&lng=&radiusKm=&strict=
 *
 * Annotates rather than hides.
 *
 * The obvious design is to filter alerts to the viewer's area, and that is
 * what this did first. It is wrong for a safety product: a HIGH-severity
 * broadcast about the Accra-Tema Motorway simply vanished for a user in
 * Tamale — including one about to drive there. Hiding a warning is a worse
 * failure than showing an irrelevant one.
 *
 * So every active alert comes back, each tagged with:
 *   · distanceM   how far from the point being viewed (null if unplaced)
 *   · local       does it concern this area
 *   · networkWide no coordinate at all, so it concerns everyone
 *
 * ...sorted local-first, then nearest-first. The client groups them into
 * "near here" and "elsewhere" so nothing is lost, only ranked.
 *
 * `strict=true` restores hard filtering. That is for the push/geofence path,
 * where the question really is "should this device be interrupted?" — there,
 * silence about a distant alert is correct.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const num = (k: string) => {
      const raw = sp.get(k);
      if (raw === null || raw.trim() === '') return null;
      const v = Number(raw);
      return Number.isFinite(v) ? v : null;
    };

    const lat = num('lat');
    const lng = num('lng');
    const viewRadiusKm = num('radiusKm') ?? 40;
    const strict = sp.get('strict') === 'true';
    const hasOrigin = lat !== null && lng !== null;

    const alerts = await prisma.roadAlert.findMany({
      where: { active: true },
      orderBy: { created_at: 'desc' },
    });

    if (!hasOrigin) {
      return NextResponse.json({ alerts, scoped: false });
    }

    const origin = { latitude: lat, longitude: lng };

    const annotated = alerts.map((a) => {
      const placed = a.latitude != null && a.longitude != null;

      if (!placed) {
        // No coordinate: a genuinely national notice, relevant everywhere.
        return { ...a, distanceM: null as number | null, local: true, networkWide: true };
      }

      const distanceM = Math.round(
        distanceMeters(origin, {
          latitude: a.latitude as number,
          longitude: a.longitude as number,
        })
      );

      // An explicit broadcast radius is the operator's decision about who this
      // concerns and always wins. Otherwise fall back to the viewer's radius.
      const limitKm = a.radius_km ?? viewRadiusKm;

      return { ...a, distanceM, local: distanceM <= limitKm * 1000, networkWide: false };
    });

    const ordered = annotated.sort((x, y) => {
      if (x.local !== y.local) return x.local ? -1 : 1;
      return (x.distanceM ?? -1) - (y.distanceM ?? -1);
    });

    const result = strict ? ordered.filter((a) => a.local) : ordered;

    return NextResponse.json({
      alerts: result,
      scoped: true,
      strict,
      viewRadiusKm,
      localCount: ordered.filter((a) => a.local).length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch road alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser || authUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description, severity, latitude, longitude, locationName, location, radiusKm } =
      body;
    const loc = locationName || location;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const alert = await prisma.roadAlert.create({
      data: {
        title,
        description,
        severity: severity || 'MEDIUM',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        // Geofenced broadcast. Only meaningful alongside a coordinate — a
        // radius with no centre would silence the alert for everyone, so it
        // is stored as null unless both are present.
        radius_km:
          radiusKm && latitude && longitude
            ? Math.min(500, Math.max(1, parseFloat(radiusKm)))
            : null,
        location: loc || null,
        active: true,
      },
    });

    return NextResponse.json({ message: 'Road alert created', alert }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create road alert' }, { status: 500 });
  }
}
