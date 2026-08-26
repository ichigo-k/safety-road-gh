import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const [accidents, hazards] = await Promise.all([
      prisma.accidentReport.findMany({
        include: { user: { select: { id: true, full_name: true, phone: true, email: true } } },
        orderBy: { created_at: 'desc' },
      }),
      prisma.roadHazard.findMany({
        include: { user: { select: { id: true, full_name: true, phone: true, email: true } } },
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
      user: {
        id: a.user.id,
        name: a.user.full_name,
        phone: a.user.phone,
        email: a.user.email,
      },
    }));

    const formattedHazards = hazards.map((h) => ({
      id: h.id,
      type: 'HAZARD',
      hazardCategory: h.hazard_type,
      title: `Road Hazard: ${h.hazard_type.replace('_', ' ')}`,
      description: h.description,
      injuredCount: 0,
      vehicleCount: 0,
      latitude: h.latitude,
      longitude: h.longitude,
      locationName: h.location,
      photoUrl: h.image_url,
      status: h.status,
      createdAt: h.created_at,
      user: {
        id: h.user.id,
        name: h.user.full_name,
        phone: h.user.phone,
        email: h.user.email,
      },
    }));

    let allReports = [...formattedAccidents, ...formattedHazards].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (type) allReports = allReports.filter((r) => r.type === type);
    if (status) allReports = allReports.filter((r) => r.status === status);

    return NextResponse.json({ reports: allReports });
  } catch (error: any) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized. Token required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type,
      hazardCategory,
      accident_type,
      title,
      description,
      injuredCount,
      vehicleCount,
      latitude,
      longitude,
      locationName,
      location,
      photoUrl,
      image_url,
    } = body;

    const loc = locationName || location;
    const img = photoUrl || image_url;

    if (!type || !description || latitude === undefined || longitude === undefined || !loc) {
      return NextResponse.json(
        { error: 'Missing required report fields (type, description, location, latitude, longitude)' },
        { status: 400 }
      );
    }

    if (type === 'HAZARD') {
      const hazard = await prisma.roadHazard.create({
        data: {
          user_id: authUser.userId,
          hazard_type: hazardCategory || 'OTHER',
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          location: loc,
          image_url: img || null,
          status: 'PENDING',
        },
        include: { user: { select: { id: true, full_name: true, phone: true } } },
      });
      return NextResponse.json({ message: 'Hazard report submitted', report: hazard }, { status: 201 });
    } else {
      const accident = await prisma.accidentReport.create({
        data: {
          user_id: authUser.userId,
          accident_type: accident_type || 'VEHICLE_COLLISION',
          description,
          injured_count: injuredCount ? parseInt(injuredCount) : 0,
          vehicle_count: vehicleCount ? parseInt(vehicleCount) : 1,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          location: loc,
          image_url: img || null,
          status: 'PENDING',
        },
        include: { user: { select: { id: true, full_name: true, phone: true } } },
      });
      return NextResponse.json({ message: 'Accident report submitted', report: accident }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Failed to submit report', details: error.message }, { status: 500 });
  }
}
