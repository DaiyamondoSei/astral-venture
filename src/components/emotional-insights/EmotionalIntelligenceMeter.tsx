
import React from 'react';
import { Heart } from 'lucide-react';

interface EmotionalIntelligenceMeterProps {
  emotionalGrowth: number;
}

const EmotionalIntelligenceMeter = ({ emotionalGrowth }: EmotionalIntelligenceMeterProps) => {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <Heart size={18} className="text-rose-400" />
      <span className="text-white/90">Emotional Intelligence</span>
      <div className="ml-auto bg-white/10 rounded-full h-2 w-24">
        <div
          className="bg-gradient-to-r from-rose-400 to-rose-600 h-full rounded-full"
          style={{ width: `${emotionalGrowth}%` }}
        ></div>
      </div>
    </div>
  );
};

export default EmotionalIntelligenceMeter;
