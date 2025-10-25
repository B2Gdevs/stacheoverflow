import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { beatPacks, beats } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, desc, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const user = await getUser();
      const isAdmin = user?.role === 'admin';

      // Get beat packs with their beats
      const packs = await db
        .select()
        .from(beatPacks)
        .where(
          isAdmin 
            ? undefined // Admins see all packs
            : eq(beatPacks.published, 1) // Regular users see only published packs
        )
        .orderBy(desc(beatPacks.createdAt))
        .limit(limit)
        .offset(offset);

      // Get beats for each pack
      const packsWithBeats = await Promise.all(
        packs.map(async (pack) => {
          const packBeats = await db
            .select()
            .from(beats)
            .where(eq(beats.packId, pack.id));
          
          // Format beats like the beats API does
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
            category: beat.category,
            tags: beat.tags || [],
            imageFile: beat.imageFile,
            published: beat.published === 1,
            audioFiles: {
              mp3: beat.audioFileMp3,
              wav: beat.audioFileWav,
              stems: beat.audioFileStems
            }
          }));
          
          return {
            ...pack,
            price: pack.price / 100, // Convert pack price from cents to dollars
            published: pack.published === 1,
            beats: formattedBeats
          };
        })
      );

      return NextResponse.json(packsWithBeats);
    } catch (error) {
      console.error('Error fetching beat packs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch beat packs' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const {
        title,
        artist,
        genre,
        price,
        description,
        imageFile,
        published,
        selectedBeats
      } = body;

      // Create the beat pack
      const newPack = await db
        .insert(beatPacks)
        .values({
          title,
          artist,
          genre,
          price: Math.round(price * 100), // Convert to cents
          description,
          imageFile,
          published: published ? 1 : 0,
          uploadedBy: user.id
        })
        .returning();

      const packId = newPack[0].id;

      // Link existing beats to the pack
      if (selectedBeats && selectedBeats.length > 0) {
        await db
          .update(beats)
          .set({ 
            isPack: 1,
            packId: packId,
            updatedAt: new Date()
          })
          .where(inArray(beats.id, selectedBeats));
      }

      return NextResponse.json(newPack[0]);
    } catch (error) {
      console.error('Error creating beat pack:', error);
      return NextResponse.json(
        { error: 'Failed to create beat pack' },
        { status: 500 }
      );
    }
  });
}
