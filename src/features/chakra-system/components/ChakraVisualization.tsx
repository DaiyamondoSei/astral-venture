
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ChakraVisualizationProps {
  activatedChakras?: string[];
  energyLevel?: number;
}

/**
 * ChakraVisualization Component
 * 
 * A component that visualizes the chakra system, showing activated chakras and energy flow.
 */
const ChakraVisualization: React.FC<ChakraVisualizationProps> = ({
  activatedChakras = [],
  energyLevel = 0
}) => {
  return (
    <Card className="w-full h-full overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center h-[400px] bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg">
          <div className="text-center text-gray-300">
            <h3 className="text-xl font-medium mb-2">Chakra System Visualization</h3>
            <p className="mb-4">Energy Level: {energyLevel}%</p>
            <p>Activated Chakras: {activatedChakras.length > 0 ? activatedChakras.join(', ') : 'None'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChakraVisualization;
