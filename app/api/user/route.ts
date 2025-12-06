import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users, socialConnections } from '@/lib/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { withCache } from '@/lib/cache/cache-middleware';
import { cacheInvalidation } from '@/lib/cache/api-cache';

export async function GET(request: NextRequest) {
  // Get user ID for cache key (user-specific caching)
  let userId: number | undefined;
  
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
      if (dbUser) userId = dbUser.id;
    }
  } catch (error) {
    // Fall through to handler
  }
  
  return withCache(request, async () => {
    // First try to get user from Supabase session
    try {
      const supabase = await createClient();
      
      // Try to get session first, then user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 User API: Session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        error: sessionError?.message,
      });
      
      const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser();
      
      console.log('🔐 User API: Supabase getUser result:', {
        hasUser: !!supabaseUser,
        email: supabaseUser?.email,
        error: supabaseError?.message,
      });
      
      if (!supabaseError && supabaseUser && supabaseUser.email) {
      console.log('🔐 User API: Found Supabase user:', supabaseUser.email);
      
      // Normalize email to lowercase for case-insensitive matching
      const normalizedEmail = supabaseUser.email.toLowerCase().trim();
      
      // First try to find user by supabase_auth_user_id (most direct link)
      // This is set by the database trigger when OAuth accounts are linked
      let [dbUser] = await db
        .select()
        .from(users)
        .where(
          and(
            sql`CAST(${users.supabaseAuthUserId} AS TEXT) = ${supabaseUser.id}`,
            isNull(users.deletedAt)
          )
        )
        .limit(1);
      
      // If not found by auth_user_id, try by email (case-insensitive)
      // This handles cases where the trigger hasn't run yet or email/password accounts
      if (!dbUser) {
        [dbUser] = await db
          .select()
          .from(users)
          .where(
            and(
              sql`LOWER(${users.email}) = ${normalizedEmail}`,
              isNull(users.deletedAt)
            )
          )
          .limit(1);
      }
      
      if (dbUser) {
        console.log('🔐 User API: Found existing database user:', {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          hasSupabaseAuthUserId: !!dbUser.supabaseAuthUserId,
        });
        
        // Link the Supabase Auth user to the existing database user
        // This ensures OAuth accounts are properly linked even if the trigger didn't run
        if (!dbUser.supabaseAuthUserId || dbUser.supabaseAuthUserId !== supabaseUser.id) {
          console.log('🔐 User API: Linking Supabase Auth user to existing database user');
          await db
            .update(users)
            .set({ 
              supabaseAuthUserId: supabaseUser.id,
              updatedAt: new Date() 
            })
            .where(eq(users.id, dbUser.id));
          dbUser.supabaseAuthUserId = supabaseUser.id;
        }
        
        // Update email to normalized version if it differs (for consistency)
        if (dbUser.email !== normalizedEmail) {
          console.log('🔐 User API: Normalizing email case in database');
          await db
            .update(users)
            .set({ email: normalizedEmail, updatedAt: new Date() })
            .where(eq(users.id, dbUser.id));
          dbUser.email = normalizedEmail;
        }
        
        // Note: Social connections are handled by the database trigger
        // We don't need to create/update them here - the trigger handles it automatically
        
        console.log('🔐 User API: Returning user:', {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          name: dbUser.name,
          supabaseAuthUserId: dbUser.supabaseAuthUserId,
          avatarUrl: dbUser.avatarUrl,
        });
        return NextResponse.json(dbUser);
      }
      
      // User doesn't exist in database, create them
      console.log('🔐 User API: Creating new database user for:', normalizedEmail);
      // Generate a random password hash for OAuth users (they'll never use it)
      const { hashPassword } = await import('@/lib/auth/session');
      const oauthPasswordHash = await hashPassword(`oauth_${supabaseUser.id}_${Date.now()}`);
      
      const [newUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || normalizedEmail.split('@')[0],
          passwordHash: oauthPasswordHash, // OAuth users don't use passwords, but field is required
          role: 'member',
        })
        .returning();
      
      console.log('🔐 User API: Created new user:', newUser.id);
      
      // Store social connection for new OAuth user
      let provider = 'email';
      if (supabaseUser.identities && supabaseUser.identities.length > 0) {
        const oauthIdentity = supabaseUser.identities.find((id: any) => id.provider !== 'email');
        provider = oauthIdentity?.provider || supabaseUser.identities[0]?.provider || 'email';
      }
      
      const isOAuthProvider = provider !== 'email' && (provider === 'google' || provider === 'spotify');
      
      if (isOAuthProvider) {
        try {
          await db
            .insert(socialConnections)
            .values({
              userId: newUser.id,
              platform: provider,
              platformUserId: supabaseUser.id,
              profileData: JSON.stringify({
                email: supabaseUser.email,
                name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
                avatar: supabaseUser.user_metadata?.avatar_url,
              }),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          console.log('🔐 User API: Created social connection for new user');
        } catch (connectionError) {
          console.error('🔐 User API: Error storing social connection:', connectionError);
          // Don't fail the request if social connection storage fails
        }
      }
      
      console.log('🔐 User API: Returning new user:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      });
        return NextResponse.json(newUser);
      }
    } catch (error) {
      console.error('🔐 User API: Supabase auth error:', error);
      // Fall through to legacy session check
    }
    
    // Fall back to legacy session
    console.log('🔐 User API: Falling back to legacy session check');
    const user = await getUser();
    console.log('🔐 User API: Legacy session user:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
    } : 'null');
    return NextResponse.json(user);
  }, {
    userId,
  });
}
