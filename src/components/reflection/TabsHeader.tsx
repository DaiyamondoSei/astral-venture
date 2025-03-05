
import React from 'react';
import { TabsList } from '@/components/ui/tabs';
import { BookOpen, PenLine, Heart, Sparkles, History } from 'lucide-react';
import TabItem from './TabItem';

const TabsHeader: React.FC = () => {
  return (
    <TabsList className="grid grid-cols-5 mb-6">
      <TabItem value="new" icon={PenLine} label="New Reflection" />
      <TabItem value="insights" icon={BookOpen} label="Your Insights" />
      <TabItem value="emotional" icon={Heart} label="Emotional Journey" />
      <TabItem value="philosophical" icon={Sparkles} label="Consciousness" />
      <TabItem value="history" icon={History} label="Past Reflections" />
    </TabsList>
  );
};

export default TabsHeader;
