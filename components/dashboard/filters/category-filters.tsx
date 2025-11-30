'use client';

/**
 * Category Filters Component
 * 
 * Displays category filter buttons (All Music, Beats for Artists, Music for Games)
 * - Horizontal scrollable on mobile
 * - Inline on desktop
 * 
 * @component
 */

import { Button } from '@/components/ui/button';

interface CategoryFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  variant?: 'inline' | 'scrollable';
}

const categories = [
  { value: 'all', label: 'All Music' },
  { value: 'artist', label: 'Beats for Artists' },
  { value: 'game', label: 'Music for Games' },
];

export function CategoryFilters({ 
  selectedCategory, 
  onCategoryChange,
  variant = 'scrollable'
}: CategoryFiltersProps) {
  // In drawer: Use flex-wrap for better layout, no horizontal scroll
  // On main page: Use horizontal scroll
  const containerClass = variant === 'inline'
    ? "flex gap-2 flex-wrap"
    : "flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1";

  return (
    <div className={containerClass}>
      <div className={variant === 'inline' ? "flex gap-2 flex-wrap" : "flex gap-2 min-w-max"}>
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            onClick={() => onCategoryChange(category.value)}
            className={`font-bold border-2 whitespace-nowrap flex-shrink-0 min-h-[44px] sm:min-h-0 rounded-full transition-all duration-200 ${
              selectedCategory === category.value
                ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25 scale-105' 
                : 'bg-black/50 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 hover:text-white'
            }`}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

