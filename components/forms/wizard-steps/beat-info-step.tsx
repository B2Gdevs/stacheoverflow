'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BeatData, Category, useWizard } from '@/lib/wizard';
import { CATEGORY_TAGS, GENRE_OPTIONS } from '@/lib/wizard/constants';

export function BeatInfoStep() {
  const { data, updateData } = useWizard();
  const { beat } = data;

  console.log('🎵 BeatInfoStep: Current beat data:', beat);
  console.log('🎵 BeatInfoStep: Beat existingFiles:', beat.existingFiles);

  const handleInputChange = (field: keyof BeatData, value: any) => {
    console.log(`🎵 BeatInfoStep: Updating ${field}:`, value);
    updateData({
      beat: { ...beat, [field]: value }
    });
  };

  const handleCategoryChange = (category: Category) => {
    console.log('🎵 BeatInfoStep: Category changed to:', category);
    const availableTags = CATEGORY_TAGS[category];
    handleInputChange('category', category);
    handleInputChange('tags', []);
  };

  const addTag = (tag: string) => {
    console.log('🎵 BeatInfoStep: Adding tag:', tag);
    if (!beat.tags.includes(tag)) {
      handleInputChange('tags', [...beat.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    console.log('🎵 BeatInfoStep: Removing tag:', tag);
    handleInputChange('tags', beat.tags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title" className="text-white font-bold">Title *</Label>
          <Input
            id="title"
            value={beat.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
            placeholder="Enter beat title"
          />
        </div>
        <div>
          <Label htmlFor="artist" className="text-white font-bold">Artist *</Label>
          <Input
            id="artist"
            value={beat.artist}
            onChange={(e) => handleInputChange('artist', e.target.value)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
            placeholder="Enter artist name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="genre" className="text-white font-bold">Genre *</Label>
          <select
            id="genre"
            value={beat.genre}
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
          <Label htmlFor="bpm" className="text-white font-bold">BPM</Label>
          <Input
            id="bpm"
            type="number"
            value={beat.bpm}
            onChange={(e) => handleInputChange('bpm', parseInt(e.target.value) || 0)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
            placeholder="120"
          />
        </div>
        <div>
          <Label htmlFor="key" className="text-white font-bold">Key</Label>
          <Input
            id="key"
            value={beat.key}
            onChange={(e) => handleInputChange('key', e.target.value)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
            placeholder="C Major"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="price" className="text-white font-bold">Price ($) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={beat.price}
          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
          className="bg-black border-2 border-gray-600 text-white cursor-text"
          placeholder="0.00"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-white font-bold">Description</Label>
        <textarea
          id="description"
          value={beat.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-text"
          rows={3}
          placeholder="Describe your beat..."
        />
      </div>

      {/* Category & Tags */}
      <div className="space-y-4">
        <div>
          <Label className="text-white font-bold">Category</Label>
          <select
            value={beat.category}
            onChange={(e) => handleCategoryChange(e.target.value as Category)}
            className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-pointer"
          >
            <option value={Category.ARTIST}>For Artists</option>
            <option value={Category.GAME}>For Games</option>
          </select>
        </div>

        <div>
          <Label className="text-white font-bold">Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CATEGORY_TAGS[beat.category].map(tag => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer"
              >
                + {tag}
              </button>
            ))}
          </div>
          {Array.isArray(beat.tags) && beat.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {beat.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-green-500 text-white rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-green-200 hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
