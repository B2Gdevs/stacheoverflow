import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { subscriptionPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { createSubscriptionCheckout } from '@/lib/stripe/subscriptions';
import { withLogging } from '@/lib/middleware/logging';
import { withCache } from '@/lib/cache/cache-middleware';
import { cacheInvalidation } from '@/lib/cache/api-cache';

export async function GET(request: NextRequest) {
  return withCache(request, async () => {
    return withLogging(request, async (req) => {
      try {
        // Get all active subscription plans
        const plans = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.isActive, 1))
          .orderBy(subscriptionPlans.price);

        return NextResponse.json(plans);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return NextResponse.json(
          { error: 'Failed to fetch subscription plans' },
          { status: 500 }
        );
      }
    });
  });
}

export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getUser();
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { planId, successUrl, cancelUrl } = body;

      if (!planId || !successUrl || !cancelUrl) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Create subscription checkout session
      const session = await createSubscriptionCheckout({
        userId: user.id,
        planId,
        customerEmail: user.email,
        successUrl,
        cancelUrl,
      });

      // Invalidate subscriptions cache after creating checkout
      cacheInvalidation.subscriptions();

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription checkout' },
        { status: 500 }
      );
    }
  });
}
