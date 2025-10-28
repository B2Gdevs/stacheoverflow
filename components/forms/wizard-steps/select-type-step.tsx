'use client';

import React from 'react';
import { Music, Package } from 'lucide-react';
import { WizardCard } from '@/lib/wizard/cards';
import { UploadType, WizardStep, useWizard } from '@/lib/wizard';

export function SelectTypeStep() {
  const { data, updateData, goToStep } = useWizard();

  const handleTypeSelect = (type: UploadType) => {
    console.log('🎵 SelectTypeStep: Type selected:', type);
    updateData({ uploadType: type });
    
    // Automatically advance to the next step
    if (type === UploadType.SINGLE) {
      console.log('🎵 SelectTypeStep: Advancing to BEAT_INFO step');
      goToStep(WizardStep.BEAT_INFO);
    } else {
      console.log('🎵 SelectTypeStep: Advancing to PACK_INFO step');
      goToStep(WizardStep.PACK_INFO);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <WizardCard
        title="Single Beat"
        description="Upload a single beat with audio files and metadata"
        icon={<Music className="h-5 w-5" />}
        onClick={() => handleTypeSelect(UploadType.SINGLE)}
        isSelected={data.uploadType === UploadType.SINGLE}
      />
      <WizardCard
        title="Beat Pack"
        description="Create a pack from existing beats"
        icon={<Package className="h-5 w-5" />}
        onClick={() => handleTypeSelect(UploadType.PACK)}
        isSelected={data.uploadType === UploadType.PACK}
      />
    </div>
  );
}
