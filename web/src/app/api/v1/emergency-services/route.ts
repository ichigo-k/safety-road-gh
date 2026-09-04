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

    const rows = await prisma.emergencyService.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    /* Both the admin list and the mobile Emergency screen read `altPhone` and
       `category`, but the columns are `alt_phone` and `type`. Returning raw
       Prisma rows meant those two always came back undefined, so the alternate
       number never rendered anywhere. Map to the shape the clients expect and
       keep `type` for callers that already use it. */
    const services = rows.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      category: s.type,
      phone: s.phone,
      altPhone: s.alt_phone,
      region: s.region,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
    }));

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
    const { name, type, category, phone, altPhone, region, latitude, longitude, address } = body;
    const serviceType = type || category;

    if (!name || !serviceType || !phone || latitude === undefined || longitude === undefined || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = await prisma.emergencyService.create({
      data: {
        name,
        type: serviceType,
        phone,
        // Optional, and sent by the admin form. These were previously
        // destructured away and silently discarded.
        alt_phone: altPhone?.trim() || null,
        region: region?.trim() || null,
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
