'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Music, Zap, Star, Heart, Tag as TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateTagName } from '@/lib/utils/tag-validation';

interface TagInputProps {
  title: string;
  description?: string;
  selectedTags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  icon?: React.ReactNode;
  className?: string;
  allowCreation?: boolean; // New prop to control creation mode
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({ 
  title, 
  description, 
  selectedTags, 
  onTagAdd, 
  onTagRemove,
  icon,
  className,
  allowCreation = true,
  placeholder = "Search or create tags...",
  maxTags = 20
}: TagInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch tags from API
  const fetchTags = async (query: string = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tags${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch tags');
      
      const data = await response.json();
      setAvailableTags(data.tags || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
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
      if (searchQuery.trim()) {
        fetchTags(searchQuery);
      } else {
        fetchTags();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    setError(null);
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) return;
    if (selectedTags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }
    
    onTagAdd(tag);
    setSearchQuery('');
    setShowSuggestions(false);
    setError(null);
  };

  const handleCreateTag = async () => {
    const trimmedQuery = searchQuery.trim();
    
    if (!allowCreation) {
      setError('Tag creation is disabled');
      return;
    }
    
    if (selectedTags.includes(trimmedQuery)) {
      setError('Tag already selected');
      return;
    }
    
    if (selectedTags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }
    
    const validation = validateTagName(trimmedQuery);
    if (!validation.valid) {
      setError(validation.error || 'Invalid tag name');
      return;
    }
    
    // Make POST request to validate and create the tag
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: trimmedQuery }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }
      
      const result = await response.json();
      console.log('✅ Tag created successfully:', result);
      
      // Add the tag to the selected tags
      onTagAdd(trimmedQuery);
      setSearchQuery('');
      setShowSuggestions(false);
      setError(null);
      
    } catch (err) {
      console.error('❌ Error creating tag:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        if (availableTags.includes(searchQuery.trim())) {
          handleTagSelect(searchQuery.trim());
        } else {
          handleCreateTag();
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const getTagIcon = (tag: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Chorus': <Music className="h-3 w-3" />,
      'Verse': <Zap className="h-3 w-3" />,
      'Hook': <Star className="h-3 w-3" />,
      'Bridge': <Heart className="h-3 w-3" />,
      'Intro': <Music className="h-3 w-3" />,
      'Outro': <Music className="h-3 w-3" />,
      'Instrumental': <Music className="h-3 w-3" />,
      'Acapella': <Music className="h-3 w-3" />
    };
    return iconMap[tag] || <TagIcon className="h-3 w-3" />;
  };

  const filteredTags = availableTags.filter(tag => 
    !selectedTags.includes(tag) && 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreate = allowCreation && 
    searchQuery.trim() && 
    !availableTags.includes(searchQuery.trim()) &&
    !selectedTags.includes(searchQuery.trim());

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-white font-bold text-lg">{title}</h3>
      </div>
      {description && (
        <p className="text-gray-400 text-sm">{description}</p>
      )}
      
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 bg-black border-0 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400/50 rounded-lg"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (filteredTags.length > 0 || canCreate) && (
          <div 
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <Search className="h-3 w-3 text-gray-400" />
                {tag}
              </button>
            ))}
            
            {canCreate && (
              <button
                onClick={handleCreateTag}
                className="w-full px-4 py-2 text-left text-green-400 hover:bg-gray-700 flex items-center gap-2 border-t border-gray-600"
              >
                <Plus className="h-3 w-3" />
                Create "{searchQuery.trim()}"
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-green-400 text-sm font-medium">
            Selected tags ({selectedTags.length}/{maxTags}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25"
              >
                {getTagIcon(tag)}
                {tag}
                <button
                  onClick={() => onTagRemove(tag)}
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
