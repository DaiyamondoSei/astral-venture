
import React from 'react';
import { TabsContent as ShadcnTabsContent } from '@/components/ui/tabs';
import EnergyReflectionForm from '../EnergyReflectionForm';
import PracticeInsightsPanel from '../PracticeInsightsPanel';
import EmotionalInsightsPanel from '../EmotionalInsightsPanel';
import PhilosophicalReflection from '../philosophical/PhilosophicalReflection';
import ReflectionHistory from './ReflectionHistory';

interface TabsContentProps {
  activeTab: string;
  onReflectionComplete: (pointsEarned: number) => void;
}

const TabsContent: React.FC<TabsContentProps> = ({ 
  activeTab, 
  onReflectionComplete 
}) => {
  return (
    <>
      <ShadcnTabsContent value="new">
        <EnergyReflectionForm onReflectionComplete={onReflectionComplete} />
      </ShadcnTabsContent>
      
      <ShadcnTabsContent value="insights">
        <PracticeInsightsPanel />
      </ShadcnTabsContent>
      
      <ShadcnTabsContent value="emotional">
        <EmotionalInsightsPanel />
      </ShadcnTabsContent>
      
      <ShadcnTabsContent value="philosophical">
        <PhilosophicalReflection />
      </ShadcnTabsContent>
      
      <ShadcnTabsContent value="history">
        <ReflectionHistory />
      </ShadcnTabsContent>
    </>
  );
};

export default TabsContent;
