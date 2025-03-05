
import React from 'react';
import EnergyReflectionForm from '@/components/EnergyReflectionForm';
import ReflectionHistory from './ReflectionHistory';
import ReflectionHistoryInsights from './ReflectionHistoryInsights';

interface TabsContentProps {
  activeTab: string;
  onReflectionComplete?: (pointsEarned: number) => void;
  onOpenAiAssistant?: (reflectionId?: string, reflectionContent?: string) => void;
}

const TabsContent: React.FC<TabsContentProps> = ({ 
  activeTab, 
  onReflectionComplete,
  onOpenAiAssistant
}) => {
  return (
    <div className="tab-content mt-4">
      {activeTab === 'new' && (
        <EnergyReflectionForm onReflectionComplete={onReflectionComplete} />
      )}
      {activeTab === 'history' && (
        <ReflectionHistory onOpenAiAssistant={onOpenAiAssistant} />
      )}
      {activeTab === 'insights' && (
        <ReflectionHistoryInsights onOpenAiAssistant={onOpenAiAssistant} />
      )}
    </div>
  );
};

export default TabsContent;
