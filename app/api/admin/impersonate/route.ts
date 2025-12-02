import { NextRequest, NextResponse } from 'next/server';
import { getRealUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * Get the real authenticated admin user, bypassing impersonation
 * This is needed for impersonation endpoints to verify the actual admin
 */
async function getCurrentAdmin() {
  return await getRealUser();
}

/**
 * POST /api/admin/impersonate
 * Start impersonating a user
 * 
 * Body: { userId: number, environment?: 'dev' | 'prod' }
 */
export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const admin = await getCurrentAdmin();
      if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { userId, environment } = body;

      if (!userId || typeof userId !== 'number') {
        return NextResponse.json(
          { error: 'userId is required and must be a number' },
          { status: 400 }
        );
      }

      // Get the target user
      const [targetUser] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, userId),
            isNull(users.deletedAt)
          )
        )
        .limit(1);

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prevent impersonating other admins (security)
      if (targetUser.role === 'admin' && targetUser.id !== admin.id) {
        return NextResponse.json(
          { error: 'Cannot impersonate other admins' },
          { status: 403 }
        );
      }

      // Store impersonation in cookie
      // Format: { userId: number, adminId: number, environment?: string, expires: timestamp }
      const cookieStore = await cookies();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8); // 8 hour session

      const impersonationData = {
        userId: targetUser.id,
        adminId: admin.id,
        environment: environment || 'prod', // Default to prod
        expires: expiresAt.toISOString()
      };

      cookieStore.set('impersonation', JSON.stringify(impersonationData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/'
      });

      return NextResponse.json({
        success: true,
        message: `Impersonating user: ${targetUser.email}`,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          role: targetUser.role
        },
        environment: impersonationData.environment
      });
    } catch (error) {
      console.error('Error starting impersonation:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/admin/impersonate
 * Stop impersonating and return to admin account
 */
export async function DELETE(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const admin = await getCurrentAdmin();
      if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Clear impersonation cookie
      const cookieStore = await cookies();
      cookieStore.delete('impersonation');

      return NextResponse.json({
        success: true,
        message: 'Impersonation stopped'
      });
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

/**
 * GET /api/admin/impersonate
 * Get current impersonation status
 */
export async function GET(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const admin = await getCurrentAdmin();
      if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const cookieStore = await cookies();
      const impersonationCookie = cookieStore.get('impersonation');

      if (!impersonationCookie?.value) {
        return NextResponse.json({
          isImpersonating: false
        });
      }

      try {
        const impersonationData = JSON.parse(impersonationCookie.value);
        
        // Check if expired
        if (new Date(impersonationData.expires) < new Date()) {
          cookieStore.delete('impersonation');
          return NextResponse.json({
            isImpersonating: false,
            expired: true
          });
        }

        // Get the impersonated user
        const [targetUser] = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, impersonationData.userId),
              isNull(users.deletedAt)
            )
          )
          .limit(1);

        if (!targetUser) {
          cookieStore.delete('impersonation');
          return NextResponse.json({
            isImpersonating: false,
            userNotFound: true
          });
        }

        return NextResponse.json({
          isImpersonating: true,
          user: {
            id: targetUser.id,
            email: targetUser.email,
            name: targetUser.name,
            role: targetUser.role
          },
          environment: impersonationData.environment,
          adminId: impersonationData.adminId
        });
      } catch (parseError) {
        // Invalid cookie, clear it
        cookieStore.delete('impersonation');
        return NextResponse.json({
          isImpersonating: false,
          invalid: true
        });
      }
    } catch (error) {
      console.error('Error getting impersonation status:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

