'use client';

import { useState, useEffect } from 'react';
import { Gift, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { PromoCodeInput } from './promo-code-input';

interface PromoCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode?: string;
}

export function PromoCodeModal({ open, onOpenChange, initialCode }: PromoCodeModalProps) {
  const [code, setCode] = useState(initialCode || '');
  const { addToast } = useToast();

  useEffect(() => {
    if (initialCode && open) {
      setCode(initialCode);
    }
  }, [initialCode, open]);

  const handleRedeemSuccess = (assetId: number, assetType: string) => {
    addToast({
      type: 'success',
      title: 'Asset Unlocked! 🎉',
      description: `You can now download this ${assetType}.`,
    });
    // Close modal after a short delay
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-black border-gray-800">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Gift className={cn(getIconSize('lg'), "text-green-400")} />
            <SheetTitle className="text-white">Redeem Promo Code</SheetTitle>
          </div>
          <SheetDescription className="text-gray-400">
            Enter a promo code to unlock free assets and exclusive content.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <PromoCodeInput 
            onRedeemSuccess={handleRedeemSuccess}
            className="w-full"
          />
        </div>

        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className={cn(getIconSize('sm'), "text-green-400 mt-0.5 flex-shrink-0")} />
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-1">How it works</h4>
              <p className="text-xs text-gray-400">
                Enter your promo code to unlock free beats, packs, or exclusive content. 
                Once redeemed, you'll have full download access to the unlocked asset.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

