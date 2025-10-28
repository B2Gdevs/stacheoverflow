'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { BeatData, useWizard } from '@/lib/wizard';
import { APP_CONFIG, FileSizeUtils, FileTypeUtils } from '@/lib/constants';
import { Upload, Music, FileAudio, Archive, Image, CheckCircle, AlertCircle, X } from 'lucide-react';

export function UploadFilesStep() {
  const { data, updateData } = useWizard();
  const { beat } = data;
  const [activeSection, setActiveSection] = useState<'mp3' | 'wav' | 'stems' | 'image'>('mp3');
  const [dragActive, setDragActive] = useState(false);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('🎵 UploadFilesStep: Current beat data:', beat);
  console.log('🎵 UploadFilesStep: Beat audioFiles:', beat.audioFiles);
  console.log('🎵 UploadFilesStep: Beat existingFiles:', beat.existingFiles);
  console.log('🎵 UploadFilesStep: Beat imageFile:', beat.imageFile);

  const getFileInfo = (type: 'mp3' | 'wav' | 'stems' | 'image') => {
    if (type === 'image') {
      const newFile = beat.imageFile;
      const existingFile = beat.existingFiles?.image;
      
      if (newFile) {
        return {
          name: newFile.name,
          size: FileSizeUtils.formatFileSize(newFile.size),
          isNew: true,
          file: newFile
        };
      } else if (existingFile) {
        const fileName = existingFile.split('/').pop() || existingFile;
        return {
          name: fileName,
          size: 'Existing file',
          isNew: false,
          file: null
        };
      }
    } else {
      const newFile = beat.audioFiles[type];
      const existingFile = beat.existingFiles?.[type];
      
      if (newFile) {
        return {
          name: newFile.name,
          size: FileSizeUtils.formatFileSize(newFile.size),
          isNew: true,
          file: newFile
        };
      } else if (existingFile) {
        const fileName = existingFile.split('/').pop() || existingFile;
        return {
          name: fileName,
          size: 'Existing file',
          isNew: false,
          file: null
        };
      }
    }
    
    return null;
  };

  const getSectionIcon = (type: 'mp3' | 'wav' | 'stems' | 'image') => {
    switch (type) {
      case 'mp3':
      case 'wav':
        return <Music className="w-5 h-5" />;
      case 'stems':
        return <Archive className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
    }
  };

  const getSectionTitle = (type: 'mp3' | 'wav' | 'stems' | 'image') => {
    switch (type) {
      case 'mp3':
        return 'MP3 Audio';
      case 'wav':
        return 'WAV Audio';
      case 'stems':
        return 'Stems (ZIP/RAR)';
      case 'image':
        return 'Cover Image';
    }
  };

  const getSectionDescription = (type: 'mp3' | 'wav' | 'stems' | 'image') => {
    switch (type) {
      case 'mp3':
        return 'Compressed audio format';
      case 'wav':
        return 'High-quality audio format';
      case 'stems':
        return 'Individual track files';
      case 'image':
        return 'Album artwork (required)';
    }
  };

  // Debug the specific MP3 file
  console.log('🎵 UploadFilesStep: MP3 specific check:', {
    mp3File: beat.audioFiles.mp3,
    mp3Existing: beat.existingFiles?.mp3,
    mp3Info: getFileInfo('mp3')
  });

  const validateFile = (file: File, type: 'mp3' | 'wav' | 'stems' | 'image'): string | null => {
    // Check file type
    if (type === 'image') {
      if (!FileTypeUtils.isValidImageType(file.name)) {
        return `Invalid image type. Supported: ${APP_CONFIG.FILE_TYPES.IMAGES.COVER.join(', ')}`;
      }
    } else {
      if (!FileTypeUtils.isValidAudioType(file.name)) {
        return `Invalid audio type. Supported: ${Object.values(APP_CONFIG.FILE_TYPES.AUDIO).flat().join(', ')}`;
      }
    }

    // Check file size
    if (FileSizeUtils.exceedsMaxSize(file.size)) {
      return `File size (${FileSizeUtils.formatFileSize(file.size)}) exceeds maximum allowed size (${APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB}MB)`;
    }

    // Check if file is too large for Supabase (warning only)
    if (FileSizeUtils.exceedsSupabaseLimit(file.size)) {
      console.log(`⚠️ File ${file.name} (${FileSizeUtils.formatFileSize(file.size)}) exceeds Supabase limit, will use local storage`);
    }

    return null; // No errors
  };

  const handleFileUpload = useCallback((file: File, type: 'mp3' | 'wav' | 'stems' | 'image') => {
    console.log(`🎵 UploadFilesStep: File upload for ${type}:`, file.name);
    
    const error = validateFile(file, type);
    if (error) {
      console.error(`❌ File validation failed for ${type}:`, error);
      setFileErrors(prev => ({ ...prev, [type]: error }));
      return;
    }

    // Clear any existing error
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });

    // Update the data
    if (type === 'image') {
      updateData({
        beat: {
          ...beat,
          imageFile: file
        }
      });
    } else {
      updateData({
        beat: {
          ...beat,
          audioFiles: {
            ...beat.audioFiles,
            [type]: file
          }
        }
      });
    }
  }, [beat, updateData]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], activeSection);
    }
  }, [activeSection, handleFileUpload]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], activeSection);
    }
  };

  const removeFile = (type: 'mp3' | 'wav' | 'stems' | 'image') => {
    if (type === 'image') {
      updateData({
        beat: {
          ...beat,
          imageFile: null
        }
      });
    } else {
      updateData({
        beat: {
          ...beat,
          audioFiles: {
            ...beat.audioFiles,
            [type]: null
          }
        }
      });
    }
    
    // Clear error
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });
  };


  const currentFileInfo = getFileInfo(activeSection);
  const sections: Array<'mp3' | 'wav' | 'stems' | 'image'> = ['mp3', 'wav', 'stems', 'image'];

  return (
    <div className="space-y-6">
      <div className="flex gap-6 h-96">
        {/* Left Side - Upload Area */}
        <div className="flex-1">
          <div className="h-full">
            <h4 className="text-white font-bold mb-4 text-lg">Upload Files</h4>
            <p className="text-gray-400 text-sm mb-6">Upload your {getSectionTitle(activeSection).toLowerCase()}</p>
            
            {/* Drag and Drop Area */}
            <div
              className={`relative h-64 border-2 border-dashed rounded-xl transition-all duration-200 ${
                dragActive
                  ? 'border-green-400 bg-green-400/10'
                  : fileErrors[activeSection]
                  ? 'border-red-400 bg-red-400/10'
                  : currentFileInfo
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
                accept={activeSection === 'image' ? 'image/*' : activeSection === 'stems' ? '.zip,.rar' : `.${activeSection}`}
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                {currentFileInfo ? (
                  <div className="space-y-4">
                    {activeSection === 'image' && currentFileInfo.file ? (
                      <img
                        src={URL.createObjectURL(currentFileInfo.file)}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-600"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center">
                        {getSectionIcon(activeSection)}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <p className="text-white font-semibold text-lg">{currentFileInfo.name}</p>
                      <p className="text-gray-400 text-sm">{currentFileInfo.size}</p>
                      <div className="flex items-center gap-2">
                        {currentFileInfo.isNew ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">📁</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-400">
                          {currentFileInfo.isNew ? 'New file uploaded' : 'Existing file'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFile(activeSection)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ) : fileErrors[activeSection] ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-400/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-red-400 font-semibold">Upload Error</p>
                      <p className="text-red-300 text-sm max-w-xs">{fileErrors[activeSection]}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-semibold">Drag and drop files here</p>
                      <p className="text-gray-400 text-sm">-OR-</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                      >
                        Browse Files
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - File Sections */}
        <div className="w-80 space-y-3">
          <h4 className="text-white font-bold text-lg">File Sections</h4>
          <p className="text-gray-400 text-sm mb-4">Select a section to upload files</p>
          
          {sections.map((section) => {
            const fileInfo = getFileInfo(section);
            const isActive = activeSection === section;
            const hasError = !!fileErrors[section];
            
            return (
              <div
                key={section}
                onClick={() => setActiveSection(section)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'border-green-400 bg-green-400/10'
                    : hasError
                    ? 'border-red-400 bg-red-400/5 hover:border-red-300'
                    : fileInfo
                    ? 'border-green-400/50 bg-green-400/5 hover:border-green-400'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-green-400 text-white'
                      : hasError
                      ? 'bg-red-400/20 text-red-400'
                      : fileInfo
                      ? 'bg-green-400/20 text-green-400'
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {getSectionIcon(section)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-white font-semibold text-sm">{getSectionTitle(section)}</h5>
                      {fileInfo && (
                        <div className="flex items-center gap-1">
                          {fileInfo.isNew ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">📁</span>
                            </div>
                          )}
                        </div>
                      )}
                      {hasError && <AlertCircle className="w-4 h-4 text-red-400" />}
                    </div>
                    <p className="text-gray-400 text-xs">{getSectionDescription(section)}</p>
                    {fileInfo && (
                      <div className="mt-1 space-y-1">
                        <p className="text-white text-xs font-medium truncate">{fileInfo.name}</p>
                        <p className="text-gray-400 text-xs">{fileInfo.size}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* File Requirements */}
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
        <h4 className="text-white font-bold mb-3">File Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">Audio Files</span>
            </div>
            <ul className="text-gray-400 space-y-1 ml-6">
              <li>• MP3: Optional, max {APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB}MB</li>
              <li>• WAV: Optional, max {APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB}MB</li>
              <li>• <span className="text-green-400 font-bold">At least one audio file required</span></li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">Other Files</span>
            </div>
            <ul className="text-gray-400 space-y-1 ml-6">
              <li>• Stems: Optional, ZIP/RAR format</li>
              <li>• Cover Image: Required, JPG/PNG/WebP</li>
              <li>• <span className="text-blue-400 font-bold">📁 = Existing, ✓ = New</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
