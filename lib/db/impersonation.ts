import { cookies } from 'next/headers';
import { db } from './drizzle';
import { users } from './schema';
import { eq, and, isNull } from 'drizzle-orm';

export interface ImpersonationData {
  userId: number;
  adminId: number;
  environment: 'dev' | 'prod';
  expires: string;
}

/**
 * Check if there's an active impersonation session
 * Returns the impersonated user if active, null otherwise
 */
export async function getImpersonatedUser(): Promise<typeof users.$inferSelect | null> {
  const cookieStore = await cookies();
  const impersonationCookie = cookieStore.get('impersonation');

  if (!impersonationCookie?.value) {
    return null;
  }

  try {
    const impersonationData: ImpersonationData = JSON.parse(impersonationCookie.value);

    // Check if expired
    if (new Date(impersonationData.expires) < new Date()) {
      cookieStore.delete('impersonation');
      return null;
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

    return targetUser || null;
  } catch (error) {
    // Invalid cookie, clear it
    cookieStore.delete('impersonation');
    return null;
  }
}

/**
 * Get the current environment (dev or prod) from impersonation cookie
 */
export async function getImpersonationEnvironment(): Promise<'dev' | 'prod' | null> {
  const cookieStore = await cookies();
  const impersonationCookie = cookieStore.get('impersonation');

  if (!impersonationCookie?.value) {
    return null;
  }

  try {
    const impersonationData: ImpersonationData = JSON.parse(impersonationCookie.value);
    return impersonationData.environment || 'prod';
  } catch (error) {
    return null;
  }
}

