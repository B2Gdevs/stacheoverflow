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
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-4">
        {canGoBack && onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="bg-red-800 border-2 border-red-600 text-red-300 hover:bg-red-700 hover:border-red-500 cursor-pointer"
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {canGoNext && onNext && (
          <Button
            onClick={onNext}
            className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
          >
            {nextText}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {canComplete && onComplete && (
          <Button
            onClick={onComplete}
            className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
          >
            <Check className="h-4 w-4 mr-2" />
            {completeText}
          </Button>
        )}
      </div>
    </div>
  );
}
