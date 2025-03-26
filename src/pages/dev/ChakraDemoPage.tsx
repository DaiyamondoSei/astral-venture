
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import ChakraVisualization from '@/features/chakra-system/components/ChakraVisualization';
import { ChakraType } from '@/features/chakra-system/types/chakraTypes';

/**
 * A demo page to showcase the chakra system visualization
 */
const ChakraDemoPage: React.FC = () => {
  const [energyLevel, setEnergyLevel] = useState(50);
  const [activatedChakras, setActivatedChakras] = useState<ChakraType[]>(['heart', 'throat']);

  // All chakra types
  const allChakras: ChakraType[] = [
    'crown', 'third-eye', 'throat', 'heart', 'solar', 'sacral', 'root'
  ];
  
  // Toggle a chakra's activation
  const toggleChakra = (chakra: ChakraType) => {
    if (activatedChakras.includes(chakra)) {
      setActivatedChakras(activatedChakras.filter(c => c !== chakra));
    } else {
      setActivatedChakras([...activatedChakras, chakra]);
    }
  };

  // Reset all chakras
  const resetChakras = () => {
    setActivatedChakras([]);
    setEnergyLevel(0);
  };

  // Activate all chakras
  const activateAllChakras = () => {
    setActivatedChakras([...allChakras]);
    setEnergyLevel(100);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Chakra System Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chakra Visualization */}
        <ChakraVisualization 
          activatedChakras={activatedChakras} 
          energyLevel={energyLevel} 
        />
        
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Energy Level Slider */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Energy Level: {energyLevel}%</h3>
              <Slider 
                value={[energyLevel]} 
                min={0} 
                max={100} 
                step={1}
                onValueChange={(value) => setEnergyLevel(value[0])}
              />
            </div>
            
            {/* Chakra Activation Buttons */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Activate Chakras</h3>
              <div className="flex flex-wrap gap-2">
                {allChakras.map(chakra => (
                  <Button 
                    key={chakra}
                    variant={activatedChakras.includes(chakra) ? "default" : "outline"}
                    onClick={() => toggleChakra(chakra)}
                    className="capitalize"
                  >
                    {chakra}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={activateAllChakras} className="flex-1">
                Activate All
              </Button>
              <Button onClick={resetChakras} variant="outline" className="flex-1">
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChakraDemoPage;
