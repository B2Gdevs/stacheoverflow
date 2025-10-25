'use client';

import React from 'react';
import { Download, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/contexts/audio-context';
import { AudioPlayer } from '@/components/audio-player';

interface GlobalAudioPlayerProps {
  onPurchase?: (trackId: string) => void;
  onDownload?: (trackId: string) => void;
}

export function GlobalAudioPlayer({ onPurchase, onDownload }: GlobalAudioPlayerProps) {
  const { 
    currentTrack, 
    isPlayerVisible, 
    closePlayer, 
    playerState 
  } = useAudio();

  if (!isPlayerVisible || !currentTrack) return null;

  const audioSrc = currentTrack.audioFile ? `/api/audio/${currentTrack.audioFile}` : '';

  return (
    <div className="sticky bottom-0 z-50 bg-black border-t-2 border-gray-700 w-full">
      <div className="flex items-center justify-between p-3">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            {currentTrack.imageFile ? (
              <img 
                src={`/api/files/${currentTrack.imageFile}`} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-amber-600/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-white truncate text-sm">{currentTrack.title}</h4>
            <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {currentTrack.genre && (
                <span className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600">
                  {currentTrack.genre}
                </span>
              )}
              {currentTrack.isPack && currentTrack.packBeats && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  {currentTrack.packBeats} beats
                </span>
              )}
              {currentTrack.price && (
                <span className="text-xs font-bold text-green-400">
                  ${currentTrack.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex-1 justify-center">
          <AudioPlayer src={audioSrc} />
        </div>

        {/* Purchase/Download Actions */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          {currentTrack.isPurchased ? (
            <Button
              size="sm"
              onClick={() => onDownload?.(currentTrack.id)}
              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 cursor-pointer"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onPurchase?.(currentTrack.id)}
              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 cursor-pointer"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Buy Now
            </Button>
          )}
        </div>

        {/* Close Button */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={closePlayer}
            className="text-gray-400 hover:text-white w-6 h-6 p-0 cursor-pointer"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
