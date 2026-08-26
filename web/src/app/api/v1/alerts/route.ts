import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const alerts = await prisma.roadAlert.findMany({
      where: { active: true },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
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
    const { title, description, severity, latitude, longitude, locationName, location } = body;
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
        location: loc || null,
        active: true,
      },
    });

    return NextResponse.json({ message: 'Road alert created', alert }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create road alert' }, { status: 500 });
  }
}
