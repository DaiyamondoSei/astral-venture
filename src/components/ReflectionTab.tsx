
import React from 'react';
import EnergyReflectionForm from './EnergyReflectionForm';
import PracticeInsightsPanel from './PracticeInsightsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PenLine } from 'lucide-react';

interface ReflectionTabProps {
  onReflectionComplete?: (pointsEarned: number) => void;
}

const ReflectionTab = ({ onReflectionComplete }: ReflectionTabProps) => {
  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="new" className="flex items-center">
          <PenLine size={16} className="mr-2" />
          New Reflection
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center">
          <BookOpen size={16} className="mr-2" />
          Your Insights
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="new">
        <EnergyReflectionForm onReflectionComplete={onReflectionComplete} />
      </TabsContent>
      
      <TabsContent value="insights">
        <PracticeInsightsPanel />
      </TabsContent>
    </Tabs>
  );
};

export default ReflectionTab;
