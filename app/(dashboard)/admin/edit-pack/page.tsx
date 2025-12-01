'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Package, Plus, Loader2 } from 'lucide-react';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useBeatPacks, useUser } from '@/lib/swr/hooks';
import Link from 'next/link';
import { MusicGrid } from '@/components/dashboard/grid/music-grid';
import { PackDetailsDialog } from '@/components/dashboard/pack-details-dialog';
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

export default function EditPackListPage() {
  const router = useRouter();
  const { packs, isLoading, refresh } = useBeatPacks();
  const { user: currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any>(null);

  // Filter packs based on search, genre, and category
  const filteredPacks = packs.filter((pack: any) => {
    const matchesSearch = pack.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.artist?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || pack.genre === selectedGenre;
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'artist' && pack.category === 'artist') ||
                           (selectedCategory === 'game' && pack.category === 'game');
    return matchesSearch && matchesGenre && matchesCategory;
  });

  const handlePlayTrack = () => {
    // No-op for admin page - audio playback not needed
  };

  const handleViewPackDetails = (pack: any) => {
    // Open pack details modal
    setSelectedPack(pack);
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
          <h1 className="text-3xl font-bold text-white mb-2">Beat Packs</h1>
          <p className="text-gray-400">Create and manage beat packs</p>
        </div>
        <Link href="/admin/upload">
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className={cn(getIconSize('sm'), "mr-2")} />
            Create New Pack
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

      {/* Packs Grid using same component as marketplace */}
      {filteredPacks.length > 0 ? (
        <MusicGrid
          beats={[]}
          packs={filteredPacks}
          currentTrack={undefined}
          playerState={undefined}
          onPlayTrack={handlePlayTrack}
          onToggleTrack={handlePlayTrack}
          currentUser={currentUser}
          getImageUrl={getImageUrl}
          onViewPackDetails={handleViewPackDetails}
        />
      ) : (
        <div className="text-center py-12">
          <Package className={cn(getIconSize('xl'), "mx-auto text-gray-500 mb-4")} />
          <p className="text-gray-400">
            {searchTerm || selectedGenre !== 'All' || selectedCategory !== 'all' 
              ? 'No packs found matching your filters' 
              : 'No beat packs created yet'}
          </p>
          {!searchTerm && selectedGenre === 'All' && selectedCategory === 'all' && (
            <Link href="/admin/upload">
              <Button className="mt-4 bg-green-500 hover:bg-green-600 text-white">
                <Plus className={cn(getIconSize('sm'), "mr-2")} />
                Create Your First Pack
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Pack Details Dialog */}
      <PackDetailsDialog
        pack={selectedPack}
        open={!!selectedPack}
        onOpenChange={(open) => !open && setSelectedPack(null)}
        currentUser={currentUser}
        getImageUrl={getImageUrl}
      />
    </div>
  );
}
