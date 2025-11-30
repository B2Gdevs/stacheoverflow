'use client';

import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getIconSize } from '@/lib/utils/icon-sizes';

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
}

export function SearchSection({ 
  searchTerm, 
  onSearchChange,
  onFilterClick 
}: SearchSectionProps) {
  return (
    <div className="flex gap-2 sm:gap-4">
      <div className="relative flex-1 min-w-0">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${getIconSize('md')}`} />
        <Input
          type="text"
          placeholder="Search music..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 sm:pl-10 bg-black border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
        />
      </div>
      <Button 
        variant="outline" 
        className="bg-black border-2 border-gray-600 text-white hover:bg-gray-800 min-h-[44px] sm:min-h-0 flex-shrink-0"
        onClick={onFilterClick}
      >
        <Filter className={`${getIconSize('md')} mr-2`} />
        <span className="hidden sm:inline">Filter</span>
      </Button>
    </div>
  );
}

