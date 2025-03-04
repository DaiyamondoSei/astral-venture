
import React from 'react';
import { PenLine } from 'lucide-react';

type TabType = 'practice' | 'wisdom' | 'reflection';

interface CategoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const CategoryTabs = ({ activeTab, onTabChange }: CategoryTabsProps) => {
  return (
    <div className="flex border-b border-white/10">
      <button
        className={`px-4 py-2 font-medium ${activeTab === 'practice' ? 'text-white border-b-2 border-primary' : 'text-white/60'}`}
        onClick={() => onTabChange('practice')}
      >
        Practice
      </button>
      <button
        className={`px-4 py-2 font-medium ${activeTab === 'wisdom' ? 'text-white border-b-2 border-primary' : 'text-white/60'}`}
        onClick={() => onTabChange('wisdom')}
      >
        Quantum Wisdom
      </button>
      <button
        className={`px-4 py-2 font-medium ${activeTab === 'reflection' ? 'text-white border-b-2 border-primary' : 'text-white/60'}`}
        onClick={() => onTabChange('reflection')}
      >
        <PenLine size={14} className="inline mr-1" />
        Reflect
      </button>
    </div>
  );
};

export default CategoryTabs;
