
import React, { useState } from 'react';
import { Sliders, Sparkles, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CHAKRA_NAMES, CHAKRA_COLORS } from '@/components/entry-animation/cosmic/types';

interface ChakraCustomizerProps {
  selectedChakras: number[];
  onChakraSelect: (chakras: number[]) => void;
  chakraIntensities: number[];
  onIntensityChange: (index: number, value: number) => void;
}

const ChakraCustomizer: React.FC<ChakraCustomizerProps> = ({
  selectedChakras,
  onChakraSelect,
  chakraIntensities,
  onIntensityChange
}) => {
  const [showAllChakras, setShowAllChakras] = useState(false);

  // Handle "Show All Chakras" toggle
  const handleShowAllChakras = (show: boolean) => {
    setShowAllChakras(show);
    if (show) {
      onChakraSelect([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  // Toggle individual chakra selection
  const handleChakraToggle = (index: number) => {
    if (selectedChakras.includes(index)) {
      onChakraSelect(selectedChakras.filter(i => i !== index));
    } else {
      onChakraSelect([...selectedChakras, index]);
    }
  };

  return (
    <Card className="bg-black/50 border border-white/10 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center">
          <Sparkles size={16} className="mr-2" />
          Advanced Chakra Customization
        </CardTitle>
        <CardDescription>
          Fine-tune individual chakra properties and behaviors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80">Activate All Chakras</span>
          <Switch 
            checked={showAllChakras} 
            onCheckedChange={handleShowAllChakras} 
          />
        </div>
        
        <div className="space-y-4">
          {CHAKRA_NAMES.map((name, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ 
                      background: selectedChakras.includes(index) 
                        ? CHAKRA_COLORS[index]
                        : 'rgba(255,255,255,0.2)'
                    }}
                  />
                  <span className="text-white/80">{name} Chakra</span>
                </div>
                <Switch 
                  checked={selectedChakras.includes(index)}
                  onCheckedChange={() => handleChakraToggle(index)}
                  disabled={showAllChakras}
                />
              </div>
              
              {selectedChakras.includes(index) && (
                <div className="pl-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Intensity</span>
                    <span className="text-white/80 text-sm">{Math.round(chakraIntensities[index] * 100)}%</span>
                  </div>
                  <Slider
                    value={[chakraIntensities[index] * 100]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={([value]) => onIntensityChange(index, value / 100)}
                    className="py-2"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onChakraSelect([0, 3, 6])}
            className="border-white/10 bg-transparent text-white/80"
          >
            <Zap size={14} className="mr-1" />
            Root-Heart-Crown
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onChakraSelect([0, 1, 2])}
            className="border-white/10 bg-transparent text-white/80"
          >
            <Sliders size={14} className="mr-1" />
            Lower Chakras
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onChakraSelect([3, 4])}
            className="border-white/10 bg-transparent text-white/80"
          >
            <Sliders size={14} className="mr-1" />
            Middle Chakras
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onChakraSelect([5, 6])}
            className="border-white/10 bg-transparent text-white/80"
          >
            <Sliders size={14} className="mr-1" />
            Upper Chakras
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChakraCustomizer;
