
/**
 * Geometry Visual Demo Component
 * 
 * Demonstrates the AI-powered visual processing capabilities (Phase 2).
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Cpu, Info } from 'lucide-react';
import { useAIVisualProcessing } from '@/hooks/useAIVisualProcessing';
import { CHAKRA_COLORS, CHAKRA_NAMES } from '@/utils/emotion/constants';
import { ChakraTypes } from '@/types/chakra/ChakraSystemTypes';
import { useToast } from '@/components/ui/use-toast';

interface GeometryVisualDemoProps {
  chakraAssociations?: number[];
  initialComplexity?: number;
  showControls?: boolean;
  className?: string;
}

const GeometryVisualDemo: React.FC<GeometryVisualDemoProps> = ({
  chakraAssociations = [4], // Default to heart chakra
  initialComplexity = 3,
  showControls = true,
  className = ''
}) => {
  const { toast } = useToast();
  const [selectedChakras, setSelectedChakras] = useState<number[]>(chakraAssociations);
  
  const {
    geometryPattern,
    isLoading,
    error,
    regeneratePattern,
    complexity,
    setComplexity,
    generatedLocally
  } = useAIVisualProcessing({
    chakraAssociations: selectedChakras,
    initialComplexity,
    adaptToDevice: true
  });
  
  // Effect to show error toast if needed
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error generating pattern',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error, toast]);
  
  // Toggle chakra selection
  const toggleChakra = (chakraIndex: number) => {
    setSelectedChakras(prev => {
      if (prev.includes(chakraIndex)) {
        return prev.filter(c => c !== chakraIndex);
      } else {
        return [...prev, chakraIndex];
      }
    });
  };
  
  // Generate new pattern when selected chakras change
  useEffect(() => {
    if (selectedChakras.length > 0) {
      regeneratePattern();
    }
  }, [selectedChakras]);
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            Sacred Geometry Visualizer
          </div>
          {generatedLocally && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Cpu className="h-3 w-3" />
              Local Generation
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-powered sacred geometry patterns aligned with energy centers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Geometry visualization */}
        <div className="relative aspect-square w-full p-4 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-md border border-border/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RefreshCw className="animate-spin h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Generating pattern...</p>
            </div>
          ) : geometryPattern ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                className="transform-gpu"
                style={{
                  opacity: 0.9,
                  filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))'
                }}
              >
                {/* Add gradient definitions */}
                <defs>
                  {selectedChakras.map((chakra, index) => (
                    <linearGradient key={`grad-${chakra}`} id={`chakra-gradient-${chakra}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={CHAKRA_COLORS[chakra] || '#ffffff'} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={CHAKRA_COLORS[chakra] || '#ffffff'} stopOpacity="0.3" />
                    </linearGradient>
                  ))}
                </defs>
                
                {/* Render the SVG path */}
                <path 
                  d={geometryPattern.svgPath} 
                  fill="none" 
                  stroke={selectedChakras.length === 1 
                    ? `url(#chakra-gradient-${selectedChakras[0]})` 
                    : 'url(#chakra-gradient-4)'} 
                  strokeWidth={0.5 + (complexity * 0.2)}
                  style={{
                    animation: geometryPattern.animationProperties?.rotation 
                      ? `rotate ${geometryPattern.animationProperties.duration}ms infinite linear` 
                      : undefined
                  }}
                />
                
                {/* Add points/nodes at vertices for higher complexity */}
                {complexity > 2 && geometryPattern.points.slice(0, 20).map((point, index) => (
                  <circle 
                    key={`point-${index}`}
                    cx={point[0]} 
                    cy={point[1]} 
                    r={0.5 + (complexity * 0.1)}
                    fill={selectedChakras.length > 0 
                      ? CHAKRA_COLORS[selectedChakras[index % selectedChakras.length]] 
                      : '#ffffff'}
                    style={{
                      animation: geometryPattern.animationProperties?.pulsate 
                        ? `pulse ${1000 + (index * 100)}ms infinite alternate ease-in-out` 
                        : undefined
                    }}
                  />
                ))}
              </svg>
              
              {/* Energy alignment info */}
              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                {geometryPattern.energyAlignment.map((energy, index) => (
                  <Badge key={`energy-${index}`} variant="secondary" className="text-xs opacity-80">
                    {energy}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No pattern generated</p>
            </div>
          )}
        </div>
        
        {showControls && (
          <>
            {/* Chakra selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Energy Centers:</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(chakraIndex => (
                  <Badge 
                    key={`chakra-${chakraIndex}`}
                    variant={selectedChakras.includes(chakraIndex) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedChakras.includes(chakraIndex) 
                        ? CHAKRA_COLORS[chakraIndex] 
                        : undefined,
                      borderColor: CHAKRA_COLORS[chakraIndex],
                      color: selectedChakras.includes(chakraIndex) ? '#ffffff' : undefined
                    }}
                    onClick={() => toggleChakra(chakraIndex)}
                  >
                    {CHAKRA_NAMES[chakraIndex as keyof typeof CHAKRA_NAMES]}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Complexity control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Complexity:</label>
                <span className="text-xs text-muted-foreground">{complexity}</span>
              </div>
              <Slider
                value={[complexity]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setComplexity(value[0])}
              />
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="gap-1"
          onClick={() => regeneratePattern()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          <span>
            {generatedLocally 
              ? 'Generated locally to save API costs' 
              : 'AI-powered pattern generation'}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GeometryVisualDemo;
