import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { promoCodes, promoCodeRedemptions, purchases } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, and } from 'drizzle-orm';

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
          success: false,
          error: 'Invalid promo code'
        }, { status: 400 });
      }

      // Validate code (same checks as validate endpoint)
      const now = new Date();
      if (promoCode.validUntil && new Date(promoCode.validUntil) < now) {
        return NextResponse.json({
          success: false,
          error: 'This promo code has expired'
        }, { status: 400 });
      }

      if (new Date(promoCode.validFrom) > now) {
        return NextResponse.json({
          success: false,
          error: 'This promo code is not yet valid'
        }, { status: 400 });
      }

      if (promoCode.maxUses !== null && promoCode.usesCount >= promoCode.maxUses) {
        return NextResponse.json({
          success: false,
          error: 'This promo code has reached its usage limit'
        }, { status: 400 });
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
          success: true,
          alreadyRedeemed: true,
          message: 'You have already redeemed this code',
          assetId: existingRedemption.assetId,
          assetType: promoCode.assetType
        });
      }

      // Handle redemption based on whether this unlocks a specific asset or all assets
      if (promoCode.discountType === 'free_asset') {
        if (promoCode.assetId) {
          // Specific asset unlock
          const assetId = promoCode.assetId;

      // Create redemption record
      const [redemption] = await db
        .insert(promoCodeRedemptions)
        .values({
          promoCodeId: promoCode.id,
          userId: user.id,
          assetId: assetId
        })
        .returning();

      // Increment uses count
      await db
        .update(promoCodes)
        .set({
          usesCount: promoCode.usesCount + 1,
          updatedAt: new Date()
        })
        .where(eq(promoCodes.id, promoCode.id));

      // Create a purchase record with $0 amount to grant download access
      const [purchase] = await db
        .insert(purchases)
        .values({
          userId: user.id,
          beatId: assetId,
          amount: 0, // Free
          status: 'completed',
          purchasedAt: new Date()
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: 'Promo code redeemed successfully!',
        assetId: assetId,
        assetType: promoCode.assetType,
        purchaseId: purchase.id
      });
    } catch (error) {
      console.error('Error redeeming promo code:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

