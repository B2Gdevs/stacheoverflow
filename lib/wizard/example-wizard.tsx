// Example of how to create a new wizard using the reusable system
import React from 'react';
import { 
  WizardProvider, 
  WizardContainer, 
  WizardHeader, 
  WizardProgress, 
  WizardStepContainer,
  WizardStep,
  useWizardNavigation,
  useWizardValidation
} from './index';

// Define your wizard steps
const EXAMPLE_STEPS = [
  WizardStep.SELECT_TYPE,
  WizardStep.BEAT_INFO,
  WizardStep.REVIEW
] as const;

// Define your wizard data type
interface ExampleWizardData {
  step1: string;
  step2: number;
  step3: boolean;
}

// Step components
function Step1() {
  const { data, updateData } = useWizard();
  
  return (
    <div>
      <h3 className="text-white font-bold mb-4">Step 1</h3>
      <input
        type="text"
        value={data.step1 || ''}
        onChange={(e) => updateData({ step1: e.target.value })}
        className="bg-black border-2 border-gray-600 text-white p-2 rounded"
        placeholder="Enter something..."
      />
    </div>
  );
}

function Step2() {
  const { data, updateData } = useWizard();
  
  return (
    <div>
      <h3 className="text-white font-bold mb-4">Step 2</h3>
      <input
        type="number"
        value={data.step2 || 0}
        onChange={(e) => updateData({ step2: parseInt(e.target.value) || 0 })}
        className="bg-black border-2 border-gray-600 text-white p-2 rounded"
        placeholder="Enter a number..."
      />
    </div>
  );
}

function Step3() {
  const { data, updateData } = useWizard();
  
  return (
    <div>
      <h3 className="text-white font-bold mb-4">Step 3</h3>
      <label className="flex items-center text-white">
        <input
          type="checkbox"
          checked={data.step3 || false}
          onChange={(e) => updateData({ step3: e.target.checked })}
          className="mr-2"
        />
        Check this box
      </label>
    </div>
  );
}

function ReviewStep() {
  const { data, complete } = useWizard();
  
  const handleSubmit = () => {
    // Your submission logic here
    console.log('Submitting:', data);
    complete();
  };
  
  return (
    <div>
      <h3 className="text-white font-bold mb-4">Review</h3>
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-white">Step 1: {data.step1}</p>
        <p className="text-white">Step 2: {data.step2}</p>
        <p className="text-white">Step 3: {data.step3 ? 'Yes' : 'No'}</p>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        Submit
      </button>
    </div>
  );
}

// Main wizard content
function ExampleWizardContent({ onCancel, onComplete }: { onCancel?: () => void; onComplete?: () => void }) {
  const { state, goToStep } = useWizard();
  const { canGoBack, canGoNext, goToNext, goToPrevious, isFirstStep, isLastStep } = useWizardNavigation();
  const { validateRequiredFields } = useWizardValidation();

  const renderStep = () => {
    switch (state.currentStep) {
      case WizardStep.SELECT_TYPE:
        return <Step1 />;
      case WizardStep.BEAT_INFO:
        return <Step2 />;
      case WizardStep.REVIEW:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  const handleNext = () => {
    // Add validation here if needed
    if (state.currentStep === WizardStep.SELECT_TYPE) {
      const errors = validateRequiredFields({ step1: state.data.step1 });
      if (errors.length > 0) {
        alert(errors.join(', '));
        return;
      }
    }
    
    goToNext(EXAMPLE_STEPS);
  };

  const handleBack = () => {
    goToPrevious(EXAMPLE_STEPS);
  };

  return (
    <WizardContainer>
      <WizardHeader
        title="Example Wizard"
        description="This is an example of how to create a new wizard"
      />
      
      <WizardProgress steps={EXAMPLE_STEPS} />

      <WizardNavigation
        onCancel={onCancel}
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={canGoBack(EXAMPLE_STEPS)}
        canGoNext={canGoNext(EXAMPLE_STEPS)}
        nextText="Next →"
        className="mb-6"
      />

      <WizardStepContainer>
        {renderStep()}
      </WizardStepContainer>
    </WizardContainer>
  );
}

// Main export
export function ExampleWizard({ onCancel, onComplete }: { onCancel?: () => void; onComplete?: () => void }) {
  const initialData: ExampleWizardData = {
    step1: '',
    step2: 0,
    step3: false,
  };

  const config = {
    steps: EXAMPLE_STEPS,
    initialData,
    onComplete: (data: ExampleWizardData) => {
      console.log('Wizard completed with data:', data);
      onComplete?.(data);
    },
    onCancel
  };

  return (
    <WizardProvider config={config}>
      <ExampleWizardContent onCancel={onCancel} onComplete={onComplete} />
    </WizardProvider>
  );
}
