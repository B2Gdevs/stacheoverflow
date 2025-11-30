'use client';

import { Search } from 'lucide-react';

interface NoResultsProps {
  message?: string;
  suggestion?: string;
}

export function NoResults({ 
  message = "No music found",
  suggestion = "Try adjusting your search or filter criteria"
}: NoResultsProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Search className="h-12 w-12 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{message}</h3>
      <p className="text-gray-300">{suggestion}</p>
    </div>
  );
}

