
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Settings2, 
  Sliders, 
  PanelRight, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Eye,
  Sparkles,
  Dices,
  Activity,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import AstralBody from '@/components/entry-animation/AstralBody';
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody';
import HumanSilhouette from '@/components/entry-animation/cosmic/silhouette/HumanSilhouette';
import { CHAKRA_NAMES, ENERGY_THRESHOLDS } from '@/components/entry-animation/cosmic/types';

// Import new advanced control components
import ChakraCustomizer from './advanced-controls/ChakraCustomizer';
import VisualizationSettings from './advanced-controls/VisualizationSettings';
import AnimationControls from './advanced-controls/AnimationControls';
import PerformanceMonitor from './advanced-controls/PerformanceMonitor';
import ComponentIsolation from './advanced-controls/ComponentIsolation';

interface DevModePanelProps {
  onClose: () => void;
}

const DevModePanel: React.FC<DevModePanelProps> = ({ onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [energyPoints, setEnergyPoints] = useState(300);
  const [selectedChakras, setSelectedChakras] = useState<number[]>([0, 3, 6]);
  const [showAllChakras, setShowAllChakras] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showIllumination, setShowIllumination] = useState(true);
  const [showFractal, setShowFractal] = useState(true);
  const [showTranscendence, setShowTranscendence] = useState(false);
  const [showInfinity, setShowInfinity] = useState(false);
  
  // Advanced settings states
  const [chakraIntensities, setChakraIntensities] = useState<number[]>([1, 1, 1, 1, 1, 1, 1]);
  const [fractalComplexity, setFractalComplexity] = useState(5);
  const [glowIntensity, setGlowIntensity] = useState(0.7);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationPreset, setAnimationPreset] = useState('smooth');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isolationMode, setIsolationMode] = useState(false);
  
  // Component isolation options
  const [componentOptions, setComponentOptions] = useState([
    { id: 'silhouette', name: 'Human Silhouette', description: 'Base human form', isVisible: true },
    { id: 'chakras', name: 'Chakra Points', description: 'Energy centers', isVisible: true },
    { id: 'aura', name: 'Aura Field', description: 'Surrounding energy', isVisible: true },
    { id: 'rays', name: 'Energy Rays', description: 'Emanating light', isVisible: true },
    { id: 'fractal', name: 'Fractal Patterns', description: 'Complex geometries', isVisible: true },
    { id: 'stars', name: 'Background Stars', description: 'Cosmic backdrop', isVisible: true },
    { id: 'glow', name: 'Central Glow', description: 'Core energy', isVisible: true },
  ]);
  
  // Calculate chakra intensity based on selected chakras
  const getChakraIntensity = (chakraIndex: number) => {
    if (showAllChakras) return 1;
    return selectedChakras.includes(chakraIndex) ? chakraIntensities[chakraIndex] : 0.3;
  };
  
  // Handle chakra intensity change
  const handleIntensityChange = (index: number, value: number) => {
    const newIntensities = [...chakraIntensities];
    newIntensities[index] = value;
    setChakraIntensities(newIntensities);
  };
  
  // Handle "Show All Chakras" toggle
  const handleShowAllChakras = (show: boolean) => {
    setShowAllChakras(show);
    if (show) {
      setSelectedChakras([0, 1, 2, 3, 4, 5, 6]);
    }
  };
  
  // Handle component visibility toggle
  const handleToggleComponent = (id: string) => {
    setComponentOptions(prev => 
      prev.map(option => 
        option.id === id ? { ...option, isVisible: !option.isVisible } : option
      )
    );
  };
  
  // Show all components
  const handleShowAllComponents = () => {
    setComponentOptions(prev => 
      prev.map(option => ({ ...option, isVisible: true }))
    );
  };
  
  // Hide all components
  const handleHideAllComponents = () => {
    setComponentOptions(prev => 
      prev.map(option => ({ ...option, isVisible: false }))
    );
  };
  
  // Reset animations
  const handleResetAnimations = () => {
    setAnimationSpeed(1.0);
    setAnimationPreset('smooth');
  };
  
  // Generate random configuration
  const handleRandomize = () => {
    // Random chakras (1-7 chakras)
    const numChakras = Math.floor(Math.random() * 7) + 1;
    const randomChakras = [];
    const allChakras = [0, 1, 2, 3, 4, 5, 6];
    
    // Shuffle and pick
    for (let i = 0; i < numChakras; i++) {
      const availableIndices = allChakras.filter(idx => !randomChakras.includes(idx));
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      randomChakras.push(availableIndices[randomIndex]);
    }
    
    setSelectedChakras(randomChakras);
    
    // Random energies (100-1000)
    const randomEnergy = Math.floor(Math.random() * 900) + 100;
    setEnergyPoints(randomEnergy);
    
    // Random visualization settings
    setShowDetails(Math.random() > 0.2);
    setShowIllumination(Math.random() > 0.3);
    setShowFractal(Math.random() > 0.4);
    setShowTranscendence(Math.random() > 0.7);
    setShowInfinity(Math.random() > 0.8);
  };
  
  return (
    <motion.div 
      className={`fixed right-0 top-0 h-full bg-black/95 border-l border-white/10 
        backdrop-blur-md shadow-2xl z-50 flex flex-col overflow-hidden transition-all
        ${isExpanded ? 'w-full md:w-2/3 lg:w-1/2' : 'w-full sm:w-96'}`}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Code size={18} className="text-quantum-400" />
          <h2 className="text-lg font-semibold text-white">Developer Mode</h2>
          <Badge className="bg-quantum-500/30 hover:bg-quantum-500/40 text-white text-xs">PREMIUM</Badge>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-white/70 hover:text-white mr-2"
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-white/70 hover:text-white"
          >
            <X size={18} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
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
          
          <TabsContent value="visualizations" className="p-4 space-y-6">
            <Card className="bg-black/50 border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Energy Visualizations</CardTitle>
                <CardDescription>
                  Preview different astral body visualizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                    <h3 className="text-white text-center mb-4">Cosmic Version</h3>
                    <div className="aspect-[3/4] max-w-[240px] mx-auto">
                      <CosmicAstralBody 
                        energyPoints={energyPoints}
                        activatedChakras={selectedChakras}
                        showDetailsOverride={showDetails}
                        showIlluminationOverride={showIllumination}
                        showFractalOverride={showFractal}
                        showTranscendenceOverride={showTranscendence}
                        showInfinityOverride={showInfinity}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                    <h3 className="text-white text-center mb-4">Classic Version</h3>
                    <div className="aspect-[3/4] max-w-[240px] mx-auto">
                      <AstralBody />
                    </div>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="border-white/10">
                  <AccordionItem value="silhouette" className="border-white/10">
                    <AccordionTrigger className="text-white hover:text-white/80">
                      Human Silhouette Component
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 bg-black/40 rounded-lg border border-white/5 max-w-[300px] mx-auto">
                        <svg 
                          className="w-full aspect-[3/4]"
                          viewBox="0 0 200 400" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <HumanSilhouette 
                            showChakras={true}
                            showDetails={showDetails}
                            showIllumination={showIllumination}
                            showFractal={showFractal}
                            showTranscendence={showTranscendence}
                            showInfinity={showInfinity}
                            baseProgressPercentage={energyPoints / 600}
                            getChakraIntensity={getChakraIntensity}
                            activatedChakras={selectedChakras}
                          />
                        </svg>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <VisualizationSettings 
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
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="chakras" className="p-4 space-y-6">
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
          </TabsContent>
          
          <TabsContent value="controls" className="p-4 space-y-6">
            <Card className="bg-black/50 border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Energy Controls</CardTitle>
                <CardDescription>
                  Adjust energy levels to see different visualization states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Energy Points</span>
                    <span className="text-white font-medium">{energyPoints}</span>
                  </div>
                  <Slider
                    value={[energyPoints]}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={([value]) => setEnergyPoints(value)}
                    className="py-4"
                  />
                  
                  <div className="flex justify-between text-xs text-white/50 px-2">
                    <span>0</span>
                    <span>250</span>
                    <span>500</span>
                    <span>750</span>
                    <span>1000</span>
                  </div>
                </div>
                
                <Separator className="bg-white/10 my-4" />
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ENERGY_THRESHOLDS).map(([key, value]) => (
                    <Button 
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => setEnergyPoints(value)}
                      className={`border-white/10 ${energyPoints >= value ? 'bg-quantum-500/30 text-white' : 'bg-transparent text-white/60'}`}
                    >
                      <Zap size={14} className="mr-1" />
                      {key.charAt(0) + key.slice(1).toLowerCase()} Level
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandomize}
                  className="w-full mt-4 border-white/10 bg-quantum-500/20 text-white"
                >
                  <Dices size={14} className="mr-1" />
                  Randomize Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="p-4 space-y-6">
            <AnimationControls 
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              animationsEnabled={animationsEnabled}
              setAnimationsEnabled={setAnimationsEnabled}
              animationPreset={animationPreset}
              setAnimationPreset={setAnimationPreset}
              onResetAnimations={handleResetAnimations}
            />
            
            <ComponentIsolation 
              componentOptions={componentOptions}
              onToggleComponent={handleToggleComponent}
              isolationMode={isolationMode}
              setIsolationMode={setIsolationMode}
              onShowAll={handleShowAllComponents}
              onHideAll={handleHideAllComponents}
            />
            
            <PerformanceMonitor 
              isMonitoring={isMonitoring}
              setIsMonitoring={setIsMonitoring}
            />
            
            <Card className="bg-black/50 border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center">
                  <Settings2 size={16} className="mr-2" />
                  Advanced Developer Tools
                </CardTitle>
                <CardDescription>
                  Additional tools for development and testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="border-white/10 bg-transparent text-white/80 justify-start">
                    <Activity size={14} className="mr-2" />
                    Export Performance Report
                  </Button>
                  <Button variant="outline" className="border-white/10 bg-transparent text-white/80 justify-start">
                    <Eye size={14} className="mr-2" />
                    Visual Regression Test
                  </Button>
                  <Button variant="outline" className="border-white/10 bg-transparent text-white/80 justify-start">
                    <Layers size={14} className="mr-2" />
                    Component Tree Explorer
                  </Button>
                </div>
                
                <div className="p-3 bg-quantum-500/10 rounded-md border border-quantum-500/20 text-xs text-white/70 mt-4">
                  <p>Developer mode provides additional testing capabilities and visualization options for development purposes.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="p-4 border-t border-white/10 flex justify-between">
        <span className="text-xs text-white/40">Developer Mode v1.2</span>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white" onClick={onClose}>
          Close Panel
        </Button>
      </div>
    </motion.div>
  );
};

export default DevModePanel;
