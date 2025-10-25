'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAudioPlayer } from '@/hooks/use-audio-player';

interface Track {
  id: string;
  title: string;
  artist: string;
  imageFile?: string;
  audioFile?: string;
  price?: number;
  genre?: string;
  duration?: number;
  bpm?: number;
  key?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPack?: boolean;
  packBeats?: number;
  isPurchased?: boolean;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlayerVisible: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  toggleTrack: () => void;
  closePlayer: () => void;
  playerState: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
  };
  playerControls: {
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    mute: () => void;
    unmute: () => void;
  };
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  
  const { state: playerState, controls: playerControls } = useAudioPlayer();

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlayerVisible(true);
    
    if (track.audioFile) {
      const audioSrc = `/api/audio/${track.audioFile}`;
      playerControls.loadTrack(audioSrc);
      playerControls.play();
    }
  }, [playerControls]);

  const pauseTrack = useCallback(() => {
    playerControls.pause();
  }, [playerControls]);

  const resumeTrack = useCallback(() => {
    playerControls.play();
  }, [playerControls]);

  const toggleTrack = useCallback(() => {
    playerControls.toggle();
  }, [playerControls]);

  const closePlayer = useCallback(() => {
    setIsPlayerVisible(false);
    setCurrentTrack(null);
    playerControls.pause();
  }, [playerControls]);

  const value: AudioContextType = {
    currentTrack,
    isPlayerVisible,
    playTrack,
    pauseTrack,
    resumeTrack,
    toggleTrack,
    closePlayer,
    playerState,
    playerControls: {
      seek: playerControls.seek,
      setVolume: playerControls.setVolume,
      mute: playerControls.mute,
      unmute: playerControls.unmute,
    },
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
