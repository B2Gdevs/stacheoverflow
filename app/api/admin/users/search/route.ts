import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, and, sql, isNull, or, ilike } from 'drizzle-orm';
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

      const { searchParams } = new URL(req.url);
      const query = searchParams.get('q');

      if (!query || query.trim().length < 2) {
        return NextResponse.json({ users: [] });
      }

      const searchTerm = `%${query.trim()}%`;

      // Search by email or name (case-insensitive)
      const results = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(
          and(
            isNull(users.deletedAt),
            or(
              sql`LOWER(${users.email}) LIKE LOWER(${searchTerm})`,
              sql`LOWER(${users.name}) LIKE LOWER(${searchTerm})`
            )
          )
        )
        .limit(20)
        .orderBy(users.createdAt);

      return NextResponse.json({ users: results });
    } catch (error) {
      console.error('Error searching users:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

