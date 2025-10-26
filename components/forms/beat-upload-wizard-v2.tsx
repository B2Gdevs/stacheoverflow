'use client';

import React from 'react';
import { Music, Package, Upload, FileText, Search, Check } from 'lucide-react';
import { 
  WizardProvider, 
  WizardContainer, 
  WizardHeader, 
  WizardProgress, 
  WizardStepContainer, 
  WizardNavigation,
  WizardCard,
  WizardStep,
  UploadType,
  Category,
  CATEGORY_OPTIONS,
  GENRE_OPTIONS,
  CATEGORY_TAGS,
  useWizard
} from '@/lib/wizard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BeatData, PackData, WizardData } from '@/lib/wizard/types';

interface BeatUploadWizardProps {
  onCancel?: () => void;
  onComplete?: (result: any) => void;
}

// API submission functions
async function submitSingleBeat(beat: any) {
  const formData = new FormData();
  
  // Add beat data
  formData.append('title', beat.title);
  formData.append('artist', beat.artist);
  formData.append('genre', beat.genre);
  formData.append('bpm', beat.bpm.toString());
  formData.append('key', beat.key);
  formData.append('price', beat.price.toString());
  formData.append('description', beat.description);
  formData.append('category', beat.category);
  formData.append('tags', JSON.stringify(beat.tags));
  formData.append('published', beat.published.toString());
  
  // Add audio files
  if (beat.audioFiles.mp3) {
    formData.append('mp3File', beat.audioFiles.mp3);
  }
  if (beat.audioFiles.wav) {
    formData.append('wavFile', beat.audioFiles.wav);
  }
  if (beat.audioFiles.stems) {
    formData.append('stemsFile', beat.audioFiles.stems);
  }
  
  // Add cover image
  if (beat.imageFile) {
    formData.append('imageFile', beat.imageFile);
  }

  const response = await fetch('/api/beats', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create beat');
  }

  return await response.json();
}

async function submitBeatPack(pack: any, selectedBeats: any[]) {
  const formData = new FormData();
  
  // Add pack data
  formData.append('title', pack.title);
  formData.append('artist', pack.artist);
  formData.append('genre', pack.genre);
  formData.append('price', pack.price.toString());
  formData.append('description', pack.description);
  formData.append('published', pack.published.toString());
  formData.append('selectedBeats', JSON.stringify(selectedBeats.map(beat => beat.id)));
  
  // Add cover image
  if (pack.imageFile) {
    formData.append('imageFile', pack.imageFile);
  }

  const response = await fetch('/api/beat-packs', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create beat pack');
  }

  return await response.json();
}

