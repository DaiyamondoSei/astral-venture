
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Sparkles, Sliders, Settings2 } from 'lucide-react';
import VisualizationsTab from '../tabs/VisualizationsTab';
import ChakrasTab from '../tabs/ChakrasTab';
import ControlsTab from '../tabs/ControlsTab';
import AdvancedTab from '../tabs/AdvancedTab';
import { ComponentOption } from '../hooks/useDevModeState';

interface DevModeTabsProps {
  energyPoints: number;
  setEnergyPoints: (value: number) => void;
  selectedChakras: number[];
  setSelectedChakras: (chakras: number[]) => void;
  showDetails: boolean;
  setShowDetails: (value: boolean) => void;
  showIllumination: boolean;
  setShowIllumination: (value: boolean) => void;
  showFractal: boolean;
  setShowFractal: (value: boolean) => void;
  showTranscendence: boolean;
  setShowTranscendence: (value: boolean) => void;
  showInfinity: boolean;
  setShowInfinity: (value: boolean) => void;
  chakraIntensities: number[];
  handleIntensityChange: (index: number, value: number) => void;
  fractalComplexity: number;
  setFractalComplexity: (value: number) => void;
  glowIntensity: number;
  setGlowIntensity: (value: number) => void;
  getChakraIntensity: (chakraIndex: number) => number;
  handleRandomize: () => void;
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
  animationPreset: string;
  setAnimationPreset: (value: string) => void;
  onResetAnimations: () => void;
  componentOptions: ComponentOption[];
  onToggleComponent: (id: string) => void;
  isolationMode: boolean;
  setIsolationMode: (value: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  isMonitoring: boolean;
  setIsMonitoring: (value: boolean) => void;
}

const DevModeTabs: React.FC<DevModeTabsProps> = ({
  energyPoints,
  setEnergyPoints,
  selectedChakras,
  setSelectedChakras,
  showDetails,
  setShowDetails,
  showIllumination,
  setShowIllumination,
  showFractal,
  setShowFractal,
  showTranscendence,
  setShowTranscendence,
  showInfinity,
  setShowInfinity,
  chakraIntensities,
  handleIntensityChange,
  fractalComplexity,
  setFractalComplexity,
  glowIntensity,
  setGlowIntensity,
  getChakraIntensity,
  handleRandomize,
  animationSpeed,
  setAnimationSpeed,
  animationsEnabled,
  setAnimationsEnabled,
  animationPreset,
  setAnimationPreset,
  onResetAnimations,
  componentOptions,
  onToggleComponent,
  isolationMode,
  setIsolationMode,
  onShowAll,
  onHideAll,
  isMonitoring,
  setIsMonitoring
}) => {
  return (
    <Tabs defaultValue="visualizations" className="w-full">
      <TabsList className="w-full px-4 py-2 flex justify-center bg-transparent border-b border-white/10">
        <TabsTrigger 
          value="visualizations" 
          className="data-[state=active]:bg-quantum-500/30 data-[state=active]:text-white rounded-md"
        >
          <Eye size={16} className="mr-2" />
          Visualizations
        </TabsTrigger>
        <TabsTrigger 
          value="chakras" 
          className="data-[state=active]:bg-quantum-500/30 data-[state=active]:text-white rounded-md"
        >
          <Sparkles size={16} className="mr-2" />
          Chakras
        </TabsTrigger>
        <TabsTrigger 
          value="controls" 
          className="data-[state=active]:bg-quantum-500/30 data-[state=active]:text-white rounded-md"
        >
          <Sliders size={16} className="mr-2" />
          Controls
        </TabsTrigger>
        <TabsTrigger 
          value="advanced" 
          className="data-[state=active]:bg-quantum-500/30 data-[state=active]:text-white rounded-md"
        >
          <Settings2 size={16} className="mr-2" />
          Advanced
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="visualizations">
        <VisualizationsTab 
          energyPoints={energyPoints}
          selectedChakras={selectedChakras}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          showIllumination={showIllumination}
          setShowIllumination={setShowIllumination}
          showFractal={showFractal}
          setShowFractal={setShowFractal}
          showTranscendence={showTranscendence}
          setShowTranscendence={setShowTranscendence}
          showInfinity={showInfinity}
          setShowInfinity={setShowInfinity}
          fractalComplexity={fractalComplexity}
          setFractalComplexity={setFractalComplexity}
          glowIntensity={glowIntensity}
          setGlowIntensity={setGlowIntensity}
          getChakraIntensity={getChakraIntensity}
        />
      </TabsContent>
      
      <TabsContent value="chakras">
        <ChakrasTab 
          selectedChakras={selectedChakras}
          setSelectedChakras={setSelectedChakras}
          chakraIntensities={chakraIntensities}
          handleIntensityChange={handleIntensityChange}
        />
      </TabsContent>
      
      <TabsContent value="controls">
        <ControlsTab 
          energyPoints={energyPoints}
          setEnergyPoints={setEnergyPoints}
          handleRandomize={handleRandomize}
        />
      </TabsContent>
      
      <TabsContent value="advanced">
        <AdvancedTab 
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          animationsEnabled={animationsEnabled}
          setAnimationsEnabled={setAnimationsEnabled}
          animationPreset={animationPreset}
          setAnimationPreset={setAnimationPreset}
          onResetAnimations={onResetAnimations}
          componentOptions={componentOptions}
          onToggleComponent={onToggleComponent}
          isolationMode={isolationMode}
          setIsolationMode={setIsolationMode}
          onShowAll={onShowAll}
          onHideAll={onHideAll}
          isMonitoring={isMonitoring}
          setIsMonitoring={setIsMonitoring}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DevModeTabs;
