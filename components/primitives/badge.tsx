'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  removable?: boolean;
  onRemove?: () => void;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  removable = false,
  onRemove,
  className,
  ...props
}: BadgeProps) {
  const baseClasses = "inline-flex items-center font-medium transition-all duration-200";
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs rounded-md",
    md: "px-3 py-1.5 text-sm rounded-lg",
    lg: "px-4 py-2 text-base rounded-lg"
  };

  const variantClasses = {
    default: "bg-gray-700/50 text-gray-300 border border-gray-600",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400 shadow-lg shadow-green-500/25",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border border-yellow-400 shadow-lg shadow-yellow-500/25",
    error: "bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400 shadow-lg shadow-red-500/25",
    info: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border border-blue-400 shadow-lg shadow-blue-500/25",
    outline: "bg-transparent text-white border-2 border-white hover:bg-white hover:text-black"
  };

  const badgeClasses = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const iconSpacing = size === 'sm' ? (iconPosition === 'left' ? 'mr-1' : 'ml-1') : 
                     size === 'lg' ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : 
                     (iconPosition === 'left' ? 'mr-1.5' : 'ml-1.5');

  return (
    <span className={badgeClasses} {...props}>
      {Icon && iconPosition === 'left' && (
        <Icon className={cn(iconSize, iconSpacing)} />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className={cn(iconSize, iconSpacing)} />
      )}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

// Specialized badge variants
export function SuccessBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge {...props} variant="success" />;
}

export function WarningBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge {...props} variant="warning" />;
}

export function ErrorBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge {...props} variant="error" />;
}

export function InfoBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge {...props} variant="info" />;
}

export function OutlineBadge(props: Omit<BadgeProps, 'variant'>) {
  return <Badge {...props} variant="outline" />;
}
