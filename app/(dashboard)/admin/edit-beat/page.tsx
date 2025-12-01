'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Music, Plus, Loader2 } from 'lucide-react';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useBeats, useUser } from '@/lib/swr/hooks';
import Link from 'next/link';
import { MusicGrid } from '@/components/dashboard/grid/music-grid';
import { MobileSearchBar } from '@/components/dashboard/filters/mobile-search-bar';
import { FilterDrawer } from '@/components/dashboard/filters/filter-drawer';
import { QuickFilters } from '@/components/dashboard/filters/quick-filters';

// Helper to get image URL - uses imageUrl from API response (Supabase signed URL)
function getImageUrl(item: any): string {
  // Use imageUrl from API response (Supabase signed URL)
  if (item.imageUrl) {
    return item.imageUrl;
  }
  
  // Fallback to imageFile if imageUrl not available
  if (item.imageFile) {
    // If it's already a full URL, return it
    if (item.imageFile.startsWith('http')) {
      return item.imageFile;
    }
  }
  
  return '';
}

export default function EditBeatListPage() {
  const router = useRouter();
  const { beats, isLoading, refresh } = useBeats();
  const { user: currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filter beats based on search, genre, and category
  const filteredBeats = beats.filter((beat: any) => {
    const matchesSearch = beat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.artist?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || beat.genre === selectedGenre;
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'artist' && beat.category === 'artist') ||
                           (selectedCategory === 'game' && beat.category === 'game');
    return matchesSearch && matchesGenre && matchesCategory;
  });

  const handlePlayTrack = () => {
    // No-op for admin page - audio playback not needed
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className={cn(getIconSize('lg'), "animate-spin text-green-400")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Beats</h1>
          <p className="text-gray-400">Create and manage beats</p>
        </div>
        <Link href="/admin/upload">
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className={cn(getIconSize('sm'), "mr-2")} />
            Create New Beat
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Mobile-Optimized Search Bar */}
        <MobileSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterClick={() => setFilterDrawerOpen(true)}
          placeholder="Search beats..."
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

      {/* Beats Grid using same component as marketplace */}
      {filteredBeats.length > 0 ? (
        <MusicGrid
          beats={filteredBeats}
          packs={[]}
          currentTrack={undefined}
          playerState={undefined}
          onPlayTrack={handlePlayTrack}
          onToggleTrack={handlePlayTrack}
          currentUser={currentUser}
          getImageUrl={getImageUrl}
        />
      ) : (
        <div className="text-center py-12">
          <Music className={cn(getIconSize('xl'), "mx-auto text-gray-500 mb-4")} />
          <p className="text-gray-400">
            {searchTerm || selectedGenre !== 'All' || selectedCategory !== 'all' 
              ? 'No beats found matching your filters' 
              : 'No beats created yet'}
          </p>
          {!searchTerm && selectedGenre === 'All' && selectedCategory === 'all' && (
            <Link href="/admin/upload">
              <Button className="mt-4 bg-green-500 hover:bg-green-600 text-white">
                <Plus className={cn(getIconSize('sm'), "mr-2")} />
                Create Your First Beat
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

