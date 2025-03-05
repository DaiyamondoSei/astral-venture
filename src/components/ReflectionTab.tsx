
import React, { useState } from 'react';
import EnergyReflectionForm from './EnergyReflectionForm';
import PracticeInsightsPanel from './PracticeInsightsPanel';
import EmotionalInsightsPanel from './EmotionalInsightsPanel';
import PhilosophicalReflection from './philosophical/PhilosophicalReflection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PenLine, Heart, Sparkles, Lightbulb } from 'lucide-react';

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
      <TabsList className="grid grid-cols-5 mb-6">
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
        <TabsTrigger value="philosophical" className="flex items-center">
          <Sparkles size={16} className="mr-2" />
          Consciousness
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center">
          <Lightbulb size={16} className="mr-2" />
          Past Reflections
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
      
      <TabsContent value="philosophical">
        <PhilosophicalReflection />
      </TabsContent>
      
      <TabsContent value="history">
        <div className="glass-card p-5">
          <h3 className="font-display text-lg mb-4">Your Reflection History</h3>
          <p className="text-white/70 text-sm mb-6">
            View your past reflections and insights to track your consciousness evolution over time.
          </p>
          <div className="space-y-4">
            {/* We'll implement the full history view in a future update */}
            <div className="p-4 border border-quantum-500/20 rounded-lg bg-black/20">
              <p className="text-white/60 text-center">
                Your reflection history will be displayed here in a future update. Continue adding reflections to build your journey.
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ReflectionTab;
