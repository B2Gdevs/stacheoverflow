'use client';

import React from 'react';
import { 
  Music, 
  User, 
  Hash, 
  Clock, 
  Key, 
  DollarSign, 
  FileText, 
  Star,
  Zap,
  Heart
} from 'lucide-react';
import { Input, Select, Textarea } from '@/components/primitives';
import { TagSection, CategorySelector } from '@/components/ui/enhanced-tags';
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

  const genreOptions = [
    { value: '', label: 'Select genre' },
    ...GENRE_OPTIONS.map(genre => ({ value: genre, label: genre }))
  ];

  const categoryOptions = [
    { 
      value: Category.ARTIST, 
      label: 'For Artists', 
      icon: <Music className="h-5 w-5" />, 
      description: 'Perfect for rappers, singers, and artists' 
    },
    { 
      value: Category.GAME, 
      label: 'For Games', 
      icon: <Zap className="h-5 w-5" />, 
      description: 'Ideal for game soundtracks and sound effects' 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title & Artist Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          icon={Music}
          label="Beat Title *"
          value={beat.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter your beat title"
          tooltip="Make it catchy and memorable"
        />
        <Input
          icon={User}
          label="Artist Name *"
          value={beat.artist}
          onChange={(e) => handleInputChange('artist', e.target.value)}
          placeholder="Enter artist name"
          tooltip="Your stage name or real name"
        />
      </div>

      {/* Genre, BPM & Key Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Select
          icon={Hash}
          label="Genre *"
          value={beat.genre}
          onChange={(e) => handleInputChange('genre', e.target.value)}
          options={genreOptions}
          tooltip="Choose the main genre"
        />
        <Input
          icon={Clock}
          label="BPM"
          type="number"
          value={beat.bpm}
          onChange={(e) => handleInputChange('bpm', parseInt(e.target.value) || 0)}
          placeholder="120"
          tooltip="Beats per minute"
        />
        <Input
          icon={Key}
          label="Musical Key"
          value={beat.key}
          onChange={(e) => handleInputChange('key', e.target.value)}
          placeholder="C Major"
          tooltip="Musical key signature"
        />
      </div>

      {/* Price Section */}
      <div className="max-w-md">
        <Input
          icon={DollarSign}
          label="Price ($) *"
          type="number"
          step="0.01"
          value={beat.price}
          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          tooltip="Set your beat price in USD"
        />
      </div>

      {/* Description Section */}
      <Textarea
        icon={FileText}
        label="Description"
        value={beat.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Describe your beat, its vibe, and what makes it special..."
        rows={4}
        tooltip="Tell potential buyers about your beat"
      />

      {/* Category Selection */}
      <CategorySelector
        categories={categoryOptions}
        selectedCategory={beat.category}
        onCategoryChange={(category) => handleCategoryChange(category as Category)}
      />

      {/* Tags Section */}
      <TagSection
        title="Beat Tags"
        description="Add tags to help people find your beat"
        icon={<Star className="h-5 w-5 text-green-400" />}
        tags={[...CATEGORY_TAGS[beat.category]]}
        selectedTags={Array.isArray(beat.tags) ? beat.tags : []}
        onTagClick={addTag}
        onTagRemove={removeTag}
      />
    </div>
  );
}
