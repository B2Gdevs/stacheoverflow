import { createClient } from '@supabase/supabase-js';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { APP_CONFIG, FileSizeUtils } from './constants';

// Storage bucket names (using constants)
export const STORAGE_BUCKETS = {
  AUDIO: APP_CONFIG.STORAGE.BUCKETS.AUDIO,
  IMAGES: APP_CONFIG.STORAGE.BUCKETS.IMAGES,
  AVATARS: APP_CONFIG.STORAGE.BUCKETS.AVATARS,
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

// Generate unique filename to avoid conflicts
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
}

// Ensure directory exists
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

// Upload file to a specific bucket (Supabase or local fallback)
export async function uploadFileToBucket(
  file: Buffer, 
  fileName: string, 
  contentType: string,
  bucketName?: string
): Promise<StorageResult> {
  const bucket = bucketName || (contentType.startsWith('image/') 
    ? STORAGE_BUCKETS.IMAGES 
    : STORAGE_BUCKETS.AUDIO);

  // Generate unique filename to avoid conflicts
  const uniqueFileName = generateUniqueFileName(fileName);

  // Check file size using constants
  const fileSizeMB = FileSizeUtils.bytesToMB(file.length);
  
  if (FileSizeUtils.exceedsSupabaseLimit(file.length)) {
    console.log(`File size ${FileSizeUtils.formatFileSize(file.length)} exceeds Supabase limit (${APP_CONFIG.FILE_LIMITS.SUPABASE_MAX_SIZE_MB}MB), using local storage`);
  } else if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniqueFileName, file, {
          contentType,
          upsert: true // Allow overwriting
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw error;
      }

      if (!data || !data.path) {
        console.error('❌ Supabase upload returned no data or path');
        throw new Error('Upload returned no data');
      }

      // Get public URL - data.path is just the filename, not including bucket
      const publicUrlResult = supabase.storage.from(bucket).getPublicUrl(data.path);
      const publicUrl = publicUrlResult.data.publicUrl;

      console.log('✅ Supabase upload successful:', {
        bucket,
        path: data.path,
        publicUrl,
        fullPath: `${bucket}/${data.path}`,
      });

      // Warn if using a private bucket (avatars should be public)
      if (bucket === STORAGE_BUCKETS.AVATARS) {
        console.log('ℹ️ Using avatars bucket - ensure it is set to public in Supabase');
      }

      return {
        success: true,
        fileName: `${bucket}/${data.path}`,
        publicUrl
      };
    } catch (error) {
      console.error('Supabase upload failed, falling back to local storage:', error);
    }
  }

  // Fallback to local storage
  try {
    const uploadDir = contentType.startsWith('image/') 
      ? APP_CONFIG.STORAGE.DIRECTORIES.IMAGES
      : APP_CONFIG.STORAGE.DIRECTORIES.AUDIO;
    
    const fullPath = join(process.cwd(), uploadDir, uniqueFileName);
    
    // Ensure directory exists before writing
    await ensureDirectoryExists(fullPath);
    
    await writeFile(fullPath, file);

    return {
      success: true,
      fileName: `${uploadDir}/${uniqueFileName}`,
      publicUrl: `/api/files/${uploadDir}/${uniqueFileName}`
    };
  } catch (error) {
    return {
      success: false,
      fileName: '',
      error: `Upload failed: ${error}`
    };
  }
}

// Upload file (Supabase or local fallback) - uses default bucket selection
export async function uploadFile(
  file: Buffer, 
  fileName: string, 
  contentType: string
): Promise<StorageResult> {
  return uploadFileToBucket(file, fileName, contentType);
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
