
/**
 * Visual System Example
 * 
 * Demonstrates the usage of the enhanced visualization system
 * with chakra system integration and performance optimization.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedVisualization from '@/components/visualization/EnhancedVisualization';
import EnhancedChakraActivation from '@/components/chakra/EnhancedChakraActivation';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

/**
 * Visual System Example Component
 */
const VisualSystemExample: React.FC = () => {
  // State for energy points and activated chakras
  const [energyPoints, setEnergyPoints] = useState(300);
  const [activatedChakras, setActivatedChakras] = useState<number[]>([3]); // Heart chakra active by default
  
  // Performance monitoring
  const { trackInteraction } = usePerformanceMonitoring({
    componentName: 'VisualSystemExample',
    trackInteractions: true
  });
  
  // Handle chakra activation change
  const handleChakraActivationChange = (activatedChakras: number[]) => {
    const endTracking = trackInteraction('chakraActivationChange');
    setActivatedChakras(activatedChakras);
    endTracking();
  };
  
  // Handle energy level change
  const handleEnergyChange = (value: number[]) => {
    const endTracking = trackInteraction('energyChange');
    setEnergyPoints(value[0]);
    endTracking();
  };
  
  // Add energy points
  const handleAddEnergy = () => {
    const endTracking = trackInteraction('addEnergy');
    setEnergyPoints(prev => Math.min(prev + 100, 1000));
    endTracking();
  };
  
  // Reset energy points
  const handleResetEnergy = () => {
    const endTracking = trackInteraction('resetEnergy');
    setEnergyPoints(0);
    setActivatedChakras([]);
    endTracking();
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Visual System Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Visualization</CardTitle>
            <CardDescription>
              Interactive cosmic and chakra visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedVisualization 
              energyPoints={energyPoints}
              activatedChakras={activatedChakras}
            />
          </CardContent>
        </Card>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Energy Control</CardTitle>
              <CardDescription>
                Adjust energy levels and chakra activation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium">Energy Points: {energyPoints}</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={handleAddEnergy}>
                      +100 Energy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetEnergy}>
                      Reset
                    </Button>
                  </div>
                </div>
                <Slider
                  value={[energyPoints]}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={handleEnergyChange}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Chakra System</CardTitle>
              <CardDescription>
                Activate and balance your chakras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedChakraActivation 
                energyPoints={energyPoints}
                activatedChakras={activatedChakras}
                onActivationChange={handleChakraActivationChange}
                showLabels={true}
                interactive={true}
                animationLevel="enhanced"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisualSystemExample;
