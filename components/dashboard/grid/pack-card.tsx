'use client';

import { ShoppingCart, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayButton } from '@/lib/audio';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { useRouter } from 'next/navigation';

interface PackCardProps {
  pack: any;
  isPlaying?: boolean;
  onPlay: () => void;
  onToggle: () => void;
  onViewDetails?: (pack: any) => void;
  currentUser?: any;
  getImageUrl: (pack: any) => string;
}

export function PackCard({ 
  pack, 
  isPlaying, 
  onPlay, 
  onToggle,
  onViewDetails,
  currentUser,
  getImageUrl
}: PackCardProps) {
  const router = useRouter();

  return (
    <div className="group bg-black rounded-lg border-2 border-gray-700 hover:border-amber-500 transition-all duration-200 hover:shadow-lg">
      {/* Pack Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-900">
        {pack.imageFile ? (
          <img 
            src={getImageUrl(pack) || '/placeholder-image.png'} 
            alt={pack.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayButton
            isPlaying={isPlaying || false}
            onToggle={onToggle}
            variant="amber"
          />
        </div>
        <div className="absolute top-3 right-3">
          <div className="bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
            Pack
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            pack.published 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {pack.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Pack Info */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-white truncate">{pack.title}</h3>
            <p className="text-xs text-gray-400 truncate">{pack.artist}</p>
          </div>
          <span className="text-sm font-bold text-amber-500 ml-2">
            ${pack.price.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-600">
            {pack.genre}
          </span>
          <span className="text-xs text-gray-400">{pack.beats?.length || 0} beats</span>
        </div>

        {/* Pack Details */}
        <div className="text-xs text-gray-400 space-y-1 mb-2">
          <div className="flex justify-between">
            <span>Individual total:</span>
            <span>${pack.beats?.reduce((sum: number, beat: any) => sum + beat.price, 0).toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Pack price:</span>
            <span className="text-amber-500">${pack.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>You save:</span>
            <span className="text-green-500">
              ${((pack.beats?.reduce((sum: number, beat: any) => sum + beat.price, 0) || 0) - pack.price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs min-h-[44px] sm:min-h-0"
            onClick={() => onViewDetails?.(pack)}
          >
            <Package className={`${getIconSize('sm')} mr-1`} />
            View Details
          </Button>

          {/* Buy Button - Only show for non-admins */}
          {currentUser?.role !== 'admin' && (
            <Button 
              size="sm" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer min-h-[44px] sm:min-h-0"
            >
              <ShoppingCart className={`${getIconSize('sm')} mr-1`} />
              Buy Pack
            </Button>
          )}

          {/* Admin Actions */}
          {currentUser?.role === 'admin' && (
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs flex-1 cursor-pointer min-h-[44px] sm:min-h-0"
                onClick={() => router.push(`/admin/edit-pack/${pack.id}`)}
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

