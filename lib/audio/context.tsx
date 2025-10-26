'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Track, AudioState, AudioControls } from './types';

interface AudioContextType {
  currentTrack: Track | null;
  isPlayerVisible: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  toggleTrack: () => void;
  closePlayer: () => void;
  playerState: AudioState;
  playerControls: AudioControls;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [playerState, setPlayerState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleEnded = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    const handlePlay = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const playerControls: AudioControls = {
    play: useCallback(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, []),

    pause: useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }, []),

    toggle: useCallback(() => {
      if (audioRef.current) {
        if (playerState.isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      }
    }, [playerState.isPlaying]),

    seek: useCallback((time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setPlayerState(prev => ({ ...prev, currentTime: time }));
      }
    }, []),

    setVolume: useCallback((volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        setPlayerState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
      }
    }, []),

    mute: useCallback(() => {
      if (audioRef.current) {
        audioRef.current.volume = 0;
        setPlayerState(prev => ({ ...prev, isMuted: true }));
      }
    }, []),

    unmute: useCallback(() => {
      if (audioRef.current) {
        audioRef.current.volume = playerState.volume;
        setPlayerState(prev => ({ ...prev, isMuted: false }));
      }
    }, [playerState.volume]),

    loadTrack: useCallback((src: string) => {
      if (audioRef.current) {
        audioRef.current.src = src;
        audioRef.current.load();
        setPlayerState(prev => ({ ...prev, currentTime: 0, isPlaying: false }));
      }
    }, []),
  };

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
    playerControls,
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
