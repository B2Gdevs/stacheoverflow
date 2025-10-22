'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Heart, ShoppingCart, Search, Filter, Download, User, Upload, Music, Trash2, Edit, Package } from 'lucide-react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const genres = ["All", "Hip Hop", "Trap", "R&B", "Pop", "Electronic", "Rock"];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch beats from the database
  const { data: beatsData, error, isLoading, mutate } = useSWR('/api/beats', fetcher);
  const beats = beatsData?.beats || [];
  
  // Fetch beat packs from the database
  const { data: packsData } = useSWR('/api/beat-packs', fetcher);
  const packs = packsData || [];
  
  // Fetch current user to check if admin
  const { data: currentUser } = useSWR('/api/user', fetcher);

  // Filter individual beats
  const filteredBeats = beats.filter((beat: any) => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || beat.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  // Filter beat packs
  const filteredPacks = packs.filter((pack: any) => {
    const matchesSearch = pack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || pack.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const toggleFavorite = (beatId: number) => {
    setFavorites(prev => 
      prev.includes(beatId) 
        ? prev.filter(id => id !== beatId)
        : [...prev, beatId]
    );
  };

  const handleDeleteBeat = async (beatId: number) => {
    if (!confirm('Are you sure you want to delete this beat? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/beats?id=${beatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete beat');
      }

      // Refresh the beats list
      mutate();
      alert('Beat deleted successfully!');
    } catch (error) {
      console.error('Error deleting beat:', error);
      alert('Failed to delete beat. Please try again.');
    }
  };

  const handleDeletePack = async (packId: number) => {
    if (!confirm('Are you sure you want to delete this pack? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/beat-packs/${packId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete pack');
      }

      // Refresh the data
      mutate();
      alert('Pack deleted successfully!');
    } catch (error) {
      console.error('Error deleting pack:', error);
      alert('Failed to delete pack. Please try again.');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading beats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Artist Preview Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-amber-600/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">StachO</h2>
            <p className="text-gray-300">Producer & Beatmaker</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-green-500 hover:bg-green-600">
            <Play className="h-4 w-4 mr-2" />
            Artist Preview
          </Button>
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Download className="h-4 w-4 mr-2" />
            Download Bio
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Beats</h1>
          <p className="text-gray-300 mt-1">Discover and purchase premium beats</p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search beats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGenre(genre)}
            className={`rounded-full ${
              selectedGenre === genre 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300"
            }`}
          >
            {genre}
          </Button>
        ))}
      </div>

      {/* Beats and Packs Grid or Empty State */}
      {beats.length === 0 && packs.length === 0 ? (
        // Empty State - No beats in database
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Beats Available</h3>
            <p className="text-gray-300 mb-6">
              You haven't uploaded any beats yet. Start building your music catalog by uploading your first beat.
            </p>
            <Button 
              onClick={() => router.push('/admin/upload')}
              className="bg-green-500 hover:bg-green-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Beat
            </Button>
          </div>
        </div>
      ) : filteredBeats.length === 0 && filteredPacks.length === 0 ? (
        // No beats match the current filter
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No beats found</h3>
          <p className="text-gray-300">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        // Beats and Packs Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Individual Beats */}
          {filteredBeats.map((beat: any) => (
            <Card key={beat.id} className="group hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                {/* Beat Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-800">
                  {beat.imageFile ? (
                    <img 
                      src={`/api/files/${beat.imageFile}`} 
                      alt={beat.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-amber-600/20" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Play className="h-6 w-6 text-gray-900 ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(beat.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          favorites.includes(beat.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-600'
                        }`} 
                      />
                    </Button>
                  </div>
                </div>

                {/* Beat Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-white">{beat.title}</h3>
                      <p className="text-sm text-gray-300">{beat.artist}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-500">${beat.price}</span>
                      <div className="mt-1 flex flex-col gap-1">
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          {beat.genre}
                        </span>
                        {currentUser?.role === 'admin' && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            beat.published 
                              ? 'bg-green-600 text-white' 
                              : 'bg-yellow-600 text-white'
                          }`}>
                            {beat.published ? 'Published' : 'Draft'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Beat Details */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>{beat.duration || 'N/A'}</span>
                    <span>{beat.bpm ? `${beat.bpm} BPM` : 'N/A'}</span>
                    <span>{beat.key || 'N/A'}</span>
                  </div>

                  {/* Audio Player */}
                  {beat.audioFiles?.mp3 && (
                    <div className="mb-4">
                      <audio 
                        controls 
                        className="w-full h-10 bg-gray-800 rounded-lg"
                        preload="metadata"
                      >
                        <source src={`/api/files/${beat.audioFiles.mp3}`} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-1">
                      {beat.audioFiles?.mp3 && (
                        <Button size="sm" variant="outline" className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download MP3
                        </Button>
                      )}
                      {beat.audioFiles?.wav && (
                        <Button size="sm" variant="outline" className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download WAV
                        </Button>
                      )}
                      {beat.audioFiles?.stems && (
                        <Button size="sm" variant="outline" className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download Stems
                        </Button>
                      )}
                    </div>
                    
                    {/* Admin Actions */}
                    {currentUser?.role === 'admin' && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300 text-xs flex-1"
                          onClick={() => router.push(`/admin/edit/${beat.id}`)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300 text-xs flex-1"
                          onClick={() => handleDeleteBeat(beat.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Beat Packs */}
          {filteredPacks.map((pack: any) => (
            <Card key={`pack-${pack.id}`} className="group hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                {/* Pack Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-800">
                  {pack.imageFile ? (
                    <img 
                      src={`/api/files/${pack.imageFile}`} 
                      alt={pack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Package className="h-6 w-6 text-gray-900" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Pack
                    </div>
                  </div>
                </div>

                {/* Pack Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-white">{pack.title}</h3>
                      <p className="text-sm text-gray-300">{pack.artist}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-amber-500">${(pack.price / 100).toFixed(2)}</span>
                      <div className="mt-1 flex flex-col gap-1">
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          {pack.genre}
                        </span>
                        {currentUser?.role === 'admin' && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            pack.published 
                              ? 'bg-green-600 text-white' 
                              : 'bg-yellow-600 text-white'
                          }`}>
                            {pack.published ? 'Published' : 'Draft'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Pack Beats List with Pricing */}
                    {pack.beats && pack.beats.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400 font-medium">
                            {pack.beats.length} beats included:
                          </div>
                          <button 
                            className="text-xs text-amber-500 hover:text-amber-400 underline"
                            onClick={() => {
                              // Toggle collapse for beat details
                              const element = document.getElementById(`pack-beats-${pack.id}`);
                              if (element) {
                                element.classList.toggle('hidden');
                              }
                            }}
                          >
                            {document.getElementById(`pack-beats-${pack.id}`)?.classList.contains('hidden') ? 'Show' : 'Hide'} details
                          </button>
                        </div>
                        
                        {/* Collapsible Beat Details */}
                        <div id={`pack-beats-${pack.id}`} className="space-y-1 max-h-32 overflow-y-auto">
                          {pack.beats.map((beat: any) => (
                            <div key={beat.id} className="flex items-center justify-between text-xs bg-gray-800 rounded px-2 py-1">
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-300 truncate">{beat.title}</span>
                                <span className="text-gray-500 ml-2">• {beat.genre}</span>
                              </div>
                              <span className="text-green-500 font-medium">${beat.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pack Discount Info */}
                        {pack.beats.length > 1 && (
                          <div className="bg-gray-800 rounded p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Individual total:</span>
                              <span className="text-gray-300 line-through">
                                ${pack.beats.reduce((sum: number, beat: any) => sum + beat.price, 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-amber-400 font-medium">Pack price:</span>
                              <span className="text-amber-500 font-bold">
                                ${(pack.price / 100).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-green-400 font-medium">You save:</span>
                              <span className="text-green-500 font-bold">
                                ${(pack.beats.reduce((sum: number, beat: any) => sum + beat.price, 0) - (pack.price / 100)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Download Options */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{pack.beats?.length || 0} beats</span>
                        <div className="flex gap-1">
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            MP3
                          </span>
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            WAV
                          </span>
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            Stems
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Buy Pack
                      </Button>
                    </div>
                  </div>
                  
                  {/* Admin Actions */}
                  {currentUser?.role === 'admin' && (
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300 text-xs flex-1"
                        onClick={() => router.push(`/admin/edit-pack/${pack.id}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-black border-white text-white hover:bg-gray-800 hover:border-gray-300 text-xs flex-1"
                        onClick={() => handleDeletePack(pack.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}