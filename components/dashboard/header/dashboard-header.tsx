'use client';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ 
  title = "Music Library",
  subtitle = "Discover and purchase premium beats and game music"
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400">{subtitle}</p>
    </div>
  );
}

