import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';
import { deriveHotspots, type IncidentInput } from '@/lib/hotspots';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/hotspots/recompute
 *
 * Rebuilds every DERIVED hotspot from the current incident set.
 *
 * OFFICIAL hotspots are left untouched — an operator marking a junction as
 * dangerous should not have that judgement erased by a nightly job.
 *
 * Manually-set status on derived rows is preserved across recomputes too:
 * if someone marked a hotspot UNDER_REPAIR, rebuilding the score should not
 * quietly flip it back to ACTIVE and resume alerting drivers about roadworks
 * that are already being fixed.
 */
export async function POST(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser || authUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const [accidents, hazards, existingDerived] = await Promise.all([
      prisma.accidentReport.findMany({
        where: { status: { not: 'REJECTED' } },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          location: true,
          injured_count: true,
          created_at: true,
        },
      }),
      prisma.roadHazard.findMany({
        where: { status: { not: 'REJECTED' } },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          location: true,
          created_at: true,
        },
      }),
      prisma.hotspot.findMany({ where: { source: 'DERIVED' } }),
    ]);

    const incidents: IncidentInput[] = [
      ...accidents.map((a) => ({
        id: `a:${a.id}`,
        type: 'ACCIDENT' as const,
        latitude: a.latitude,
        longitude: a.longitude,
        location: a.location,
        injuredCount: a.injured_count,
        createdAt: a.created_at,
      })),
      ...hazards.map((h) => ({
        id: `h:${h.id}`,
        type: 'HAZARD' as const,
        latitude: h.latitude,
        longitude: h.longitude,
        location: h.location,
        injuredCount: 0,
        createdAt: h.created_at,
      })),
    ];

    const derived = deriveHotspots(incidents);

    // Carry forward operator-set status by matching a rebuilt hotspot to the
    // nearest previous one at the same place. Without this, every recompute
    // would reset curation.
    const statusByLocation = new Map<string, string>();
    for (const row of existingDerived) {
      if (row.status !== 'ACTIVE') {
        statusByLocation.set(`${row.latitude.toFixed(3)},${row.longitude.toFixed(3)}`, row.status);
      }
    }

    await prisma.$transaction([
      prisma.hotspot.deleteMany({ where: { source: 'DERIVED' } }),
      ...derived.map((h) =>
        prisma.hotspot.create({
          data: {
            name: h.name,
            latitude: h.latitude,
            longitude: h.longitude,
            radius_m: h.radiusM,
            risk_score: h.riskScore,
            severity: h.severity,
            dominant_type: h.dominantType,
            incident_count: h.incidentCount,
            casualty_count: h.casualtyCount,
            hour_profile: JSON.stringify(h.hourProfile),
            status:
              statusByLocation.get(`${h.latitude.toFixed(3)},${h.longitude.toFixed(3)}`) ?? 'ACTIVE',
            source: 'DERIVED',
            last_incident_at: h.lastIncidentAt,
          },
        })
      ),
    ]);

    return NextResponse.json({
      message: 'Hotspots recomputed',
      incidentsProcessed: incidents.length,
      hotspotsCreated: derived.length,
      statusPreserved: statusByLocation.size,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to recompute hotspots' }, { status: 500 });
  }
}
