/**
 * Rebuilds derived hotspots from the current incident set.
 *
 * Run on a schedule (nightly is plenty — the scoring uses a 90-day half-life,
 * so hotspots do not shift hour to hour):
 *
 *   npm --prefix web run hotspots:recompute
 *
 * The same logic is exposed to the admin UI at POST /api/v1/hotspots/recompute
 * for an on-demand rebuild. This script exists so it can run from cron without
 * needing an admin token.
 */

import { PrismaClient } from '@prisma/client';
import { deriveHotspots, type IncidentInput } from '../src/lib/hotspots';

const prisma = new PrismaClient();

async function main() {
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
      select: { id: true, latitude: true, longitude: true, location: true, created_at: true },
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

  // Preserve operator curation across rebuilds — see the API route for why.
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

  console.log(`Processed ${incidents.length} incidents -> ${derived.length} hotspots`);
  for (const h of derived.slice(0, 10)) {
    console.log(
      `  ${h.riskScore.toFixed(1).padStart(5)}  ${h.severity.padEnd(8)} ` +
        `${String(h.incidentCount).padStart(2)} incidents  ${h.radiusM}m  ${h.name}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
