'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PackEditForm } from '@/components/forms';
import { useBeatPack } from '@/lib/swr/hooks';

export default function EditPackPage() {
  const router = useRouter();
  const params = useParams();
  const packId = params.id as string;

  const { pack, isError: error, isLoading } = useBeatPack(packId || null);

  const handleComplete = (result: any) => {
    console.log('Pack update completed:', result);
    router.push('/admin/edit-pack');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading pack...</div>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Error loading pack or pack not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Beat Pack</h1>
          <p className="text-gray-300">Update pack details and publish status</p>
        </div>

        <PackEditForm
          pack={{
            id: pack.id,
            title: pack.title,
            artist: pack.artist,
            genre: pack.genre,
            price: pack.price / 100, // Convert from cents to dollars for display
            description: pack.description,
            imageFile: pack.imageFile,
            published: pack.published === 1,
            beats: pack.beats || []
          }}
          onCancel={() => router.back()}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
