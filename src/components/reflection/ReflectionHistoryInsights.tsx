
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface ReflectionHistoryInsightsProps {
  reflection?: any; // Using any here as we don't know the exact type
  data?: any; // Allow for either reflection or data prop
  onClose?: () => void;
  onOpenAiAssistant?: (reflectionId?: string, reflectionContent?: string) => void;
}

const ReflectionHistoryInsights: React.FC<ReflectionHistoryInsightsProps> = ({
  reflection,
  data,
  onClose,
  onOpenAiAssistant
}) => {
  const reflectionData = reflection || data;
  
  if (!reflectionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No reflection data available</p>
        </CardContent>
      </Card>
    );
  }
  
  const handleAskAI = () => {
    if (onOpenAiAssistant) {
      onOpenAiAssistant(
        reflectionData.id,
        reflectionData.content
      );
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reflection Insights</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Emotional Themes</h3>
            <p className="text-muted-foreground">
              {reflectionData.emotionalThemes || 'No emotional themes detected'}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Chakra Activation</h3>
            <p className="text-muted-foreground">
              {reflectionData.chakraActivation || 'No chakra activation detected'}
            </p>
          </div>
          
          <div className="pt-2">
            <Button onClick={handleAskAI} className="w-full">
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReflectionHistoryInsights;
