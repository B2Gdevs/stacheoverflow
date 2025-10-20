import Stripe from 'stripe';
import { db } from '@/lib/db/drizzle';
import { subscriptionPlans, userSubscriptions, purchases, downloads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Logger } from '@/lib/logging';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface CreateSubscriptionData {
  userId: number;
  planId: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePurchaseData {
  userId: number;
  beatId: number;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}

// Create or get Stripe customer
export async function getOrCreateStripeCustomer(email: string, userId: number) {
  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      await Logger.logStripeRequest({
        requestType: 'customer_list',
        requestPayload: { email, limit: 1 },
        responsePayload: { found: true, customerId: existingCustomers.data[0].id },
        success: true,
      });
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId: userId.toString(),
      },
    });

    await Logger.logStripeRequest({
      requestType: 'customer_create',
      requestPayload: { email, metadata: { userId: userId.toString() } },
      responsePayload: { customerId: customer.id, email: customer.email },
      success: true,
    });

    return customer;
  } catch (error) {
    await Logger.logStripeRequest({
      requestType: 'customer_operation',
      requestPayload: { email, userId },
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    });
    throw error;
  }
}

// Create subscription checkout session
export async function createSubscriptionCheckout({
  userId,
  planId,
  customerEmail,
  successUrl,
  cancelUrl,
}: CreateSubscriptionData) {
  // Get subscription plan
  const plan = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  if (plan.length === 0) {
    throw new Error('Subscription plan not found');
  }

  const subscriptionPlan = plan[0];

  // Get or create Stripe customer
  const customer = await getOrCreateStripeCustomer(customerEmail, userId);

  // Create Stripe product and price if they don't exist
  let stripeProductId = subscriptionPlan.stripeProductId;
  let stripePriceId = subscriptionPlan.stripePriceId;

  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: subscriptionPlan.name,
      description: subscriptionPlan.description || undefined,
    });
    stripeProductId = product.id;

    // Update plan with Stripe product ID
    await db
      .update(subscriptionPlans)
      .set({ stripeProductId })
      .where(eq(subscriptionPlans.id, planId));
  }

  if (!stripePriceId) {
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: subscriptionPlan.price,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });
    stripePriceId = price.id;

    // Update plan with Stripe price ID
    await db
      .update(subscriptionPlans)
      .set({ stripePriceId })
      .where(eq(subscriptionPlans.id, planId));
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      planId: planId.toString(),
    },
  });

  await Logger.logStripeRequest({
    requestType: 'checkout_session_create',
    requestPayload: {
      customer: customer.id,
      mode: 'subscription',
      price: stripePriceId,
      metadata: { userId: userId.toString(), planId: planId.toString() },
    },
    responsePayload: {
      sessionId: session.id,
      url: session.url,
      customer: session.customer,
    },
    success: true,
  });

  return session;
}

// Create individual beat purchase checkout session
export async function createPurchaseCheckout({
  userId,
  beatId,
  amount,
  successUrl,
  cancelUrl,
}: CreatePurchaseData) {
  // Get or create Stripe customer (we'll need the user's email)
  // For now, we'll create a session without a customer and let them enter email
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Beat Download',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      beatId: beatId.toString(),
    },
  });

  return session;
}

// Handle successful subscription
export async function handleSubscriptionSuccess(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.mode !== 'subscription' || !session.subscription) {
    throw new Error('Invalid subscription session');
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const userId = parseInt(session.metadata?.userId || '0');
  const planId = parseInt(session.metadata?.planId || '0');

  if (!userId || !planId) {
    throw new Error('Missing user or plan ID in session metadata');
  }

  // Create user subscription record
  const newSubscription = {
    userId,
    planId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    downloadsUsed: 0,
    downloadsResetAt: new Date(subscription.current_period_end * 1000),
  };

  await db.insert(userSubscriptions).values(newSubscription);

  return newSubscription;
}

