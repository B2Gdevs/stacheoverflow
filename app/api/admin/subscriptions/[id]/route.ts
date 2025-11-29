import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { subscriptionPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { withLogging } from '@/lib/middleware/logging';
import { cacheInvalidation } from '@/lib/cache/api-cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withLogging(request, async (req) => {
    try {
      // Check if user is admin
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const resolvedParams = await params;
      const planId = parseInt(resolvedParams.id);
      
      if (isNaN(planId)) {
        return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
      }

      const body = await req.json();
      const { name, description, price, monthlyDownloads, isActive } = body;

      // Check if plan exists
      const existingPlan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId))
        .limit(1);

      if (existingPlan.length === 0) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      // Prepare update data
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = Math.round(price);
      if (monthlyDownloads !== undefined) updateData.monthlyDownloads = monthlyDownloads;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      updateData.updatedAt = new Date();

      // Update the plan
      await db
        .update(subscriptionPlans)
        .set(updateData)
        .where(eq(subscriptionPlans.id, planId));

      // Invalidate cache
      cacheInvalidation.adminSubscriptions();
      cacheInvalidation.subscriptions();

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription plan' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const planId = parseInt(resolvedParams.id);
    
    if (isNaN(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Check if plan exists
    const existingPlan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (existingPlan.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Delete the plan
    await db
      .delete(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));

    // Invalidate cache
    cacheInvalidation.adminSubscriptions();
    cacheInvalidation.subscriptions();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription plan' },
      { status: 500 }
    );
  }
}
