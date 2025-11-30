'use client';

import { Music, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function NoMusic() {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Music className="h-12 w-12 mx-auto" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">No Music Available</h3>
      <p className="text-gray-300 mb-6">
        You haven't uploaded any music yet. Start building your catalog by uploading your first beat or game music.
      </p>
      <Button 
        onClick={() => router.push('/admin/upload')}
        className="bg-green-500 hover:bg-green-600"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Your First Track
      </Button>
    </div>
  );
}

