
import React from 'react';
import { Milestone, Stars } from 'lucide-react';

interface EmotionalJourneyTimelineProps {
  milestones: Array<{
    date: string;
    title: string;
    description: string;
  }>;
}

const EmotionalJourneyTimeline: React.FC<EmotionalJourneyTimelineProps> = ({ milestones }) => {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-3 bg-black/20 rounded-lg">
      <div className="mb-2 flex items-center">
        <Milestone size={16} className="text-primary mr-2" />
        <span className="text-white/80 text-sm">Emotional Journey Milestones</span>
      </div>
      
      <div className="relative border-l border-quantum-500/30 pl-4 space-y-3 ml-2">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-6 mt-1.5 w-3 h-3 rounded-full bg-quantum-500/70"></div>
            <div className="mb-1 text-xs text-white/60">{milestone.date}</div>
            <div className="text-sm text-white/90 font-medium">{milestone.title}</div>
            <p className="text-xs text-white/70">{milestone.description}</p>
          </div>
        ))}
        
        {milestones.length < 3 && (
          <div className="relative">
            <div className="absolute -left-6 mt-1.5 w-3 h-3 rounded-full bg-white/30"></div>
            <div className="flex items-center">
              <Stars size={14} className="text-white/40 mr-1" />
              <span className="text-xs text-white/40">Continue your practice to unlock more milestones</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalJourneyTimeline;
