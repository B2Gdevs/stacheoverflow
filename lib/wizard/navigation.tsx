'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface WizardNavigationProps {
  onCancel?: () => void;
  onBack?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  canComplete?: boolean;
  nextText?: string;
  completeText?: string;
  className?: string;
}

export function WizardNavigation({ 
  onCancel,
  onBack,
  onNext,
  onComplete,
  canGoBack = false,
  canGoNext = true,
  canComplete = false,
  nextText = "Next",
  completeText = "Complete",
  className = '' 
}: WizardNavigationProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between ${className}`}>
      <div className="flex gap-2 w-full sm:w-auto">
        {canGoBack && onBack && (
          <Button 
            variant="secondary" 
            onClick={onBack}
            className="flex-1 sm:flex-initial border-green-500 text-green-400 hover:bg-green-500/10 text-xs sm:text-sm px-3 sm:px-4 py-2 min-h-[44px] sm:min-h-0"
          >
            <span className="hidden sm:inline">← </span>Back
          </Button>
        )}
        {onCancel && (
          <Button 
            variant="destructive" 
            onClick={onCancel}
            className="flex-1 sm:flex-initial border-red-500 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm px-3 sm:px-4 py-2 min-h-[44px] sm:min-h-0"
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
        {canGoNext && onNext && (
          <Button 
            variant="default" 
            onClick={onNext}
            className="flex-1 sm:flex-initial bg-white text-black hover:bg-gray-200 text-xs sm:text-sm px-4 sm:px-6 py-2 min-h-[44px] sm:min-h-0 font-semibold"
          >
            {nextText}
            <span className="hidden sm:inline"> →</span>
          </Button>
        )}
        {canComplete && onComplete && (
          <Button 
            variant="default" 
            onClick={onComplete}
            className="flex-1 sm:flex-initial bg-white text-black hover:bg-gray-200 text-xs sm:text-sm px-4 sm:px-6 py-2 min-h-[44px] sm:min-h-0 font-semibold"
          >
            <Check className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {completeText}
          </Button>
        )}
      </div>
    </div>
  );
}
