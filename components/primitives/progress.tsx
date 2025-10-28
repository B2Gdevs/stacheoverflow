'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  const variantClasses = {
    default: "bg-gradient-to-r from-green-500 to-emerald-500",
    success: "bg-gradient-to-r from-green-500 to-emerald-500",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500",
    error: "bg-gradient-to-r from-red-500 to-red-600"
  };

  const progressClasses = cn(
    "w-full bg-gray-800/50 rounded-full overflow-hidden border border-gray-600",
    sizeClasses[size],
    className
  );

  const barClasses = cn(
    "h-full transition-all duration-300 ease-out rounded-full",
    variantClasses[variant],
    animated && "animate-pulse"
  );

  return (
    <div className="space-y-2" {...props}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm">
            {label || `${Math.round(percentage)}%`}
          </span>
          {showLabel && (
            <span className="text-gray-400 text-sm">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={progressClasses}>
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Array<{
    id: string;
    label: string;
    description?: string;
    status: 'completed' | 'current' | 'upcoming';
  }>;
  orientation?: 'horizontal' | 'vertical';
}

export function StepProgress({
  steps,
  orientation = 'horizontal',
  className,
  ...props
}: StepProgressProps) {
  const orientationClasses = orientation === 'horizontal' 
    ? "flex items-center space-x-4" 
    : "flex flex-col space-y-4";

  return (
    <div className={cn(orientationClasses, className)} {...props}>
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        const isUpcoming = step.status === 'upcoming';

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                isCompleted && "bg-green-500 border-green-400 text-white",
                isCurrent && "bg-green-500/20 border-green-400 text-green-400",
                isUpcoming && "bg-gray-800 border-gray-600 text-gray-400"
              )}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>

            {/* Step Content */}
            <div className="ml-3">
              <div className={cn(
                "text-sm font-bold",
                isCompleted && "text-white",
                isCurrent && "text-green-400",
                isUpcoming && "text-gray-400"
              )}>
                {step.label}
              </div>
              {step.description && (
                <div className="text-xs text-gray-400">
                  {step.description}
                </div>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-all duration-200",
                  orientation === 'horizontal' ? "w-16" : "w-0.5 h-8",
                  isCompleted ? "bg-green-400" : "bg-gray-600"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
