'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio, Image, Upload, Save, Trash2, ArrowLeft } from 'lucide-react';

interface Beat {
  id?: number;
  title: string;
  artist: string;
  genre: string;
  price: number;
  duration: number | null;
  bpm: number | null;
  key: string | null;
  description: string | null;
  published?: boolean;
  audioFiles: {
    mp3: string | null;
    wav: string | null;
    stems: string | null;
  };
  imageFile: string | null;
  createdAt?: string;
  // Pack-specific fields
  isPack?: boolean;
  packId?: number;
  beats?: any[];
}

interface BeatUploadFormProps {
  mode: 'create' | 'edit';
  initialBeat?: Beat;
  onCancel?: () => void;
}

export default function BeatUploadForm({ mode, initialBeat, onCancel }: BeatUploadFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    price: 0,
    duration: '',
    bpm: '',
    key: '',
    description: '',
    published: false,
  });

  const [audioFiles, setAudioFiles] = useState({
    mp3: null as File | null,
    wav: null as File | null,
    stems: null as File | null,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialBeat) {
      setFormData({
        title: initialBeat.title,
        artist: initialBeat.artist,
        genre: initialBeat.genre,
        price: initialBeat.price,
        duration: initialBeat.duration?.toString() || '',
        bpm: initialBeat.bpm?.toString() || '',
        key: initialBeat.key || '',
        description: initialBeat.description || '',
        published: initialBeat.published || false,
      });
    }
  }, [mode, initialBeat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'price' || name === 'duration' || name === 'bpm' 
          ? (value === '' ? '' : Number(value)) 
          : value
    }));
  };

  const handleAudioFileChange = (type: 'mp3' | 'wav' | 'stems', file: File | null) => {
    setAudioFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const uploadFile = async (file: File, type: 'audio' | 'image'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const result = await response.json();
    return result.fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload new files if provided
      const audioFilePaths: { mp3?: string; wav?: string; stems?: string } = {};
      let imageFilePath: string | undefined;

      // Upload audio files
      for (const [type, file] of Object.entries(audioFiles)) {
        if (file) {
          audioFilePaths[type as keyof typeof audioFilePaths] = await uploadFile(file, 'audio');
        }
      }

      // Upload image file
      if (imageFile) {
        imageFilePath = await uploadFile(imageFile, 'image');
      }

      if (mode === 'create') {
        // Create new beat
        const newBeatData: any = {
          ...formData,
          price: Number(formData.price),
          duration: formData.duration ? Number(formData.duration) : null,
          bpm: formData.bpm ? Number(formData.bpm) : null,
          key: formData.key || null,
          description: formData.description || null,
          published: formData.published,
          audioFiles: {
            mp3: audioFilePaths.mp3 || null,
            wav: audioFilePaths.wav || null,
            stems: audioFilePaths.stems || null,
          },
          imageFile: imageFilePath || null,
        };

        const response = await fetch('/api/beats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newBeatData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle specific error cases
          if (errorData.code === 'DUPLICATE_FILE') {
            const existingBeatId = errorData.existingBeatId;
            const shouldEdit = confirm(
              `A beat with this file already exists. Would you like to edit the existing beat instead?`
            );
            
            if (shouldEdit && existingBeatId) {
              router.push(`/admin/edit/${existingBeatId}`);
              return;
            } else {
              throw new Error('Please use a different file or choose a different name.');
            }
          }
          
          throw new Error(errorData.error || 'Failed to create beat');
        }

        router.push('/dashboard');
      } else {
        // Update existing beat
        const updateData: any = {
          ...formData,
          price: Number(formData.price),
          duration: formData.duration ? Number(formData.duration) : null,
          bpm: formData.bpm ? Number(formData.bpm) : null,
          key: formData.key || null,
          description: formData.description || null,
          published: formData.published,
        };

        // Only include file paths if new files were uploaded
        if (Object.keys(audioFilePaths).length > 0) {
          updateData.audioFiles = {
            ...initialBeat?.audioFiles,
            ...audioFilePaths,
          };
        }

        if (imageFilePath) {
          updateData.imageFile = imageFilePath;
        }

        // Use different API endpoint for packs vs individual beats
        const apiEndpoint = initialBeat?.isPack 
          ? `/api/beat-packs/${initialBeat?.id}`
          : `/api/beats/${initialBeat?.id}`;

        const response = await fetch(apiEndpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle specific error cases
          if (errorData.code === 'DUPLICATE_FILE') {
            throw new Error('A beat with this file already exists. Please use a different file.');
          }
          
          throw new Error(errorData.error || 'Failed to update beat');
        }

        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== 'edit' || !initialBeat?.id) return;
    
    const itemType = initialBeat?.isPack ? 'pack' : 'beat';
    if (!confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Use different API endpoint for packs vs individual beats
      const apiEndpoint = initialBeat?.isPack 
        ? `/api/beat-packs/${initialBeat.id}`
        : `/api/beats?id=${initialBeat.id}`;

      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${itemType}`);
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${itemType}`);
    }
  };

  const renderFileInput = (
    type: 'mp3' | 'wav' | 'stems',
    label: string,
    accept: string,
    existingFile: string | null
  ) => (
    <div>
      <Label className="text-gray-300">{label}</Label>
      <div className="mt-2">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleAudioFileChange(type, e.target.files?.[0] || null)}
          className="hidden"
          id={`${type}-upload`}
        />
        <Label
          htmlFor={`${type}-upload`}
          className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
        >
          <div className="text-center">
            <FileAudio className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">
              {audioFiles[type] ? audioFiles[type]!.name : existingFile ? `Current: ${existingFile.split('/').pop()}` : `Upload ${label}`}
            </p>
            {existingFile && !audioFiles[type] && (
              <p className="text-xs text-green-400 mt-1">Click to replace</p>
            )}
          </div>
        </Label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Upload New Beat' : 'Edit Beat'}
          </h1>
        </div>

        {error && (
          <Card className="bg-red-900/20 border-red-500 mb-6">
            <CardContent className="p-4">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {initialBeat?.isPack ? 'Pack Information' : 'Basic Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="artist" className="text-gray-300">Artist</Label>
                  <Input
                    id="artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="genre" className="text-gray-300">Genre</Label>
                  <Input
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-gray-300">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bpm" className="text-gray-300">BPM</Label>
                  <Input
                    id="bpm"
                    name="bpm"
                    type="number"
                    value={formData.bpm}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-gray-300">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="key" className="text-gray-300">Key</Label>
                  <Input
                    id="key"
                    name="key"
                    value={formData.key}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="e.g., C Major, A Minor"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the beat..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="published"
                  name="published"
                  type="checkbox"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                />
                <Label htmlFor="published" className="text-gray-300">
                  Publish this beat (make it visible to all users)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Audio Files</CardTitle>
              <p className="text-gray-400 text-sm">
                {mode === 'edit' ? 'Leave empty to keep existing files' : 'Upload your audio files'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderFileInput('mp3', 'MP3 Preview', '.mp3', initialBeat?.audioFiles?.mp3 || null)}
                {renderFileInput('wav', 'WAV File', '.wav', initialBeat?.audioFiles?.wav || null)}
                {renderFileInput('stems', 'Stems', '.zip,.rar', initialBeat?.audioFiles?.stems || null)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Cover Image</CardTitle>
              <p className="text-gray-400 text-sm">
                {mode === 'edit' ? 'Leave empty to keep existing image' : 'Upload a cover image'}
              </p>
            </CardHeader>
            <CardContent>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                >
                  <div className="text-center">
                    <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400">
                      {imageFile ? imageFile.name : initialBeat?.imageFile ? `Current: ${initialBeat.imageFile.split('/').pop()}` : 'Upload Cover Image'}
                    </p>
                    {initialBeat?.imageFile && !imageFile && (
                      <p className="text-xs text-green-400 mt-1">Click to replace</p>
                    )}
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting 
                ? (mode === 'create' ? 'Uploading...' : 'Updating...') 
                : (mode === 'create' 
                    ? (initialBeat?.isPack ? 'Create Pack' : 'Upload Beat')
                    : (initialBeat?.isPack ? 'Update Pack' : 'Update Beat')
                  )
              }
            </Button>

            {mode === 'edit' && initialBeat?.id && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {initialBeat?.isPack ? 'Delete Pack' : 'Delete Beat'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
