import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { createPurchaseCheckout } from '@/lib/stripe/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { beatId, amount, successUrl, cancelUrl } = body;

    if (!beatId || !amount || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create purchase checkout session
    const session = await createPurchaseCheckout({
      userId: user.id,
      beatId,
      amount: Math.round(amount * 100), // Convert to cents
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating purchase checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase checkout' },
      { status: 500 }
    );
  }
}
