import { useWizard } from './context';
import { WizardStep } from './constants';

export function useWizardNavigation() {
  const { state, data, goToStep } = useWizard();

  const getCurrentStepIndex = (steps: WizardStep[]) => {
    return steps.indexOf(state.currentStep);
  };

  const canGoBack = (steps: WizardStep[]) => {
    const currentIndex = getCurrentStepIndex(steps);
    return currentIndex > 0;
  };

  const canGoNext = (steps: WizardStep[]) => {
    const currentIndex = getCurrentStepIndex(steps);
    return currentIndex < steps.length - 1;
  };

  const goToNext = (steps: WizardStep[]) => {
    const currentIndex = getCurrentStepIndex(steps);
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      goToStep(steps[nextIndex]);
    }
  };

  const goToPrevious = (steps: WizardStep[]) => {
    const currentIndex = getCurrentStepIndex(steps);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      goToStep(steps[prevIndex]);
    }
  };

  const isFirstStep = (steps: WizardStep[]) => {
    return getCurrentStepIndex(steps) === 0;
  };

  const isLastStep = (steps: WizardStep[]) => {
    return getCurrentStepIndex(steps) === steps.length - 1;
  };

  return {
    state,
    data,
    goToStep,
    getCurrentStepIndex,
    canGoBack,
    canGoNext,
    goToNext,
    goToPrevious,
    isFirstStep,
    isLastStep,
  };
}

export function useWizardValidation() {
  const { data } = useWizard();

  const validateRequiredFields = (fields: Record<string, any>) => {
    const errors: string[] = [];
    
    Object.entries(fields).forEach(([field, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && value <= 0)) {
        errors.push(`${field} is required`);
      }
    });

    return errors;
  };

  const validateArrayNotEmpty = (array: any[], fieldName: string) => {
    if (!array || array.length === 0) {
      return [`${fieldName} must have at least one item`];
    }
    return [];
  };

  return {
    validateRequiredFields,
    validateArrayNotEmpty,
  };
}
