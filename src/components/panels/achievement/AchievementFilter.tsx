
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AchievementFilterProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const AchievementFilter: React.FC<AchievementFilterProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="mb-4">
      <TabsList className="grid grid-cols-5 bg-white/10 backdrop-blur border-white/10">
        <TabsTrigger value="all" className="text-white">All</TabsTrigger>
        <TabsTrigger value="meditation" className="text-white">Meditation</TabsTrigger>
        <TabsTrigger value="practice" className="text-white">Practice</TabsTrigger>
        <TabsTrigger value="reflection" className="text-white">Reflection</TabsTrigger>
        <TabsTrigger value="wisdom" className="text-white">Wisdom</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AchievementFilter;
