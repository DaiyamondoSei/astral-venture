
import React from 'react';
import { Star } from 'lucide-react';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';

interface ActiveEnergyCentersProps {
  activatedChakras: number[];
}

const ActiveEnergyCenters = ({ activatedChakras }: ActiveEnergyCentersProps) => {
  return (
    <div className="px-4 py-3 bg-black/20 rounded-lg">
      <div className="flex items-center mb-2">
        <Star size={16} className="text-primary mr-2" />
        <span className="text-white/80 text-sm">Active Energy Centers</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {activatedChakras.map((chakraIndex) => (
          <span 
            key={chakraIndex} 
            className="text-xs px-2 py-0.5 rounded-full bg-quantum-500/20 text-white/80"
          >
            {CHAKRA_NAMES[chakraIndex]}
          </span>
        ))}
      </div>
      <p className="text-xs text-white/70 mt-2">
        {activatedChakras.length <= 2 && 'Your energy centers are beginning to activate.'}
        {activatedChakras.length > 2 && activatedChakras.length <= 4 && 'Your energy system is developing balance.'}
        {activatedChakras.length > 4 && 'Your energy system is approaching higher integration.'}
      </p>
    </div>
  );
};

export default ActiveEnergyCenters;
