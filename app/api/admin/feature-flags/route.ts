import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { featureFlags } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get all feature flags
      const flags = await db
        .select()
        .from(featureFlags)
        .orderBy(featureFlags.flagKey);

      // Convert to object format
      const flagsObj: Record<string, boolean> = {};
      flags.forEach(flag => {
        flagsObj[flag.flagKey] = flag.flagValue === 1;
      });

      // Include defaults for any missing flags
      const defaultFlags = {
        SUBSCRIPTIONS_ENABLED: false,
        PROMO_CODES_ENABLED: true,
        NEWS_ENABLED: false,
        NOTIFICATIONS_ENABLED: false,
      };

      return NextResponse.json({
        ...defaultFlags,
        ...flagsObj,
      });
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { flagKey, enabled } = body;

      if (!flagKey || typeof enabled !== 'boolean') {
        return NextResponse.json(
          { error: 'flagKey and enabled are required' },
          { status: 400 }
        );
      }

      // Check if flag exists
      const [existing] = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.flagKey, flagKey))
        .limit(1);

      if (existing) {
        // Update existing flag
        const [updated] = await db
          .update(featureFlags)
          .set({
            flagValue: enabled ? 1 : 0,
            updatedBy: user.id,
            updatedAt: new Date(),
          })
          .where(eq(featureFlags.flagKey, flagKey))
          .returning();

        return NextResponse.json(updated);
      } else {
        // Create new flag
        const [created] = await db
          .insert(featureFlags)
          .values({
            flagKey,
            flagValue: enabled ? 1 : 0,
            updatedBy: user.id,
          })
          .returning();

        return NextResponse.json(created);
      }
    } catch (error) {
      console.error('Error updating feature flag:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

