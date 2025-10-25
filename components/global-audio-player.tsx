'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  isVisible: boolean;
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    imageFile?: string;
    audioFile?: string;
  } | null;
  onClose: () => void;
}

export default function GlobalAudioPlayer({ isVisible, currentTrack, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previewTimer, setPreviewTimer] = useState<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);

      // Auto-play when track changes
      const playTrack = async () => {
        try {
          await audio.play();
          setIsPlaying(true);
          
          // Set 30-second timer for preview
          const timer = setTimeout(() => {
            audio.pause();
            setIsPlaying(false);
          }, 30000);
          setPreviewTimer(timer);
        } catch (error) {
          console.error('Auto-play failed:', error);
        }
      };

      // Start playing immediately when track loads
      if (audio.readyState >= 2) {
        playTrack();
      } else {
        audio.addEventListener('canplay', playTrack, { once: true });
      }

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('canplay', playTrack);
        
        // Clear any existing timer
        if (previewTimer) {
          clearTimeout(previewTimer);
          setPreviewTimer(null);
        }
      };
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Cleanup timer when component unmounts or track changes
  useEffect(() => {
    return () => {
      if (previewTimer) {
        clearTimeout(previewTimer);
        setPreviewTimer(null);
      }
    };
  }, [previewTimer]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    const newTime = parseFloat((e.target as HTMLInputElement).value);
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible || !currentTrack) return null;

  return (
    <div className="sticky bottom-0 z-50 bg-black border-t-2 border-gray-700 w-full">
      <div className="flex items-center justify-between p-4">
        {/* Track Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
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
            <h4 className="font-bold text-white truncate">{currentTrack.title}</h4>
            <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
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
        <div className="flex items-center gap-4 flex-1 justify-center">
          <Button
            size="sm"
            onClick={togglePlayPause}
            className="bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded-full"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-8">{formatTime(currentTime)}</span>
            <div className="relative w-32">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                onInput={handleSeek}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
                }}
                disabled={!duration}
              />
            </div>
            <span className="text-xs text-gray-400 w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume and Close */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
