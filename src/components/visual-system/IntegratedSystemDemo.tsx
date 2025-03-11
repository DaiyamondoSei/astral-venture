
import React, { useState } from 'react';
import IntegratedSystem from './IntegratedSystem';
import { ChakraType } from '@/types/chakra/ChakraSystemTypes';

export const IntegratedSystemDemo: React.FC = () => {
  const [chakraActivations, setChakraActivations] = useState<Record<ChakraType, number>>({
    root: 0,
    sacral: 0,
    solar: 0,
    heart: 0,
    throat: 0,
    'third-eye': 0,
    crown: 0
  });

  const [showQuantumEffects, setShowQuantumEffects] = useState(false);
  const [adaptToPerformance, setAdaptToPerformance] = useState(true);

  const handleChakraChange = (chakra: ChakraType, value: number) => {
    setChakraActivations(prev => ({
      ...prev,
      [chakra]: value
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
        <IntegratedSystem
          chakraActivations={chakraActivations}
          showQuantumEffects={showQuantumEffects}
          adaptToPerformance={adaptToPerformance}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showQuantumEffects}
              onChange={e => setShowQuantumEffects(e.target.checked)}
              className="rounded border-gray-300 text-primary"
            />
            <span className="ml-2">Show Quantum Effects</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={adaptToPerformance}
              onChange={e => setAdaptToPerformance(e.target.checked)}
              className="rounded border-gray-300 text-primary"
            />
            <span className="ml-2">Adapt to Performance</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(Object.keys(chakraActivations) as ChakraType[]).map(chakra => (
            <div key={chakra} className="space-y-2">
              <label className="block">
                {chakra.charAt(0).toUpperCase() + chakra.slice(1)} Chakra
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={chakraActivations[chakra]}
                onChange={e => handleChakraChange(chakra, parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">
                {chakraActivations[chakra]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegratedSystemDemo;
