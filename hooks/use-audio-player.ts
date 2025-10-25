import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  loadTrack: (src: string) => void;
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<AudioPlayerState>({
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
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
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

  const controls: AudioPlayerControls = {
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
        if (state.isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      }
    }, [state.isPlaying]),

    seek: useCallback((time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setState(prev => ({ ...prev, currentTime: time }));
      }
    }, []),

    setVolume: useCallback((volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
      }
    }, []),

    mute: useCallback(() => {
      if (audioRef.current) {
        audioRef.current.volume = 0;
        setState(prev => ({ ...prev, isMuted: true }));
      }
    }, []),

    unmute: useCallback(() => {
      if (audioRef.current) {
        audioRef.current.volume = state.volume;
        setState(prev => ({ ...prev, isMuted: false }));
      }
    }, [state.volume]),

    loadTrack: useCallback((src: string) => {
      if (audioRef.current) {
        audioRef.current.src = src;
        audioRef.current.load();
        setState(prev => ({ ...prev, currentTime: 0, isPlaying: false }));
      }
    }, []),
  };

  return {
    state,
    controls,
    audioRef,
  };
}
