import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { beats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const beatId = parseInt(resolvedParams.id);
    
    if (isNaN(beatId)) {
      return NextResponse.json({ error: 'Invalid beat ID' }, { status: 400 });
    }

    const beat = await db
      .select()
      .from(beats)
      .where(eq(beats.id, beatId))
      .limit(1);

    if (beat.length === 0) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    const beatData = beat[0];

    // Transform the data to match the expected format
    const response = {
      id: beatData.id,
      title: beatData.title,
      artist: beatData.artist,
      genre: beatData.genre,
      price: beatData.price,
      duration: beatData.duration,
      bpm: beatData.bpm,
      key: beatData.key,
      description: beatData.description,
      audioFiles: {
        mp3: beatData.audioFileMp3,
        wav: beatData.audioFileWav,
        stems: beatData.audioFileStems,
      },
      imageFile: beatData.imageFile,
      createdAt: beatData.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching beat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beat' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const beatId = parseInt(resolvedParams.id);
    
    if (isNaN(beatId)) {
      return NextResponse.json({ error: 'Invalid beat ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      artist,
      genre,
      price,
      duration,
      bpm,
      key,
      description,
      audioFiles,
      imageFile,
    } = body;

    // Check if beat exists
    const existingBeat = await db
      .select()
      .from(beats)
      .where(eq(beats.id, beatId))
      .limit(1);

    if (existingBeat.length === 0) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      title,
      artist,
      genre,
      price: Number(price),
      duration: duration ? Number(duration) : null,
      bpm: bpm ? Number(bpm) : null,
      key: key || null,
      description: description || null,
    };

    // Update audio files if provided
    if (audioFiles) {
      if (audioFiles.mp3 !== undefined) {
        updateData.audioFileMp3 = audioFiles.mp3;
      }
      if (audioFiles.wav !== undefined) {
        updateData.audioFileWav = audioFiles.wav;
      }
      if (audioFiles.stems !== undefined) {
        updateData.audioFileStems = audioFiles.stems;
      }
    }

    // Update image file if provided
    if (imageFile !== undefined) {
      updateData.imageFile = imageFile;
    }

    // Update the beat
    await db
      .update(beats)
      .set(updateData)
      .where(eq(beats.id, beatId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating beat:', error);
    return NextResponse.json(
      { error: 'Failed to update beat' },
      { status: 500 }
    );
  }
}
