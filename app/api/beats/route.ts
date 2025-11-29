import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { beats, type NewBeat } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { deleteFile, uploadFile } from '@/lib/storage';
import { syncTagsForBeat } from '@/lib/db/tag-queries';
import { createClient } from '@/utils/supabase/server';
import { users } from '@/lib/db/schema';
import { sql, isNull } from 'drizzle-orm';
import { withCache } from '@/lib/cache/cache-middleware';
import { invalidateBeatsCache } from '@/lib/cache/api-cache';
import { STORAGE_BUCKETS } from '@/lib/storage';

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
  
  // Fall back to legacy session
  return await getUser();
}

export async function GET(request: NextRequest) {
  // Get user once for cache key and query
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';
  
  return withCache(request, async () => {
    try {
      const allBeats = await db
        .select()
        .from(beats)
        .where(
          isAdmin 
            ? eq(beats.isActive, 1) // Admins see all active beats (published + drafts)
            : and(eq(beats.isActive, 1), eq(beats.published, 1)) // Regular users see only published beats
        )
        .orderBy(beats.createdAt);

      // Generate signed URLs for images (valid for 1 hour)
      const supabase = await createClient();
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseAdmin = serviceKey ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      ) : null;

      // Format the beats for the frontend
      const formattedBeats = await Promise.all(allBeats.map(async (beat) => {
        let imageUrl = null;
        
        // Generate signed URL for image if it exists
        if (beat.imageFile && supabaseAdmin && beat.imageFile.includes('/')) {
          try {
            const [bucket, ...fileParts] = beat.imageFile.split('/');
            const fileName = fileParts.join('/');
            
            if (bucket === STORAGE_BUCKETS.IMAGES && fileName) {
              const { data, error } = await supabaseAdmin.storage
                .from(bucket)
                .createSignedUrl(fileName, 3600); // 1 hour
              
              if (!error && data) {
                imageUrl = data.signedUrl;
              }
            }
          } catch (error) {
            console.error(`Error generating signed URL for ${beat.imageFile}:`, error);
          }
        }
        
        return {
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
          imageUrl, // Include signed URL
          published: beat.published === 1,
          audioFiles: {
            mp3: beat.audioFileMp3,
            wav: beat.audioFileWav,
            stems: beat.audioFileStems
          },
          createdAt: beat.createdAt,
          updatedAt: beat.updatedAt
        };
      }));

      return NextResponse.json({ beats: formattedBeats });
    } catch (error) {
      console.error('Error fetching beats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch beats' },
        { status: 500 }
      );
    }
  }, {
    userId: user?.id,
    isAdmin,
  });
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Handle FormData instead of JSON
    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const genre = formData.get('genre') as string;
    const price = parseFloat(formData.get('price') as string);
    const duration = formData.get('duration') as string || '';
    const bpm = parseInt(formData.get('bpm') as string) || 0;
    const key = formData.get('key') as string || '';
    const description = formData.get('description') as string || '';
    const category = formData.get('category') as string || 'artist';
    // Parse tags with error handling
    let tags = [];
    try {
      const tagsString = formData.get('tags') as string || '[]';
      const parsedTags = JSON.parse(tagsString);
      tags = Array.isArray(parsedTags) ? parsedTags : [];
    } catch (error) {
      console.error('Error parsing tags:', error);
      tags = [];
    }
    const published = formData.get('published') === 'true';
    
    // Handle file uploads
    const mp3File = formData.get('mp3File') as File | null;
    const wavFile = formData.get('wavFile') as File | null;
    const stemsFile = formData.get('stemsFile') as File | null;
    const imageFile = formData.get('imageFile') as File | null;

    // Validate required fields
    if (!title || !artist || !genre || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: title, artist, genre, and price are required.' },
        { status: 400 }
      );
    }

    // Upload files and get file names
    let mp3FileName = null;
    let wavFileName = null;
    let stemsFileName = null;
    let imageFileName = null;

    if (mp3File) {
      const mp3Buffer = Buffer.from(await mp3File.arrayBuffer());
      const mp3Result = await uploadFile(mp3Buffer, mp3File.name, mp3File.type);
      if (mp3Result.success) {
        mp3FileName = mp3Result.fileName;
      } else {
        return NextResponse.json(
          { error: 'Failed to upload MP3 file: ' + mp3Result.error },
          { status: 500 }
        );
      }
    }

    if (wavFile) {
      const wavBuffer = Buffer.from(await wavFile.arrayBuffer());
      const wavResult = await uploadFile(wavBuffer, wavFile.name, wavFile.type);
      if (wavResult.success) {
        wavFileName = wavResult.fileName;
      } else {
        return NextResponse.json(
          { error: 'Failed to upload WAV file: ' + wavResult.error },
          { status: 500 }
        );
      }
    }

    if (stemsFile) {
      const stemsBuffer = Buffer.from(await stemsFile.arrayBuffer());
      const stemsResult = await uploadFile(stemsBuffer, stemsFile.name, stemsFile.type);
      if (stemsResult.success) {
        stemsFileName = stemsResult.fileName;
      } else {
        return NextResponse.json(
          { error: 'Failed to upload stems file: ' + stemsResult.error },
          { status: 500 }
        );
      }
    }

    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imageResult = await uploadFile(imageBuffer, imageFile.name, imageFile.type);
      if (imageResult.success) {
        imageFileName = imageResult.fileName;
      } else {
        return NextResponse.json(
          { error: 'Failed to upload image file: ' + imageResult.error },
          { status: 500 }
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
      category: category || 'artist',
      tags: tags || [],
      published: published ? 1 : 0,
      audioFileMp3: mp3FileName,
      audioFileWav: wavFileName,
      audioFileStems: stemsFileName,
      imageFile: imageFileName,
      uploadedBy: user.id,
      isActive: 1
    };

    const [createdBeat] = await db
      .insert(beats)
      .values(newBeat)
      .returning();

    // Sync tags to the tags table
    if (tags && tags.length > 0) {
      try {
        await syncTagsForBeat(createdBeat.id, tags);
      } catch (error) {
        console.error('Failed to sync tags for beat:', error);
        // Don't fail the request if tag sync fails
      }
    }

    // Invalidate beats cache after creating new beat
    invalidateBeatsCache();

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
    const user = await getCurrentUser();
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

    // Invalidate beats cache after deletion
    invalidateBeatsCache();

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
