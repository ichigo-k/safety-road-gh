import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRequestAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category) where.category = category;

    const tips = await prisma.safetyTip.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ tips });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch safety tips' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = verifyRequestAuth(req);
  if (!authUser || authUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { category, title, description, content, image_url } = body;
    const desc = description || content;

    if (!category || !title || !desc) {
      return NextResponse.json({ error: 'Category, title, and description are required' }, { status: 400 });
    }

    const tip = await prisma.safetyTip.create({
      data: {
        category,
        title,
        description: desc,
        image_url: image_url || null,
      },
    });

    return NextResponse.json({ message: 'Safety tip created', tip }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create safety tip' }, { status: 500 });
  }
}
