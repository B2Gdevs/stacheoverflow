import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { beats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { uploadFile } from '@/lib/storage';
import { APP_CONFIG, FileSizeUtils } from '@/lib/constants';
import { syncTagsForBeat } from '@/lib/db/tag-queries';

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
      category: beatData.category,
      tags: beatData.tags || [],
      published: beatData.published === 1,
      isPack: beatData.isPack === 1,
      packId: beatData.packId || null,
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

    // Check if beat exists
    const existingBeat = await db
      .select()
      .from(beats)
      .where(eq(beats.id, beatId))
      .limit(1);

    if (existingBeat.length === 0) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

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
      
      // Check file size using constants
      if (FileSizeUtils.isLargeFile(mp3Buffer.length)) {
        console.log(`⚠️ Large MP3 file detected: ${FileSizeUtils.formatFileSize(mp3Buffer.length)}`);
      }
      
      const mp3Result = await uploadFile(mp3Buffer, mp3File.name, mp3File.type);
      if (mp3Result.success) {
        mp3FileName = mp3Result.fileName;
        console.log(`✅ MP3 file uploaded successfully: ${mp3Result.fileName}`);
      } else {
        console.error(`❌ MP3 file upload failed: ${mp3Result.error}`);
        return NextResponse.json(
          { error: 'Failed to upload MP3 file: ' + mp3Result.error },
          { status: 500 }
        );
      }
    }

    if (wavFile) {
      const wavBuffer = Buffer.from(await wavFile.arrayBuffer());
      
      // Check file size using constants
      if (FileSizeUtils.isLargeFile(wavBuffer.length)) {
        console.log(`⚠️ Large WAV file detected: ${FileSizeUtils.formatFileSize(wavBuffer.length)}`);
      }
      
      const wavResult = await uploadFile(wavBuffer, wavFile.name, wavFile.type);
      if (wavResult.success) {
        wavFileName = wavResult.fileName;
        console.log(`✅ WAV file uploaded successfully: ${wavResult.fileName}`);
      } else {
        console.error(`❌ WAV file upload failed: ${wavResult.error}`);
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

    // Prepare update data
    const updateData: any = {
      title,
      artist,
      genre,
      price: Math.round(Number(price) * 100), // Convert to cents
      duration: duration ? Number(duration) : null,
      bpm: bpm ? Number(bpm) : null,
      key: key || null,
      description: description || null,
      category: category || 'artist',
      tags: tags, // Drizzle expects an array, not a JSON string
      published: published ? 1 : 0,
    };

    // Update audio files if new files were uploaded
    if (mp3FileName) {
      updateData.audioFileMp3 = mp3FileName;
    }
    if (wavFileName) {
      updateData.audioFileWav = wavFileName;
    }
    if (stemsFileName) {
      updateData.audioFileStems = stemsFileName;
    }
    if (imageFileName) {
      updateData.imageFile = imageFileName;
    }
    // Update the beat
    await db
      .update(beats)
      .set(updateData)
      .where(eq(beats.id, beatId));

    // Sync tags to the tags table
    if (tags && tags.length > 0) {
      try {
        await syncTagsForBeat(beatId, tags);
      } catch (error) {
        console.error('Failed to sync tags for beat:', error);
        // Don't fail the request if tag sync fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating beat:', error);
    return NextResponse.json(
      { error: 'Failed to update beat' },
      { status: 500 }
    );
  }
}
