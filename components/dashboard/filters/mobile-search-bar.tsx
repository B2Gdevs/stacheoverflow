'use client';

/**
 * Mobile-Optimized Search Bar Component
 * 
 * Features:
 * - Expandable search on mobile (tap to focus expands)
 * - Always visible search icon button on mobile
 * - Full-width search bar on desktop
 * - Integrated filter button
 * 
 * @component
 */

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';

interface MobileSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function MobileSearchBar({
  searchTerm,
  onSearchChange,
  onFilterClick,
  placeholder = "Search music...",
  className
}: MobileSearchBarProps) {
  return (
    <div className={cn("flex gap-2 sm:gap-4", className)}>
      {/* Search Bar - Always visible, responsive sizing */}
      <div className="relative flex-1 min-w-0">
        <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", getIconSize('md'))} />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-10 sm:pl-10 sm:pr-10 bg-black border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 min-h-[44px] sm:min-h-0"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-6 sm:w-6 text-gray-400 hover:text-white min-h-[32px] min-w-[32px] sm:min-h-0 sm:min-w-0"
          >
            <X className={getIconSize('sm')} />
          </Button>
        )}
      </div>

      {/* Filter Button - Opens filter drawer */}
      <Button 
        variant="outline" 
        className="bg-black border-2 border-gray-600 text-white hover:bg-gray-800 min-h-[44px] sm:min-h-0 flex-shrink-0"
        onClick={onFilterClick}
      >
        <Filter className={cn(getIconSize('md'), "sm:mr-2")} />
        <span className="hidden sm:inline">Filter</span>
      </Button>
    </div>
  );
}

