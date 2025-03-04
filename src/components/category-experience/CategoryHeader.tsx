
import React from 'react';
import GlowEffect from '../GlowEffect';

interface CategoryHeaderProps {
  category: string;
  displayCategory: string;
  getCategoryGradient: () => string;
}

const CategoryHeader = ({ category, displayCategory, getCategoryGradient }: CategoryHeaderProps) => {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <GlowEffect 
        className={`w-16 h-16 mb-4 rounded-full bg-gradient-to-br ${getCategoryGradient()} flex items-center justify-center`}
      >
        <div className="text-white text-lg font-semibold">{displayCategory.charAt(0)}</div>
      </GlowEffect>
      <h2 className="text-2xl font-display font-medium text-white">{displayCategory} Path</h2>
      <p className="text-white/70 mt-1">Expand your consciousness through {displayCategory.toLowerCase()} practices</p>
    </div>
  );
};

export default CategoryHeader;
