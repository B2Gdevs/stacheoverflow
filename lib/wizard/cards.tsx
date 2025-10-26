'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WizardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isSelected?: boolean;
  className?: string;
}

export function WizardCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  isSelected = false,
  className = '' 
}: WizardCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected 
          ? 'bg-green-500/20 border-2 border-green-500' 
          : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
        }
        ${className}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}
          `}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{title}</h3>
            <p className="text-gray-400 text-xs">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
