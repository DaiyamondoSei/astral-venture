
import React from 'react';
import { EnergyLevelProps, ENERGY_THRESHOLDS } from './types';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Flame } from 'lucide-react';

interface ProgressIndicatorsProps {
  energyPoints: number;
  showTranscendence: boolean;
  showInfinity: boolean;
  streakDays?: number;
  activatedChakras?: number[];
}

const ProgressIndicators: React.FC<ProgressIndicatorsProps> = ({ 
  energyPoints,
  showTranscendence,
  showInfinity,
  streakDays = 0,
  activatedChakras = []
}) => {
  // Chakra names for reference
  const chakraNames = [
    "Root", "Sacral", "Solar Plexus", 
    "Heart", "Throat", "Third Eye", "Crown"
  ];
  
  return (
    <>
      {/* Progress level indicator - only appears after base level */}
      {energyPoints > 10 && (
        <div className={`absolute bottom-2 right-2 text-xs ${
          showInfinity 
            ? 'text-violet-200/80'
            : showTranscendence
              ? 'text-indigo-200/75'
              : 'text-cyan-200/70'
        } font-mono`}>
          Level: {Math.floor(energyPoints / 50) + 1}
        </div>
      )}
      
      {/* Cosmic energy level */}
      {showTranscendence && (
        <div className="absolute top-2 left-2 text-xs text-indigo-200/75 font-mono">
          Cosmic Energy: {energyPoints.toLocaleString()}
        </div>
      )}
      
      {/* Weekly streak indicator - shown after base threshold */}
      {energyPoints > ENERGY_THRESHOLDS.BASE && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Badge variant="outline" className="bg-black/30 border-primary/40 flex items-center gap-1 text-xs">
            <Flame size={12} className="text-orange-400" />
            <span className="text-white/90">{streakDays} day streak</span>
          </Badge>
        </div>
      )}
      
      {/* Active chakras indicators - shown after chakra threshold */}
      {energyPoints > ENERGY_THRESHOLDS.CHAKRAS && activatedChakras.length > 0 && (
        <div className="absolute bottom-10 left-2 flex flex-col gap-1">
          <div className="text-xs text-cyan-200/70 font-mono mb-1">Active Chakras:</div>
          {activatedChakras.map((chakraIndex) => (
            <Badge 
              key={chakraIndex}
              variant="outline" 
              className="text-xs bg-black/30 border-primary/40"
            >
              {chakraNames[chakraIndex]}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

export default ProgressIndicators;
