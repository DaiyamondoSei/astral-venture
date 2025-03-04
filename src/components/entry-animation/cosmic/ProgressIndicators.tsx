
import React from 'react';

interface ProgressIndicatorsProps {
  energyPoints: number;
  showTranscendence: boolean;
  showInfinity: boolean;
}

const ProgressIndicators: React.FC<ProgressIndicatorsProps> = ({ 
  energyPoints,
  showTranscendence,
  showInfinity
}) => {
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
    </>
  );
};

export default ProgressIndicators;
