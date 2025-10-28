'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackData, useWizard } from '@/lib/wizard';
import { GENRE_OPTIONS } from '@/lib/wizard/constants';

export function PackInfoStep() {
  const { data, updateData } = useWizard();
  const { pack } = data;

  console.log('🎵 PackInfoStep: Current pack data:', pack);
  console.log('🎵 PackInfoStep: Pack existingFiles:', pack.existingFiles);

  const handleInputChange = (field: keyof PackData, value: any) => {
    console.log(`🎵 PackInfoStep: Updating ${field}:`, value);
    updateData({
      pack: { ...pack, [field]: value }
    });
  };

  const getPackImageDisplay = () => {
    console.log('🎵 PackInfoStep: getPackImageDisplay called');
    console.log('🎵 PackInfoStep: pack.imageFile:', pack.imageFile);
    console.log('🎵 PackInfoStep: pack.existingFiles?.image:', pack.existingFiles?.image);
    
    if (pack.imageFile) {
      console.log('🎵 PackInfoStep: Showing new pack image:', pack.imageFile.name);
      return (
        <div className="mt-2">
          <img
            src={URL.createObjectURL(pack.imageFile)}
            alt="Pack cover preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600"
          />
          <p className="text-green-400 text-sm mt-1">✓ {pack.imageFile.name}</p>
        </div>
      );
    } else if (pack.existingFiles?.image) {
      console.log('🎵 PackInfoStep: Showing existing pack image:', pack.existingFiles.image);
      return (
        <div className="mt-2">
          <img
            src={`/api/files/${pack.existingFiles.image}`}
            alt="Current pack cover"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600"
          />
          <p className="text-blue-400 text-sm mt-1">📁 Current pack cover image</p>
        </div>
      );
    }
    console.log('🎵 PackInfoStep: No pack image to display');
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="pack-title" className="text-white font-bold">Pack Title *</Label>
          <Input
            id="pack-title"
            value={pack.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
            placeholder="Enter pack title"
          />
        </div>
        <div>
          <Label htmlFor="pack-artist" className="text-white font-bold">Artist *</Label>
          <Input
            id="pack-artist"
            value={pack.artist}
            onChange={(e) => handleInputChange('artist', e.target.value)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
            placeholder="Enter artist name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="pack-genre" className="text-white font-bold">Genre *</Label>
          <select
            id="pack-genre"
            value={pack.genre}
            onChange={(e) => handleInputChange('genre', e.target.value)}
            className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-pointer"
          >
            <option value="">Select genre</option>
            {GENRE_OPTIONS.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="pack-price" className="text-white font-bold">Price ($) *</Label>
          <Input
            id="pack-price"
            type="number"
            step="0.01"
            value={pack.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="pack-description" className="text-white font-bold">Description</Label>
        <textarea
          id="pack-description"
          value={pack.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-text"
          rows={3}
          placeholder="Describe your beat pack..."
        />
      </div>

      <div>
        <Label htmlFor="pack-image" className="text-white font-bold">Pack Cover Image</Label>
        <input
          id="pack-image"
          type="file"
          accept="image/*"
          onChange={(e) => handleInputChange('imageFile', e.target.files?.[0] || null)}
          className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-pointer file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
        />
        {getPackImageDisplay()}
      </div>
    </div>
  );
}
