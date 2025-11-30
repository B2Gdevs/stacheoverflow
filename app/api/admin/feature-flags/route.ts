import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { featureFlags, users } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';

async function getCurrentUser() {
  // Try Supabase session first (for OAuth users)
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (supabaseUser?.email) {
      const normalizedEmail = supabaseUser.email.toLowerCase().trim();
      const [dbUser] = await db
        .select()
        .from(users)
        .where(
          and(
            sql`LOWER(${users.email}) = ${normalizedEmail}`,
            isNull(users.deletedAt)
          )
        )
        .limit(1);
      
      if (dbUser) return dbUser;
    }
  } catch (error) {
    console.error('Error getting user from Supabase:', error);
  }
  
  // Fall back to legacy session cookie (for email/password users)
  return await getUser();
}

export async function GET(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get all feature flags with full details
      const flags = await db
        .select()
        .from(featureFlags)
        .orderBy(featureFlags.flagKey);

      // Return full flag objects for admin UI
      return NextResponse.json(flags);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
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
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { flagKey, enabled, description } = body;

      if (!flagKey || typeof enabled !== 'boolean') {
        return NextResponse.json(
          { error: 'flagKey and enabled are required' },
          { status: 400 }
        );
      }

      // Check if flag already exists
      const [existing] = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.flagKey, flagKey))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { error: 'Feature flag with this key already exists' },
          { status: 409 }
        );
      }

      // Create new flag
      const [created] = await db
        .insert(featureFlags)
        .values({
          flagKey: flagKey.toUpperCase(),
          flagValue: enabled ? 1 : 0,
          description: description || null,
          updatedBy: user.id,
        })
        .returning();

      return NextResponse.json(created, { status: 201 });
    } catch (error: any) {
      console.error('Error creating feature flag:', error);
      if (error.message?.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'Feature flag with this key already exists' },
          { status: 409 }
        );
      }
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
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { flagKey, enabled, description } = body;

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

      if (!existing) {
        return NextResponse.json(
          { error: 'Feature flag not found' },
          { status: 404 }
        );
      }

      // Update existing flag
      const [updated] = await db
        .update(featureFlags)
        .set({
          flagValue: enabled ? 1 : 0,
          description: description !== undefined ? description : existing.description,
          updatedBy: user.id,
          updatedAt: new Date(),
        })
        .where(eq(featureFlags.flagKey, flagKey))
        .returning();

      return NextResponse.json(updated);
    } catch (error) {
      console.error('Error updating feature flag:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