// Handle successful purchase
export async function handlePurchaseSuccess(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.mode !== 'payment') {
    throw new Error('Invalid payment session');
  }

  const userId = parseInt(session.metadata?.userId || '0');
  const beatId = parseInt(session.metadata?.beatId || '0');

  if (!userId || !beatId) {
    throw new Error('Missing user or beat ID in session metadata');
  }

  // Create purchase record
  const newPurchase = {
    userId,
    beatId,
    amount: session.amount_total || 0,
    stripePaymentIntentId: session.payment_intent as string,
    status: 'completed',
  };

  await db.insert(purchases).values(newPurchase);

  return newPurchase;
}

// Check if user can download (subscription or purchase)
export async function canUserDownload(userId: number, beatId: number): Promise<{
  canDownload: boolean;
  reason?: string;
  downloadType?: 'subscription' | 'purchase';
  subscriptionId?: number;
  purchaseId?: number;
}> {
  // Check if user has an active subscription
  const activeSubscription = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active'),
        // Check if subscription is still valid
        // This would need a proper date comparison in a real implementation
      )
    )
    .limit(1);

  if (activeSubscription.length > 0) {
    const subscription = activeSubscription[0];
    
    // Check if user has downloads remaining
    if (subscription.downloadsUsed >= subscription.monthlyDownloads) {
      return {
        canDownload: false,
        reason: 'Monthly download limit reached',
      };
    }

    return {
      canDownload: true,
      downloadType: 'subscription',
      subscriptionId: subscription.id,
    };
  }

  // Check if user has purchased this beat
  const purchase = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, userId),
        eq(purchases.beatId, beatId),
        eq(purchases.status, 'completed')
      )
    )
    .limit(1);

  if (purchase.length > 0) {
    return {
      canDownload: true,
      downloadType: 'purchase',
      purchaseId: purchase[0].id,
    };
  }

  return {
    canDownload: false,
    reason: 'No active subscription or purchase found',
  };
}

// Record a download
export async function recordDownload(
  userId: number,
  beatId: number,
  fileType: 'mp3' | 'wav' | 'stems',
  downloadType: 'subscription' | 'purchase',
  subscriptionId?: number,
  purchaseId?: number
) {
  // Record the download
  await db.insert(downloads).values({
    userId,
    beatId,
    fileType,
    downloadType,
    subscriptionId,
    purchaseId,
  });

  // If it's a subscription download, increment the usage counter
  if (downloadType === 'subscription' && subscriptionId) {
    await db
      .update(userSubscriptions)
      .set({ downloadsUsed: db.select().from(userSubscriptions).where(eq(userSubscriptions.id, subscriptionId)).then(s => s[0]?.downloadsUsed + 1 || 1) })
      .where(eq(userSubscriptions.id, subscriptionId));
  }
}

// Get user's subscription status
export async function getUserSubscription(userId: number) {
  const subscription = await db
    .select({
      subscription: userSubscriptions,
      plan: subscriptionPlans,
    })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active')
      )
    )
    .limit(1);

  return subscription.length > 0 ? subscription[0] : null;
}

// Get user's purchase history
export async function getUserPurchases(userId: number) {
  return await db
    .select({
      purchase: purchases,
      beat: {
        id: purchases.beatId,
        title: purchases.beatId, // This would need a proper join in a real implementation
      },
    })
    .from(purchases)
    .where(eq(purchases.userId, userId))
    .orderBy(purchases.purchasedAt);
}

// Get user's download history
export async function getUserDownloads(userId: number) {
  return await db
    .select()
    .from(downloads)
    .where(eq(downloads.userId, userId))
    .orderBy(downloads.downloadedAt);
}

// Webhook handler for Stripe events
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        await handleSubscriptionSuccess(session.id);
      } else if (session.mode === 'payment') {
        await handlePurchaseSuccess(session.id);
      }
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await db
        .update(userSubscriptions)
        .set({
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await db
        .update(userSubscriptions)
        .set({ status: 'canceled' })
        .where(eq(userSubscriptions.stripeSubscriptionId, deletedSubscription.id));
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
