import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { beats, type NewBeat } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { deleteFile } from '@/lib/storage';

export async function GET() {
  try {
    // Check if user is admin to see all beats (including drafts)
    const user = await getUser();
    const isAdmin = user?.role === 'admin';
    
    const allBeats = await db
      .select()
      .from(beats)
      .where(
        isAdmin 
          ? eq(beats.isActive, 1) // Admins see all active beats (published + drafts)
          : and(eq(beats.isActive, 1), eq(beats.published, 1)) // Regular users see only published beats
      )
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
      published: beat.published === 1,
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
      published,
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

    // Check if a beat with the same audio file already exists
    if (audioFiles?.mp3) {
      const existingBeat = await db
        .select()
        .from(beats)
        .where(eq(beats.audioFileMp3, audioFiles.mp3))
        .limit(1);
      
      if (existingBeat.length > 0) {
        return NextResponse.json(
          { 
            error: 'A beat with this MP3 file already exists. Please use a different file or update the existing beat.',
            code: 'DUPLICATE_FILE',
            existingBeatId: existingBeat[0].id
          },
          { status: 409 }
        );
      }
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
      published: published ? 1 : 0,
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
    
    // Check for specific database errors
    if (error instanceof Error) {
      // Check for duplicate file errors
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return NextResponse.json(
          { 
            error: 'A beat with this file already exists. Please use a different file or update the existing beat.',
            code: 'DUPLICATE_FILE'
          },
          { status: 409 }
        );
      }
      
      // Check for foreign key constraint errors
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { 
            error: 'Invalid user reference. Please try logging in again.',
            code: 'INVALID_USER'
          },
          { status: 400 }
        );
      }
      
      // Check for column errors
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database schema error. Please contact support.',
            code: 'SCHEMA_ERROR',
            details: error.message
          },
          { status: 500 }
        );
      }
      
      // Return the actual error message for debugging
      return NextResponse.json(
        { 
          error: 'Failed to create beat',
          details: error.message,
          code: 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }
    
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
