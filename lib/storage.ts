import { createClient } from '@supabase/supabase-js';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';

// Storage bucket names
export const STORAGE_BUCKETS = {
  AUDIO: 'audio-files',
  IMAGES: 'cover-images',
} as const;

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const configured = url && key && serviceKey && 
         !url.includes('your_supabase') && 
         !key.includes('your_supabase') &&
         !serviceKey.includes('your_supabase') &&
         url.startsWith('https://');
  
  if (!configured) {
    console.log('🔍 Supabase not configured:', {
      hasUrl: !!url,
      hasAnonKey: !!key,
      hasServiceKey: !!serviceKey,
      urlValid: url && url.startsWith('https://'),
      urlPlaceholder: url && url.includes('your_supabase'),
      keyPlaceholder: key && key.includes('your_supabase'),
      serviceKeyPlaceholder: serviceKey && serviceKey.includes('your_supabase')
    });
  }
  
  return configured;
};

// Supabase client (only if configured)
let supabase: any = null;
if (isSupabaseConfigured()) {
  try {
    // Use service role key for admin operations (upload/delete)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey && !serviceKey.includes('your_supabase')) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } else {
      // Fallback to anon key for read operations
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
}

// Storage interface
export interface StorageResult {
  success: boolean;
  fileName: string;
  publicUrl?: string;
  error?: string;
}

// Upload file (Supabase or local fallback)
export async function uploadFile(
  file: Buffer, 
  fileName: string, 
  contentType: string
): Promise<StorageResult> {
  const bucket = contentType.startsWith('image/') 
    ? STORAGE_BUCKETS.IMAGES 
    : STORAGE_BUCKETS.AUDIO;

  // Use Supabase if configured
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType,
          upsert: false
        });

      if (error) {
        throw error;
      }

      return {
        success: true,
        fileName: `${bucket}/${data.path}`,
        publicUrl: supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
      };
    } catch (error) {
      console.error('Supabase upload failed, falling back to local storage:', error);
    }
  }

  // Fallback to local storage
  try {
    const uploadDir = contentType.startsWith('image/') 
      ? 'uploads/images' 
      : 'uploads/audio';
    
    const fullPath = join(process.cwd(), uploadDir, fileName);
    await writeFile(fullPath, file);

    return {
      success: true,
      fileName: `${uploadDir}/${fileName}`,
      publicUrl: `/api/files/${uploadDir}/${fileName}`
    };
  } catch (error) {
    return {
      success: false,
      fileName: '',
      error: `Upload failed: ${error}`
    };
  }
}

// Download file (Supabase or local fallback)
export async function downloadFile(filePath: string): Promise<Buffer | null> {
  // Use Supabase if configured and path indicates Supabase storage
  if (supabase && isSupabaseConfigured() && filePath.includes('/')) {
    try {
      const [bucket, ...fileParts] = filePath.split('/');
      const fileName = fileParts.join('/');

      if (bucket && fileName) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(fileName);

        if (!error && data) {
          return Buffer.from(await data.arrayBuffer());
        }
      }
    } catch (error) {
      console.error('Supabase download failed, trying local storage:', error);
    }
  }

  // Fallback to local storage
  try {
    const fullPath = join(process.cwd(), filePath);
    return await readFile(fullPath);
  } catch (error) {
    console.error('Local file download failed:', error);
    return null;
  }
}

// Delete file (Supabase or local fallback)
export async function deleteFile(filePath: string): Promise<boolean> {
  // Use Supabase if configured and path indicates Supabase storage
  if (supabase && isSupabaseConfigured() && filePath.includes('/')) {
    try {
      const [bucket, ...fileParts] = filePath.split('/');
      const fileName = fileParts.join('/');

      if (bucket && fileName) {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([fileName]);

        if (!error) {
          return true;
        }
      }
    } catch (error) {
      console.error('Supabase delete failed, trying local storage:', error);
    }
  }

  // Fallback to local storage
  try {
    const fullPath = join(process.cwd(), filePath);
    await unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Local file delete failed:', error);
    return false;
  }
}

// Get public URL for file
export function getPublicUrl(filePath: string): string {
  if (supabase && isSupabaseConfigured() && filePath.includes('/')) {
    const [bucket, ...fileParts] = filePath.split('/');
    const fileName = fileParts.join('/');
    
    if (bucket && fileName) {
      return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
    }
  }
  
  // Fallback to local API endpoint
  return `/api/files/${filePath}`;
}
