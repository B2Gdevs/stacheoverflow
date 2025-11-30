import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { promoCodes, promoCodeRedemptions } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, and, or, gte, lte, isNull } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { code } = body;

      if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: 'Code is required' }, { status: 400 });
      }

      // Find the promo code
      const [promoCode] = await db
        .select()
        .from(promoCodes)
        .where(
          and(
            eq(promoCodes.code, code.toUpperCase().trim()),
            eq(promoCodes.isActive, 1)
          )
        )
        .limit(1);

      if (!promoCode) {
        return NextResponse.json({
          valid: false,
          error: 'Invalid promo code'
        });
      }

      // Check if code is still valid (date range)
      const now = new Date();
      if (promoCode.validUntil && new Date(promoCode.validUntil) < now) {
        return NextResponse.json({
          valid: false,
          error: 'This promo code has expired'
        });
      }

      if (new Date(promoCode.validFrom) > now) {
        return NextResponse.json({
          valid: false,
          error: 'This promo code is not yet valid'
        });
      }

      // Check if code has reached max uses
      if (promoCode.maxUses !== null && promoCode.usesCount >= promoCode.maxUses) {
        return NextResponse.json({
          valid: false,
          error: 'This promo code has reached its usage limit'
        });
      }

      // Check if user has already redeemed this code
      const [existingRedemption] = await db
        .select()
        .from(promoCodeRedemptions)
        .where(
          and(
            eq(promoCodeRedemptions.promoCodeId, promoCode.id),
            eq(promoCodeRedemptions.userId, user.id)
          )
        )
        .limit(1);

      if (existingRedemption) {
        return NextResponse.json({
          valid: true,
          alreadyRedeemed: true,
          message: 'You have already redeemed this code',
          assetId: existingRedemption.assetId,
          assetType: promoCode.assetType
        });
      }

      // Code is valid
      return NextResponse.json({
        valid: true,
        promoCode: {
          id: promoCode.id,
          code: promoCode.code,
          description: promoCode.description,
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue,
          assetId: promoCode.assetId,
          assetType: promoCode.assetType
        }
      });
    } catch (error) {
      console.error('Error validating promo code:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

