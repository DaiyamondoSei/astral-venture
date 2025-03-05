
import React from 'react';
import EnergyReflectionForm from '@/components/EnergyReflectionForm';
import ReflectionHistory from './ReflectionHistory';
import ReflectionHistoryInsights from './ReflectionHistoryInsights';

interface TabsContentProps {
  activeTab: string;
  onReflectionComplete?: (pointsEarned: number) => void;
  onOpenAiAssistant?: (reflectionId?: string, reflectionContent?: string) => void;
  patternInsights?: any;
  loadingInsights?: boolean;
}

const TabsContent: React.FC<TabsContentProps> = ({ 
  activeTab, 
  onReflectionComplete,
  onOpenAiAssistant,
  patternInsights,
  loadingInsights
}) => {
  return (
    <div className="tab-content mt-4">
      {activeTab === 'new' && (
        <EnergyReflectionForm onReflectionComplete={onReflectionComplete} />
      )}
      {activeTab === 'history' && (
        <ReflectionHistory 
          onOpenAiAssistant={onOpenAiAssistant} 
          reflections={[]} // We'll need to pass real reflections here
        />
      )}
      {activeTab === 'insights' && (
        <div>
          {loadingInsights ? (
            <div className="animate-pulse p-4">
              <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
            </div>
          ) : (
            <ReflectionHistoryInsights 
              data={patternInsights} 
              onOpenAiAssistant={onOpenAiAssistant} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TabsContent;
