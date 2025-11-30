import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { promoCodes } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const allPromos = await db
        .select()
        .from(promoCodes)
        .orderBy(promoCodes.createdAt);

      return NextResponse.json(allPromos);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const {
        code,
        description,
        discountType,
        discountValue,
        assetId,
        assetType,
        maxUses,
        validFrom,
        validUntil,
      } = body;

      if (!code || !discountType || !assetId) {
        return NextResponse.json(
          { error: 'Code, discountType, and assetId are required' },
          { status: 400 }
        );
      }

      // Check if code already exists
      const [existing] = await db
        .select()
        .from(promoCodes)
        .where(eq(promoCodes.code, code.toUpperCase().trim()))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { error: 'Promo code already exists' },
          { status: 400 }
        );
      }

      const [newPromo] = await db
        .insert(promoCodes)
        .values({
          code: code.toUpperCase().trim(),
          description: description || null,
          discountType,
          discountValue: discountValue || null,
          assetId: assetId ? parseInt(assetId) : null,
          assetType: assetType || 'beat',
          maxUses: maxUses ? parseInt(maxUses) : null,
          validFrom: validFrom ? new Date(validFrom) : new Date(),
          validUntil: validUntil ? new Date(validUntil) : null,
          isActive: 1,
        })
        .returning();

      return NextResponse.json(newPromo);
    } catch (error) {
      console.error('Error creating promo code:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

