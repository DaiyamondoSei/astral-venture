
import React, { useState } from 'react';
import EnergyReflectionForm from './EnergyReflectionForm';
import PracticeInsightsPanel from './PracticeInsightsPanel';
import EmotionalInsightsPanel from './EmotionalInsightsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PenLine, Heart } from 'lucide-react';

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
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="new" className="flex items-center">
          <PenLine size={16} className="mr-2" />
          New Reflection
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center">
          <BookOpen size={16} className="mr-2" />
          Your Insights
        </TabsTrigger>
        <TabsTrigger value="emotional" className="flex items-center">
          <Heart size={16} className="mr-2" />
          Emotional Journey
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="new">
        <EnergyReflectionForm onReflectionComplete={handleReflectionComplete} />
      </TabsContent>
      
      <TabsContent value="insights">
        <PracticeInsightsPanel />
      </TabsContent>
      
      <TabsContent value="emotional">
        <EmotionalInsightsPanel />
      </TabsContent>
    </Tabs>
  );
};

export default ReflectionTab;
