import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getUserSubscription } from '@/lib/stripe/subscriptions';
import Stripe from 'stripe';
import { withCache } from '@/lib/cache/cache-middleware';
import { cacheInvalidation } from '@/lib/cache/api-cache';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function GET(request: NextRequest) {
  // Get user for cache key
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return withCache(request, async () => {
    try {
      const subscription = await getUserSubscription(user.id);
      
      if (!subscription) {
        return NextResponse.json({ subscription: null });
      }

      return NextResponse.json(subscription);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }
  }, {
    userId: user.id,
  });
}

export async function DELETE() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await getUserSubscription(user.id);
    
    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel the subscription in Stripe
    if (subscription.subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Invalidate user subscription cache
    cacheInvalidation.user(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
