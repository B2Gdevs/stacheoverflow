'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { APP_CONFIG, FileSizeUtils, FileTypeUtils } from '@/lib/constants';
import { mutate } from 'swr';
import { CACHE_KEYS } from '@/lib/swr/config';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarUrl?: string | null;
}

export function AvatarUploadDialog({
  open,
  onOpenChange,
  currentAvatarUrl,
}: AvatarUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setError(null);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  }, [open, previewUrl]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!FileTypeUtils.isValidImageType(file.name)) {
      return `Invalid image type. Supported: ${APP_CONFIG.FILE_TYPES.IMAGES.COVER.join(', ')}`;
    }

    // Check file size (5MB limit for profile pictures)
    const maxSizeMB = 5;
    if (FileSizeUtils.bytesToMB(file.size) > maxSizeMB) {
      return `File size (${FileSizeUtils.formatFileSize(file.size)}) exceeds maximum allowed size (${maxSizeMB}MB)`;
    }

    return null;
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Create preview
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Get Supabase session token to send in Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      
      const formData = new FormData();
      formData.append('file', file);

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include', // Important: include cookies for auth
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      console.log('✅ Avatar uploaded successfully:', data.avatarUrl);

      // Optimistically update the cache immediately
      await mutate(
        CACHE_KEYS.USER,
        async (currentUser: any) => {
          console.log('🔄 Optimistically updating cache with avatar URL:', data.avatarUrl);
          if (currentUser) {
            const updated = { ...currentUser, avatarUrl: data.avatarUrl };
            console.log('✅ Updated user data:', { id: updated.id, avatarUrl: updated.avatarUrl });
            return updated;
          }
          return currentUser;
        },
        false // Don't revalidate yet
      );

      // Then force a revalidation to fetch fresh data from server
      await mutate(CACHE_KEYS.USER);

      addToast({
        type: 'success',
        title: 'Success',
        description: 'Profile picture updated successfully',
      });

      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Profile Picture</DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload a new profile picture. Supported formats: JPG, PNG, WebP (max 5MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`relative min-h-[200px] border-2 border-dashed rounded-lg transition-all duration-200 ${
              dragActive
                ? 'border-green-400 bg-green-400/10'
                : error
                ? 'border-red-400 bg-red-400/10'
                : file
                ? 'border-green-400 bg-green-400/5'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              {previewUrl ? (
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                  />
                </div>
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              )}

              {file ? (
                <div className="space-y-2">
                  <p className="text-sm text-white font-medium">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {FileSizeUtils.formatFileSize(file.size)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WebP up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

