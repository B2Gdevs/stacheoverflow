'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Heart, ShoppingCart, Search, Filter, Download, User, Upload, Music, Trash2, Edit, Package, Clock, Zap } from 'lucide-react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useAudio, PlayButton } from '@/lib/audio';
import { GlobalAudioPlayer } from '@/components/audio';
import { fetcher, CACHE_KEYS } from '@/lib/swr/config';

const genres = ["All", "Hip Hop", "Trap", "R&B", "Pop", "Electronic", "Rock"];

// Helper to get image URL - uses imageUrl from API response (Supabase signed URL)
function getImageUrl(beat: any): string {
  // Use imageUrl from API response (Supabase signed URL) - this is the normal way
  if (beat.imageUrl) {
    return beat.imageUrl;
  }
  
  // Fallback to imageFile if imageUrl not available
  if (beat.imageFile) {
    // If it's already a full URL, return it
    if (beat.imageFile.startsWith('http')) {
      return beat.imageFile;
    }
  }
  
  return '';
}

// Using shared fetcher from SWR config

export function DashboardContent() {
  const router = useRouter();
  const { playTrack, currentTrack, playerState, toggleTrack } = useAudio();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedPack, setSelectedPack] = useState<any>(null);

  // Fetch beats from the database (cached for 4 hours)
  // Images now include signed URLs directly in the response
  const { data: beatsData, error, isLoading, mutate } = useSWR(CACHE_KEYS.BEATS, fetcher);
  const beats = beatsData?.beats || [];
  
  // Fetch beat packs from the database (cached for 4 hours)
  // Images now include signed URLs directly in the response
  const { data: packsData, error: packsError, isLoading: packsLoading, mutate: mutatePacks } = useSWR(CACHE_KEYS.BEAT_PACKS, fetcher);
  const packs = Array.isArray(packsData) ? packsData : [];

  // Get current user (cached for 15 minutes)
  const { data: currentUser } = useSWR(CACHE_KEYS.USER, fetcher);

  const handlePlayTrack = (beat: any) => {
    playTrack({
      id: beat.id,
      title: beat.title,
      artist: beat.artist,
      imageFile: beat.imageFile,
      audioFile: beat.audioFiles?.mp3,
      price: beat.price,
      genre: beat.genre,
      duration: beat.duration,
      bpm: beat.bpm,
      key: beat.key,
      description: beat.description,
      category: beat.category,
      tags: beat.tags,
      isPack: beat.isPack,
      packBeats: beat.packBeats,
      isPurchased: false
    });
  };

  const handlePurchase = async (trackId: string) => {
    console.log('Purchase track:', trackId);
    alert('Purchase functionality coming soon!');
  };

  const handleDownload = async (trackId: string) => {
    console.log('Download track:', trackId);
    alert('Download functionality coming soon!');
  };

  // Filter beats based on search and genre
  const filteredBeats = beats.filter((beat: any) => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         beat.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || beat.genre === selectedGenre;
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'artist' && beat.category === 'artist') ||
                           (selectedCategory === 'game' && beat.category === 'game');
    return matchesSearch && matchesGenre && matchesCategory;
  });

  // Filter beat packs
  const filteredPacks = packs.filter((pack: any) => {
    const matchesSearch = pack.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pack.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || pack.genre === selectedGenre;
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'artist' && pack.category === 'artist') ||
                           (selectedCategory === 'game' && pack.category === 'game');
    return matchesSearch && matchesGenre && matchesCategory;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-64"></div>
            ))}
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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>
            <Button variant="outline" className="bg-black border-2 border-gray-600 text-white hover:bg-gray-800">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={`font-bold border-2 ${
                selectedCategory === 'all' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-black border-gray-600 text-white hover:bg-gray-800'
              }`}
            >
              All Music
            </Button>
            <Button
              variant={selectedCategory === 'artist' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('artist')}
              className={`font-bold border-2 ${
                selectedCategory === 'artist' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-black border-gray-600 text-white hover:bg-gray-800'
              }`}
            >
              Beats for Artists
            </Button>
            <Button
              variant={selectedCategory === 'game' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('game')}
              className={`font-bold border-2 ${
                selectedCategory === 'game' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-black border-gray-600 text-white hover:bg-gray-800'
              }`}
            >
              Music for Games
            </Button>
          </div>

          {/* Genre Filters */}
          <div className="flex gap-2 flex-wrap">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                onClick={() => setSelectedGenre(genre)}
                className={`font-bold border-2 ${
                  selectedGenre === genre 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-black border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Music Grid */}
        {filteredBeats.length === 0 && filteredPacks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Music className="h-12 w-12 mx-auto" />
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
        ) : filteredBeats.length === 0 && filteredPacks.length === 0 ? (
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
                      src={getImageUrl(beat) || ''} 
                      alt={beat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-amber-600/20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayButton
                      isPlaying={currentTrack?.id === beat.id && playerState.isPlaying}
                      onToggle={() => {
                        if (currentTrack?.id === beat.id) {
                          toggleTrack();
                        } else {
                          handlePlayTrack(beat);
                        }
                      }}
                      variant="green"
                    />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      beat.published 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {beat.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Beat Info */}
                <div className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-white truncate">{beat.title}</h3>
                      <p className="text-xs text-gray-400 truncate">{beat.artist}</p>
                    </div>
                    <span className="text-sm font-bold text-green-500 ml-2">
                      ${beat.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-600">
                      {beat.genre}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 mt-2">
                    {/* Buy Button - Only show for non-admins */}
                    {currentUser?.role !== 'admin' && (
                      <Button 
                        size="sm" 
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xs cursor-pointer"
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
                          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1 cursor-pointer"
                          onClick={() => router.push(`/admin/edit/${beat.id}`)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1 cursor-pointer"
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
                      src={getImageUrl(pack) || ''} 
                      alt={pack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayButton
                      isPlaying={currentTrack?.id === pack.id && playerState.isPlaying}
                      onToggle={() => {
                        if (currentTrack?.id === pack.id) {
                          toggleTrack();
                        } else {
                          handlePlayTrack({
                            ...pack,
                            isPack: true,
                            packBeats: pack.beats?.length || 0
                          });
                        }
                      }}
                      variant="amber"
                    />
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Pack
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      pack.published 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {pack.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Pack Info */}
                <div className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-white truncate">{pack.title}</h3>
                      <p className="text-xs text-gray-400 truncate">{pack.artist}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-500 ml-2">
                      ${pack.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-600">
                      {pack.genre}
                    </span>
                    <span className="text-xs text-gray-400">{pack.beats?.length || 0} beats</span>
                  </div>

                  {/* Pack Details */}
                  <div className="text-xs text-gray-400 space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span>Individual total:</span>
                      <span>${pack.beats?.reduce((sum: number, beat: any) => sum + beat.price, 0).toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pack price:</span>
                      <span className="text-amber-500">${pack.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>You save:</span>
                      <span className="text-green-500">
                        ${((pack.beats?.reduce((sum: number, beat: any) => sum + beat.price, 0) || 0) - pack.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs"
                      onClick={() => setSelectedPack(pack)}
                    >
                      <Package className="h-3 w-3 mr-1" />
                      View Details
                    </Button>

                    {/* Buy Button - Only show for non-admins */}
                    {currentUser?.role !== 'admin' && (
                      <Button 
                        size="sm" 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer"
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
                          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1 cursor-pointer"
                          onClick={() => router.push(`/admin/edit-pack/${pack.id}`)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1 cursor-pointer"
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

      {/* Global Audio Player */}
      <GlobalAudioPlayer
        onPurchase={handlePurchase}
        onDownload={handleDownload}
      />
    </div>
  );
}
