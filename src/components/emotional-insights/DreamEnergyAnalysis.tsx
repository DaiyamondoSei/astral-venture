
import React from 'react';
import { Droplets } from 'lucide-react';

interface DreamEnergyAnalysisProps {
  userDream: string | null;
  dominantEmotions: string[];
}

const DreamEnergyAnalysis = ({ userDream, dominantEmotions }: DreamEnergyAnalysisProps) => {
  if (!userDream) return null;
  
  return (
    <div className="px-4 py-3 bg-black/20 rounded-lg">
      <div className="flex items-center mb-2">
        <Droplets size={16} className="text-primary mr-2" />
        <span className="text-white/80 text-sm">Dream Energy Analysis</span>
      </div>
      <p className="text-xs text-white/70 italic mb-2">
        "{userDream.length > 120 ? userDream.substring(0, 120) + '...' : userDream}"
      </p>
      <div className="flex flex-wrap gap-1 mt-1">
        {dominantEmotions.slice(0, 2).map((emotion, index) => (
          <span key={index} className="text-xs px-2 py-0.5 rounded-full bg-quantum-500/20 text-white/80">
            {emotion}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DreamEnergyAnalysis;
