'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useWizard } from './context';
import { WizardStep } from './constants';

interface WizardProgressProps {
  steps: WizardStep[];
  className?: string;
}

export function WizardProgress({ steps, className = '' }: WizardProgressProps) {
  const { state } = useWizard();
  const currentIndex = steps.indexOf(state.currentStep);

  const getStepInfo = (step: WizardStep) => {
    switch (step) {
      case WizardStep.SELECT_TYPE:
        return { title: 'Select Type', description: 'Choose upload type' };
      case WizardStep.BEAT_INFO:
        return { title: 'Beat Info', description: 'Enter beat details' };
      case WizardStep.PACK_INFO:
        return { title: 'Pack Info', description: 'Enter pack details' };
      case WizardStep.UPLOAD_FILES:
        return { title: 'Upload Files', description: 'Upload your files' };
      case WizardStep.SELECT_BEATS:
        return { title: 'Select Beats', description: 'Choose beats for pack' };
      case WizardStep.REVIEW:
        return { title: 'Review', description: 'Review and submit' };
      case WizardStep.COMPLETE:
        return { title: 'Complete', description: 'Upload complete' };
      default:
        return { title: 'Step', description: '' };
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;
          const stepInfo = getStepInfo(step);

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 mb-2
                  ${isActive ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isUpcoming ? 'bg-gray-800 border-gray-600 text-gray-400' : ''}
                `}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-xs font-bold ${isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                    {stepInfo.title}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                    {stepInfo.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 transition-all duration-200
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
