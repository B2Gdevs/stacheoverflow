'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WizardNavigation } from './navigation';


export function WizardContainer({ 
  children, 
  className = ''
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`min-h-screen bg-black ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}

interface WizardHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function WizardHeader({ title, description, className = '' }: WizardHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

interface WizardStepContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function WizardStepContainer({ children, className = '' }: WizardStepContainerProps) {
  return (
    <Card className={`bg-green-950 border-0 border-gray-400 ${className}`}>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
