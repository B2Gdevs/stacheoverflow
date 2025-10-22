'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  Music, 
  Package, 
  Check,
  Upload,
  Save
} from 'lucide-react';

interface BeatUploadWizardProps {
  onCancel?: () => void;
  onComplete?: (result: any) => void;
}

type UploadType = 'single' | 'existing-pack';

interface BeatData {
  title: string;
  artist: string;
  genre: string;
  price: number;
  duration: string;
  bpm: number;
  key: string;
  description: string;
  category: string; // 'artist', 'game', 'commercial', etc.
  tags: string[]; // Array of tag strings
  audioFiles: {
    mp3: File | null;
    wav: File | null;
    stems: File | null;
  };
  imageFile: File | null;
  published: boolean;
}

interface PackData {
  title: string;
  artist: string;
  genre: string;
  price: number;
  description: string;
  imageFile: File | null;
  published: boolean;
  selectedBeats: number[];
}

export function BeatUploadWizard({ onCancel, onComplete }: BeatUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [packData, setPackData] = useState<PackData>({
    title: '',
    artist: '',
    genre: '',
    price: 0,
    description: '',
    imageFile: null,
    published: false,
    selectedBeats: []
  });
  const [currentBeat, setCurrentBeat] = useState<BeatData>({
    title: '',
    artist: '',
    genre: '',
    price: 0,
    duration: '',
    bpm: 0,
    key: '',
    description: '',
    category: 'artist',
    tags: [],
    audioFiles: { mp3: null, wav: null, stems: null },
    imageFile: null,
    published: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Predefined categories and their associated tags
  const categoryTags = {
    artist: ['vocal', 'instrumental', 'hook', 'verse', 'chorus', 'bridge', 'outro'],
    game: ['boss-battle', 'exploration', 'menu', 'combat', 'victory', 'defeat', 'ambient', 'tension', 'relaxing', 'epic'],
    commercial: ['advertisement', 'promotional', 'corporate', 'presentation', 'background'],
    film: ['action', 'drama', 'romance', 'horror', 'comedy', 'suspense', 'emotional', 'cinematic']
  };

  const getSteps = () => {
    if (uploadType === 'single') {
      return [
        { id: 'type', title: 'Choose Upload Type', description: 'Select how you want to upload beats' },
        { id: 'beat-info', title: 'Beat Information', description: 'Enter beat details and upload files' },
        { id: 'review', title: 'Review & Publish', description: 'Review your beat before publishing' }
      ];
    } else if (uploadType === 'existing-pack') {
      return [
        { id: 'type', title: 'Choose Upload Type', description: 'Select how you want to upload beats' },
        { id: 'pack-info', title: 'Pack Information', description: 'Enter pack details' },
        { id: 'select-beats', title: 'Select Beats', description: 'Choose existing beats for your pack' },
        { id: 'review', title: 'Review & Publish', description: 'Review your pack before publishing' }
      ];
    }
    return [
      { id: 'type', title: 'Choose Upload Type', description: 'Select how you want to upload beats' }
    ];
  };

  const steps = getSteps();

  const handleUploadTypeSelect = (type: UploadType) => {
    setUploadType(type);
    setCurrentStep(1);
  };

  const handlePackInfoChange = (field: keyof PackData, value: any) => {
    setPackData(prev => ({ ...prev, [field]: value }));
  };

  const handleBeatChange = (field: keyof BeatData, value: any) => {
    setCurrentBeat(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (type: 'mp3' | 'wav' | 'stems' | 'image', file: File | null) => {
    if (type === 'image') {
      setCurrentBeat(prev => ({ ...prev, imageFile: file }));
    } else {
      setCurrentBeat(prev => ({
        ...prev,
        audioFiles: { ...prev.audioFiles, [type]: file }
      }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setCurrentBeat(prev => ({ ...prev, category }));
    setAvailableTags(categoryTags[category as keyof typeof categoryTags] || []);
  };

  const addTag = (tag: string) => {
    if (tag && !currentBeat.tags.includes(tag)) {
      setCurrentBeat(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentBeat(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const addCustomTag = () => {
    if (newTag.trim() && !currentBeat.tags.includes(newTag.trim())) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (uploadType === 'single') {
        const response = await fetch('/api/beats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentBeat,
            audioFiles: {
              mp3: currentBeat.audioFiles.mp3?.name,
              wav: currentBeat.audioFiles.wav?.name,
              stems: currentBeat.audioFiles.stems?.name
            },
            imageFile: currentBeat.imageFile?.name
          })
        });
        
        if (response.ok) {
          onComplete?.({ type: 'single', data: await response.json() });
        }
      } else {
        const response = await fetch('/api/beat-packs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...packData,
            imageFile: packData.imageFile?.name,
            selectedBeats: packData.selectedBeats
          })
        });
        
        if (response.ok) {
          onComplete?.({ type: 'pack', data: await response.json() });
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Choose Upload Type</h2>
              <p className="text-slate-400 text-lg">How would you like to upload your beats?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card 
                className="bg-slate-900 border-2 border-slate-700 cursor-pointer hover:border-amber-600 hover:bg-slate-800 transition-all duration-200 group"
                onClick={() => handleUploadTypeSelect('single')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-800/30 transition-colors">
                    <Music className="w-10 h-10 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Single Beat</h3>
                  <p className="text-slate-400 leading-relaxed">Upload and publish one beat at a time with full metadata and file support</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-slate-900 border-2 border-slate-700 cursor-pointer hover:border-amber-600 hover:bg-slate-800 transition-all duration-200 group"
                onClick={() => handleUploadTypeSelect('existing-pack')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-800/30 transition-colors">
                    <Package className="w-10 h-10 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Create Pack</h3>
                  <p className="text-slate-400 leading-relaxed">Bundle existing beats into a pack for better value and organization</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 1:
        if (uploadType === 'single') {
          return (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3">Beat Information</h2>
                <p className="text-slate-400 text-lg">Enter details about your beat and upload files</p>
              </div>

              <Card className="bg-slate-900 border-2 border-slate-700">
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="beat-title" className="text-slate-300 font-medium">Beat Title</Label>
                      <Input
                        id="beat-title"
                        value={currentBeat.title}
                        onChange={(e) => handleBeatChange('title', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="e.g., Midnight Dreams"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beat-artist" className="text-slate-300 font-medium">Artist</Label>
                      <Input
                        id="beat-artist"
                        value={currentBeat.artist}
                        onChange={(e) => handleBeatChange('artist', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="Your artist name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="beat-genre" className="text-slate-300 font-medium">Genre</Label>
                      <Input
                        id="beat-genre"
                        value={currentBeat.genre}
                        onChange={(e) => handleBeatChange('genre', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="e.g., Hip Hop"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beat-bpm" className="text-slate-300 font-medium">BPM</Label>
                      <Input
                        id="beat-bpm"
                        type="number"
                        value={currentBeat.bpm}
                        onChange={(e) => handleBeatChange('bpm', parseInt(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="140"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beat-key" className="text-slate-300 font-medium">Key</Label>
                      <Input
                        id="beat-key"
                        value={currentBeat.key}
                        onChange={(e) => handleBeatChange('key', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="e.g., Cm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="beat-duration" className="text-slate-300 font-medium">Duration</Label>
                      <Input
                        id="beat-duration"
                        value={currentBeat.duration}
                        onChange={(e) => handleBeatChange('duration', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="3:45"
                      />
                    </div>
                     <div>
                       <Label htmlFor="beat-price" className="text-slate-300 font-medium">Price ($)</Label>
                       <Input
                         id="beat-price"
                         type="number"
                         step="0.01"
                         value={currentBeat.price}
                         onChange={(e) => handleBeatChange('price', parseFloat(e.target.value) || 0)}
                         className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                         placeholder="20.00"
                       />
                     </div>
                  </div>

                  <div>
                    <Label htmlFor="beat-description" className="text-slate-300 font-medium">Description</Label>
                    <textarea
                      id="beat-description"
                      value={currentBeat.description}
                      onChange={(e) => handleBeatChange('description', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Describe your beat..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 font-medium">Category & Tags</Label>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="beat-category" className="text-slate-400 text-sm">Category</Label>
                        <select
                          id="beat-category"
                          value={currentBeat.category}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="artist">Artist/Producer</option>
                          <option value="game">Game Music</option>
                          <option value="commercial">Commercial</option>
                          <option value="film">Film/TV</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-slate-400 text-sm">Available Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {availableTags.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-md border border-slate-600 hover:border-amber-500 transition-colors"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-400 text-sm">Custom Tag</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Enter custom tag..."
                            className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                            onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                          />
                          <Button
                            type="button"
                            onClick={addCustomTag}
                            className="bg-amber-600 hover:bg-amber-700 text-white border-0"
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-400 text-sm">Selected Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentBeat.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-amber-600 text-white text-sm rounded-md flex items-center gap-2"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-amber-200"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="beat-mp3" className="text-slate-300 font-medium">MP3 File</Label>
                      <Input
                        id="beat-mp3"
                        type="file"
                        accept="audio/mp3"
                        onChange={(e) => handleFileChange('mp3', e.target.files?.[0] || null)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beat-wav" className="text-slate-300 font-medium">WAV File</Label>
                      <Input
                        id="beat-wav"
                        type="file"
                        accept="audio/wav"
                        onChange={(e) => handleFileChange('wav', e.target.files?.[0] || null)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="beat-stems" className="text-slate-300 font-medium">Stems File</Label>
                      <Input
                        id="beat-stems"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileChange('stems', e.target.files?.[0] || null)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beat-image" className="text-slate-300 font-medium">Cover Image</Label>
                      <Input
                        id="beat-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('image', e.target.files?.[0] || null)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="beat-published"
                      checked={currentBeat.published}
                      onChange={(e) => handleBeatChange('published', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-amber-600 focus:ring-amber-500"
                    />
                    <Label htmlFor="beat-published" className="text-slate-300 font-medium">
                      Publish this beat (make it visible to all users)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        } else {
          return (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3">Pack Information</h2>
                <p className="text-slate-400 text-lg">Enter details about your beat pack</p>
              </div>

              <Card className="bg-slate-900 border-2 border-slate-700">
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="pack-title" className="text-slate-300 font-medium">Pack Title</Label>
                      <Input
                        id="pack-title"
                        value={packData.title}
                        onChange={(e) => handlePackInfoChange('title', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="e.g., Summer Vibes Pack"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pack-artist" className="text-slate-300 font-medium">Artist</Label>
                      <Input
                        id="pack-artist"
                        value={packData.artist}
                        onChange={(e) => handlePackInfoChange('artist', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="Your artist name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="pack-genre" className="text-slate-300 font-medium">Genre</Label>
                      <Input
                        id="pack-genre"
                        value={packData.genre}
                        onChange={(e) => handlePackInfoChange('genre', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="e.g., Hip Hop, Trap"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pack-price" className="text-slate-300 font-medium">Price (cents)</Label>
                      <Input
                        id="pack-price"
                        type="number"
                        value={packData.price}
                        onChange={(e) => handlePackInfoChange('price', parseInt(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                        placeholder="5000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pack-description" className="text-slate-300 font-medium">Description</Label>
                    <textarea
                      id="pack-description"
                      value={packData.description}
                      onChange={(e) => handlePackInfoChange('description', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Describe your beat pack..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pack-image" className="text-slate-300 font-medium">Pack Cover Image</Label>
                    <Input
                      id="pack-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePackInfoChange('imageFile', e.target.files?.[0] || null)}
                      className="bg-slate-800 border-slate-600 text-white focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="pack-published"
                      checked={packData.published}
                      onChange={(e) => handlePackInfoChange('published', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-amber-600 focus:ring-amber-500"
                    />
                    <Label htmlFor="pack-published" className="text-slate-300 font-medium">
                      Publish this pack (make it visible to all users)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        break;

      case 2:
        if (uploadType === 'single') {
          return (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3">Review & Publish</h2>
                <p className="text-slate-400 text-lg">Review your beat before publishing</p>
              </div>

              <Card className="bg-slate-900 border-2 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Beat Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Title:</span>
                      <span className="ml-2 text-white">{currentBeat.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Artist:</span>
                      <span className="ml-2 text-white">{currentBeat.artist}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Genre:</span>
                      <span className="ml-2 text-white">{currentBeat.genre}</span>
                    </div>
                     <div>
                       <span className="text-slate-400">Price:</span>
                       <span className="ml-2 text-white">${currentBeat.price.toFixed(2)}</span>
                     </div>
                    <div>
                      <span className="text-slate-400">BPM:</span>
                      <span className="ml-2 text-white">{currentBeat.bpm}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Key:</span>
                      <span className="ml-2 text-white">{currentBeat.key}</span>
                    </div>
                     <div>
                       <span className="text-slate-400">Category:</span>
                       <span className="ml-2 text-white capitalize">{currentBeat.category}</span>
                     </div>
                     <div>
                       <span className="text-slate-400">Status:</span>
                       <span className="ml-2 text-white">{currentBeat.published ? 'Published' : 'Draft'}</span>
                     </div>
                   </div>
                   {currentBeat.tags.length > 0 && (
                     <div className="mt-4">
                       <span className="text-slate-400 text-sm">Tags:</span>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {currentBeat.tags.map(tag => (
                           <span
                             key={tag}
                             className="px-2 py-1 bg-amber-600 text-white text-xs rounded-md"
                           >
                             {tag}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                </CardContent>
              </Card>
            </div>
          );
        } else {
          return (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3">Select Beats</h2>
                <p className="text-slate-400 text-lg">Choose existing beats for your pack</p>
              </div>

              <Card className="bg-slate-900 border-2 border-slate-700">
                <CardContent className="p-8">
                  <div className="text-center text-slate-400">
                    <Package className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-lg">Beat selection coming soon...</p>
                    <p className="text-sm">This feature will allow you to select from your existing beats to create packs.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        break;

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Review & Publish</h2>
              <p className="text-slate-400 text-lg">Review your pack before publishing</p>
            </div>

            <Card className="bg-slate-900 border-2 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pack Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Title:</span>
                    <span className="ml-2 text-white">{packData.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Artist:</span>
                    <span className="ml-2 text-white">{packData.artist}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Genre:</span>
                    <span className="ml-2 text-white">{packData.genre}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Price:</span>
                    <span className="ml-2 text-white">${(packData.price / 100).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Beats:</span>
                    <span className="ml-2 text-white">{packData.selectedBeats.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className="ml-2 text-white">{packData.published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-4xl font-bold">Beat Upload Wizard</h1>
          </div>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200 ${
                    index < currentStep 
                      ? 'bg-amber-600 border-amber-600 text-white' 
                      : index === currentStep
                      ? 'bg-amber-900/30 border-amber-500 text-amber-400'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}>
                    {index < currentStep ? <Check className="w-6 h-6" /> : index + 1}
                  </div>
                  <div className="ml-4">
                    <div className={`text-sm font-semibold transition-colors ${
                      index <= currentStep ? 'text-white' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-6 transition-colors ${
                    index < currentStep ? 'bg-amber-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <div>
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div>
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-amber-600 hover:bg-amber-700 text-white border-0"
                disabled={
                  (currentStep === 0 && !uploadType) ||
                  (currentStep === 1 && uploadType === 'single' && (!currentBeat.title || !currentBeat.audioFiles.mp3)) ||
                  (currentStep === 1 && uploadType === 'existing-pack' && (!packData.title || !packData.artist))
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white border-0"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Upload {uploadType === 'single' ? 'Beat' : 'Pack'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
