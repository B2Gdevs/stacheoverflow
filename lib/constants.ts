// App Configuration Constants
// These can be easily modified to change app behavior

export const APP_CONFIG = {
  // File Upload Limits
  FILE_LIMITS: {
    // Supabase storage limit (in MB)
    SUPABASE_MAX_SIZE_MB: 50,
    // Warning threshold for large files (in MB)
    LARGE_FILE_WARNING_MB: 30,
    // Maximum allowed file size (in MB) - set higher than Supabase limit
    MAX_FILE_SIZE_MB: 200,
  },
  
  // Supported File Types
  FILE_TYPES: {
    AUDIO: {
      MP3: '.mp3',
      WAV: '.wav',
      STEMS: ['.zip', '.rar'],
    },
    IMAGES: {
      COVER: ['.jpg', '.jpeg', '.png', '.webp'],
    },
  },
  
  // UI Configuration
  UI: {
    // Toast durations (in milliseconds)
    TOAST_DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
      WARNING: 4000,
      INFO: 3000,
    },
    // Pagination
    ITEMS_PER_PAGE: 20,
  },
  
  // API Configuration
  API: {
    // Request timeouts (in milliseconds)
    TIMEOUT: 30000,
    // Retry attempts
    MAX_RETRIES: 3,
  },
  
  // Storage Configuration
  STORAGE: {
    // Local storage directories
    DIRECTORIES: {
      AUDIO: 'uploads/audio',
      IMAGES: 'uploads/images',
    },
    // Supabase bucket names
    BUCKETS: {
      AUDIO: 'audio-files',
      IMAGES: 'cover-images',
      AVATARS: 'avatars', // Public bucket for user profile pictures
    },
  },
} as const;

// Helper functions for file size validation
export const FileSizeUtils = {
  // Convert bytes to MB
  bytesToMB: (bytes: number): number => {
    return bytes / (1024 * 1024);
  },
  
  // Check if file exceeds Supabase limit
  exceedsSupabaseLimit: (fileSizeBytes: number): boolean => {
    return FileSizeUtils.bytesToMB(fileSizeBytes) > APP_CONFIG.FILE_LIMITS.SUPABASE_MAX_SIZE_MB;
  },
  
  // Check if file is considered large (warning threshold)
  isLargeFile: (fileSizeBytes: number): boolean => {
    return FileSizeUtils.bytesToMB(fileSizeBytes) > APP_CONFIG.FILE_LIMITS.LARGE_FILE_WARNING_MB;
  },
  
  // Check if file exceeds maximum allowed size
  exceedsMaxSize: (fileSizeBytes: number): boolean => {
    return FileSizeUtils.bytesToMB(fileSizeBytes) > APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB;
  },
  
  // Format file size for display
  formatFileSize: (fileSizeBytes: number): string => {
    const mb = FileSizeUtils.bytesToMB(fileSizeBytes);
    if (mb < 1) {
      return `${(mb * 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  },
};

// File type validation
export const FileTypeUtils = {
  // Check if file is valid audio type
  isValidAudioType: (fileName: string): boolean => {
    const extension = fileName.toLowerCase().split('.').pop();
    return Object.values(APP_CONFIG.FILE_TYPES.AUDIO).flat().includes(`.${extension}`);
  },
  
  // Check if file is valid image type
  isValidImageType: (fileName: string): boolean => {
    const extension = fileName.toLowerCase().split('.').pop();
    return APP_CONFIG.FILE_TYPES.IMAGES.COVER.includes(`.${extension}`);
  },
  
  // Get file type category
  getFileCategory: (fileName: string): 'audio' | 'image' | 'unknown' => {
    if (FileTypeUtils.isValidAudioType(fileName)) return 'audio';
    if (FileTypeUtils.isValidImageType(fileName)) return 'image';
    return 'unknown';
  },
};
