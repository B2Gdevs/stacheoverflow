'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Plus, Search, Loader2 } from 'lucide-react';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useBeatPacks, useUser } from '@/lib/swr/hooks';
import Link from 'next/link';
import { MusicGrid } from '@/components/dashboard/grid/music-grid';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPacks = packs.filter(pack => 
    !searchQuery || 
    pack.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayTrack = () => {
    // No-op for admin page - audio playback not needed
  };

  const handleViewPackDetails = (pack: any) => {
    // For admin, clicking on pack opens the wizard for editing
    router.push(`/admin/edit-pack/${pack.id}`);
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

      {/* Search */}
      <div className="relative">
        <Search className={cn(getIconSize('sm'), "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400")} />
        <Input
          type="text"
          placeholder="Search packs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-black border-gray-600 text-white"
        />
      </div>

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
            {searchQuery ? 'No packs found matching your search' : 'No beat packs created yet'}
          </p>
          {!searchQuery && (
            <Link href="/admin/upload">
              <Button className="mt-4 bg-green-500 hover:bg-green-600 text-white">
                <Plus className={cn(getIconSize('sm'), "mr-2")} />
                Create Your First Pack
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
