'use client';

import { Heart, ShoppingCart, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayButton } from '@/lib/audio';
import { getIconSize, getIconButtonSize } from '@/lib/utils/icon-sizes';
import { useRouter } from 'next/navigation';

interface BeatCardProps {
  beat: any;
  isPlaying?: boolean;
  onPlay: () => void;
  onToggle: () => void;
  currentUser?: any;
  getImageUrl: (beat: any) => string;
}

export function BeatCard({ 
  beat, 
  isPlaying, 
  onPlay, 
  onToggle,
  currentUser,
  getImageUrl
}: BeatCardProps) {
  const router = useRouter();

  return (
    <div className="group bg-black rounded-lg border-2 border-gray-700 hover:border-green-500 transition-all duration-200 hover:shadow-lg">
      {/* Beat Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-900">
        {beat.imageFile ? (
          <img 
            src={getImageUrl(beat) || '/placeholder-image.png'} 
            alt={beat.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-amber-600/20" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayButton
            isPlaying={isPlaying || false}
            onToggle={onToggle}
            variant="green"
          />
        </div>
        <div className="absolute top-3 right-3">
          <Button
            size="sm"
            variant="ghost"
            className={`${getIconButtonSize('sm')} bg-black/50 hover:bg-black/70 text-white`}
          >
            <Heart className={getIconSize('sm')} />
          </Button>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            beat.published 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {beat.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Beat Info */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-white truncate">{beat.title}</h3>
            <p className="text-xs text-gray-400 truncate">{beat.artist}</p>
          </div>
          <span className="text-sm font-bold text-green-500 ml-2">
            ${beat.price.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-600">
            {beat.genre}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2 mt-2">
          {/* Buy Button - Only show for non-admins */}
          {currentUser?.role !== 'admin' && (
            <Button 
              size="sm" 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xs cursor-pointer min-h-[44px] sm:min-h-0"
            >
              <ShoppingCart className={`${getIconSize('sm')} mr-1`} />
              Buy Now
            </Button>
          )}

          {/* Admin Actions */}
          {currentUser?.role === 'admin' && (
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1 cursor-pointer min-h-[44px] sm:min-h-0"
                onClick={() => router.push(`/admin/edit/${beat.id}`)}
              >
                <Edit className={`${getIconSize('sm')} mr-1`} />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1 cursor-pointer min-h-[44px] sm:min-h-0"
              >
                <Trash2 className={`${getIconSize('sm')} mr-1`} />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

