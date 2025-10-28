'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoIcon } from './tooltip';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label?: string;
  error?: string;
  tooltip?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export function EnhancedInput({
  icon: Icon,
  label,
  error,
  tooltip,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: EnhancedInputProps) {
  const baseClasses = "w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/50";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg"
  };

  const variantClasses = {
    default: "bg-black border-0 border-gray-400 text-white placeholder-gray-400 hover:border-gray-200 focus:border-green-400",
    success: "bg-green-900/20 border-1 border-green-500 text-white placeholder-green-300 focus:border-green-400",
    error: "bg-red-900/20 border-1 border-red-500 text-white placeholder-red-300 focus:border-red-400",
    warning: "bg-yellow-900/20 border-1 border-yellow-500 text-white placeholder-yellow-300 focus:border-yellow-400"
  };

  const inputClasses = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    "rounded-lg",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-white font-bold text-sm flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-green-400" />}
          {label}
          {tooltip && <InfoIcon content={tooltip} />}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          className={cn(
            inputClasses,
            Icon && "pl-10"
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

interface EnhancedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: LucideIcon;
  label?: string;
  error?: string;
  tooltip?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  options: { value: string; label: string }[];
}

export function EnhancedSelect({
  icon: Icon,
  label,
  error,
  tooltip,
  variant = 'default',
  size = 'md',
  options,
  className,
  ...props
}: EnhancedSelectProps) {
  const baseClasses = "w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/50 appearance-none cursor-pointer";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg"
  };

  const variantClasses = {
    default: "bg-black border-0 border-gray-400 text-white hover:border-gray-200 focus:border-green-400",
    success: "bg-green-900/20 border-0 border-green-500 text-white focus:border-green-400",
    error: "bg-red-900/20 border-0 border-red-500 text-white focus:border-red-400",
    warning: "bg-yellow-900/20 border-0 border-yellow-500 text-white focus:border-yellow-400"
  };

  const selectClasses = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    "rounded-lg",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-white font-bold text-sm flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-green-400" />}
          {label}
          {tooltip && <InfoIcon content={tooltip} />}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <select
          className={cn(
            selectClasses,
            Icon && "pl-10"
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-900 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: LucideIcon;
  label?: string;
  error?: string;
  tooltip?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export function EnhancedTextarea({
  icon: Icon,
  label,
  error,
  tooltip,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: EnhancedTextareaProps) {
  const baseClasses = "w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/50 resize-none";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg"
  };

  const variantClasses = {
    default: "bg-black border-0 border-gray-400 text-white placeholder-gray-400 hover:border-gray-200 focus:border-green-400",
    success: "bg-green-900/20 border-0 border-green-500 text-white placeholder-green-300 focus:border-green-400",
    error: "bg-red-900/20 border-0 border-red-500 text-white placeholder-red-300 focus:border-red-400",
    warning: "bg-yellow-900/20 border-0 border-yellow-500 text-white placeholder-yellow-300 focus:border-yellow-400"
  };

  const textareaClasses = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    "rounded-lg",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-white font-bold text-sm flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-green-400" />}
          {label}
          {tooltip && <InfoIcon content={tooltip} />}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <textarea
          className={cn(
            textareaClasses,
            Icon && "pl-10"
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
