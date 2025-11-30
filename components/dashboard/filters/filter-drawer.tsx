'use client';

/**
 * Filter Drawer Component
 * 
 * A mobile-optimized bottom sheet drawer for filters.
 * On mobile: Opens as bottom sheet
 * On desktop: Opens as side panel (optional, can be inline)
 * 
 * Features:
 * - Category filters (All Music, Artists, Games)
 * - Genre filters with scrollable chips
 * - Clear filters button
 * - Apply button (sticky on mobile)
 * 
 * @component
 */

import { useState, useEffect } from 'react';
import { X, Filter, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { CategoryFilters } from './category-filters';
import { GenreFilters } from './genre-filters';

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  selectedGenre: string;
  onCategoryChange: (category: string) => void;
  onGenreChange: (genre: string) => void;
  genres?: string[];
}

export function FilterDrawer({
  open,
  onOpenChange,
  selectedCategory,
  selectedGenre,
  onCategoryChange,
  onGenreChange,
  genres
}: FilterDrawerProps) {
  const isMobile = useIsMobile();
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempGenre, setTempGenre] = useState(selectedGenre);

  // Sync temp state when drawer opens or props change
  useEffect(() => {
    if (open) {
      setTempCategory(selectedCategory);
      setTempGenre(selectedGenre);
    }
  }, [open, selectedCategory, selectedGenre]);

  const handleApply = () => {
    onCategoryChange(tempCategory);
    onGenreChange(tempGenre);
    onOpenChange(false);
  };

  const handleClear = () => {
    setTempCategory('all');
    setTempGenre('All');
    onCategoryChange('all');
    onGenreChange('All');
  };

  const hasChanges = tempCategory !== selectedCategory || tempGenre !== selectedGenre;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "bg-black border-gray-800 p-0 flex flex-col",
          isMobile && "max-h-[85vh] rounded-t-2xl"
        )}
        style={isMobile ? { height: '85vh' } : undefined}
      >
        <SheetHeader className="border-b border-gray-800 pb-4 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Filter className={cn(getIconSize('lg'), "text-green-500")} />
              </div>
              <div>
                <SheetTitle className="text-white text-xl">Filters</SheetTitle>
                <SheetDescription className="text-gray-400">
                  Refine your music search
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
            >
              <X className={getIconSize('md')} />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Filter Content - Scrollable */}
          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6 scrollbar-hide">
            {/* Category Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Music2 className={cn(getIconSize('sm'), "text-green-500")} />
                <h3 className="text-white font-bold text-sm uppercase tracking-wide">Category</h3>
              </div>
              <CategoryFilters
                selectedCategory={tempCategory}
                onCategoryChange={setTempCategory}
                variant="inline"
              />
            </div>

            {/* Genre Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Music2 className={cn(getIconSize('sm'), "text-green-500")} />
                <h3 className="text-white font-bold text-sm uppercase tracking-wide">Genre</h3>
              </div>
              <GenreFilters
                selectedGenre={tempGenre}
                onGenreChange={setTempGenre}
                genres={genres}
                variant="inline"
              />
            </div>
          </div>

          {/* Action Buttons - Sticky on Mobile */}
          <div className="border-t border-gray-800 pt-4 pb-6 px-6 space-y-2 bg-black flex-shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1 bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white min-h-[44px] sm:min-h-0"
              >
                Clear All
              </Button>
              <Button
                onClick={handleApply}
                disabled={!hasChanges}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold min-h-[44px] sm:min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

