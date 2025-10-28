'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { 
  WizardProvider, 
  WizardContainer, 
  WizardHeader, 
  WizardProgress, 
  WizardStepContainer,
  WizardNavigation,
  WizardStep,
  UploadType,
  Category,
  useWizard,
  WizardMode
} from '@/lib/wizard';

// Import step components
import {
  SelectTypeStep,
  BeatInfoStep,
  UploadFilesStep,
  PackInfoStep,
  SelectBeatsStep,
  ReviewStep
} from './wizard-steps';

// Import API functions
import { submitSingleBeat, submitBeatPack } from './wizard-api';

// Import types from wizard system
import { BeatData, PackData, WizardData } from '@/lib/wizard/types';

interface BeatWizardProps {
  mode: WizardMode;
  initialBeat?: any; // Existing beat data for edit mode
  onCancel?: () => void;
  onComplete?: (data: any) => void;
}

// Main Wizard Component
function BeatWizardContent({ mode, onCancel, onComplete }: BeatWizardProps) {
  const { state, data, goToStep } = useWizard();

  console.log('🎵 BeatWizardContent: Current wizard state:', state);
  console.log('🎵 BeatWizardContent: Current wizard data:', data);
  console.log('🎵 BeatWizardContent: Mode:', mode);

  const getStepsForType = (uploadType: UploadType) => {
    if (uploadType === UploadType.SINGLE) {
      return [
        WizardStep.SELECT_TYPE,
        WizardStep.BEAT_INFO,
        WizardStep.UPLOAD_FILES,
        WizardStep.REVIEW
      ];
    } else {
      return [
        WizardStep.SELECT_TYPE,
        WizardStep.PACK_INFO,
        WizardStep.SELECT_BEATS,
        WizardStep.REVIEW
      ];
    }
  };

  const getCurrentStepIndex = () => {
    const steps = getStepsForType(data.uploadType);
    return steps.indexOf(state.currentStep);
  };

  const getCurrentSteps = () => {
    return getStepsForType(data.uploadType);
  };

  const renderStep = () => {
    console.log('🎵 BeatWizardContent: Rendering step:', state.currentStep);
    switch (state.currentStep) {
      case WizardStep.SELECT_TYPE:
        return <SelectTypeStep />;
      case WizardStep.BEAT_INFO:
        return <BeatInfoStep />;
      case WizardStep.UPLOAD_FILES:
        return <UploadFilesStep />;
      case WizardStep.PACK_INFO:
        return <PackInfoStep />;
      case WizardStep.SELECT_BEATS:
        return <SelectBeatsStep />;
      case WizardStep.REVIEW:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  const steps = getCurrentSteps();
  const currentStepIndex = getCurrentStepIndex();
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Navigation handlers
  const handleNext = () => {
    console.log('🎵 BeatWizardContent: Next button clicked');
    if (isLastStep) {
      return; // Review step handles its own submission
    }

    // Validation before proceeding
    if (state.currentStep === WizardStep.BEAT_INFO) {
      const { beat } = data;
      if (!beat.title || !beat.artist || !beat.genre || !beat.price || beat.price <= 0) {
        alert('Please fill in all required fields (Title, Artist, Genre, Price)');
        return;
      }
    }

    if (state.currentStep === WizardStep.PACK_INFO) {
      const { pack } = data;
      if (!pack.title || !pack.artist || !pack.genre || !pack.price || pack.price <= 0) {
        alert('Please fill in all required fields (Pack Title, Artist, Genre, Price)');
        return;
      }
    }

    if (state.currentStep === WizardStep.SELECT_BEATS) {
      if (data.selectedBeats.length === 0) {
        alert('Please select at least one beat for the pack');
        return;
      }
    }
    
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      console.log('🎵 BeatWizardContent: Advancing to step:', steps[nextStepIndex]);
      goToStep(steps[nextStepIndex]);
    }
  };

  const handleBack = () => {
    console.log('🎵 BeatWizardContent: Back button clicked');
    if (isFirstStep) {
      return;
    }
    
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      console.log('🎵 BeatWizardContent: Going back to step:', steps[prevStepIndex]);
      goToStep(steps[prevStepIndex]);
    }
  };

  const handleComplete = async (wizardData: WizardData) => {
    console.log('🎵 BeatWizardContent: handleComplete called with data:', wizardData);
    try {
      if (wizardData.uploadType === UploadType.SINGLE) {
        console.log('🎵 BeatWizardContent: Submitting single beat');
        await submitSingleBeat(wizardData.beat, mode);
      } else {
        console.log('🎵 BeatWizardContent: Submitting beat pack');
        await submitBeatPack(wizardData.pack, wizardData.selectedBeats, mode);
      }
      
      console.log('🎵 BeatWizardContent: Submission successful, calling onComplete');
      onComplete?.(wizardData);
    } catch (error) {
      console.error('🎵 BeatWizardContent: Error submitting wizard data:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <WizardContainer>
      <WizardHeader
        title={mode === WizardMode.EDIT ? "Edit Music" : "Upload Music"}
        description={mode === WizardMode.EDIT 
          ? "Edit your beat or pack details" 
          : "Create and upload your beats or create beat packs"
        }
      />
      
      <WizardProgress steps={steps} />

      <WizardNavigation
        onCancel={onCancel}
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={!isFirstStep}
        canGoNext={!isLastStep}
        nextText="Next →"
        className="mb-6"
      />

      <WizardStepContainer>
        {renderStep()}
      </WizardStepContainer>
    </WizardContainer>
  );
}

// Main Export
export function BeatWizard({ mode, initialBeat, onCancel, onComplete }: BeatWizardProps) {
  const router = useRouter();
  const { addToast } = useToast();

  console.log('🎵 BeatWizard: Initializing with mode:', mode);
  console.log('🎵 BeatWizard: Initial beat data:', initialBeat);

  // Convert existing beat data to wizard format
  const convertBeatToWizardData = (beat: any): WizardData => {
    console.log('🎵 BeatWizard: Converting beat to wizard data:', beat);
    
    // Determine if this is a pack or single beat
    const isPack = beat.isPack || beat.packId;
    console.log('🎵 BeatWizard: Is pack?', isPack);
    
    const wizardData = {
      uploadType: isPack ? UploadType.PACK : UploadType.SINGLE,
      beat: {
        id: beat.id,
        title: beat.title || '',
        artist: beat.artist || '',
        genre: beat.genre || '',
        price: beat.price ? beat.price / 100 : 0, // Convert from cents to dollars
        duration: beat.duration || '',
        bpm: beat.bpm || 0,
        key: beat.key || '',
        description: beat.description || '',
        category: beat.category || Category.ARTIST,
        tags: beat.tags || [],
        audioFiles: {
          mp3: null, // Files can't be pre-populated
          wav: null,
          stems: null
        },
        imageFile: null, // Files can't be pre-populated
        published: beat.published || false,
        // Store existing file references
        existingFiles: {
          mp3: beat.audioFiles?.mp3 || null,
          wav: beat.audioFiles?.wav || null,
          stems: beat.audioFiles?.stems || null,
          image: beat.imageFile || null
        }
      },
      pack: {
        id: isPack ? beat.id : undefined,
        title: isPack ? beat.title : '',
        artist: isPack ? beat.artist : '',
        genre: isPack ? beat.genre : '',
        price: isPack && beat.price ? beat.price / 100 : 0,
        description: isPack ? beat.description : '',
        imageFile: null,
        published: beat.published || false,
        // Store existing pack image
        existingFiles: {
          image: isPack ? (beat.imageFile || null) : null
        }
      },
      selectedBeats: []
    };
    
    console.log('🎵 BeatWizard: Converted wizard data:', wizardData);
    console.log('🎵 BeatWizard: Beat existingFiles:', wizardData.beat.existingFiles);
    console.log('🎵 BeatWizard: Pack existingFiles:', wizardData.pack.existingFiles);
    
    return wizardData;
  };

  const initialData: WizardData = mode === WizardMode.EDIT && initialBeat 
    ? convertBeatToWizardData(initialBeat)
    : {
        uploadType: UploadType.SINGLE,
        beat: {
          id: undefined,
          title: '',
          artist: '',
          genre: '',
          price: 0,
          duration: '',
          bpm: 0,
          key: '',
          description: '',
          category: Category.ARTIST,
          tags: [],
          audioFiles: {
            mp3: null,
            wav: null,
            stems: null
          },
          imageFile: null,
          published: false,
          existingFiles: {
            mp3: null,
            wav: null,
            stems: null,
            image: null
          }
        },
        pack: {
          id: undefined,
          title: '',
          artist: '',
          genre: '',
          price: 0,
          description: '',
          imageFile: null,
          published: false,
          existingFiles: {
            image: null
          }
        },
        selectedBeats: []
      };

  console.log('🎵 BeatWizard: Initial data for wizard:', initialData);

  const config = {
    mode,
    steps: [
      WizardStep.SELECT_TYPE,
      WizardStep.BEAT_INFO,
      WizardStep.UPLOAD_FILES,
      WizardStep.PACK_INFO,
      WizardStep.SELECT_BEATS,
      WizardStep.REVIEW
    ],
    initialData,
    onComplete: async (data: WizardData) => {
      console.log('🎵 BeatWizard: Wizard completed with data:', data);
      
      try {
        if (data.uploadType === UploadType.SINGLE) {
          console.log('🎵 BeatWizard: Submitting single beat...');
          await submitSingleBeat(data.beat, mode);
        } else {
          console.log('🎵 BeatWizard: Submitting beat pack...');
          await submitBeatPack(data.pack, data.selectedBeats, mode);
        }
        
        console.log('🎵 BeatWizard: Submission successful, redirecting...');
        
        addToast({
          type: 'success',
          title: mode === WizardMode.EDIT ? 'Beat Updated Successfully!' : 'Beat Created Successfully!',
          description: mode === WizardMode.EDIT ? 'Your changes have been saved.' : 'Your beat has been created.',
          duration: 3000
        });
        
        if (mode === WizardMode.EDIT) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('🎵 BeatWizard: Submission failed:', error);
        
        addToast({
          type: 'error',
          title: 'Failed to Save Beat',
          description: (error as Error).message || 'An unexpected error occurred',
          duration: 5000
        });
      }
    },
    onCancel: onCancel || (() => router.back())
  };

  return (
    <WizardProvider config={config}>
      <BeatWizardContent mode={mode} onCancel={onCancel} onComplete={onComplete} />
    </WizardProvider>
  );
}