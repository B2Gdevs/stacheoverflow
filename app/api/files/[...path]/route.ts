import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { downloadFile } from '@/lib/storage';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and, sql, isNull } from 'drizzle-orm';

async function getCurrentUser(request: NextRequest) {
  // Try Supabase session first (for OAuth users)
  // createClient() automatically reads cookies from the request
  try {
    const supabase = await createClient();
    
    // Try getSession first (works better with cookies from img tags)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!sessionError && session?.user?.email) {
      const normalizedEmail = session.user.email.toLowerCase().trim();
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
      
      if (dbUser) {
        return dbUser;
      }
    }
  } catch (error) {
    // Continue to fallback
  }
  
  // Fall back to legacy session cookie (for email/password users)
  const legacyUser = await getUser();
  return legacyUser;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join('/');
    
    // Security check - only allow audio and image files
    if (!filePath.match(/\.(mp3|wav|jpg|jpeg|png|gif)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // All files require authentication - user must be logged in
    // For img tag requests, cookies are automatically sent, so we can check session
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    return new NextResponse(new Uint8Array(fileBuffer), {
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
