import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUS = ['ACTIVE', 'MONITORING', 'UNDER_REPAIR', 'MITIGATED'] as const;

/**
 * PATCH /api/v1/hotspots/[id]
 *
 * Curation only — status, notes, radius and (for official hotspots) severity.
 * The derived risk score is not writable: it is a function of the incident
 * data, and letting it be edited by hand would make the number meaningless.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const authUser = verifyRequestAuth(req);
  if (!authUser || authUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const data: Record<string, unknown> = {};

    if (body.status !== undefined) {
      const status = String(body.status).toUpperCase();
      if (!ALLOWED_STATUS.includes(status as (typeof ALLOWED_STATUS)[number])) {
        return NextResponse.json(
          { error: `status must be one of ${ALLOWED_STATUS.join(', ')}` },
          { status: 400 }
        );
      }
      data.status = status;
    }

    if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null;
    if (body.name !== undefined && String(body.name).trim()) data.name = String(body.name).trim();

    if (body.radiusM !== undefined && Number.isFinite(Number(body.radiusM))) {
      // Keep the geofence within sane bounds; a 50 km radius would alert a
      // whole region, a 10 m one would never fire.
      data.radius_m = Math.min(5000, Math.max(100, Math.round(Number(body.radiusM))));
    }

    const existing = await prisma.hotspot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Hotspot not found' }, { status: 404 });
    }

    // Severity is operator-owned on official rows and data-owned on derived ones.
    if (body.severity !== undefined && existing.source === 'OFFICIAL') {
      data.severity = String(body.severity).toUpperCase();
    }

    const hotspot = await prisma.hotspot.update({ where: { id }, data });
    return NextResponse.json({ hotspot });
  } catch {
    return NextResponse.json({ error: 'Failed to update hotspot' }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/hotspots/[id]
 *
 * Only official hotspots can be deleted. A derived one would simply reappear
 * on the next recompute, so removing it is a status change (MITIGATED), not
 * a delete — otherwise operators would delete the same row forever.
 */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const authUser = verifyRequestAuth(req);
  if (!authUser || authUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await ctx.params;
    const existing = await prisma.hotspot.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Hotspot not found' }, { status: 404 });
    }

    if (existing.source === 'DERIVED') {
      return NextResponse.json(
        {
          error:
            'Derived hotspots cannot be deleted — they are rebuilt from incident data. Mark it MITIGATED instead.',
        },
        { status: 409 }
      );
    }

    await prisma.hotspot.delete({ where: { id } });
    return NextResponse.json({ message: 'Hotspot deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete hotspot' }, { status: 500 });
  }
}
