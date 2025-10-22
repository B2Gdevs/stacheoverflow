import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { beatPacks, beats } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, inArray } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withLogging(request, async (req) => {
    try {
      const { id } = await params;
      const packId = parseInt(id);

      if (isNaN(packId)) {
        return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
      }

      // Get the pack
      const pack = await db
        .select()
        .from(beatPacks)
        .where(eq(beatPacks.id, packId))
        .limit(1);

      if (pack.length === 0) {
        return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
      }

      // Get all beats in this pack
      const packBeats = await db
        .select()
        .from(beats)
        .where(eq(beats.packId, packId));

      // Format the beats for the frontend
      const formattedBeats = packBeats.map(beat => ({
        id: beat.id,
        title: beat.title,
        artist: beat.artist,
        genre: beat.genre,
        price: beat.price / 100, // Convert from cents to dollars
        duration: beat.duration,
        bpm: beat.bpm,
        key: beat.key,
        description: beat.description,
        audioFiles: {
          mp3: beat.audioFileMp3,
          wav: beat.audioFileWav,
          stems: beat.audioFileStems
        },
        imageFile: beat.imageFile,
        published: beat.published === 1,
        category: beat.category,
        tags: beat.tags || []
      }));

      const packData = {
        ...pack[0],
        price: pack[0].price / 100, // Convert from cents to dollars
        published: pack[0].published === 1,
        beats: formattedBeats
      };

      return NextResponse.json(packData);
    } catch (error) {
      console.error('Error fetching beat pack:', error);
      return NextResponse.json(
        { error: 'Failed to fetch beat pack' },
        { status: 500 }
      );
    }
  });
}

export async function PUT(
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
      const packId = parseInt(id);

      if (isNaN(packId)) {
        return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
      }

      const updateData = await req.json();
      const {
        title,
        artist,
        genre,
        price,
        description,
        imageFile,
        published,
        selectedBeats
      } = updateData;

      // Update the pack
      const updatedPack = await db
        .update(beatPacks)
        .set({
          title,
          artist,
          genre,
          price: Math.round(price * 100), // Convert to cents
          description,
          imageFile,
          published: published ? 1 : 0,
          updatedAt: new Date()
        })
        .where(eq(beatPacks.id, packId))
        .returning();

      // Update beat associations if selectedBeats is provided
      if (selectedBeats !== undefined) {
        // First, unlink all beats from this pack
        await db
          .update(beats)
          .set({ 
            isPack: 0,
            packId: null,
            updatedAt: new Date()
          })
          .where(eq(beats.packId, packId));

        // Then link the selected beats to this pack
        if (selectedBeats.length > 0) {
          await db
            .update(beats)
            .set({ 
              isPack: 1,
              packId: packId,
              updatedAt: new Date()
            })
            .where(inArray(beats.id, selectedBeats));
        }
      }

      return NextResponse.json(updatedPack[0]);
    } catch (error) {
      console.error('Error updating beat pack:', error);
      return NextResponse.json(
        { error: 'Failed to update beat pack' },
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
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;
      const packId = parseInt(id);

      if (isNaN(packId)) {
        return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
      }

      // First, unlink all beats from this pack
      await db
        .update(beats)
        .set({ 
          isPack: 0,
          packId: null,
          updatedAt: new Date()
        })
        .where(eq(beats.packId, packId));

      // Then delete the pack
      await db
        .delete(beatPacks)
        .where(eq(beatPacks.id, packId));

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting beat pack:', error);
      return NextResponse.json(
        { error: 'Failed to delete beat pack' },
        { status: 500 }
      );
    }
  });
}