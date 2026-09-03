import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';

// Reads the database per request: never prerender or cache at build time.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || searchParams.get('category');

    const where: any = {};
    if (type) where.type = type;

    const services = await prisma.emergencyService.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch emergency services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser || authUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, type, category, phone, latitude, longitude, address } = body;
    const serviceType = type || category;

    if (!name || !serviceType || !phone || latitude === undefined || longitude === undefined || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = await prisma.emergencyService.create({
      data: {
        name,
        type: serviceType,
        phone,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
      },
    });

    return NextResponse.json({ message: 'Emergency service added', service }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to add emergency service' }, { status: 500 });
  }
}
