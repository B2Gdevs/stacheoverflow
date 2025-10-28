'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (side) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollLeft + 8;
        break;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isVisible, side]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-lg shadow-lg max-w-xs",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            className
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="relative">
            {content}
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-2 h-2 bg-gray-900 border border-gray-600 rotate-45",
                side === 'top' && "bottom-[-5px] left-1/2 transform -translate-x-1/2 border-t-0 border-l-0",
                side === 'bottom' && "top-[-5px] left-1/2 transform -translate-x-1/2 border-b-0 border-r-0",
                side === 'left' && "right-[-5px] top-1/2 transform -translate-y-1/2 border-l-0 border-b-0",
                side === 'right' && "left-[-5px] top-1/2 transform -translate-y-1/2 border-r-0 border-t-0"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface InfoIconProps {
  content: string;
  className?: string;
}

export function InfoIcon({ content, className }: InfoIconProps) {
  return (
    <Tooltip content={content}>
      <Info className={cn("h-4 w-4 text-gray-400 hover:text-green-400 cursor-help transition-colors", className)} />
    </Tooltip>
  );
}

// Additional exports for compatibility with existing components
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const TooltipTrigger = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  return <div {...props}>{children}</div>;
};

export const TooltipContent = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  return <div {...props}>{children}</div>;
};