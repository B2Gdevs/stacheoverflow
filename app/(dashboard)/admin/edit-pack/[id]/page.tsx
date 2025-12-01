'use client';

import { useRouter, useParams } from 'next/navigation';
import { BeatWizard } from '@/components/forms/beat-wizard';
import { WizardMode } from '@/lib/wizard';
import { useBeatPack } from '@/lib/swr/hooks';

export default function EditPackPage() {
  const router = useRouter();
  const params = useParams();
  const packId = params.id as string;

  const { pack, isError: error, isLoading } = useBeatPack(packId || null);

  if (error) {
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
            <h1 className="text-3xl font-bold">Edit Beat Pack</h1>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <p className="text-red-400">Error loading pack</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !pack) {
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
            <h1 className="text-3xl font-bold">Edit Beat Pack</h1>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <p className="text-gray-300">Loading pack...</p>
          </div>
        </div>
      </div>
    );
  }

  // Convert pack to format expected by wizard (with isPack flag)
  const packForWizard = {
    ...pack,
    isPack: 1, // Mark as pack so wizard knows it's a pack
    price: pack.price, // Keep in cents (wizard will convert)
    published: pack.published === 1,
    beats: pack.beats || []
  };

  return (
    <BeatWizard 
      mode={WizardMode.EDIT}
      initialBeat={packForWizard}
      onCancel={() => router.push('/admin/edit-pack')} 
    />
  );
}
