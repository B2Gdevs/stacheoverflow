import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { featureFlags, users } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/lib/db/queries';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ flagKey: string }> }
) {
  return withLogging(request, async (req) => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { flagKey } = await params;

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

      // Delete the flag
      await db
        .delete(featureFlags)
        .where(eq(featureFlags.flagKey, flagKey));

      return NextResponse.json({ message: 'Feature flag deleted successfully' });
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

