'use client';

import React from 'react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  src: string;
  autoPlay?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  className?: string;
}

export function AudioPlayer({ 
  src, 
  autoPlay = false, 
  onPlayPauseChange,
  className = '' 
}: AudioPlayerProps) {
  const { state, controls } = useAudioPlayer();

  // Load track when src changes
  React.useEffect(() => {
    if (src) {
      controls.loadTrack(src);
    }
  }, [src, controls]);

  // Auto-play when enabled
  React.useEffect(() => {
    if (autoPlay && src) {
      controls.play();
    }
  }, [autoPlay, src, controls]);

  // Notify parent of play/pause changes
  React.useEffect(() => {
    onPlayPauseChange?.(state.isPlaying);
  }, [state.isPlaying, onPlayPauseChange]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        size="sm"
        onClick={controls.toggle}
        className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full cursor-pointer"
      >
        {state.isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
      </Button>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-6">{formatTime(state.currentTime)}</span>
        <div className="relative w-24">
          <input
            type="range"
            min="0"
            max={state.duration || 0}
            value={state.currentTime}
            onChange={(e) => controls.seek(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(state.currentTime / (state.duration || 1)) * 100}%, #374151 ${(state.currentTime / (state.duration || 1)) * 100}%, #374151 100%)`
            }}
            disabled={!state.duration}
          />
        </div>
        <span className="text-xs text-gray-400 w-6">{formatTime(state.duration)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={state.isMuted ? controls.unmute : controls.mute}
          className="text-gray-400 hover:text-white w-6 h-6 p-0 cursor-pointer"
        >
          {state.isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </Button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={state.isMuted ? 0 : state.volume}
          onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
          className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
