import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_verified: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { full_name, name, phone } = body;
    const userName = full_name || name;

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(userName && { full_name: userName }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({ message: 'Profile updated', user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
