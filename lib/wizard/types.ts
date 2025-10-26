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
}

export interface PackData {
  title: string;
  artist: string;
  genre: string;
  price: number;
  description: string;
  imageFile: File | null;
  selectedBeats: BeatData[];
  published: boolean;
}

export interface WizardData {
  uploadType: UploadType;
  beat: BeatData;
  pack: PackData;
  selectedBeats: BeatData[];
}
