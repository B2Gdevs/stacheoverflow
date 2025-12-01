'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, X, ShoppingCart, Edit, Music, Loader2 } from 'lucide-react';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

interface PackDetailsDialogProps {
  pack: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: any;
  getImageUrl: (pack: any) => string;
}

export function PackDetailsDialog({
  pack,
  open,
  onOpenChange,
  currentUser,
  getImageUrl
}: PackDetailsDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!pack) return null;

  const individualTotal = pack.beats?.reduce((sum: number, beat: any) => sum + (beat.price / 100), 0) || 0;
  const packPrice = pack.price / 100;
  const savings = individualTotal - packPrice;

  const handlePurchase = async () => {
    if (!pack.id || !pack.price) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Invalid pack information',
      });
      return;
    }

    setIsPurchasing(true);

    try {
      // For now, packs use the same purchase flow as beats
      // TODO: Create pack-specific purchase endpoint if needed
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          beatId: pack.id, // Using beatId field for pack purchases (may need packId field later)
          amount: pack.price,
          successUrl: `${window.location.origin}/marketplace?purchase=success`,
          cancelUrl: `${window.location.origin}/marketplace?purchase=cancelled`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      addToast({
        type: 'error',
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Failed to start purchase process',
      });
      setIsPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 text-white border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className={getIconSize('md')} />
            {pack.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pack Image and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              {pack.imageFile ? (
                <img
                  src={getImageUrl(pack) || '/placeholder-image.png'}
                  alt={pack.title}
                  className="w-full sm:w-48 h-48 object-cover rounded-lg border-2 border-gray-700"
                />
              ) : (
                <div className="w-full sm:w-48 h-48 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg border-2 border-gray-700 flex items-center justify-center">
                  <Package className={getIconSize('xl')} />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{pack.title}</h3>
                <p className="text-gray-400">by {pack.artist}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-gray-300 border border-gray-600">
                  {pack.genre}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  pack.published 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                }`}>
                  {pack.published ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-2xl font-bold text-amber-500">${packPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Beats in pack:</span>
                  <span className="text-white font-semibold">{pack.beats?.length || 0} beats</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Calculator */}
          {pack.beats && pack.beats.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Pack Value</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Individual total:</span>
                  <span className="text-gray-300 line-through">${individualTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pack price:</span>
                  <span className="text-amber-500 font-semibold">${packPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-gray-400">You save:</span>
                  <span className="text-green-500 font-bold">
                    ${savings.toFixed(2)} ({((savings / individualTotal) * 100).toFixed(0)}% OFF)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {pack.description && (
            <div>
              <h4 className="text-white font-semibold mb-2">Description</h4>
              <p className="text-gray-300">{pack.description}</p>
            </div>
          )}

          {/* Beats List */}
          {pack.beats && pack.beats.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Music className={getIconSize('sm')} />
                Beats in this pack ({pack.beats.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pack.beats.map((beat: any) => (
                  <div
                    key={beat.id}
                    className="bg-gray-800 border border-gray-700 rounded p-3 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{beat.title}</p>
                      <p className="text-gray-400 text-sm truncate">by {beat.artist}</p>
                    </div>
                    <span className="text-amber-500 font-semibold ml-4">${(beat.price / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-700">
            {currentUser?.role === 'admin' ? (
              <Button
                variant="outline"
                className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/admin/edit-pack/${pack.id}`);
                }}
              >
                <Edit className={cn(getIconSize('sm'), "mr-2")} />
                Edit Pack
              </Button>
            ) : (
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold"
                onClick={handlePurchase}
                disabled={isPurchasing || !pack.published}
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className={cn(getIconSize('sm'), "mr-2 animate-spin")} />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className={cn(getIconSize('sm'), "mr-2")} />
                    Buy Pack ${pack.price.toFixed(2)}
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

