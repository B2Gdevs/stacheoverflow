'use client';

import Image from 'next/image';
import { Gamepad2, Music2, Sparkles } from 'lucide-react';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ 
  title = "Music Marketplace",
  subtitle = "Premium beats for game developers and commercial artists"
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      {/* Mobile: Show logo and branding */}
      <div className="flex items-center gap-3 mb-4 sm:hidden">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src="/images/stacheoverflow-logo.png"
            alt="StacheOverflow"
            fill
            sizes="40px"
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">
            stache<span className="text-green-500">overflow</span>
          </h1>
          <p className="text-xs text-gray-400">Music Marketplace</p>
        </div>
      </div>

      {/* Title and Subtitle */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 text-sm sm:text-base">{subtitle}</p>
      </div>

      {/* Target Audience Badges - Mobile Visible */}
      <div className="flex flex-wrap gap-2 mt-4 sm:mt-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/50">
          <Gamepad2 className={cn(getIconSize('sm'), "text-green-400")} />
          <span className="text-xs font-bold text-green-400">Game Developers</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/50">
          <Music2 className={cn(getIconSize('sm'), "text-green-400")} />
          <span className="text-xs font-bold text-green-400">Commercial Artists</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/50">
          <Sparkles className={cn(getIconSize('sm'), "text-green-400")} />
          <span className="text-xs font-bold text-green-400">100% Ownership</span>
        </div>
      </div>
    </div>
  );
}

