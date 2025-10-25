'use client';

import React from 'react';
import { AudioProvider } from '@/contexts/audio-context';
import { DashboardContent } from '@/components/dashboard-content';

export default function DashboardPage() {
  return (
    <AudioProvider>
      <DashboardContent />
    </AudioProvider>
  );
}