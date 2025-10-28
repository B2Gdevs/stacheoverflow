'use client';

import React from 'react';
import { X, Plus, Music, Zap, Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'selected' | 'add' | 'category';
  onClick?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function Tag({ 
  children, 
  variant = 'default', 
  onClick, 
  onRemove, 
  icon,
  className 
}: TagProps) {
  const baseClasses = "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer";
  
  const variantClasses = {
    default: "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50 hover:border-gray-500",
    selected: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25",
    add: "bg-gray-800/50 text-gray-400 border-2 border-dashed border-gray-600 hover:bg-gray-700/50 hover:border-gray-500 hover:text-gray-300",
    category: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border border-blue-400 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25"
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      onClick={onClick}
    >
      {icon}
      {children}
      {onRemove && variant === 'selected' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

interface TagSectionProps {
  title: string;
  description?: string;
  tags: string[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

export function TagSection({ 
  title, 
  description, 
  tags, 
  selectedTags, 
  onTagClick, 
  onTagRemove,
  icon,
  className 
}: TagSectionProps) {
  const getTagIcon = (tag: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Chorus': <Music className="h-3 w-3" />,
      'Verse': <Zap className="h-3 w-3" />,
      'Hook': <Star className="h-3 w-3" />,
      'Bridge': <Heart className="h-3 w-3" />,
      'Intro': <Music className="h-3 w-3" />,
      'Outro': <Music className="h-3 w-3" />,
      'Instrumental': <Music className="h-3 w-3" />,
      'Acapella': <Music className="h-3 w-3" />
    };
    return iconMap[tag] || <Music className="h-3 w-3" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-white font-bold text-lg">{title}</h3>
      </div>
      {description && (
        <p className="text-gray-400 text-sm">{description}</p>
      )}
      
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Tag
              key={tag}
              variant={selectedTags.includes(tag) ? 'selected' : 'add'}
              onClick={() => onTagClick(tag)}
              icon={selectedTags.includes(tag) ? null : <Plus className="h-3 w-3" />}
            >
              {tag}
            </Tag>
          ))}
        </div>
        
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-green-400 text-sm font-medium">Selected tags:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Tag
                  key={tag}
                  variant="selected"
                  onRemove={() => onTagRemove(tag)}
                  icon={getTagIcon(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CategorySelectorProps {
  categories: { value: string; label: string; icon: React.ReactNode; description: string }[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export function CategorySelector({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  className 
}: CategorySelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-white font-bold text-lg flex items-center gap-2">
        <Star className="h-5 w-5 text-green-400" />
        Category
      </h3>
      <p className="text-gray-400 text-sm">Choose the primary category for your beat</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(category => (
          <div
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
              selectedCategory === category.value
                ? "border-green-400 bg-green-400/10 shadow-lg shadow-green-500/25"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                selectedCategory === category.value
                  ? "bg-green-400/20 text-green-400"
                  : "bg-gray-700/50 text-gray-400"
              )}>
                {category.icon}
              </div>
              <div>
                <h4 className="text-white font-semibold">{category.label}</h4>
                <p className="text-gray-400 text-sm">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
