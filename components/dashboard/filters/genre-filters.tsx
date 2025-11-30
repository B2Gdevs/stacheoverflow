'use client';

/**
 * Genre Filters Component
 * 
 * Displays genre filter chips (All, Hip Hop, Trap, etc.)
 * - Horizontal scrollable on mobile
 * - Wraps on desktop
 * 
 * @component
 */

import { Button } from '@/components/ui/button';

interface GenreFiltersProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  genres?: string[];
  variant?: 'inline' | 'scrollable';
}

const defaultGenres = ["All", "Hip Hop", "Trap", "R&B", "Pop", "Electronic", "Rock"];

export function GenreFilters({ 
  selectedGenre, 
  onGenreChange,
  genres = defaultGenres,
  variant = 'scrollable'
}: GenreFiltersProps) {
  // In drawer: Use flex-wrap for better layout, no horizontal scroll
  // On main page: Use horizontal scroll
  const containerClass = variant === 'inline'
    ? "flex gap-2 flex-wrap"
    : "flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1";

  return (
    <div className={containerClass}>
      <div className={variant === 'inline' ? "flex gap-2 flex-wrap" : "flex gap-2 min-w-max"}>
        {genres.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? 'default' : 'outline'}
            onClick={() => onGenreChange(genre)}
            className={`font-bold border-2 whitespace-nowrap flex-shrink-0 min-h-[44px] sm:min-h-0 rounded-full transition-all duration-200 ${
              selectedGenre === genre 
                ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25 scale-105' 
                : 'bg-black/50 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 hover:text-white'
            }`}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  );
}

