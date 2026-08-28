import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, normalizeRole, signToken } from '@/lib/auth';

const DEMO_ADMIN = {
  email: 'admin@safetyroad.gov.gh',
  password: 'Admin@123456',
  id: 'demo-admin',
  full_name: 'MTTD Road Safety Officer',
  role: 'ADMIN' as const,
};

export async function POST(req: NextRequest) {
  let email = '';
  let password = '';
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'development' && email.toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const token = signToken({ userId: DEMO_ADMIN.id, email: DEMO_ADMIN.email, role: DEMO_ADMIN.role, full_name: DEMO_ADMIN.full_name });
      return NextResponse.json({ message: 'Login successful (local demo mode)', user: { id: DEMO_ADMIN.id, full_name: DEMO_ADMIN.full_name, email: DEMO_ADMIN.email, role: DEMO_ADMIN.role }, token });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: normalizeRole(user.role),
      full_name: user.full_name,
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: normalizeRole(user.role),
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    // Keep the local demo usable when the hosted database is unavailable.
    if (
      process.env.NODE_ENV === 'development' &&
      email?.toLowerCase() === DEMO_ADMIN.email &&
      password === DEMO_ADMIN.password
    ) {
      const token = signToken({
        userId: DEMO_ADMIN.id,
        email: DEMO_ADMIN.email,
        role: DEMO_ADMIN.role,
        full_name: DEMO_ADMIN.full_name,
      });
      return NextResponse.json({
        message: 'Login successful (local demo mode)',
        user: { ...DEMO_ADMIN, password: undefined },
        token,
      });
    }

    return NextResponse.json(
      { error: 'Login service is temporarily unavailable. Please try again.' },
      { status: 503 },
    );
  }
}
