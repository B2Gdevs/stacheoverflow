import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { downloadFile } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Check if user is authenticated (basic authentication check)
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const filePath = resolvedParams.path.join('/');
    
    // Security check - only allow audio and image files
    if (!filePath.match(/\.(mp3|wav|jpg|jpeg|png|gif)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Download file (Supabase or local fallback)
    const fileBuffer = await downloadFile(filePath);

    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.mp3')) {
      contentType = 'audio/mpeg';
    } else if (filePath.endsWith('.wav')) {
      contentType = 'audio/wav';
    } else if (filePath.match(/\.(jpg|jpeg)$/i)) {
      contentType = 'image/jpeg';
    } else if (filePath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filePath.endsWith('.gif')) {
      contentType = 'image/gif';
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}
