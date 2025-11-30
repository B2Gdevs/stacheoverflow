'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/lib/audio';
import { GlobalAudioPlayer } from '@/components/audio';
import { fetcher, CACHE_KEYS } from '@/lib/swr/config';
import { DashboardHeader } from './header/dashboard-header';
import { MobileSearchBar } from './filters/mobile-search-bar';
import { FilterDrawer } from './filters/filter-drawer';
import { QuickFilters } from './filters/quick-filters';
import { MusicGrid } from './grid/music-grid';
import { NoMusic } from './empty-states/no-music';

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

export function DashboardContent() {
  const router = useRouter();
  const { playTrack, currentTrack, playerState, toggleTrack } = useAudio();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Fetch beats from the database (cached for 4 hours)
  const { data: beatsData, error, isLoading, mutate } = useSWR(CACHE_KEYS.BEATS, fetcher);
  const beats = beatsData?.beats || [];
  
  // Fetch beat packs from the database (cached for 4 hours)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if we have any music at all (before filtering)
  const hasAnyMusic = beats.length > 0 || packs.length > 0;
  const hasFilteredResults = filteredBeats.length > 0 || filteredPacks.length > 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-8">
        <DashboardHeader />

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Mobile-Optimized Search Bar */}
          <MobileSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => setFilterDrawerOpen(true)}
          />

          {/* Quick Filters - Show active filters as chips */}
          <QuickFilters
            selectedCategory={selectedCategory}
            selectedGenre={selectedGenre}
            onCategoryChange={setSelectedCategory}
            onGenreChange={setSelectedGenre}
          />
        </div>

        {/* Filter Drawer - Mobile Bottom Sheet / Desktop Side Panel */}
        <FilterDrawer
          open={filterDrawerOpen}
          onOpenChange={setFilterDrawerOpen}
          selectedCategory={selectedCategory}
          selectedGenre={selectedGenre}
          onCategoryChange={setSelectedCategory}
          onGenreChange={setSelectedGenre}
        />

        {/* Music Grid */}
        {!hasAnyMusic ? (
          <NoMusic />
        ) : !hasFilteredResults ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No music found</h3>
            <p className="text-gray-300">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <MusicGrid
            beats={filteredBeats}
            packs={filteredPacks}
            currentTrack={currentTrack}
            playerState={playerState}
            onPlayTrack={handlePlayTrack}
            onToggleTrack={toggleTrack}
            currentUser={currentUser}
            getImageUrl={getImageUrl}
            onViewPackDetails={setSelectedPack}
          />
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
