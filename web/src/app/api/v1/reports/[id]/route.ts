import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';

// Reads the database per request: never prerender or cache at build time.
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const [accident, hazard] = await Promise.all([
      prisma.accidentReport.findUnique({
        where: { id },
        include: { user: { select: { id: true, full_name: true, phone: true, email: true } } },
      }),
      prisma.roadHazard.findUnique({
        where: { id },
        include: { user: { select: { id: true, full_name: true, phone: true, email: true } } },
      }),
    ]);

    const report = accident
      ? {
          id: accident.id,
          type: 'ACCIDENT',
          title: `${accident.accident_type.replace('_', ' ')} Incident`,
          description: accident.description,
          injuredCount: accident.injured_count,
          vehicleCount: accident.vehicle_count,
          latitude: accident.latitude,
          longitude: accident.longitude,
          locationName: accident.location,
          photoUrl: accident.image_url,
          status: accident.status,
          createdAt: accident.created_at,
          user: {
            id: accident.user.id,
            name: accident.user.full_name,
            phone: accident.user.phone,
            email: accident.user.email,
          },
        }
      : hazard
      ? {
          id: hazard.id,
          type: 'HAZARD',
          hazardCategory: hazard.hazard_type,
          title: `Road Hazard: ${hazard.hazard_type.replace('_', ' ')}`,
          description: hazard.description,
          injuredCount: 0,
          vehicleCount: 0,
          latitude: hazard.latitude,
          longitude: hazard.longitude,
          locationName: hazard.location,
          photoUrl: hazard.image_url,
          status: hazard.status,
          createdAt: hazard.created_at,
          user: {
            id: hazard.user.id,
            name: hazard.user.full_name,
            phone: hazard.user.phone,
            email: hazard.user.email,
          },
        }
      : null;

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authUser = verifyRequestAuth(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (authUser.role !== 'ADMIN' && authUser.role !== 'RESPONDER') {
    return NextResponse.json({ error: 'Forbidden. Admin or Responder role required.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const [accident, hazard] = await Promise.all([
      prisma.accidentReport.findUnique({ where: { id } }),
      prisma.roadHazard.findUnique({ where: { id } }),
    ]);

    let updatedReport;
    if (accident) {
      updatedReport = await prisma.accidentReport.update({
        where: { id },
        data: { status },
      });
    } else if (hazard) {
      updatedReport = await prisma.roadHazard.update({
        where: { id },
        data: { status },
      });
    } else {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Report status updated', report: updatedReport });
  } catch (error: any) {
    console.error('Update report status error:', error);
    return NextResponse.json({ error: 'Failed to update report status' }, { status: 500 });
  }
}
