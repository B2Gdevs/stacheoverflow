'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Music, 
  Image, 
  FileAudio,
  Save,
  X,
  Plus
} from 'lucide-react';

export default function BeatUpload() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    artist: 'StachO',
    genre: 'Hip Hop',
    price: '',
    duration: '',
    bpm: '',
    key: '',
    description: ''
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const genres = ['Hip Hop', 'Trap', 'R&B', 'Pop', 'Electronic', 'Rock', 'Jazz'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const response = await fetch('/api/beats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre,
          price: parseFloat(formData.price),
          duration: formData.duration || null,
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
          key: formData.key || null,
          description: formData.description || null,
          audioFile: audioFile ? audioFile.name : null,
          imageFile: imageFile ? imageFile.name : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload beat');
      }

      // Reset form
      setFormData({
        title: '',
        artist: 'StachO',
        genre: 'Hip Hop',
        price: '',
        duration: '',
        bpm: '',
        key: '',
        description: ''
      });
      setAudioFile(null);
      setImageFile(null);
      
      alert('Beat uploaded successfully!');
      
      // Redirect to dashboard to see the new beat
      router.push('/dashboard');
    } catch (error) {
      console.error('Error uploading beat:', error);
      alert('Failed to upload beat. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Beat</h1>
          <p className="text-gray-300 mt-1">Add new beats to your marketplace</p>
        </div>
        <Button className="bg-green-500 hover:bg-green-600">
          <Music className="h-4 w-4 mr-2" />
          View All Beats
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-500" />
                Beat Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-300">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      placeholder="Enter beat title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist" className="text-gray-300">Artist *</Label>
                    <Input
                      id="artist"
                      name="artist"
                      value={formData.artist}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="genre" className="text-gray-300">Genre *</Label>
                    <select
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                      className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md"
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-gray-300">Price ($) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      placeholder="29.99"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-gray-300">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      placeholder="3:24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bpm" className="text-gray-300">BPM</Label>
                    <Input
                      id="bpm"
                      name="bpm"
                      type="number"
                      value={formData.bpm}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      placeholder="140"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key" className="text-gray-300">Key</Label>
                    <Input
                      id="key"
                      name="key"
                      value={formData.key}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      placeholder="C Minor"
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
                    className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md placeholder-gray-400"
                    placeholder="Describe your beat..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Upload Beat
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* File Upload */}
        <div className="space-y-6">
          {/* Audio File Upload */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-green-500" />
                Audio File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {audioFile ? (
                    <div className="space-y-2">
                      <FileAudio className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="text-white text-sm">{audioFile.name}</p>
                      <p className="text-gray-400 text-xs">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileAudio className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-gray-400 text-sm">No audio file selected</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                  id="audio-upload"
                />
                <Label htmlFor="audio-upload" className="cursor-pointer">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Select Audio File
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Image File Upload */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Image className="h-5 w-5 text-green-500" />
                Cover Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {imageFile ? (
                    <div className="space-y-2">
                      <Image className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="text-white text-sm">{imageFile.name}</p>
                      <p className="text-gray-400 text-xs">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Image className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-gray-400 text-sm">No image selected</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Select Cover Image
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
