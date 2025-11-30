'use client';

import { useState } from 'react';
import { Gift, Check, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { useToast } from '@/components/ui/toast';

interface PromoCodeInputProps {
  onRedeemSuccess?: (assetId: number, assetType: string) => void;
  className?: string;
}

export function PromoCodeInput({ onRedeemSuccess, className }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid' | 'redeemed'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [validatedCode, setValidatedCode] = useState<any>(null);
  const { addToast } = useToast();

  const handleValidate = async () => {
    if (!code.trim()) {
      setValidationState('idle');
      return;
    }

    setIsValidating(true);
    setValidationState('idle');
    setValidationMessage('');

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        if (data.alreadyRedeemed) {
          setValidationState('redeemed');
          setValidationMessage('You have already redeemed this code!');
          setValidatedCode(data);
        } else {
          setValidationState('valid');
          setValidationMessage(data.promoCode.description || 'Valid promo code!');
          setValidatedCode(data.promoCode);
        }
      } else {
        setValidationState('invalid');
        setValidationMessage(data.error || 'Invalid promo code');
        setValidatedCode(null);
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setValidationState('invalid');
      setValidationMessage('Error validating code. Please try again.');
      setValidatedCode(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRedeem = async () => {
    if (!code.trim() || validationState !== 'valid') return;

    setIsRedeeming(true);

    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.alreadyRedeemed) {
          addToast({
            type: 'info',
            title: 'Already Redeemed',
            description: 'You have already redeemed this code.',
          });
        } else {
          addToast({
            type: 'success',
            title: 'Success! 🎉',
            description: data.message || 'Promo code redeemed successfully!',
          });
          
          if (onRedeemSuccess) {
            onRedeemSuccess(data.assetId, data.assetType);
          }

          setValidationState('redeemed');
          setValidationMessage('Code redeemed! You can now download the asset.');
        }
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          description: data.error || 'Failed to redeem code',
        });
        setValidationState('invalid');
        setValidationMessage(data.error || 'Failed to redeem');
      }
    } catch (error) {
      console.error('Error redeeming promo code:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to redeem code. Please try again.',
      });
      setValidationState('invalid');
      setValidationMessage('Error redeeming code');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setValidationState('idle');
    setValidationMessage('');
    setValidatedCode(null);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <div className="relative flex-1">
        <Gift className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", getIconSize('sm'))} />
        <Input
          type="text"
          placeholder="Enter promo code..."
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (validationState !== 'idle') {
              setValidationState('idle');
              setValidationMessage('');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && code.trim()) {
              if (validationState === 'valid') {
                handleRedeem();
              } else {
                handleValidate();
              }
            }
          }}
          className={cn(
            "pl-10 pr-10 bg-black border-2 text-white placeholder-gray-400 min-h-[44px] sm:min-h-0",
            validationState === 'valid' && "border-green-500 focus:border-green-500",
            validationState === 'invalid' && "border-red-500 focus:border-red-500",
            validationState === 'redeemed' && "border-green-500 focus:border-green-500"
          )}
        />
        {code && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className={getIconSize('sm')} />
          </button>
        )}
      </div>

      {validationState === 'valid' ? (
        <Button
          onClick={handleRedeem}
          disabled={isRedeeming}
          className="bg-green-500 hover:bg-green-600 text-white min-h-[44px] sm:min-h-0 flex-shrink-0"
        >
          {isRedeeming ? (
            <>
              <Loader2 className={cn(getIconSize('sm'), "mr-2 animate-spin")} />
              Redeeming...
            </>
          ) : (
            <>
              <Sparkles className={cn(getIconSize('sm'), "mr-2")} />
              Redeem
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleValidate}
          disabled={isValidating || !code.trim()}
          variant="outline"
          className="bg-black border-2 border-gray-600 text-white hover:bg-gray-800 min-h-[44px] sm:min-h-0 flex-shrink-0"
        >
          {isValidating ? (
            <>
              <Loader2 className={cn(getIconSize('sm'), "mr-2 animate-spin")} />
              Validating...
            </>
          ) : (
            <>
              <Gift className={cn(getIconSize('sm'), "mr-2")} />
              Validate
            </>
          )}
        </Button>
      )}

      {validationMessage && (
        <div className={cn(
          "text-sm mt-1 sm:mt-0 sm:absolute sm:top-full sm:left-0 sm:mt-2 px-3 py-2 rounded-md",
          validationState === 'valid' || validationState === 'redeemed' 
            ? "bg-green-500/20 text-green-400 border border-green-500/50"
            : "bg-red-500/20 text-red-400 border border-red-500/50"
        )}>
          <div className="flex items-center gap-2">
            {validationState === 'valid' || validationState === 'redeemed' ? (
              <Check className={getIconSize('sm')} />
            ) : (
              <X className={getIconSize('sm')} />
            )}
            <span>{validationMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

