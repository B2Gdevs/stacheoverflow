'use client';

import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'green' | 'amber';
}

export function PlayButton({ 
  isPlaying, 
  onToggle, 
  className = '',
  size = 'sm',
  variant = 'green'
}: PlayButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    green: 'bg-green-500 hover:bg-green-600',
    amber: 'bg-amber-500 hover:bg-amber-600'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Button
      size="sm"
      onClick={onToggle}
      className={`${sizeClasses[size]} ${variantClasses[variant]} text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg cursor-pointer ${className}`}
    >
      {isPlaying ? (
        <Pause className={iconSize[size]} />
      ) : (
        <Play className={`${iconSize[size]} ml-0.5`} />
      )}
    </Button>
  );
}
