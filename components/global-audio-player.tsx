'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/contexts/audio-context';

interface AudioPlayerProps {
  onPurchase?: (trackId: string) => void;
  onDownload?: (trackId: string) => void;
}

export default function GlobalAudioPlayer({ onPurchase, onDownload }: AudioPlayerProps) {
  const { 
    currentTrack, 
    isPlayerVisible, 
    closePlayer, 
    playerState,
    playerControls,
    toggleTrack 
  } = useAudio();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && currentTrack?.audioFile) {
      const audio = audioRef.current;
      audio.src = `/api/audio/${currentTrack.audioFile}`;
      audio.load();
    }
  }, [currentTrack]);

  const togglePlayPause = () => {
    toggleTrack();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    const newTime = parseFloat((e.target as HTMLInputElement).value);
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isPlayerVisible || !currentTrack) return null;

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

        {/* Audio Element */}
        {currentTrack.audioFile && (
          <audio
            ref={audioRef}
            src={`/api/audio/${currentTrack.audioFile}`}
            preload="metadata"
            className="hidden"
          />
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          <Button
            size="sm"
            onClick={togglePlayPause}
            className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full cursor-pointer"
          >
            {playerState.isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">{formatTime(playerState.currentTime)}</span>
            <div className="relative w-24">
              <input
                type="range"
                min="0"
                max={playerState.duration || 0}
                value={playerState.currentTime}
                onChange={handleSeek}
                onInput={handleSeek}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(playerState.currentTime / (playerState.duration || 1)) * 100}%, #374151 ${(playerState.currentTime / (playerState.duration || 1)) * 100}%, #374151 100%)`
                }}
                disabled={!playerState.duration}
              />
            </div>
            <span className="text-xs text-gray-400 w-6">{formatTime(playerState.duration)}</span>
          </div>
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

        {/* Volume and Close */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => playerControls.mute()}
              className="text-gray-400 hover:text-white w-6 h-6 p-0 cursor-pointer"
            >
              {playerState.isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={playerState.isMuted ? 0 : playerState.volume}
              onChange={(e) => playerControls.setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
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
