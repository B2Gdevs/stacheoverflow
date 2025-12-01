import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { promoCodes, users } from '@/lib/db/schema';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withLogging(request, async (req) => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;
      const promoId = parseInt(id);

      if (isNaN(promoId)) {
        return NextResponse.json({ error: 'Invalid promo ID' }, { status: 400 });
      }

      const body = await req.json();
      const { isActive, code, description, discountType, discountValue, assetId, assetType, maxUses, validFrom, validUntil } = body;

      // If only isActive is provided, just update that
      if (isActive !== undefined && Object.keys(body).length === 1) {
        const [updated] = await db
          .update(promoCodes)
          .set({
            isActive: isActive,
            updatedAt: new Date(),
          })
          .where(eq(promoCodes.id, promoId))
          .returning();

        if (!updated) {
          return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
      }

      // Otherwise, update all fields
      const [updated] = await db
        .update(promoCodes)
        .set({
          code: code?.toUpperCase().trim(),
          description,
          discountType,
          discountValue,
          assetId: assetId ? parseInt(assetId) : null,
          assetType,
          maxUses: maxUses ? parseInt(maxUses) : null,
          validFrom: validFrom ? new Date(validFrom) : new Date(),
          validUntil: validUntil ? new Date(validUntil) : null,
          updatedAt: new Date(),
        })
        .where(eq(promoCodes.id, promoId))
        .returning();

      if (!updated) {
        return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
      }

      return NextResponse.json(updated);
    } catch (error) {
      console.error('Error updating promo code:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withLogging(request, async (req) => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;
      const promoId = parseInt(id);

      if (isNaN(promoId)) {
        return NextResponse.json({ error: 'Invalid promo ID' }, { status: 400 });
      }

      const [deleted] = await db
        .delete(promoCodes)
        .where(eq(promoCodes.id, promoId))
        .returning();

      if (!deleted) {
        return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Promo code deleted successfully' });
    } catch (error) {
      console.error('Error deleting promo code:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

