'use client';

/**
 * Quick Filters Component
 * 
 * Shows active filters as chips above the search bar.
 * Only visible when filters are applied.
 * Allows quick removal of individual filters.
 * 
 * @component
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconSize } from '@/lib/utils/icon-sizes';

interface QuickFiltersProps {
  selectedCategory: string;
  selectedGenre: string;
  onCategoryChange: (category: string) => void;
  onGenreChange: (genre: string) => void;
  categories?: { value: string; label: string }[];
  genres?: string[];
}

const defaultCategories = [
  { value: 'all', label: 'All Music' },
  { value: 'artist', label: 'Beats for Artists' },
  { value: 'game', label: 'Music for Games' },
];

export function QuickFilters({
  selectedCategory,
  selectedGenre,
  onCategoryChange,
  onGenreChange,
  categories = defaultCategories,
  genres = ["All", "Hip Hop", "Trap", "R&B", "Pop", "Electronic", "Rock"]
}: QuickFiltersProps) {
  const activeCategory = categories.find(c => c.value === selectedCategory);
  const hasActiveFilters = selectedCategory !== 'all' || selectedGenre !== 'All';

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {selectedCategory !== 'all' && activeCategory && (
        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all">
          {activeCategory.label}
          <button
            onClick={() => onCategoryChange('all')}
            className="ml-0.5 hover:bg-green-500/30 rounded-full p-1 transition-colors min-h-[24px] min-w-[24px] flex items-center justify-center"
            aria-label={`Remove ${activeCategory.label} filter`}
          >
            <X className={getIconSize('sm')} />
          </button>
        </span>
      )}

      {selectedGenre !== 'All' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all">
          {selectedGenre}
          <button
            onClick={() => onGenreChange('All')}
            className="ml-0.5 hover:bg-green-500/30 rounded-full p-1 transition-colors min-h-[24px] min-w-[24px] flex items-center justify-center"
            aria-label={`Remove ${selectedGenre} filter`}
          >
            <X className={getIconSize('sm')} />
          </button>
        </span>
      )}
    </div>
  );
}

