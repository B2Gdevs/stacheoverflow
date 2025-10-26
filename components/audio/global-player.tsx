'use client';

import { AudioPlayer } from '@/lib/audio';

interface GlobalAudioPlayerProps {
  onPurchase?: (trackId: string) => void;
  onDownload?: (trackId: string) => void;
}

export default function GlobalAudioPlayer({ onPurchase, onDownload }: GlobalAudioPlayerProps) {
  return <AudioPlayer onPurchase={onPurchase} onDownload={onDownload} />;
}
