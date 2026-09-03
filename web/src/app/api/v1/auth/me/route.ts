import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';

export const dynamic = 'force-dynamic';

/** GET /api/v1/auth/me — return the current user's profile */
export async function GET(req: NextRequest) {
  const auth = verifyRequestAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, full_name: true, email: true, phone: true, role: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user });
}

/** PATCH /api/v1/auth/me — update name, email, phone, and/or password */
export async function PATCH(req: NextRequest) {
  const auth = verifyRequestAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: {
    full_name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { full_name, email, phone, currentPassword, newPassword } = body;

  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Password change requires verifying the current one first.
  if (newPassword !== undefined) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required to set a new one' },
        { status: 400 },
      );
    }
    if (!verifyPassword(currentPassword, user.password_hash)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 },
      );
    }
  }

  // If changing email, make sure it isn't taken by someone else.
  if (email && email.toLowerCase() !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (taken) {
      return NextResponse.json({ error: 'That email address is already in use' }, { status: 400 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(full_name ? { full_name } : {}),
      ...(email ? { email: email.toLowerCase() } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
      ...(newPassword ? { password_hash: hashPassword(newPassword) } : {}),
    },
    select: { id: true, full_name: true, email: true, phone: true, role: true },
  });

  return NextResponse.json({ user: updated, message: 'Profile updated' });
}
