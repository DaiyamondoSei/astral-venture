
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CHAKRA_NAMES, ENERGY_THRESHOLDS } from '@/components/entry-animation/cosmic/types';
import ChakraCustomizer from '../advanced-controls/ChakraCustomizer';

interface ChakrasTabProps {
  selectedChakras: number[];
  setSelectedChakras: (chakras: number[]) => void;
  chakraIntensities: number[];
  handleIntensityChange: (index: number, value: number) => void;
}

const ChakrasTab: React.FC<ChakrasTabProps> = ({
  selectedChakras,
  setSelectedChakras,
  chakraIntensities,
  handleIntensityChange
}) => {
  return (
    <div className="p-4 space-y-6">
      <ChakraCustomizer 
        selectedChakras={selectedChakras}
        onChakraSelect={setSelectedChakras}
        chakraIntensities={chakraIntensities}
        onIntensityChange={handleIntensityChange}
      />
      
      <Card className="bg-black/50 border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Chakra Thresholds</CardTitle>
          <CardDescription>
            Energy thresholds for chakra visualization features
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 text-sm">
            {Object.entries(ENERGY_THRESHOLDS).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/70">{key}</span>
                <span className="text-white/90">{value} points</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChakrasTab;
