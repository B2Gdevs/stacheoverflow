import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { subscriptionPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { withLogging } from '@/lib/middleware/logging';
import Stripe from 'stripe';
import { Logger } from '@/lib/logging';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      console.log('Admin subscriptions API called');
      
      // Check if user is admin
      const user = await getUser();
      console.log('User:', user ? { id: user.id, role: user.role } : 'No user');
      
      if (!user || user.role !== 'admin') {
        console.log('Unauthorized access attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get all subscription plans
      console.log('Fetching subscription plans from database...');
      const plans = await db
        .select()
        .from(subscriptionPlans)
        .orderBy(subscriptionPlans.price);

      console.log('Found plans:', plans.length);
      console.log('Plans data:', plans);

      return NextResponse.json(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      // Check if user is admin
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { name, description, price, monthlyDownloads } = body;

      if (!name || !price || !monthlyDownloads) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Create Stripe product first
      let stripeProductId: string | null = null;
      let stripePriceId: string | null = null;

      try {
        console.log('Creating Stripe product for plan:', name);
        
        const stripeProduct = await stripe.products.create({
          name: name,
          description: description || undefined,
        });

        stripeProductId = stripeProduct.id;

        await Logger.logStripeRequest({
          requestType: 'product_create',
          requestPayload: { name, description },
          responsePayload: { productId: stripeProduct.id, name: stripeProduct.name },
          success: true,
        });

        console.log('Created Stripe product:', stripeProduct.id);

        // Create Stripe price
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(price), // Convert to cents
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        });

        stripePriceId = stripePrice.id;

        await Logger.logStripeRequest({
          requestType: 'price_create',
          requestPayload: { 
            product: stripeProduct.id, 
            unit_amount: Math.round(price), 
            currency: 'usd',
            recurring: { interval: 'month' }
          },
          responsePayload: { priceId: stripePrice.id, amount: stripePrice.unit_amount },
          success: true,
        });

        console.log('Created Stripe price:', stripePrice.id);

      } catch (stripeError) {
        console.error('Error creating Stripe product/price:', stripeError);
        
        await Logger.logStripeRequest({
          requestType: 'product_price_create',
          requestPayload: { name, description, price },
          errorMessage: stripeError instanceof Error ? stripeError.message : 'Unknown error',
          success: false,
        });

        // Continue with plan creation even if Stripe fails
        console.log('Continuing with plan creation without Stripe integration');
      }

      // Create new subscription plan
      const newPlan = {
        name,
        description: description || null,
        price: Math.round(price), // Should already be in cents
        monthlyDownloads,
        stripeProductId,
        stripePriceId,
        isActive: 1,
      };

      const [createdPlan] = await db
        .insert(subscriptionPlans)
        .values(newPlan)
        .returning();

      console.log('Created subscription plan:', createdPlan);

      return NextResponse.json(createdPlan);
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription plan' },
        { status: 500 }
      );
    }
  });
}
