'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { WizardStep, WizardStatus } from './constants';
import { WizardState, WizardConfig, WizardData } from './types';

interface WizardContextType {
  state: WizardState;
  data: WizardData;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateData: (data: Partial<WizardData>) => void;
  setStatus: (status: WizardStatus) => void;
  complete: () => void;
  reset: () => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode;
  config: WizardConfig;
}) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(config.steps[0]);
  const [status, setStatus] = useState<WizardStatus>(WizardStatus.IDLE);
  const [data, setData] = useState<WizardData>(config.initialData);

  const currentStepIndex = config.steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === config.steps.length - 1;

  const state: WizardState = {
    currentStep,
    status,
    canGoBack: !isFirstStep,
    canGoForward: !isLastStep,
    isComplete: status === WizardStatus.SUCCESS
  };

  const goToStep = useCallback((step: WizardStep) => {
    if (config.steps.includes(step)) {
      setCurrentStep(step);
    }
  }, [config.steps]);

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStep(config.steps[nextIndex]);
    }
  }, [currentStepIndex, isLastStep, config.steps]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(config.steps[prevIndex]);
    }
  }, [currentStepIndex, isFirstStep, config.steps]);

  const updateData = useCallback((newData: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const complete = useCallback(() => {
    setStatus(WizardStatus.SUCCESS);
    config.onComplete(data);
  }, [data, config]);

  const reset = useCallback(() => {
    setCurrentStep(config.steps[0]);
    setStatus(WizardStatus.IDLE);
    setData(config.initialData);
  }, [config]);

  const value: WizardContextType = {
    state,
    data,
    goToStep,
    nextStep,
    previousStep,
    updateData,
    setStatus,
    complete,
    reset
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
