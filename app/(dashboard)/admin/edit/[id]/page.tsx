'use client';

import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import { BeatWizard } from '@/components/forms/beat-wizard';
import { WizardMode } from '@/lib/wizard';

interface Beat {
  id: number;
  title: string;
  artist: string;
  genre: string;
  price: number;
  duration: number | null;
  bpm: number | null;
  key: string | null;
  description: string | null;
  audioFiles: {
    mp3: string | null;
    wav: string | null;
    stems: string | null;
  };
  imageFile: string | null;
  createdAt: string;
}

export default function EditBeatPage() {
  const router = useRouter();
  const params = useParams();
  const beatId = params.id as string;
  
  console.log('EditBeatPage - beatId:', beatId);

  // Fetch the beat data
  const { data: beat, error: fetchError, mutate } = useSWR<Beat>(
    beatId ? `/api/beats/${beatId}` : null,
    (url: string) => {
      console.log('Fetching beat from:', url);
      return fetch(url).then(res => {
        console.log('Beat fetch response:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`Failed to fetch beat: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });
    }
  );

  if (fetchError) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold">Edit Beat</h1>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <p className="text-red-400">Error loading beat: {fetchError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold">Edit Beat</h1>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <p className="text-gray-300">Loading beat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BeatWizard 
      mode={WizardMode.EDIT}
      initialBeat={beat}
      onCancel={() => router.back()} 
    />
  );
}