import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { and, sql, isNull } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

async function getCurrentUser() {
  // Try Supabase session first (for OAuth users)
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser();
    
    if (!supabaseError && supabaseUser?.email) {
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
  try {
    const { searchParams } = new URL(request.url);
    // Support both 'path' and 'filePath' query parameters
    const filePath = searchParams.get('filePath') || searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }
    
    // Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse bucket and file name from path
    const [bucket, ...fileParts] = filePath.split('/');
    const fileName = fileParts.join('/');
    
    if (!bucket || !fileName) {
      return NextResponse.json(
        { error: 'Invalid file path format' },
        { status: 400 }
      );
    }
    
    // Create Supabase client with service role for signed URL generation
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Generate signed URL (valid for 1 hour)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(fileName, 3600);
    
    if (error || !data) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate signed URL', details: error?.message },
        { status: 500 }
      );
    }
    
    console.log(`✅ Generated signed URL for ${filePath} (bucket: ${bucket}, file: ${fileName})`);
    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


