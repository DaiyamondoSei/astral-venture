
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmotionalGrowthInsightsProps {
  insightMessages: string[];
  onAskAI?: () => void;
}

const EmotionalGrowthInsights: React.FC<EmotionalGrowthInsightsProps> = ({ 
  insightMessages,
  onAskAI
}) => {
  return (
    <Card className="glass-card border-quantum-400/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Sparkles size={18} className="mr-2 text-quantum-400" />
          Emotional Growth Insights
        </CardTitle>
        <CardDescription>
          Analysis of your emotional evolution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {insightMessages.slice(0, 3).map((insight, index) => (
            <li 
              key={index} 
              className="text-white/80 pl-4 border-l-2 border-quantum-400/30 py-1 text-sm"
            >
              {insight}
            </li>
          ))}
        </ul>
        
        {onAskAI && (
          <div className="mt-4">
            <Button 
              variant="link" 
              size="sm" 
              className="text-quantum-400 p-0 h-auto"
              onClick={onAskAI}
            >
              <Sparkles size={14} className="mr-1" />
              <span>Ask AI for deeper insights</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionalGrowthInsights;
