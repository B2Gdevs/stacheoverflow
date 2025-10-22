import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { beatPacks, beats } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, desc } from 'drizzle-orm';

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
          
          return {
            ...pack,
            beats: packBeats
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
        beats: packBeats
      } = body;

      // Create the beat pack
      const newPack = await db
        .insert(beatPacks)
        .values({
          title,
          artist,
          genre,
          price,
          description,
          imageFile,
          published: published ? 1 : 0,
          uploadedBy: user.id
        })
        .returning();

      const packId = newPack[0].id;

      // Create beats for the pack
      if (packBeats && packBeats.length > 0) {
        const beatsToInsert = packBeats.map((beat: any) => ({
          title: beat.title,
          artist: beat.artist,
          genre: beat.genre,
          price: beat.price,
          duration: beat.duration,
          bpm: beat.bpm,
          key: beat.key,
          description: beat.description,
          audioFileMp3: beat.audioFiles?.mp3,
          audioFileWav: beat.audioFiles?.wav,
          audioFileStems: beat.audioFiles?.stems,
          imageFile: beat.imageFile,
          published: beat.published ? 1 : 0,
          isPack: 1, // Mark as pack item
          packId: packId,
          uploadedBy: user.id
        }));

        await db.insert(beats).values(beatsToInsert);
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
