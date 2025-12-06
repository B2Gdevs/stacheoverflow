import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, sql, and, isNull } from 'drizzle-orm';
import { uploadFileToBucket } from '@/lib/storage';
import { APP_CONFIG, FileSizeUtils, FileTypeUtils } from '@/lib/constants';
import { cookies } from 'next/headers';

async function getCurrentUser() {
  // Try Supabase session first (for OAuth users)
  try {
    const supabase = await createClient();
    
    // Debug: Check what cookies are available
    const cookieStore = await cookies();
    const supabaseCookies = cookieStore.getAll().filter(c => 
      c.name.includes('sb-') || c.name.includes('supabase')
    );
    console.log('🔐 Avatar API: Supabase cookies found:', supabaseCookies.length);
    
    // Try getSession first (works better with cookies from POST requests)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔐 Avatar API: getSession result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      error: sessionError?.message,
    });
    
    if (!sessionError && session?.user?.email) {
      const normalizedEmail = session.user.email.toLowerCase().trim();
      
      // First try to find user by supabase_auth_user_id (most direct link)
      let [dbUser] = await db
        .select()
        .from(users)
        .where(
          and(
            sql`CAST(${users.supabaseAuthUserId} AS TEXT) = ${session.user.id}`,
            isNull(users.deletedAt)
          )
        )
        .limit(1);
      
      // If not found by auth_user_id, try by email (case-insensitive)
      if (!dbUser) {
        [dbUser] = await db
          .select()
          .from(users)
          .where(
            and(
              sql`LOWER(${users.email}) = ${normalizedEmail}`,
              isNull(users.deletedAt)
            )
          )
          .limit(1);
      }
      
      if (dbUser) {
        console.log('🔐 Avatar API: Found user from session:', dbUser.id);
        return dbUser;
      }
    }
    
    // If getSession didn't work, try getUser as fallback
    const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser();
    
    console.log('🔐 Avatar API: getUser result:', {
      hasUser: !!supabaseUser,
      email: supabaseUser?.email,
      error: supabaseError?.message,
    });
    
    if (!supabaseError && supabaseUser && supabaseUser.email) {
      const normalizedEmail = supabaseUser.email.toLowerCase().trim();
      
      // First try to find user by supabase_auth_user_id
      let [dbUser] = await db
        .select()
        .from(users)
        .where(
          and(
            sql`CAST(${users.supabaseAuthUserId} AS TEXT) = ${supabaseUser.id}`,
            isNull(users.deletedAt)
          )
        )
        .limit(1);
      
      // If not found by auth_user_id, try by email
      if (!dbUser) {
        [dbUser] = await db
          .select()
          .from(users)
          .where(
            and(
              sql`LOWER(${users.email}) = ${normalizedEmail}`,
              isNull(users.deletedAt)
            )
          )
          .limit(1);
      }
      
      if (dbUser) {
        console.log('🔐 Avatar API: Found user from getUser:', dbUser.id);
        return dbUser;
      }
    }
  } catch (error) {
    console.error('🔐 Avatar API: Supabase auth error:', error);
  }
  
  // Fall back to legacy session cookie (for email/password users)
  console.log('🔐 Avatar API: Falling back to legacy session');
  const legacyUser = await getUser();
  console.log('🔐 Avatar API: Legacy user:', legacyUser ? { id: legacyUser.id, email: legacyUser.email } : 'null');
  return legacyUser;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication BEFORE reading formData
    // (Reading formData might affect cookie reading in some cases)
    const dbUser = await getCurrentUser();
    
    if (!dbUser) {
      console.error('🔐 Avatar API: No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔐 Avatar API: Authenticated user:', {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    });

    // Get file from form data
    const formData = await request.formData();
    const file: File | null = formData.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!FileTypeUtils.isValidImageType(file.name)) {
      return NextResponse.json(
        { error: `Invalid image type. Supported: ${APP_CONFIG.FILE_TYPES.IMAGES.COVER.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (limit to 5MB for profile pictures)
    const maxSizeMB = 5;
    if (FileSizeUtils.bytesToMB(file.size) > maxSizeMB) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size (${maxSizeMB}MB)` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename with user ID prefix for organization
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `profile_${dbUser.id}_${timestamp}_${safeFileName}`;

    // Upload file to avatars bucket (public bucket for profile pictures)
    console.log('📤 Uploading avatar file:', {
      fileName,
      fileSize: file.size,
      contentType: file.type,
    });

    // Use avatars bucket (public bucket specifically for user profile pictures)
    const result = await uploadFileToBucket(buffer, fileName, file.type, 'avatars');

    console.log('📤 Upload result:', {
      success: result.success,
      fileName: result.fileName,
      publicUrl: result.publicUrl,
      error: result.error,
    });

    if (!result.success || !result.publicUrl) {
      console.error('❌ Upload failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Verify the URL is accessible before saving (only for absolute URLs)
    if (result.publicUrl && result.publicUrl.startsWith('http')) {
      try {
        const testResponse = await fetch(result.publicUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          console.warn('⚠️ Avatar URL not accessible:', {
            url: result.publicUrl,
            status: testResponse.status,
            statusText: testResponse.statusText,
          });
          // Continue anyway - might be a timing issue or CORS
        } else {
          console.log('✅ Avatar URL verified accessible');
        }
      } catch (error) {
        console.warn('⚠️ Could not verify avatar URL accessibility:', error);
        // Continue anyway
      }
    }

    // Update user's avatar URL in database
    await db
      .update(users)
      .set({
        avatarUrl: result.publicUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id));

    console.log('✅ Avatar updated in database:', {
      userId: dbUser.id,
      avatarUrl: result.publicUrl,
    });

    // Invalidate cache
    const { cacheInvalidation } = await import('@/lib/cache/api-cache');
    cacheInvalidation.user(dbUser.id);

    return NextResponse.json({
      success: true,
      avatarUrl: result.publicUrl,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

