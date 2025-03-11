
/**
 * IntegratedSystemDemo Component
 * 
 * A showcase component that demonstrates the integrated chakra and visual system
 * with controls for experimenting with different settings.
 */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import IntegratedSystem from '../visual-system/IntegratedSystem';
import { ChakraType } from '../../types/chakra/ChakraTypes';

/**
 * Demo component for showcasing the integrated chakra and visual system
 */
const IntegratedSystemDemo: React.FC = () => {
  // Chakra activation levels
  const [activationLevels, setActivationLevels] = useState<Record<ChakraType, number>>({
    root: 0.3,
    sacral: 0.4,
    solar: 0.5,
    heart: 0.8,
    throat: 0.6,
    third: 0.5,
    crown: 0.4
  });
  
  // Visual settings
  const [showParticles, setShowParticles] = useState(true);
  const [showEnergyField, setShowEnergyField] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [interactive, setInteractive] = useState(true);
  const [animationLevel, setAnimationLevel] = useState<'minimal' | 'standard' | 'enhanced'>('standard');
  
  // System state information
  const [systemState, setSystemState] = useState({
    balance: 0,
    coherence: 0,
    totalEnergy: 0,
    harmonization: 0
  });
  
  // Handle chakra activation from sliders
  const handleChakraSliderChange = (chakra: ChakraType, value: number) => {
    setActivationLevels(prev => ({
      ...prev,
      [chakra]: value / 100
    }));
  };
  
  // Handle chakra activation from visualization
  const handleChakraActivated = (chakra: ChakraType, level: number) => {
    setActivationLevels(prev => ({
      ...prev,
      [chakra]: level
    }));
  };
  
  // Preset configurations
  const applyPreset = (preset: 'balanced' | 'spiritual' | 'creative' | 'grounded' | 'reset') => {
    switch (preset) {
      case 'balanced':
        setActivationLevels({
          root: 0.6,
          sacral: 0.6,
          solar: 0.6,
          heart: 0.7,
          throat: 0.6,
          third: 0.6,
          crown: 0.6
        });
        break;
      case 'spiritual':
        setActivationLevels({
          root: 0.3,
          sacral: 0.4,
          solar: 0.4,
          heart: 0.6,
          throat: 0.7,
          third: 0.9,
          crown: 0.9
        });
        break;
      case 'creative':
        setActivationLevels({
          root: 0.4,
          sacral: 0.9,
          solar: 0.7,
          heart: 0.6,
          throat: 0.8,
          third: 0.7,
          crown: 0.5
        });
        break;
      case 'grounded':
        setActivationLevels({
          root: 0.9,
          sacral: 0.8,
          solar: 0.7,
          heart: 0.6,
          throat: 0.4,
          third: 0.3,
          crown: 0.2
        });
        break;
      case 'reset':
        setActivationLevels({
          root: 0.3,
          sacral: 0.3,
          solar: 0.3,
          heart: 0.3,
          throat: 0.3,
          third: 0.3,
          crown: 0.3
        });
        break;
    }
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Integrated Visualization System</CardTitle>
          <CardDescription>
            Explore the combined chakra and visual system with interactive controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegratedSystem
            initialActivation={activationLevels}
            showParticles={showParticles}
            showEnergyField={showEnergyField}
            showChakraLabels={showLabels}
            interactive={interactive}
            animationLevel={animationLevel}
            height={500}
            onChakraActivated={handleChakraActivated}
            onSystemStateChange={setSystemState}
          />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="chakras">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="chakras">Chakra Controls</TabsTrigger>
          <TabsTrigger value="visual">Visual Settings</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chakras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chakra Activation Levels</CardTitle>
              <CardDescription>
                Adjust the activation level of each chakra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(['root', 'sacral', 'solar', 'heart', 'throat', 'third', 'crown'] as ChakraType[]).map((chakra) => (
                <div key={chakra} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${chakra}-slider`} className="capitalize font-bold">
                      {chakra} Chakra
                    </Label>
                    <span className="text-sm font-medium">
                      {Math.round(activationLevels[chakra] * 100)}%
                    </span>
                  </div>
                  <Slider
                    id={`${chakra}-slider`}
                    min={0}
                    max={100}
                    step={1}
                    value={[activationLevels[chakra] * 100]}
                    onValueChange={(value) => handleChakraSliderChange(chakra, value[0])}
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2">
              <Button variant="outline" onClick={() => applyPreset('balanced')}>Balanced</Button>
              <Button variant="outline" onClick={() => applyPreset('spiritual')}>Spiritual</Button>
              <Button variant="outline" onClick={() => applyPreset('creative')}>Creative</Button>
              <Button variant="outline" onClick={() => applyPreset('grounded')}>Grounded</Button>
              <Button variant="secondary" onClick={() => applyPreset('reset')}>Reset All</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <CardTitle>Visual Settings</CardTitle>
              <CardDescription>
                Configure the appearance and behavior of the visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="particles-switch">Show Particles</Label>
                <Switch
                  id="particles-switch"
                  checked={showParticles}
                  onCheckedChange={setShowParticles}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="energy-field-switch">Show Energy Field</Label>
                <Switch
                  id="energy-field-switch"
                  checked={showEnergyField}
                  onCheckedChange={setShowEnergyField}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="labels-switch">Show Chakra Labels</Label>
                <Switch
                  id="labels-switch"
                  checked={showLabels}
                  onCheckedChange={setShowLabels}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="interactive-switch">Interactive Mode</Label>
                <Switch
                  id="interactive-switch"
                  checked={interactive}
                  onCheckedChange={setInteractive}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Animation Level</Label>
                <div className="flex gap-4">
                  <Button 
                    variant={animationLevel === 'minimal' ? 'default' : 'outline'}
                    onClick={() => setAnimationLevel('minimal')}
                  >
                    Minimal
                  </Button>
                  <Button
                    variant={animationLevel === 'standard' ? 'default' : 'outline'}
                    onClick={() => setAnimationLevel('standard')}
                  >
                    Standard
                  </Button>
                  <Button
                    variant={animationLevel === 'enhanced' ? 'default' : 'outline'}
                    onClick={() => setAnimationLevel('enhanced')}
                  >
                    Enhanced
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>
                Real-time analytics of the chakra energy system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Energy Balance</Label>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${systemState.balance * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm">{Math.round(systemState.balance * 100)}%</div>
                </div>
                
                <div className="space-y-2">
                  <Label>System Coherence</Label>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${systemState.coherence * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm">{Math.round(systemState.coherence * 100)}%</div>
                </div>
                
                <div className="space-y-2">
                  <Label>Total Energy Level</Label>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(1, systemState.totalEnergy / 7) * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm">{Math.round(systemState.totalEnergy * 14)}%</div>
                </div>
                
                <div className="space-y-2">
                  <Label>System Harmonization</Label>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${systemState.harmonization * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm">{Math.round(systemState.harmonization * 100)}%</div>
                </div>
              </div>
              
              <div className="mt-4 border rounded-md p-4 bg-slate-50">
                <h4 className="font-semibold mb-2">System Analysis</h4>
                <p className="text-sm text-gray-600">
                  {systemState.balance > 0.8 ? (
                    "Your chakra system shows excellent balance. All energy centers are working in harmony."
                  ) : systemState.balance > 0.6 ? (
                    "Your chakra system is fairly balanced. Some minor adjustments could improve overall energy flow."
                  ) : systemState.balance > 0.4 ? (
                    "Your chakra system shows moderate imbalance. Consider focusing on harmonizing your energy centers."
                  ) : (
                    "Your chakra system shows significant imbalance. Focus on balancing energy across all centers."
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {systemState.totalEnergy > 5 ? (
                    "Energy levels are very high. You have abundant vital force flowing through your chakra system."
                  ) : systemState.totalEnergy > 3 ? (
                    "Energy levels are good. Your system has healthy vitality and flow."
                  ) : systemState.totalEnergy > 2 ? (
                    "Energy levels are moderate. Consider practices to enhance your vital energy."
                  ) : (
                    "Energy levels are low. Focus on practices that build and restore your energy reserves."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedSystemDemo;
