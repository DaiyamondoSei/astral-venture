
import React from 'react';

interface CategoryGridProps {
  userProfile: any;
  onSelectCategory: (category: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ userProfile, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="glass-card p-2 cursor-pointer" onClick={() => onSelectCategory('meditation')}>Meditation</div>
      <div className="glass-card p-2 cursor-pointer" onClick={() => onSelectCategory('yoga')}>Yoga</div>
      <div className="glass-card p-2 cursor-pointer" onClick={() => onSelectCategory('breathwork')}>Breathwork</div>
      <div className="glass-card p-2 cursor-pointer" onClick={() => onSelectCategory('journaling')}>Journaling</div>
    </div>
  );
};

export default CategoryGrid;
