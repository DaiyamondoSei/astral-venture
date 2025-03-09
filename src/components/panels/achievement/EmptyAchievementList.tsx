
import React from 'react';
import { List } from 'lucide-react';

const EmptyAchievementList: React.FC = () => {
  return (
    <div className="text-center py-8 text-white/70">
      <List className="mx-auto mb-2 opacity-50" size={32} />
      <p>No achievements in this category yet</p>
    </div>
  );
};

export default EmptyAchievementList;
