import { NextRequest, NextResponse } from 'next/server';
import { getRealUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { and, sql, isNull, or, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      // Use getRealUser to bypass impersonation - we need the actual admin
      const user = await getRealUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(req.url);
      const query = searchParams.get('q');

      if (!query || query.trim().length < 2) {
        return NextResponse.json({ users: [] });
      }

      const searchTerm = query.trim().toLowerCase();
      const searchPattern = `%${searchTerm}%`;

      // Search by email or name (case-insensitive)
      // Use ilike for case-insensitive search, or handle null names
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

