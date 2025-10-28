'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { useWizard } from '@/lib/wizard';

export function SelectBeatsStep() {
  const { data, updateData } = useWizard();
  const { selectedBeats } = data;
  const [beats, setBeats] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  console.log('🎵 SelectBeatsStep: Current selectedBeats:', selectedBeats);
  console.log('🎵 SelectBeatsStep: Available beats:', beats);

  // Fetch available beats
  React.useEffect(() => {
    const fetchBeats = async () => {
      console.log('🎵 SelectBeatsStep: Fetching beats...');
      try {
        const response = await fetch('/api/beats');
        const data = await response.json();
        console.log('🎵 SelectBeatsStep: Fetched beats data:', data);
        setBeats(data.beats || []);
      } catch (error) {
        console.error('🎵 SelectBeatsStep: Error fetching beats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, []);

  const filteredBeats = beats.filter(beat => 
    beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beat.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beat.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('🎵 SelectBeatsStep: Filtered beats:', filteredBeats);

  const toggleBeatSelection = (beat: any) => {
    const isSelected = selectedBeats.some(b => b.id === beat.id);
    console.log(`🎵 SelectBeatsStep: Toggling beat ${beat.title} (${isSelected ? 'deselecting' : 'selecting'})`);
    
    if (isSelected) {
      updateData({
        selectedBeats: selectedBeats.filter(b => b.id !== beat.id)
      });
    } else {
      updateData({
        selectedBeats: [...selectedBeats, beat]
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white">Loading beats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Select Beats for Pack</h3>
        <p className="text-gray-400 mb-4">Choose beats from your existing listings to include in this pack</p>
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search beats by title, artist, or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black border-2 border-gray-600 text-white cursor-text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredBeats.map(beat => {
            const isSelected = selectedBeats.some(b => b.id === beat.id);
            return (
              <div
                key={beat.id}
                onClick={() => toggleBeatSelection(beat)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-green-900 border-green-500' 
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white truncate">{beat.title}</h4>
                  {isSelected && <span className="text-green-400">✓</span>}
                </div>
                <p className="text-gray-400 text-sm">{beat.artist}</p>
                <p className="text-gray-500 text-xs">{beat.genre}</p>
                <p className="text-green-400 font-bold">${beat.price.toFixed(2)}</p>
              </div>
            );
          })}
        </div>

        {filteredBeats.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No beats found matching your search.
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-800 rounded-lg border-2 border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-bold">Selected Beats: {selectedBeats.length}</p>
            {selectedBeats.length > 0 && (
              <span className="text-green-400 text-sm font-bold">
                ✓ Ready to proceed
              </span>
            )}
          </div>
          {selectedBeats.length > 0 && (
            <div className="mt-2 space-y-1">
              {selectedBeats.map(beat => (
                <div key={beat.id} className="text-gray-400 text-sm">
                  • {beat.title} by {beat.artist} - ${beat.price.toFixed(2)}
                </div>
              ))}
            </div>
          )}
          {selectedBeats.length === 0 && (
            <p className="text-gray-500 text-sm">Select beats by clicking on them above</p>
          )}
        </div>
      </div>
    </div>
  );
}
