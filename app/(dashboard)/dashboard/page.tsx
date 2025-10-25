'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Heart, ShoppingCart, Search, Filter, Download, User, Upload, Music, Trash2, Edit, Package, Clock, Zap } from 'lucide-react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import GlobalAudioPlayer from '@/components/global-audio-player';

const genres = ["All", "Hip Hop", "Trap", "R&B", "Pop", "Electronic", "Rock"];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  // Fetch beats from the database
  const { data: beatsData, error, isLoading, mutate } = useSWR('/api/beats', fetcher);
  const beats = beatsData?.beats || [];
  
  // Fetch beat packs from the database
  const { data: packsData } = useSWR('/api/beat-packs', fetcher);
  const packs = Array.isArray(packsData) ? packsData : [];
  
  // Fetch current user to check if admin
  const { data: currentUser } = useSWR('/api/user', fetcher);

  // Filter individual beats
  const filteredBeats = beats.filter((beat: any) => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || beat.genre === selectedGenre;
    const matchesCategory = selectedCategory === 'all' || beat.category === selectedCategory;
    return matchesSearch && matchesGenre && matchesCategory;
  });

  // Filter beat packs
  const filteredPacks = packs.filter((pack: any) => {
    const matchesSearch = pack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || pack.genre === selectedGenre;
    const matchesCategory = selectedCategory === 'all' || pack.category === selectedCategory;
    return matchesSearch && matchesGenre && matchesCategory;
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

      mutate();
    } catch (err) {
      console.error('Error deleting beat:', err);
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

      mutate();
    } catch (err) {
      console.error('Error deleting pack:', err);
    }
  };

  const handleTrackPreview = (beat: any) => {
    setCurrentTrack({
      id: beat.id,
      title: beat.title,
      artist: beat.artist,
      imageFile: beat.imageFile,
      audioFile: beat.audioFiles?.mp3
    });
    setIsPlayerVisible(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerVisible(false);
    setCurrentTrack(null);
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
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Music Library</h2>
          <p className="text-gray-400">Discover and purchase premium beats and game music</p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-black border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-black border-2 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={`font-bold ${
              selectedCategory === 'all' 
                ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-500" 
                : "bg-black border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
            }`}
          >
            All Music
          </Button>
          <Button
            variant={selectedCategory === 'artist' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory('artist')}
            className={`font-bold ${
              selectedCategory === 'artist' 
                ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-500" 
                : "bg-black border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
            }`}
          >
            Beats for Artists
          </Button>
          <Button
            variant={selectedCategory === 'game' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory('game')}
            className={`font-bold ${
              selectedCategory === 'game' 
                ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-500" 
                : "bg-black border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
            }`}
          >
            Music for Games
          </Button>
        </div>

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              className={`font-bold ${
                selectedGenre === genre 
                  ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-500" 
                  : "bg-black border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
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
              <h3 className="text-2xl font-bold text-white mb-4">No Music Available</h3>
              <p className="text-gray-300 mb-6">
                You haven't uploaded any music yet. Start building your catalog by uploading your first beat or game music.
              </p>
              <Button 
                onClick={() => router.push('/admin/upload')}
                className="bg-green-500 hover:bg-green-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Track
              </Button>
            </div>
          </div>
        ) : filteredBeats.length === 0 && filteredPacks.length === 0 ? (
          // No beats match the current filter
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No music found</h3>
            <p className="text-gray-300">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {/* Individual Beats */}
            {filteredBeats.map((beat: any) => (
              <div key={beat.id} className="group bg-black rounded-lg border-2 border-gray-700 hover:border-green-500 transition-all duration-200 hover:shadow-lg">
                {/* Beat Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-900">
                  {beat.imageFile ? (
                    <img 
                      src={`/api/files/${beat.imageFile}`} 
                      alt={beat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-amber-600/20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="sm"
                      className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    >
                      <Play className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => toggleFavorite(beat.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          favorites.includes(beat.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-white'
                        }`} 
                      />
                    </Button>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <div className="absolute top-3 left-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        beat.published 
                          ? 'bg-green-500/90 text-white' 
                          : 'bg-yellow-500/90 text-white'
                      }`}>
                        {beat.published ? 'Published' : 'Draft'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Beat Info */}
                <div className="p-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate text-sm">{beat.title}</h3>
                      <p className="text-xs text-gray-400 truncate">{beat.artist}</p>
                    </div>
                    <div className="text-right ml-2">
                      <span className="text-sm font-bold text-green-500">${beat.price}</span>
                    </div>
                  </div>

                  {/* Genre Badge */}
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-600">
                      {beat.genre}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {/* Preview Button */}
                    {beat.audioFiles?.mp3 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs"
                        onClick={() => handleTrackPreview(beat)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    )}
                    
                    {/* Buy Button - Only show for non-admins */}
                    {currentUser?.role !== 'admin' && (
                      <Button 
                        size="sm" 
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xs"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Buy Now
                      </Button>
                    )}

                    
                    {/* Admin Actions */}
                    {currentUser?.role === 'admin' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1"
                          onClick={() => router.push(`/admin/edit/${beat.id}`)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1"
                          onClick={() => handleDeleteBeat(beat.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Beat Packs */}
            {filteredPacks.map((pack: any) => (
              <div key={`pack-${pack.id}`} className="group bg-black rounded-lg border-2 border-gray-700 hover:border-amber-500 transition-all duration-200 hover:shadow-lg">
                {/* Pack Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-900">
                  {pack.imageFile ? (
                    <img 
                      src={`/api/files/${pack.imageFile}`} 
                      alt={pack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="sm"
                      className="w-8 h-8 bg-amber-500 hover:bg-amber-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    >
                      <Package className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Pack
                    </div>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <div className="absolute top-3 left-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pack.published 
                          ? 'bg-green-500/90 text-white' 
                          : 'bg-yellow-500/90 text-white'
                      }`}>
                        {pack.published ? 'Published' : 'Draft'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pack Info */}
                <div className="p-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate text-sm">{pack.title}</h3>
                      <p className="text-xs text-gray-400 truncate">{pack.artist}</p>
                    </div>
                    <div className="text-right ml-2">
                      <span className="text-sm font-bold text-amber-500">${pack.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Genre Badge */}
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-600">
                      {pack.genre}
                    </span>
                  </div>

                  {/* Pack Info */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{pack.beats?.length || 0} beats</span>
                      <button 
                        className="text-xs text-amber-500 hover:text-amber-400 underline font-bold"
                        onClick={() => setSelectedPack(pack)}
                      >
                        View Details
                      </button>
                    </div>
                    {pack.beats && pack.beats.length > 1 && (
                      <div className="bg-gray-800 rounded p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Individual total:</span>
                          <span className="text-gray-300 line-through">
                            ${pack.beats.reduce((sum: number, beat: any) => sum + beat.price, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-amber-400 font-bold">Pack price:</span>
                          <span className="text-amber-500 font-bold">
                            ${pack.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-green-400 font-bold">You save:</span>
                          <span className="text-green-500 font-bold">
                            ${(pack.beats.reduce((sum: number, beat: any) => sum + beat.price, 0) - pack.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pack Actions */}
                  <div className="space-y-2">
                    {/* Buy Button - Only show for non-admins */}
                    {currentUser?.role !== 'admin' && (
                      <Button 
                        size="sm" 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Buy Pack
                      </Button>
                    )}
                    
                    {/* Admin Actions */}
                    {currentUser?.role === 'admin' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1"
                          onClick={() => router.push(`/admin/edit-pack/${pack.id}`)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1"
                          onClick={() => handleDeletePack(pack.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pack Details Modal */}
      {selectedPack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-2 border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedPack.title}</h2>
                <p className="text-gray-400">{selectedPack.artist}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPack(null)}
                className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
              >
                ✕
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Pack Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-amber-500">${selectedPack.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-400">{selectedPack.beats?.length || 0} beats included</div>
                    </div>
                  </div>
                  {selectedPack.beats && selectedPack.beats.length > 1 && (
                    <div className="bg-gray-800 rounded-lg p-4 text-right">
                      <div className="text-sm text-gray-400 mb-1">Individual total:</div>
                      <div className="text-lg text-gray-300 line-through">
                        ${selectedPack.beats.reduce((sum: number, beat: any) => sum + beat.price, 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-green-400 mt-1">You save:</div>
                      <div className="text-xl font-bold text-green-500">
                        ${(selectedPack.beats.reduce((sum: number, beat: any) => sum + beat.price, 0) - selectedPack.price).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pack Beats List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Included Beats:</h3>
                {selectedPack.beats?.map((beat: any, index: number) => (
                  <div key={beat.id} className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                    <div className="flex items-center gap-4">
                      {/* Beat Image */}
                      <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {beat.imageFile ? (
                          <img 
                            src={`/api/files/${beat.imageFile}`} 
                            alt={beat.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-amber-600/20 flex items-center justify-center">
                            <Music className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Beat Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{beat.title}</h4>
                        <p className="text-sm text-gray-400 truncate">{beat.artist}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-600">
                            {beat.genre}
                          </span>
                          <span className="text-xs text-gray-500">
                            {beat.duration || 'N/A'} • {beat.bpm ? `${beat.bpm} BPM` : 'N/A'} • {beat.key || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Beat Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-500">${beat.price.toFixed(2)}</div>
                      </div>

                      {/* Preview Button */}
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleTrackPreview(beat)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Download includes: MP3, WAV, Stems
                </div>
                {currentUser?.role !== 'admin' && (
                  <Button 
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Pack - ${selectedPack.price.toFixed(2)}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Audio Player */}
      <GlobalAudioPlayer
        key={currentTrack?.id || 'no-track'}
        isVisible={isPlayerVisible}
        currentTrack={currentTrack}
        onClose={handleClosePlayer}
      />
    </div>
  );
}