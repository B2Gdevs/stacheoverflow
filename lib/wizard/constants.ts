// Wizard system constants and enums

export enum WizardMode {
  CREATE = 'create',
  EDIT = 'edit'
}

export enum WizardStep {
  SELECT_TYPE = 'select_type',
  BEAT_INFO = 'beat_info',
  PACK_INFO = 'pack_info',
  UPLOAD_FILES = 'upload_files',
  SELECT_BEATS = 'select_beats',
  REVIEW = 'review',
  COMPLETE = 'complete'
}

export enum UploadType {
  SINGLE = 'single',
  PACK = 'pack'
}

export enum Category {
  ARTIST = 'artist',
  GAME = 'game'
}

export enum WizardStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export const WIZARD_STEPS = {
  [WizardStep.SELECT_TYPE]: {
    title: 'Select Upload Type',
    description: 'Choose how you want to upload your music',
    icon: 'Music'
  },
  [WizardStep.BEAT_INFO]: {
    title: 'Beat Information',
    description: 'Enter details about your beat',
    icon: 'FileText'
  },
  [WizardStep.PACK_INFO]: {
    title: 'Pack Information',
    description: 'Enter details about your beat pack',
    icon: 'Package'
  },
  [WizardStep.UPLOAD_FILES]: {
    title: 'Upload Files',
    description: 'Upload your audio and image files',
    icon: 'Upload'
  },
  [WizardStep.SELECT_BEATS]: {
    title: 'Select Beats',
    description: 'Choose beats to include in your pack',
    icon: 'Search'
  },
  [WizardStep.REVIEW]: {
    title: 'Review & Submit',
    description: 'Review your information before submitting',
    icon: 'Check'
  },
  [WizardStep.COMPLETE]: {
    title: 'Complete',
    description: 'Your upload is complete',
    icon: 'CheckCircle'
  }
} as const;

export const CATEGORY_OPTIONS = [
  { value: Category.ARTIST, label: 'Beats for Artists', description: 'Music for recording artists' },
  { value: Category.GAME, label: 'Music for Games', description: 'Music for video games and media' }
] as const;

export const GENRE_OPTIONS = [
  'Hip Hop', 'Trap', 'R&B', 'Pop', 'Electronic', 'Rock', 'Jazz', 'Classical', 'Ambient', 'Folk'
] as const;

export const CATEGORY_TAGS = {
  [Category.ARTIST]: [
    'Chorus', 'Verse', 'Hook', 'Bridge', 'Intro', 'Outro', 'Instrumental', 'Acapella'
  ],
  [Category.GAME]: [
    'Boss Battle', 'Exploration', 'Combat', 'Menu', 'Victory', 'Defeat', 'Ambient', 'Action'
  ]
} as const;
