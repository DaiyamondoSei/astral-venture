
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import TabsHeader from './reflection/TabsHeader';
import TabsContent from './reflection/TabsContent';

interface ReflectionTabProps {
  onReflectionComplete?: (pointsEarned: number, emotionalInsights?: any) => void;
}

const ReflectionTab = ({ onReflectionComplete }: ReflectionTabProps) => {
  const [activeTab, setActiveTab] = useState('new');

  const handleReflectionComplete = (pointsEarned: number) => {
    // We can enhance this with emotional analysis in the future
    const emotionalInsights = {
      dominantEmotion: 'growth',
      emotionalBalance: 0.8,
      chakrasAffected: ['heart', 'throat']
    };
    
    if (onReflectionComplete) {
      onReflectionComplete(pointsEarned, emotionalInsights);
    }
    
    // Switch to insights tab after submission
    setActiveTab('insights');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsHeader />
      <TabsContent 
        activeTab={activeTab}
        onReflectionComplete={handleReflectionComplete} 
      />
    </Tabs>
  );
};

export default ReflectionTab;
