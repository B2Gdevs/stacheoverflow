'use client';

import React from 'react';
import { 
  Package, 
  User, 
  Hash, 
  DollarSign, 
  FileText, 
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { Input, Select, Textarea } from '@/components/primitives';
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

  const genreOptions = [
    { value: '', label: 'Select genre' },
    ...GENRE_OPTIONS.map(genre => ({ value: genre, label: genre }))
  ];

  return (
    <div className="space-y-8">
      {/* Pack Title & Artist Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          icon={Package}
          label="Pack Title *"
          value={pack.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter your pack title"
          tooltip="Make it descriptive and appealing"
        />
        <Input
          icon={User}
          label="Artist Name *"
          value={pack.artist}
          onChange={(e) => handleInputChange('artist', e.target.value)}
          placeholder="Enter artist name"
          tooltip="Your stage name or real name"
        />
      </div>

      {/* Genre & Price Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          icon={Hash}
          label="Genre *"
          value={pack.genre}
          onChange={(e) => handleInputChange('genre', e.target.value)}
          options={genreOptions}
          tooltip="Choose the main genre for this pack"
        />
        <Input
          icon={DollarSign}
          label="Pack Price ($) *"
          type="number"
          step="0.01"
          value={pack.price}
          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          tooltip="Set your pack price in USD"
        />
      </div>

      {/* Description Section */}
      <Textarea
        icon={FileText}
        label="Pack Description"
        value={pack.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Describe your beat pack, what's included, and why it's special..."
        rows={4}
        tooltip="Tell potential buyers about your pack"
      />

      {/* Cover Image Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-green-400" />
          <h3 className="text-white font-bold text-lg">Pack Cover Image</h3>
        </div>
        <p className="text-gray-400 text-sm">Upload a cover image for your beat pack</p>
        
        <div className="relative">
          <input
            id="pack-image"
            type="file"
            accept="image/*"
            onChange={(e) => handleInputChange('imageFile', e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Click to upload cover image</p>
            <p className="text-gray-400 text-sm">PNG, JPG, WEBP up to 10MB</p>
          </div>
        </div>
        
        {getPackImageDisplay()}
      </div>
    </div>
  );
}
