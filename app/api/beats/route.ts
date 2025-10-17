import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { beats, type NewBeat } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { deleteFile } from '@/lib/storage';

export async function GET() {
  try {
    const allBeats = await db
      .select()
      .from(beats)
      .where(eq(beats.isActive, 1))
      .orderBy(beats.createdAt);

    // Format the beats for the frontend
    const formattedBeats = allBeats.map(beat => ({
      id: beat.id,
      title: beat.title,
      artist: beat.artist,
      genre: beat.genre,
      price: beat.price / 100, // Convert from cents to dollars
      duration: beat.duration,
      bpm: beat.bpm,
      key: beat.key,
      description: beat.description,
      imageFile: beat.imageFile,
      audioFiles: {
        mp3: beat.audioFileMp3,
        wav: beat.audioFileWav,
        stems: beat.audioFileStems
      },
      createdAt: beat.createdAt,
      updatedAt: beat.updatedAt
    }));

    return NextResponse.json({ beats: formattedBeats });
  } catch (error) {
    console.error('Error fetching beats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beats' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
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
      imageFile
    } = body;

    // Validate required fields
    if (!title || !artist || !genre || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: title, artist, genre, and price are required.' },
        { status: 400 }
      );
    }

    const newBeat: NewBeat = {
      title,
      artist,
      genre,
      price: Math.round(price * 100), // Convert to cents
      duration: duration || null,
      bpm: bpm || null,
      key: key || null,
      description: description || null,
      audioFileMp3: audioFiles?.mp3 || null,
      audioFileWav: audioFiles?.wav || null,
      audioFileStems: audioFiles?.stems || null,
      imageFile: imageFile || null,
      uploadedBy: user.id,
      isActive: 1
    };

    const [createdBeat] = await db
      .insert(beats)
      .values(newBeat)
      .returning();

    return NextResponse.json({ 
      success: true, 
      beat: createdBeat 
    });
  } catch (error) {
    console.error('Error creating beat:', error);
        return NextResponse.json(
          { error: 'Failed to create beat' },
          { status: 500 }
        );
      }
    }

export async function DELETE(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const beatId = searchParams.get('id');

    if (!beatId) {
      return NextResponse.json(
        { error: 'Beat ID is required' },
        { status: 400 }
      );
    }

    // Get the beat first to access file paths
    const [beatToDelete] = await db
      .select()
      .from(beats)
      .where(eq(beats.id, parseInt(beatId)));

    if (!beatToDelete) {
      return NextResponse.json(
        { error: 'Beat not found' },
        { status: 404 }
      );
    }

    // Delete associated files from Supabase Storage
    const filesToDelete = [
      beatToDelete.audioFileMp3,
      beatToDelete.audioFileWav,
      beatToDelete.audioFileStems,
      beatToDelete.imageFile
    ].filter(Boolean);

    for (const filePath of filesToDelete) {
      if (filePath) {
        try {
          const success = await deleteFile(filePath);
          if (!success) {
            console.warn(`Failed to delete file ${filePath}`);
          }
        } catch (error) {
          console.warn(`Failed to delete file ${filePath}:`, error);
          // Continue even if file deletion fails
        }
      }
    }

    // Delete the beat record
    await db
      .delete(beats)
      .where(eq(beats.id, parseInt(beatId)));

    return NextResponse.json({ 
      success: true, 
      message: 'Beat deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting beat:', error);
    return NextResponse.json(
      { error: 'Failed to delete beat' },
      { status: 500 }
    );
  }
}
