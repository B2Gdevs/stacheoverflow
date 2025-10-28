'use client';

import { useRouter } from 'next/navigation';
import { BeatWizard } from '@/components/forms/beat-wizard';
import { WizardMode } from '@/lib/wizard';

export default function UploadBeatPage() {
  const router = useRouter();

  const handleComplete = (result: any) => {
    console.log('Upload completed:', result);
    router.push('/dashboard');
  };

  return (
    <BeatWizard 
      mode={WizardMode.CREATE}
      onCancel={() => router.back()}
      onComplete={handleComplete}
    />
  );
}