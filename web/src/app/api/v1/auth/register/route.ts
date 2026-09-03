import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeRole, signToken } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

// Reads the database per request: never prerender or cache at build time.
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, name, email, password, phone, role } = body;
    const userName = full_name || name;

    if (!userName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const password_hash = hashPassword(password);
    const userRole = role === 'ADMIN' ? 'ADMIN' : role === 'RESPONDER' ? 'RESPONDER' : 'CITIZEN';

    const user = await prisma.user.create({
      data: {
        full_name: userName,
        email: email.toLowerCase(),
        password_hash,
        phone: phone || null,
        role: userRole,
        is_verified: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: normalizeRole(user.role),
      full_name: user.full_name,
    });

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: normalizeRole(user.role),
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user', details: error.message }, { status: 500 });
  }
}
