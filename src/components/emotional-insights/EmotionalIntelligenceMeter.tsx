
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Brain } from 'lucide-react';

interface EmotionalIntelligenceMeterProps {
  emotionalGrowth: number;
}

const EmotionalIntelligenceMeter = ({ emotionalGrowth }: EmotionalIntelligenceMeterProps) => {
  // Get a description based on the growth level
  const getGrowthDescription = () => {
    if (emotionalGrowth < 20) return "Beginning emotional awareness";
    if (emotionalGrowth < 40) return "Developing emotional recognition";
    if (emotionalGrowth < 60) return "Expanding emotional intelligence";
    if (emotionalGrowth < 80) return "Advanced emotional mastery";
    return "Transcendent emotional wisdom";
  };
  
  // Get a color based on the growth level
  const getColorClass = () => {
    if (emotionalGrowth < 30) return "from-blue-500 to-blue-600";
    if (emotionalGrowth < 50) return "from-cyan-500 to-blue-500";
    if (emotionalGrowth < 70) return "from-teal-400 to-cyan-500";
    if (emotionalGrowth < 90) return "from-purple-500 to-violet-600";
    return "from-violet-500 to-fuchsia-500";
  };

  return (
    <div className="px-4 py-3 bg-black/20 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Brain size={16} className="text-primary mr-2" />
          <span className="text-white/80 text-sm">Emotional Intelligence</span>
        </div>
        <span className="text-white/90 font-medium">{emotionalGrowth}%</span>
      </div>
      
      <Progress value={emotionalGrowth} className={`h-2.5 bg-white/10`}>
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${getColorClass()}`} 
          style={{ width: `${emotionalGrowth}%` }}
        />
      </Progress>
      
      <div className="mt-2 text-right text-xs text-white/60">
        {getGrowthDescription()}
      </div>
    </div>
  );
};

export default EmotionalIntelligenceMeter;
