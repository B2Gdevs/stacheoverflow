import { WizardStep, UploadType, Category, WizardStatus } from './constants';

export interface WizardState {
  currentStep: WizardStep;
  status: WizardStatus;
  canGoBack: boolean;
  canGoForward: boolean;
  isComplete: boolean;
}

export interface WizardStepProps {
  step: WizardStep;
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

export interface WizardConfig {
  steps: WizardStep[];
  initialStep?: WizardStep;
  initialData: any;
  onComplete: (data: any) => void;
  onCancel?: () => void;
}

export interface BeatData {
  id?: number;
  title: string;
  artist: string;
  genre: string;
  price: number;
  duration: string;
  bpm: number;
  key: string;
  description: string;
  category: Category;
  tags: string[];
  audioFiles: {
    mp3: File | null;
    wav: File | null;
    stems: File | null;
  };
  imageFile: File | null;
  published: boolean;
  // Existing file references for edit mode
  existingFiles: {
    mp3: string | null;
    wav: string | null;
    stems: string | null;
    image: string | null;
  };
}

export interface PackData {
  id?: number;
  title: string;
  artist: string;
  genre: string;
  price: number;
  description: string;
  imageFile: File | null;
  published: boolean;
  // Existing file references for edit mode
  existingFiles: {
    image: string | null;
  };
}

export interface WizardData {
  uploadType: UploadType;
  beat: BeatData;
  pack: PackData;
  selectedBeats: BeatData[];
}
