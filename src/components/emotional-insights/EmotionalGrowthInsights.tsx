
import React from 'react';
import { ArrowUpCircle } from 'lucide-react';

interface EmotionalGrowthInsightsProps {
  insightMessages: string[];
}

const EmotionalGrowthInsights = ({ insightMessages }: EmotionalGrowthInsightsProps) => {
  return (
    <div className="px-4 py-3 bg-black/20 rounded-lg">
      <div className="flex items-center mb-2">
        <ArrowUpCircle size={16} className="text-primary mr-2" />
        <span className="text-white/80 text-sm">Emotional Growth Insights</span>
      </div>
      <ul className="space-y-1 text-xs text-white/70">
        {insightMessages.slice(0, 3).map((insight, index) => (
          <li key={index}>{insight}</li>
        ))}
        {insightMessages.length === 0 && (
          <li>Continue reflecting to unlock more insights</li>
        )}
      </ul>
    </div>
  );
};

export default EmotionalGrowthInsights;
