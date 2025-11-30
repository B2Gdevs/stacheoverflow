'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Music, Check } from 'lucide-react';
import { getIconSize } from '@/lib/utils/icon-sizes';

interface Beat {
  id: number;
  title: string;
  artist: string;
  genre: string;
  price: number;
  duration: number | null;
  bpm: number | null;
  key: string | null;
  description: string | null;
  audioFiles: {
    mp3: string | null;
    wav: string | null;
    stems: string | null;
  };
  imageFile: string | null;
  published: boolean;
  category: string;
  tags: string[];
}

interface BeatSearchProps {
  selectedBeats: number[];
  onBeatToggle: (beatId: number) => void;
  excludeBeats?: number[]; // Beats to exclude from search (e.g., already in pack)
  className?: string;
}

export default function BeatSearch({ 
  selectedBeats, 
  onBeatToggle, 
  excludeBeats = [], 
  className = '' 
}: BeatSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allBeats, setAllBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all beats
  useEffect(() => {
    const fetchBeats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/beats');
        const data = await response.json();
        setAllBeats(data.beats || []);
      } catch (error) {
        console.error('Error fetching beats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeats();
  }, []);

  // Filter beats based on search term and exclusions
  const filteredBeats = allBeats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const notExcluded = !excludeBeats.includes(beat.id);
    
    return matchesSearch && notExcluded;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${getIconSize('md')}`} />
        <Input
          placeholder="Search beats by title, artist, genre, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">
          <Music className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p>Loading beats...</p>
        </div>
      ) : filteredBeats.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Music className="h-8 w-8 mx-auto mb-2" />
          <p>{searchTerm ? 'No beats found matching your search' : 'No beats available'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {filteredBeats.map((beat) => {
            const isSelected = selectedBeats.includes(beat.id);
            
            return (
              <Card
                key={beat.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-green-900/20 border-green-500 ring-2 ring-green-500/50'
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => onBeatToggle(beat.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{beat.title}</div>
                      <div className="text-sm text-gray-400 truncate">
                        {beat.artist} • {beat.genre}
                      </div>
                      {beat.tags && beat.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {beat.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {beat.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{beat.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-500">
                          ${beat.price.toFixed(2)}
                        </div>
                        {beat.duration && (
                          <div className="text-xs text-gray-400">
                            {Math.floor(beat.duration / 60)}:{(beat.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="text-green-500">
                          <Check className={getIconSize('md')} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selection Summary */}
      {selectedBeats.length > 0 && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              {selectedBeats.length} beat{selectedBeats.length !== 1 ? 's' : ''} selected
            </span>
            <div className="text-sm font-medium text-green-500">
              Individual Total: ${selectedBeats
                .map(id => allBeats.find(beat => beat.id === id)?.price || 0)
                .reduce((sum, price) => sum + price, 0)
                .toFixed(2)
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
