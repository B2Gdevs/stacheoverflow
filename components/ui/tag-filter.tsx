'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Tag as TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  title?: string;
  description?: string;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll?: () => void;
  className?: string;
  maxDisplayTags?: number;
}

export function TagFilter({ 
  title = "Filter by Tags",
  description,
  selectedTags, 
  onTagToggle,
  onClearAll,
  className,
  maxDisplayTags = 10
}: TagFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tags from API
  const fetchTags = async (query: string = '') => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/tags${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch tags');
      
      const data = await response.json();
      setAvailableTags(data.tags || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setAvailableTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  // Search tags when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTags(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayTags = filteredTags.slice(0, maxDisplayTags);
  const hasMoreTags = filteredTags.length > maxDisplayTags;

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-green-400" />
            {title}
          </h3>
          {onClearAll && selectedTags.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-gray-400 hover:text-white text-sm"
            >
              Clear all
            </button>
          )}
        </div>
      )}
      
      {description && (
        <p className="text-gray-400 text-sm">{description}</p>
      )}
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full pl-10 pr-4 py-2 bg-black border-0 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400/50 rounded-lg"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Available Tags */}
      <div className="space-y-2">
        <p className="text-gray-400 text-sm">
          {isLoading ? 'Loading tags...' : `${filteredTags.length} tags available`}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {displayTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isSelected
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400 shadow-lg shadow-green-500/25"
                    : "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50 hover:border-gray-500"
                )}
              >
                <TagIcon className="h-3 w-3" />
                {tag}
                {isSelected && <X className="h-3 w-3" />}
              </button>
            );
          })}
          
          {hasMoreTags && (
            <span className="text-gray-400 text-sm px-3 py-2">
              +{filteredTags.length - maxDisplayTags} more...
            </span>
          )}
        </div>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-green-400 text-sm font-medium">
            Active filters ({selectedTags.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400 shadow-lg shadow-green-500/25"
              >
                <TagIcon className="h-3 w-3" />
                {tag}
                <button
                  onClick={() => onTagToggle(tag)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
