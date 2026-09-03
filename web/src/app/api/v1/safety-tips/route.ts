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

    // This route was returning raw Prisma rows while every client reads the
    // camelCase shape the other routes emit — so `content` and `createdAt`
    // were undefined, leaving blank tip bodies in the admin and the mobile
    // app and an "Invalid Date" on every card. The POST handler already
    // accepts `content`, so this brings the read side in line.
    return NextResponse.json({
      tips: tips.map((tip) => ({
        id: tip.id,
        category: tip.category,
        title: tip.title,
        content: tip.description,
        description: tip.description,
        imageUrl: tip.image_url,
        createdAt: tip.created_at,
      })),
    });
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