// Step Components
function SelectTypeStep() {
  const { data, updateData, goToStep } = useWizard();

  const handleTypeSelect = (type: UploadType) => {
    updateData({ uploadType: type });
    
    // Automatically advance to the next step
    if (type === UploadType.SINGLE) {
      goToStep(WizardStep.BEAT_INFO);
    } else {
      goToStep(WizardStep.PACK_INFO);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <WizardCard
        title="Single Beat"
        description="Upload a single beat or track"
        icon={<Music className="h-6 w-6" />}
        onClick={() => handleTypeSelect(UploadType.SINGLE)}
        isSelected={data.uploadType === UploadType.SINGLE}
      />
      <WizardCard
        title="Beat Pack"
        description="Create a pack from existing beats"
        icon={<Package className="h-6 w-6" />}
        onClick={() => handleTypeSelect(UploadType.PACK)}
        isSelected={data.uploadType === UploadType.PACK}
      />
    </div>
  );
}

function BeatInfoStep() {
  const { data, updateData, goToStep } = useWizard();
  const { beat } = data;

  const handleInputChange = (field: keyof BeatData, value: any) => {
    updateData({
      beat: { ...beat, [field]: value }
    });
  };

  // Don't auto-advance - let user manually proceed

  const handleCategoryChange = (category: Category) => {
    const availableTags = CATEGORY_TAGS[category];
    handleInputChange('category', category);
    handleInputChange('tags', []);
  };

  const addTag = (tag: string) => {
    if (!beat.tags.includes(tag)) {
      handleInputChange('tags', [...beat.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
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
          className="bg-black border-2 border-gray-600 text-white"
          placeholder="0.00"
        />
      </div>

      <div>
        <Label className="text-white font-bold">Category *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {CATEGORY_OPTIONS.map(option => (
            <Card
              key={option.value}
              onClick={() => handleCategoryChange(option.value)}
              className={`cursor-pointer transition-all duration-200 ${
                beat.category === option.value
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              <CardContent className="p-4">
                <h3 className="font-bold text-white">{option.label}</h3>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white font-bold">Tags</Label>
        <div className="mt-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORY_TAGS[beat.category]?.map(tag => (
              <Button
                key={tag}
                size="sm"
                variant={beat.tags.includes(tag) ? 'default' : 'outline'}
                onClick={() => beat.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                className={`
                  cursor-pointer
                  ${beat.tags.includes(tag) 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                {tag}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {beat.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-green-500/20 text-green-300 border border-green-500/30">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-green-300 hover:text-white cursor-pointer"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-white font-bold">Description</Label>
        <textarea
          id="description"
          value={beat.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full p-3 bg-black border-2 border-gray-600 text-white rounded-md h-24 resize-none cursor-text"
          placeholder="Describe your beat..."
        />
      </div>
    </div>
  );
}

function PackInfoStep() {
  const { data, updateData, goToStep } = useWizard();
  const { pack } = data;

  const handleInputChange = (field: keyof PackData, value: any) => {
    updateData({
      pack: { ...pack, [field]: value }
    });
  };

  // Don't auto-advance - let user manually proceed

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
          <Label htmlFor="pack-price" className="text-white font-bold">Pack Price ($) *</Label>
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
            className="w-full p-3 bg-black border-2 border-gray-600 text-white rounded-md h-24 resize-none cursor-text"
          placeholder="Describe your beat pack..."
        />
      </div>
    </div>
  );
}

function UploadFilesStep() {
  const { data, updateData } = useWizard();
  const { beat } = data;

  const handleFileChange = (fileType: keyof typeof beat.audioFiles, file: File | null) => {
    updateData({
      beat: {
        ...beat,
        audioFiles: {
          ...beat.audioFiles,
          [fileType]: file
        }
      }
    });
  };

  const handleImageChange = (file: File | null) => {
    updateData({
      beat: {
        ...beat,
        imageFile: file
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Upload Files</h3>
        <p className="text-gray-400 text-sm mb-6">Upload your audio files and cover image</p>
      </div>

      {/* Audio Files */}
      <div className="space-y-4">
        <h4 className="text-white font-bold">Audio Files</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="mp3" className="text-white font-bold">MP3 File</Label>
            <input
              id="mp3"
              type="file"
              accept=".mp3"
              onChange={(e) => handleFileChange('mp3', e.target.files?.[0] || null)}
              className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-pointer file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
            />
            {beat.audioFiles.mp3 && (
              <p className="text-green-400 text-xs mt-1">✓ {beat.audioFiles.mp3.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="wav" className="text-white font-bold">WAV File</Label>
            <input
              id="wav"
              type="file"
              accept=".wav"
              onChange={(e) => handleFileChange('wav', e.target.files?.[0] || null)}
              className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-pointer file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
            />
            {beat.audioFiles.wav && (
              <p className="text-green-400 text-xs mt-1">✓ {beat.audioFiles.wav.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="stems" className="text-white font-bold">Stems File</Label>
            <input
              id="stems"
              type="file"
              accept=".zip,.rar"
              onChange={(e) => handleFileChange('stems', e.target.files?.[0] || null)}
              className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-pointer file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
            />
            {beat.audioFiles.stems && (
              <p className="text-green-400 text-xs mt-1">✓ {beat.audioFiles.stems.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-4">
        <h4 className="text-white font-bold">Cover Image</h4>
        
        <div>
          <Label htmlFor="image" className="text-white font-bold">Cover Image *</Label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
            className="w-full p-2 bg-black border-2 border-gray-600 text-white rounded-md cursor-pointer file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
          />
          {beat.imageFile && (
            <p className="text-green-400 text-xs mt-1">✓ {beat.imageFile.name}</p>
          )}
        </div>

        {beat.imageFile && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(beat.imageFile)}
              alt="Cover preview"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600"
            />
          </div>
        )}
      </div>

      {/* File Requirements */}
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
        <h4 className="text-white font-bold mb-2">File Requirements</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• MP3: Optional, max 50MB</li>
          <li>• WAV: Optional, max 100MB</li>
          <li>• <span className="text-green-400 font-bold">At least one audio file (MP3 or WAV) is required</span></li>
          <li>• Stems: Optional, ZIP/RAR format</li>
          <li>• Cover Image: Required, JPG/PNG, max 10MB</li>
        </ul>
      </div>
    </div>
  );
}

function SelectBeatsStep() {
  const { data, updateData, goToStep } = useWizard();
  const { selectedBeats } = data;
  const [beats, setBeats] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Fetch available beats
  React.useEffect(() => {
    const fetchBeats = async () => {
      try {
        const response = await fetch('/api/beats');
        const data = await response.json();
        setBeats(data.beats || []);
      } catch (error) {
        console.error('Error fetching beats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, []);

  const filteredBeats = beats.filter(beat => 
    beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beat.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beat.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBeatSelection = (beat: any) => {
    const isSelected = selectedBeats.some(b => b.id === beat.id);
    if (isSelected) {
      updateData({
        selectedBeats: selectedBeats.filter(b => b.id !== beat.id)
      });
    } else {
      updateData({
        selectedBeats: [...selectedBeats, beat]
      });
    }
  };

  // Don't auto-advance - let user manually proceed

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white">Loading beats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Select Beats for Pack</h3>
        <p className="text-gray-400 mb-4">Choose beats from your existing listings to include in this pack</p>
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search beats by title, artist, or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredBeats.map(beat => {
            const isSelected = selectedBeats.some(b => b.id === beat.id);
            return (
              <div
                key={beat.id}
                onClick={() => toggleBeatSelection(beat)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-green-900 border-green-500' 
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white truncate">{beat.title}</h4>
                  {isSelected && <span className="text-green-400">✓</span>}
                </div>
                <p className="text-gray-400 text-sm">{beat.artist}</p>
                <p className="text-gray-500 text-xs">{beat.genre}</p>
                <p className="text-green-400 font-bold">${beat.price.toFixed(2)}</p>
              </div>
            );
          })}
        </div>

        {filteredBeats.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No beats found matching your search.
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-800 rounded-lg border-2 border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-bold">Selected Beats: {selectedBeats.length}</p>
            {selectedBeats.length > 0 && (
              <span className="text-green-400 text-sm font-bold">
                ✓ Ready to proceed
              </span>
            )}
          </div>
          {selectedBeats.length > 0 && (
            <div className="mt-2 space-y-1">
              {selectedBeats.map(beat => (
                <div key={beat.id} className="text-gray-400 text-sm">
                  • {beat.title} by {beat.artist} - ${beat.price.toFixed(2)}
                </div>
              ))}
            </div>
          )}
          {selectedBeats.length === 0 && (
            <p className="text-gray-500 text-sm">Select beats by clicking on them above</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewStep() {
  const { data, complete } = useWizard();
  const { uploadType, beat, pack, selectedBeats } = data;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = () => {
    const errors = [];
    
    if (uploadType === UploadType.SINGLE) {
      if (!beat.title) errors.push('Title is required');
      if (!beat.artist) errors.push('Artist is required');
      if (!beat.genre) errors.push('Genre is required');
      if (!beat.price || beat.price <= 0) errors.push('Price is required and must be greater than 0');
      
      // Check if at least one audio file is provided (MP3 or WAV)
      if (!beat.audioFiles.mp3 && !beat.audioFiles.wav) {
        errors.push('At least one audio file (MP3 or WAV) is required');
      }
      
      if (!beat.imageFile) errors.push('Cover image is required');
    } else {
      if (!pack.title) errors.push('Pack title is required');
      if (!pack.artist) errors.push('Artist is required');
      if (!pack.genre) errors.push('Genre is required');
      if (!pack.price || pack.price <= 0) errors.push('Price is required and must be greater than 0');
      if (selectedBeats.length === 0) errors.push('At least one beat must be selected');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    try {
      await complete();
    } catch (error) {
      console.error('Submission error:', error);
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
                <Label className="text-gray-400">Title</Label>
                <p className="text-white font-bold">{beat.title}</p>
              </div>
              <div>
                <Label className="text-gray-400">Artist</Label>
                <p className="text-white font-bold">{beat.artist}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-400">Genre</Label>
                <p className="text-white">{beat.genre}</p>
              </div>
              <div>
                <Label className="text-gray-400">BPM</Label>
                <p className="text-white">{beat.bpm}</p>
              </div>
              <div>
                <Label className="text-gray-400">Key</Label>
                <p className="text-white">{beat.key}</p>
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Price</Label>
              <p className="text-green-500 font-bold text-xl">${beat.price.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-gray-400">Category</Label>
              <p className="text-white">{beat.category}</p>
            </div>
            {beat.tags.length > 0 && (
              <div>
                <Label className="text-gray-400">Tags</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {beat.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-green-500/20 text-green-300 border border-green-500/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {beat.description && (
              <div>
                <Label className="text-gray-400">Description</Label>
                <p className="text-white">{beat.description}</p>
              </div>
            )}
            <div>
              <Label className="text-gray-400">Files</Label>
              <div className="space-y-1 mt-1">
                {beat.audioFiles.mp3 && (
                  <p className="text-green-400 text-sm">✓ MP3: {beat.audioFiles.mp3.name}</p>
                )}
                {beat.audioFiles.wav && (
                  <p className="text-green-400 text-sm">✓ WAV: {beat.audioFiles.wav.name}</p>
                )}
                {beat.audioFiles.stems && (
                  <p className="text-green-400 text-sm">✓ Stems: {beat.audioFiles.stems.name}</p>
                )}
                {beat.imageFile && (
                  <p className="text-green-400 text-sm">✓ Cover: {beat.imageFile.name}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Pack Title</Label>
                <p className="text-white font-bold">{pack.title}</p>
              </div>
              <div>
                <Label className="text-gray-400">Artist</Label>
                <p className="text-white font-bold">{pack.artist}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Genre</Label>
                <p className="text-white">{pack.genre}</p>
              </div>
              <div>
                <Label className="text-gray-400">Pack Price</Label>
                <p className="text-green-500 font-bold text-xl">${pack.price.toFixed(2)}</p>
              </div>
            </div>
            {pack.description && (
              <div>
                <Label className="text-gray-400">Description</Label>
                <p className="text-white">{pack.description}</p>
              </div>
            )}
            {pack.selectedBeats.length > 0 && (
              <div>
                <Label className="text-gray-400">Selected Beats ({pack.selectedBeats.length})</Label>
                <div className="space-y-2 mt-2">
                  {pack.selectedBeats.map((beat, index) => (
                    <div key={index} className="bg-gray-700 rounded p-3">
                      <p className="text-white font-bold">{beat.title}</p>
                      <p className="text-gray-400 text-sm">{beat.artist} • {beat.genre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 px-6 py-3 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-bold cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            `Submit ${uploadType === UploadType.SINGLE ? 'Beat' : 'Pack'}`
          )}
        </Button>
      </div>
    </div>
  );
}

// Main Wizard Component
function BeatUploadWizardContent({ onCancel, onComplete }: BeatUploadWizardProps) {
  const { state, data, goToStep } = useWizard();

  const getStepsForType = (uploadType: UploadType) => {
    if (uploadType === UploadType.SINGLE) {
      return [
        WizardStep.SELECT_TYPE,
        WizardStep.BEAT_INFO,
        WizardStep.UPLOAD_FILES,
        WizardStep.REVIEW
      ];
    } else {
      return [
        WizardStep.SELECT_TYPE,
        WizardStep.PACK_INFO,
        WizardStep.SELECT_BEATS,
        WizardStep.REVIEW
      ];
    }
  };

  const getCurrentStepIndex = () => {
    const steps = getStepsForType(data.uploadType);
    return steps.indexOf(state.currentStep);
  };

  const getCurrentSteps = () => {
    return getStepsForType(data.uploadType);
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case WizardStep.SELECT_TYPE:
        return <SelectTypeStep />;
      case WizardStep.BEAT_INFO:
        return <BeatInfoStep />;
      case WizardStep.UPLOAD_FILES:
        return <UploadFilesStep />;
      case WizardStep.PACK_INFO:
        return <PackInfoStep />;
      case WizardStep.SELECT_BEATS:
        return <SelectBeatsStep />;
      case WizardStep.REVIEW:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  const steps = getCurrentSteps();
  const currentStepIndex = getCurrentStepIndex();
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Navigation handlers
  const handleNext = () => {
    if (isLastStep) {
      return; // Review step handles its own submission
    }

    // Validation before proceeding
    if (state.currentStep === WizardStep.BEAT_INFO) {
      const { beat } = data;
      if (!beat.title || !beat.artist || !beat.genre || !beat.price || beat.price <= 0) {
        alert('Please fill in all required fields (Title, Artist, Genre, Price)');
        return;
      }
    }

    if (state.currentStep === WizardStep.PACK_INFO) {
      const { pack } = data;
      if (!pack.title || !pack.artist || !pack.genre || !pack.price || pack.price <= 0) {
        alert('Please fill in all required fields (Pack Title, Artist, Genre, Price)');
        return;
      }
    }

    if (state.currentStep === WizardStep.SELECT_BEATS) {
      if (data.selectedBeats.length === 0) {
        alert('Please select at least one beat for the pack');
        return;
      }
    }
    
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      goToStep(steps[nextStepIndex]);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      return;
    }
    
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      goToStep(steps[prevStepIndex]);
    }
  };

  return (
    <WizardContainer>
      <WizardHeader
        title="Upload Music"
        description="Create and upload your beats or create beat packs"
      />
      
      <WizardProgress steps={steps} />

      <WizardNavigation
        onCancel={onCancel}
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={!isFirstStep}
        canGoNext={!isLastStep}
        nextText="Next →"
        className="mb-6"
      />

      <WizardStepContainer>
        {renderStep()}
      </WizardStepContainer>
    </WizardContainer>
  );
}

// Main Export
export function BeatUploadWizard({ onCancel, onComplete }: BeatUploadWizardProps) {
  const initialData: WizardData = {
    uploadType: UploadType.SINGLE,
    beat: {
      title: '',
      artist: '',
      genre: '',
      price: 0,
      duration: '',
      bpm: 0,
      key: '',
      description: '',
      category: Category.ARTIST,
      tags: [],
      audioFiles: {
        mp3: null,
        wav: null,
        stems: null
      },
      imageFile: null,
      published: false
    },
    pack: {
      title: '',
      artist: '',
      genre: '',
      price: 0,
      description: '',
      imageFile: null,
      selectedBeats: [],
      published: false
    },
    selectedBeats: []
  };

  // Start with single beat steps by default
  const getStepsForType = (uploadType: UploadType) => {
    if (uploadType === UploadType.SINGLE) {
      return [
        WizardStep.SELECT_TYPE,
        WizardStep.BEAT_INFO,
        WizardStep.UPLOAD_FILES,
        WizardStep.REVIEW
      ];
    } else {
      return [
        WizardStep.SELECT_TYPE,
        WizardStep.PACK_INFO,
        WizardStep.SELECT_BEATS,
        WizardStep.REVIEW
      ];
    }
  };

  const handleComplete = async (data: WizardData) => {
    try {
      if (data.uploadType === UploadType.SINGLE) {
        // Submit single beat
        await submitSingleBeat(data.beat);
      } else {
        // Submit beat pack
        await submitBeatPack(data.pack, data.selectedBeats);
      }
      
      // Call the original onComplete callback
      if (onComplete) {
        onComplete(data);
      }
    } catch (error) {
      console.error('Error submitting wizard data:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const config = {
    steps: [
      WizardStep.SELECT_TYPE,
      WizardStep.BEAT_INFO,
      WizardStep.UPLOAD_FILES,
      WizardStep.PACK_INFO,
      WizardStep.SELECT_BEATS,
      WizardStep.REVIEW
    ], // Include all possible steps
    initialData,
    onComplete: handleComplete,
    onCancel
  };

  return (
    <WizardProvider config={config}>
      <BeatUploadWizardContent onCancel={onCancel} onComplete={onComplete} />
    </WizardProvider>
  );
}
