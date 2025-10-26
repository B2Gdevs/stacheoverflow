'use client';

import React from 'react';
import { AudioProvider } from '@/lib/audio';
import { DashboardContent } from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <AudioProvider>
      <DashboardContent />
    </AudioProvider>
  );
}