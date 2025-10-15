'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Heart, ShoppingCart, Search, Filter, Download, User } from 'lucide-react';

// Sample beats data
const sampleBeats = [
  {
    id: 1,
    title: "Lonely King",
    artist: "StachO",
    genre: "Hip Hop",
    price: 29.99,
    image: "/api/placeholder/300/300",
    duration: "3:24",
    bpm: 140,
    key: "C Minor"
  },
  {
    id: 2,
    title: "Said Too Much",
    artist: "StachO", 
    genre: "Trap",
    price: 34.99,
    image: "/api/placeholder/300/300",
    duration: "2:58",
    bpm: 150,
    key: "F# Minor"
  },
  {
    id: 3,
    title: "When I Die",
    artist: "StachO",
    genre: "Hip Hop",
    price: 39.99,
    image: "/api/placeholder/300/300", 
    duration: "3:45",
    bpm: 135,
    key: "A Minor"
  },
  {
    id: 4,
    title: "Midnight Vibes",
    artist: "StachO",
    genre: "R&B",
    price: 32.99,
    image: "/api/placeholder/300/300",
    duration: "3:12",
    bpm: 120,
    key: "D Major"
  },
  {
    id: 5,
    title: "Street Dreams",
    artist: "StachO",
    genre: "Hip Hop",
    price: 27.99,
    image: "/api/placeholder/300/300",
    duration: "2:45",
    bpm: 145,
    key: "G Minor"
  },
  {
    id: 6,
    title: "Neon Lights",
    artist: "StachO",
    genre: "Pop",
    price: 36.99,
    image: "/api/placeholder/300/300",
    duration: "3:30",
    bpm: 128,
    key: "E Major"
  }
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([]);

  const genres = ['All', 'Hip Hop', 'Trap', 'R&B', 'Pop'];

  const filteredBeats = sampleBeats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || beat.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const toggleFavorite = (beatId: number) => {
    setFavorites(prev => 
      prev.includes(beatId) 
        ? prev.filter(id => id !== beatId)
        : [...prev, beatId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Artist Preview Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-amber-600/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">StachO</h2>
            <p className="text-gray-300">Producer & Beatmaker</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-green-500 hover:bg-green-600">
            <Play className="h-4 w-4 mr-2" />
            Artist Preview
          </Button>
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Download className="h-4 w-4 mr-2" />
            Download Bio
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Beats</h1>
          <p className="text-gray-300 mt-1">Discover and purchase premium beats</p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search beats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-gray-800">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGenre(genre)}
            className={`rounded-full ${
              selectedGenre === genre 
                ? "bg-green-500 hover:bg-green-600" 
                : "border-gray-700 text-gray-300 hover:bg-gray-800"
            }`}
          >
            {genre}
          </Button>
        ))}
      </div>

      {/* Beats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeats.map((beat) => (
          <Card key={beat.id} className="group hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
            <CardContent className="p-0">
              {/* Beat Image */}
              <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-amber-600/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Play className="h-6 w-6 text-gray-900 ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    onClick={() => toggleFavorite(beat.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favorites.includes(beat.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </Button>
                </div>
              </div>

              {/* Beat Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-white">{beat.title}</h3>
                    <p className="text-sm text-gray-300">{beat.artist}</p>
                  </div>
                  <span className="text-sm font-medium text-green-500">${beat.price}</span>
                </div>

                {/* Beat Details */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span>{beat.duration}</span>
                  <span>{beat.bpm} BPM</span>
                  <span>{beat.key}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
                    <Play className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredBeats.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No beats found</h3>
          <p className="text-gray-300">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}