import { NextRequest, NextResponse } from 'next/server';
import { getRealUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { and, sql, isNull, or, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      console.log('🔍 User Search: Starting search request');
      
      // Use getRealUser to bypass impersonation - we need the actual admin
      const user = await getRealUser();
      console.log('🔍 User Search: getRealUser() result:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role
      });
      
      if (!user || user.role !== 'admin') {
        console.log('🔍 User Search: Unauthorized - user:', user ? { id: user.id, role: user.role } : 'null');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(req.url);
      const query = searchParams.get('q');
      console.log('🔍 User Search: Query parameter:', query);

      if (!query || query.trim().length < 2) {
        console.log('🔍 User Search: Query too short or empty');
        return NextResponse.json({ users: [] });
      }

      const searchTerm = query.trim().toLowerCase();
      const searchPattern = `%${searchTerm}%`;
      console.log('🔍 User Search: Search pattern:', searchPattern);

      // First, let's check how many users exist in total
      const totalUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(isNull(users.deletedAt));
      console.log('🔍 User Search: Total non-deleted users:', totalUsers[0]?.count || 0);

      // Get a sample of users to see what we're working with
      const sampleUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
        })
        .from(users)
        .where(isNull(users.deletedAt))
        .limit(5);
      console.log('🔍 User Search: Sample users (first 5):', sampleUsers);

      // Search by email or name (case-insensitive)
      // Use ilike for case-insensitive search, or handle null names
      console.log('🔍 User Search: Executing search query...');
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
              sql`LOWER(${users.email}) LIKE ${searchPattern}`,
              sql`LOWER(COALESCE(${users.name}, '')) LIKE ${searchPattern}`
            )
          )
        )
        .limit(20)
        .orderBy(users.createdAt);

      console.log('🔍 User Search: Search results:', {
        count: results.length,
        results: results.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role }))
      });

      return NextResponse.json({ users: results });
    } catch (error) {
      console.error('🔍 User Search: Error searching users:', error);
      if (error instanceof Error) {
        console.error('🔍 User Search: Error message:', error.message);
        console.error('🔍 User Search: Error stack:', error.stack);
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

