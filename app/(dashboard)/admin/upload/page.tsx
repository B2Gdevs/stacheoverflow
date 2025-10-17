'use client';

import { useRouter } from 'next/navigation';
import BeatUploadForm from '@/components/beat-upload-form';

export default function UploadBeatPage() {
  const router = useRouter();

  return (
    <BeatUploadForm 
      mode="create" 
      onCancel={() => router.back()} 
    />
  );
}