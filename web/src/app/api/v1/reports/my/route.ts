import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';

// Reads the database per request: never prerender or cache at build time.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [accidents, hazards] = await Promise.all([
      prisma.accidentReport.findMany({
        where: { user_id: authUser.userId },
        orderBy: { created_at: 'desc' },
      }),
      prisma.roadHazard.findMany({
        where: { user_id: authUser.userId },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const formattedAccidents = accidents.map((a) => ({
      id: a.id,
      type: 'ACCIDENT',
      title: `${a.accident_type.replace('_', ' ')} Incident`,
      description: a.description,
      injuredCount: a.injured_count,
      vehicleCount: a.vehicle_count,
      latitude: a.latitude,
      longitude: a.longitude,
      locationName: a.location,
      photoUrl: a.image_url,
      status: a.status,
      createdAt: a.created_at,
    }));

    const formattedHazards = hazards.map((h) => ({
      id: h.id,
      type: 'HAZARD',
      hazardCategory: h.hazard_type,
      title: `Road Hazard: ${h.hazard_type.replace('_', ' ')}`,
      description: h.description,
      latitude: h.latitude,
      longitude: h.longitude,
      locationName: h.location,
      photoUrl: h.image_url,
      status: h.status,
      createdAt: h.created_at,
    }));

    const reports = [...formattedAccidents, ...formattedHazards].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch user reports' }, { status: 500 });
  }
}
