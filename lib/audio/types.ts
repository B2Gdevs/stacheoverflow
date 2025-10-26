export interface Track {
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

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

export interface AudioControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  loadTrack: (src: string) => void;
}
