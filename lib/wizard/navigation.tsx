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
          <Button variant="secondary" onClick={onBack}>
            ← Back
          </Button>
        )}
        {onCancel && (
          <Button variant="destructive" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {canGoNext && onNext && (
          <Button variant="default" onClick={onNext}>
            {nextText}
          </Button>
        )}
        {canComplete && onComplete && (
          <Button variant="default" onClick={onComplete}>
            <Check className="mr-2 h-5 w-5" />
            {completeText}
          </Button>
        )}
      </div>
    </div>
  );
}
