'use client';

import { Music, Search } from 'lucide-react';
import { BeatCard } from './beat-card';
import { PackCard } from './pack-card';

interface MusicGridProps {
  beats: any[];
  packs: any[];
  currentTrack?: any;
  playerState?: any;
  onPlayTrack: (beat: any) => void;
  onToggleTrack: () => void;
  currentUser?: any;
  getImageUrl: (item: any) => string;
  onViewPackDetails?: (pack: any) => void;
}

export function MusicGrid({
  beats,
  packs,
  currentTrack,
  playerState,
  onPlayTrack,
  onToggleTrack,
  currentUser,
  getImageUrl,
  onViewPackDetails
}: MusicGridProps) {
  // Empty state - no music at all
  if (beats.length === 0 && packs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Music className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">No Music Available</h3>
        <p className="text-gray-300 mb-6">
          You haven't uploaded any music yet. Start building your catalog by uploading your first beat or game music.
        </p>
      </div>
    );
  }

  // Empty state - no results from filters
  if (beats.length === 0 && packs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Search className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No music found</h3>
        <p className="text-gray-300">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-3">
      {/* Individual Beats */}
      {beats.map((beat) => (
        <BeatCard
          key={beat.id}
          beat={beat}
          isPlaying={currentTrack?.id === beat.id && playerState?.isPlaying}
          onPlay={() => onPlayTrack(beat)}
          onToggle={onToggleTrack}
          currentUser={currentUser}
          getImageUrl={getImageUrl}
        />
      ))}

      {/* Beat Packs */}
      {packs.map((pack) => (
        <PackCard
          key={`pack-${pack.id}`}
          pack={pack}
          isPlaying={currentTrack?.id === pack.id && playerState?.isPlaying}
          onPlay={() => onPlayTrack({
            ...pack,
            isPack: true,
            packBeats: pack.beats?.length || 0
          })}
          onToggle={onToggleTrack}
          onViewDetails={onViewPackDetails}
          currentUser={currentUser}
          getImageUrl={getImageUrl}
        />
      ))}
    </div>
  );
}

