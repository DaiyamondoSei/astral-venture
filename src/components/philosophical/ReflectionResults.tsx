
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ReflectionResultsProps {
  earnedPoints: number;
  onNewReflection: () => void;
}

const ReflectionResults: React.FC<ReflectionResultsProps> = ({ 
  earnedPoints, 
  onNewReflection 
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="bg-quantum-500/10 border border-quantum-500/20 rounded-lg p-4">
        <h4 className="text-white/90 font-medium mb-2 flex items-center">
          <Sparkles size={16} className="mr-2 text-primary" />
          Consciousness Exploration Results
        </h4>
        <p className="text-white/80 mb-3">
          Your reflection demonstrates an expanded awareness and deeper connection to universal consciousness.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">Points Earned:</span>
          <span className="text-quantum-400 font-bold">{earnedPoints}</span>
        </div>
      </div>
      
      <Button 
        onClick={onNewReflection} 
        variant="outline"
        className="w-full border-quantum-500/30 text-white/80 hover:bg-quantum-500/10"
      >
        Explore New Contemplation
      </Button>
    </div>
  );
};

export default ReflectionResults;
