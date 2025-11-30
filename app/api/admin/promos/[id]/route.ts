import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { promoCodes } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withLogging(request, async (req) => {
    try {
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;
      const promoId = parseInt(id);

      if (isNaN(promoId)) {
        return NextResponse.json({ error: 'Invalid promo ID' }, { status: 400 });
      }

      const body = await req.json();
      const { isActive } = body;

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
    } catch (error) {
      console.error('Error updating promo code:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

