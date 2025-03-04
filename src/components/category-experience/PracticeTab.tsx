
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Zap, ChevronRight } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  energy_points: number;
  level: number;
  category: string;
}

interface PracticeTabProps {
  challenges: Challenge[];
  getCategoryGradient: () => string;
  onCompleteChallenge: (challenge: Challenge) => Promise<void>;
}

const PracticeTab = ({ challenges, getCategoryGradient, onCompleteChallenge }: PracticeTabProps) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  if (selectedChallenge) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="mb-6">
          <h3 className="text-xl font-display mb-2">{selectedChallenge.title}</h3>
          <p className="text-white/80">{selectedChallenge.description}</p>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Clock size={16} className="mr-2 text-white/60" />
            <span className="text-white/60 text-sm">{selectedChallenge.duration_minutes} min</span>
          </div>
          <div className="flex items-center">
            <Zap size={16} className="mr-2 text-primary" />
            <span className="text-primary text-sm">+{selectedChallenge.energy_points} points</span>
          </div>
        </div>
        
        <Button 
          onClick={() => onCompleteChallenge(selectedChallenge)}
          className={`w-full bg-gradient-to-r ${getCategoryGradient()} hover:opacity-90`}
        >
          <CheckCircle size={18} className="mr-2" />
          Mark Complete
        </Button>
        
        <button 
          onClick={() => setSelectedChallenge(null)}
          className="w-full text-center mt-3 text-white/60 text-sm hover:text-white"
        >
          Choose Another Challenge
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <div 
          key={challenge.id}
          onClick={() => setSelectedChallenge(challenge)}
          className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors flex justify-between items-center"
        >
          <div>
            <h3 className="font-medium">{challenge.title}</h3>
            <div className="flex mt-1 text-sm">
              <span className="flex items-center text-white/60 mr-4">
                <Clock size={14} className="mr-1" />
                {challenge.duration_minutes} min
              </span>
              <span className="flex items-center text-primary">
                <Zap size={14} className="mr-1" />
                {challenge.energy_points} points
              </span>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/40" />
        </div>
      ))}
      
      {challenges.length === 0 && (
        <div className="text-center py-8 text-white/60">
          No challenges available for this category yet
        </div>
      )}
    </div>
  );
};

export default PracticeTab;
