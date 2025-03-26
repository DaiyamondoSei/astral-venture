
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChakraType } from '@/features/chakra-system/types/chakraTypes';

interface ChakraVisualizationProps {
  activatedChakras?: ChakraType[];
  energyLevel?: number;
}

/**
 * ChakraVisualization Component - Simplified Version
 * 
 * A minimal visualization of the chakra system showing activated chakras
 * and energy flow as simple colored circles.
 */
const ChakraVisualization: React.FC<ChakraVisualizationProps> = ({
  activatedChakras = [],
  energyLevel = 0
}) => {
  // Simple color mapping for each chakra
  const chakraColors: Record<ChakraType, string> = {
    'crown': 'bg-purple-500',
    'third-eye': 'bg-indigo-500',
    'throat': 'bg-blue-500',
    'heart': 'bg-green-500',
    'solar': 'bg-yellow-500',
    'sacral': 'bg-orange-500',
    'root': 'bg-red-500'
  };

  // List of all chakras in order from crown to root
  const allChakras: ChakraType[] = [
    'crown', 'third-eye', 'throat', 'heart', 'solar', 'sacral', 'root'
  ];

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center h-[400px] bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg">
          <h3 className="text-xl font-medium mb-4 text-gray-300">Chakra System</h3>
          
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-300 mb-2">Energy Level: {energyLevel}%</p>
            
            <div className="flex flex-col space-y-3 items-center">
              {allChakras.map((chakra) => (
                <div 
                  key={chakra}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activatedChakras.includes(chakra) 
                      ? chakraColors[chakra] + ' opacity-100'
                      : 'bg-gray-700 opacity-40'
                  }`}
                  title={`${chakra} chakra ${activatedChakras.includes(chakra) ? '(activated)' : '(inactive)'}`}
                >
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChakraVisualization;
