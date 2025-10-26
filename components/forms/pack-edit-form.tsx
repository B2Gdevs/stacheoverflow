'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Save, Trash2, ArrowLeft, Plus, X, Music, Upload } from 'lucide-react';
import useSWR from 'swr';
import { BeatSearch } from '@/components/utils';

interface Beat {
  id: number;
  title: string;
  artist: string;
  genre: string;
  price: number;
  duration: number | null;
  bpm: number | null;
  key: string | null;
  description: string | null;
  audioFiles: {
    mp3: string | null;
    wav: string | null;
    stems: string | null;
  };
  imageFile: string | null;
  published: boolean;
  category: string;
  tags: string[];
}

interface Pack {
  id: number;
  title: string;
  artist: string;
  genre: string;
  price: number;
  description: string | null;
  imageFile: string | null;
  published: boolean;
  beats: Beat[];
}

interface PackEditFormProps {
  pack: Pack;
  onCancel?: () => void;
  onComplete?: (result: any) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PackEditForm({ pack, onCancel, onComplete }: PackEditFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: pack.title,
    artist: pack.artist,
    genre: pack.genre,
    price: pack.price, // This is already in dollars from the API
    description: pack.description || '',
    published: pack.published,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(pack.imageFile);
  const [selectedBeats, setSelectedBeats] = useState<number[]>(pack.beats.map(beat => beat.id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select current beats in pack
  useEffect(() => {
    setSelectedBeats(pack.beats.map(beat => beat.id));
  }, [pack.beats]);

  // Calculate savings based on currently selected beats
  const calculateSavings = () => {
    // Get the total of currently selected beats
    const selectedBeatsData = pack.beats.filter(beat => selectedBeats.includes(beat.id));
    const individualTotal = selectedBeatsData.reduce((sum, beat) => sum + beat.price, 0);
    const packPrice = parseFloat(formData.price.toString()) || 0;
    const dollarSavings = individualTotal - packPrice;
    const percentageSavings = individualTotal > 0 ? (dollarSavings / individualTotal) * 100 : 0;
    
    return {
      individualTotal,
      packPrice,
      dollarSavings,
      percentageSavings,
      selectedBeatsCount: selectedBeatsData.length
    };
  };

  const savings = calculateSavings();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBeatToggle = (beatId: number) => {
    setSelectedBeats(prev => 
      prev.includes(beatId) 
        ? prev.filter(id => id !== beatId)
        : [...prev, beatId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let imageFilePath = pack.imageFile;

      // Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadResult = await uploadResponse.json();
        imageFilePath = uploadResult.fileName;
      }

      // Update pack data
      const updateData = {
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        price: Math.round(formData.price * 100), // Convert from dollars to cents for database
        description: formData.description || null,
        imageFile: imageFilePath,
        published: formData.published,
        selectedBeats: selectedBeats
      };

      const response = await fetch(`/api/beat-packs/${pack.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update pack');
      }

      if (onComplete) {
        onComplete(await response.json());
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this pack? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/beat-packs/${pack.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete pack');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pack');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-md">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header with Cover Image */}
          <div className="flex items-start gap-6">
            {/* Cover Image Upload */}
            <div className="relative">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-800 border-2 border-gray-600">
                {imagePreview ? (
                  <img
                    src={imagePreview.startsWith('data:') ? imagePreview : `/api/files/${imagePreview}`}
                    alt="Pack cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>
              <label
                htmlFor="image"
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
              >
                <Upload className="h-6 w-6 text-white" />
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Pack Basic Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Pack Title</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData.price}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                />
                <Label htmlFor="published" className="text-gray-300">
                  Publish this pack (make it visible to all users)
                </Label>
              </div>
            </div>
          </div>

          {/* Savings Calculator */}
          {pack.beats.length > 0 && (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Pack Value Calculator</h3>
                  <p className="text-sm text-gray-400">
                    Based on {savings.selectedBeatsCount} selected beat{savings.selectedBeatsCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {savings.percentageSavings > 0 && (
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {savings.percentageSavings.toFixed(0)}% OFF
                    </span>
                  )}
                  {savings.dollarSavings > 0 && (
                    <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Save ${savings.dollarSavings.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-400 mb-1">Individual Total</div>
                  <div className="text-lg font-semibold text-gray-300 line-through">
                    ${savings.individualTotal.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 mb-1">Pack Price</div>
                  <div className="text-lg font-semibold text-amber-500">
                    ${savings.packPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 mb-1">Customer Saves</div>
                  <div className={`text-lg font-bold ${savings.dollarSavings > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${savings.dollarSavings.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {savings.dollarSavings < 0 && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                  <div className="text-red-400 text-sm">
                    ⚠️ Pack price is higher than individual total. Consider lowering the price for better value.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tabs for Beats and Details */}
          <Tabs defaultValue="beats" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="beats" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Beats ({selectedBeats.length})
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Listing Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beats" className="mt-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Manage Pack Beats</CardTitle>
                  <p className="text-gray-400 text-sm">
                    Search and select beats to include in this pack
                  </p>
                </CardHeader>
                <CardContent>
                  <BeatSearch
                    selectedBeats={selectedBeats}
                    onBeatToggle={handleBeatToggle}
                    excludeBeats={[]}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Pack Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe the pack..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.back())}
              className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Pack'}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Pack
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
