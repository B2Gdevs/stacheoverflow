'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { UploadType, useWizard } from '@/lib/wizard';
import { APP_CONFIG, FileSizeUtils } from '@/lib/constants';

export function ReviewStep() {
  const { data, complete } = useWizard();
  const { uploadType, beat, pack, selectedBeats } = data;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  console.log('🎵 ReviewStep: Current wizard data:', data);
  console.log('🎵 ReviewStep: Upload type:', uploadType);
  console.log('🎵 ReviewStep: Beat data:', beat);
  console.log('🎵 ReviewStep: Pack data:', pack);
  console.log('🎵 ReviewStep: Selected beats:', selectedBeats);

  const validateForm = () => {
    const errors = [];
    
    if (uploadType === UploadType.SINGLE) {
      if (!beat.title) errors.push('Title is required');
      if (!beat.artist) errors.push('Artist is required');
      if (!beat.genre) errors.push('Genre is required');
      if (!beat.price || beat.price <= 0) errors.push('Price is required and must be greater than 0');
      
      // Check if at least one audio file is provided (MP3 or WAV) - either new or existing
      const hasNewAudio = beat.audioFiles.mp3 || beat.audioFiles.wav;
      const hasExistingAudio = beat.existingFiles?.mp3 || beat.existingFiles?.wav;
      console.log('🎵 ReviewStep: Audio validation:', {
        hasNewAudio,
        hasExistingAudio,
        newFiles: beat.audioFiles,
        existingFiles: beat.existingFiles
      });
      
      if (!hasNewAudio && !hasExistingAudio) {
        errors.push('At least one audio file (MP3 or WAV) is required');
      }
      
      // Check file sizes for new files
      if (beat.audioFiles.mp3 && FileSizeUtils.exceedsMaxSize(beat.audioFiles.mp3.size)) {
        errors.push(`MP3 file size (${FileSizeUtils.formatFileSize(beat.audioFiles.mp3.size)}) exceeds maximum allowed size (${APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB}MB)`);
      }
      if (beat.audioFiles.wav && FileSizeUtils.exceedsMaxSize(beat.audioFiles.wav.size)) {
        errors.push(`WAV file size (${FileSizeUtils.formatFileSize(beat.audioFiles.wav.size)}) exceeds maximum allowed size (${APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB}MB)`);
      }
      if (beat.audioFiles.stems && FileSizeUtils.exceedsMaxSize(beat.audioFiles.stems.size)) {
        errors.push(`Stems file size (${FileSizeUtils.formatFileSize(beat.audioFiles.stems.size)}) exceeds maximum allowed size (${APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB}MB)`);
      }
      
      // Check for cover image - either new or existing
      const hasNewImage = beat.imageFile;
      const hasExistingImage = beat.existingFiles?.image;
      console.log('🎵 ReviewStep: Image validation:', {
        hasNewImage,
        hasExistingImage,
        newImage: beat.imageFile,
        existingImage: beat.existingFiles?.image
      });
      
      if (!hasNewImage && !hasExistingImage) {
        errors.push('Cover image is required');
      }
      
      // Check image file size
      if (beat.imageFile && FileSizeUtils.exceedsMaxSize(beat.imageFile.size)) {
        errors.push(`Image file size (${FileSizeUtils.formatFileSize(beat.imageFile.size)}) exceeds maximum allowed size (${APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB}MB)`);
      }
    } else {
      if (!pack.title) errors.push('Pack title is required');
      if (!pack.artist) errors.push('Artist is required');
      if (!pack.genre) errors.push('Genre is required');
      if (!pack.price || pack.price <= 0) errors.push('Price is required and must be greater than 0');
      if (selectedBeats.length === 0) errors.push('At least one beat must be selected');
      
      // Check pack image file size
      if (pack.imageFile && FileSizeUtils.exceedsMaxSize(pack.imageFile.size)) {
        errors.push(`Pack image file size (${FileSizeUtils.formatFileSize(pack.imageFile.size)}) exceeds maximum allowed size (${APP_CONFIG.FILE_LIMITS.MAX_FILE_SIZE_MB}MB)`);
      }
    }
    
    console.log('🎵 ReviewStep: Validation errors:', errors);
    return errors;
  };

  const handleSubmit = async () => {
    console.log('🎵 ReviewStep: Starting submission...');
    const errors = validateForm();
    if (errors.length > 0) {
      console.log('🎵 ReviewStep: Validation failed:', errors);
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🎵 ReviewStep: Calling complete()...');
      await complete();
    } catch (error) {
      console.error('🎵 ReviewStep: Submission error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Review Your {uploadType === UploadType.SINGLE ? 'Beat' : 'Pack'}</h3>
        
        {uploadType === UploadType.SINGLE ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-bold">Title:</h4>
                <p className="text-gray-300">{beat.title}</p>
              </div>
              <div>
                <h4 className="text-white font-bold">Artist:</h4>
                <p className="text-gray-300">{beat.artist}</p>
              </div>
              <div>
                <h4 className="text-white font-bold">Genre:</h4>
                <p className="text-gray-300">{beat.genre}</p>
              </div>
              <div>
                <h4 className="text-white font-bold">Price:</h4>
                <p className="text-gray-300">${beat.price.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="text-white font-bold">BPM:</h4>
                <p className="text-gray-300">{beat.bpm || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-white font-bold">Key:</h4>
                <p className="text-gray-300">{beat.key || 'Not specified'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold">Description:</h4>
              <p className="text-gray-300">{beat.description || 'No description'}</p>
            </div>
            
            <div>
              <h4 className="text-white font-bold">Category:</h4>
              <p className="text-gray-300">{beat.category}</p>
            </div>
            
            {Array.isArray(beat.tags) && beat.tags.length > 0 && (
              <div>
                <h4 className="text-white font-bold">Tags:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {beat.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-green-500 text-white rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Files */}
            <div>
              <h4 className="text-white font-bold">Audio Files:</h4>
              <div className="mt-2 space-y-1">
                {beat.audioFiles.mp3 && (
                  <p className="text-green-400 text-sm">✓ MP3: {beat.audioFiles.mp3.name}</p>
                )}
                {beat.audioFiles.wav && (
                  <p className="text-green-400 text-sm">✓ WAV: {beat.audioFiles.wav.name}</p>
                )}
                {beat.audioFiles.stems && (
                  <p className="text-green-400 text-sm">✓ Stems: {beat.audioFiles.stems.name}</p>
                )}
                {beat.existingFiles?.mp3 && !beat.audioFiles.mp3 && (
                  <p className="text-blue-400 text-sm">📁 MP3: {beat.existingFiles.mp3.split('/').pop()}</p>
                )}
                {beat.existingFiles?.wav && !beat.audioFiles.wav && (
                  <p className="text-blue-400 text-sm">📁 WAV: {beat.existingFiles.wav.split('/').pop()}</p>
                )}
                {beat.existingFiles?.stems && !beat.audioFiles.stems && (
                  <p className="text-blue-400 text-sm">📁 Stems: {beat.existingFiles.stems.split('/').pop()}</p>
                )}
                {!beat.audioFiles.mp3 && !beat.audioFiles.wav && !beat.existingFiles?.mp3 && !beat.existingFiles?.wav && (
                  <p className="text-red-400 text-sm">⚠ No audio files uploaded</p>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <h4 className="text-white font-bold">Cover Image:</h4>
              {beat.imageFile ? (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(beat.imageFile)}
                    alt="Cover preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-600"
                  />
                  <p className="text-green-400 text-sm mt-1">✓ {beat.imageFile.name}</p>
                </div>
              ) : beat.existingFiles?.image ? (
                <div className="mt-2">
                  <img
                    src={`/api/files/${beat.existingFiles.image}`}
                    alt="Current cover"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-600"
                  />
                  <p className="text-blue-400 text-sm mt-1">📁 Current cover image</p>
                </div>
              ) : (
                <p className="text-red-400 text-sm">⚠ No cover image uploaded</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-bold">Pack Title:</h4>
                <p className="text-gray-300">{pack.title}</p>
              </div>
              <div>
                <h4 className="text-white font-bold">Artist:</h4>
                <p className="text-gray-300">{pack.artist}</p>
              </div>
              <div>
                <h4 className="text-white font-bold">Genre:</h4>
                <p className="text-gray-300">{pack.genre}</p>
              </div>
              <div>
                <h4 className="text-white font-bold">Price:</h4>
                <p className="text-gray-300">${pack.price.toFixed(2)}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold">Description:</h4>
              <p className="text-gray-300">{pack.description || 'No description'}</p>
            </div>

            <div>
              <h4 className="text-white font-bold">Selected Beats ({selectedBeats.length}):</h4>
              <div className="mt-2 space-y-1">
                {selectedBeats.map(beat => (
                  <div key={beat.id} className="text-gray-300 text-sm">
                    • {beat.title} by {beat.artist} - ${beat.price.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* Pack Cover Image */}
            <div>
              <h4 className="text-white font-bold">Pack Cover Image:</h4>
              {pack.imageFile ? (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(pack.imageFile)}
                    alt="Pack cover preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-600"
                  />
                  <p className="text-green-400 text-sm mt-1">✓ {pack.imageFile.name}</p>
                </div>
              ) : pack.existingFiles?.image ? (
                <div className="mt-2">
                  <img
                    src={`/api/files/${pack.existingFiles.image}`}
                    alt="Current pack cover"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-600"
                  />
                  <p className="text-blue-400 text-sm mt-1">📁 Current pack cover image</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No cover image (optional)</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 cursor-pointer"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
