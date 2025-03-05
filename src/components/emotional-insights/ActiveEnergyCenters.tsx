
import React from 'react';
import { Zap } from 'lucide-react';
import { chakraNames, chakraColors } from '@/utils/emotion/mappings';

interface ActiveEnergyCentersProps {
  activatedChakras: number[];
}

const ActiveEnergyCenters = ({ activatedChakras }: ActiveEnergyCentersProps) => {
  if (!activatedChakras || activatedChakras.length === 0) {
    return (
      <div className="px-4 py-3 bg-black/20 rounded-lg">
        <div className="flex items-center mb-2">
          <Zap size={16} className="text-primary mr-2" />
          <span className="text-white/80 text-sm">Active Energy Centers</span>
        </div>
        <p className="text-xs text-white/60">
          Continue your practice to activate your energy centers
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-black/20 rounded-lg">
      <div className="flex items-center mb-2">
        <Zap size={16} className="text-primary mr-2" />
        <span className="text-white/80 text-sm">Active Energy Centers</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {activatedChakras.map((chakraIndex) => (
          <div 
            key={chakraIndex}
            className="flex items-center space-x-2 p-1.5 rounded-md bg-white/5"
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: chakraColors[chakraIndex] }}
            ></div>
            <span className="text-xs text-white/70">
              {chakraNames[chakraIndex]} Chakra
            </span>
          </div>
        ))}
      </div>
      
      {activatedChakras.length < 7 && (
        <p className="text-xs text-white/40 mt-2">
          {7 - activatedChakras.length} more to activate through practice
        </p>
      )}
    </div>
  );
};

export default ActiveEnergyCenters;
