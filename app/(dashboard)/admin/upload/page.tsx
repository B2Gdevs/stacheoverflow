'use client';

import { useRouter } from 'next/navigation';
import { BeatUploadWizard } from '@/components/beat-upload-wizard';

export default function UploadBeatPage() {
  const router = useRouter();

  const handleComplete = (result: any) => {
    console.log('Upload completed:', result);
    router.push('/dashboard');
  };

  return (
    <BeatUploadWizard 
      onCancel={() => router.back()}
      onComplete={handleComplete}
    />
  );
}