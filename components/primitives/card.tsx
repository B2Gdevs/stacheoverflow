'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  ...props
}: CardProps) {
  const baseClasses = "rounded-xl transition-all duration-200";
  
  const variantClasses = {
    default: "bg-gray-800/90 border-2 border-white",
    elevated: "bg-gray-800/90 border-2 border-white shadow-2xl shadow-black/50",
    outlined: "bg-transparent border-2 border-white",
    filled: "bg-gray-900/80 border-2 border-gray-600"
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const hoverClasses = hover ? "hover:bg-gray-700/90 hover:border-gray-300 cursor-pointer" : "";

  const cardClasses = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({
  children,
  icon,
  title,
  subtitle,
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)} {...props}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-green-400/20 rounded-lg text-green-400">
            {icon}
          </div>
        )}
        <div>
          {title && (
            <h3 className="text-white font-bold text-lg">{title}</h3>
          )}
          {subtitle && (
            <p className="text-gray-400 text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function CardContent({
  children,
  spacing = 'md',
  className,
  ...props
}: CardContentProps) {
  const spacingClasses = {
    none: "",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6"
  };

  return (
    <div className={cn(spacingClasses[spacing], className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export function CardFooter({
  children,
  justify = 'end',
  className,
  ...props
}: CardFooterProps) {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between"
  };

  return (
    <div className={cn("flex items-center gap-3 mt-4", justifyClasses[justify], className)} {...props}>
      {children}
    </div>
  );
}
