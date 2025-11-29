import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { beatPacks, beats, users } from '@/lib/db/schema';
import { withLogging } from '@/lib/middleware/logging';
import { eq, desc, inArray, and, sql, isNull } from 'drizzle-orm';
import { uploadFile, STORAGE_BUCKETS } from '@/lib/storage';
import { createClient } from '@/utils/supabase/server';
import { withCache } from '@/lib/cache/cache-middleware';
import { invalidateBeatPacksCache } from '@/lib/cache/api-cache';

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
  // Get user for cache key
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';
  
  return withCache(request, async () => {
    return withLogging(request, async (req) => {
      try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

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

      // Generate signed URLs for images (valid for 1 hour)
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseAdmin = serviceKey ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      ) : null;

      // Helper to generate signed URL for an image
      const generateImageUrl = async (imageFile: string | null): Promise<string | null> => {
        if (!imageFile || !supabaseAdmin || !imageFile.includes('/')) return null;
        
        try {
          const [bucket, ...fileParts] = imageFile.split('/');
          const fileName = fileParts.join('/');
          
          if (bucket === STORAGE_BUCKETS.IMAGES && fileName) {
            const { data, error } = await supabaseAdmin.storage
              .from(bucket)
              .createSignedUrl(fileName, 3600); // 1 hour
            
            if (!error && data) {
              return data.signedUrl;
            }
          }
        } catch (error) {
          console.error(`Error generating signed URL for ${imageFile}:`, error);
        }
        return null;
      };

      // Get beats for each pack
      const packsWithBeats = await Promise.all(
        packs.map(async (pack) => {
          const packBeats = await db
            .select()
            .from(beats)
            .where(eq(beats.packId, pack.id));
          
          // Format beats like the beats API does
          const formattedBeats = await Promise.all(packBeats.map(async (beat) => {
            const imageUrl = await generateImageUrl(beat.imageFile);
            
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
              }
            };
          }));
          
          const packImageUrl = await generateImageUrl(pack.imageFile);
          
          return {
            ...pack,
            price: pack.price / 100, // Convert pack price from cents to dollars
            published: pack.published === 1,
            imageUrl: packImageUrl, // Include pack image signed URL
            beats: formattedBeats
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
  }, {
    userId: user?.id,
    isAdmin,
  });
}

export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Handle FormData instead of JSON
      const formData = await req.formData();
      
      // Extract form data
      const title = formData.get('title') as string;
      const artist = formData.get('artist') as string;
      const genre = formData.get('genre') as string;
      const price = parseFloat(formData.get('price') as string);
      const description = formData.get('description') as string || '';
      const published = formData.get('published') === 'true';
      const selectedBeats = JSON.parse(formData.get('selectedBeats') as string || '[]');
      
      // Handle file uploads
      const imageFile = formData.get('imageFile') as File | null;

      // Upload pack image if provided
      let imageFileName = null;
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

      // Create the beat pack
      const newPack = await db
        .insert(beatPacks)
        .values({
          title,
          artist,
          genre,
          price: Math.round(price * 100), // Convert to cents
          description,
          imageFile: imageFileName,
          published: published ? 1 : 0,
          uploadedBy: user.id
        })
        .returning();

      const packId = newPack[0].id;

      // Link existing beats to the pack
      if (selectedBeats && selectedBeats.length > 0) {
        await db
          .update(beats)
          .set({ 
            isPack: 1,
            packId: packId,
            updatedAt: new Date()
          })
          .where(inArray(beats.id, selectedBeats));
      }

      // Invalidate cache after creating pack
      invalidateBeatPacksCache();

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
