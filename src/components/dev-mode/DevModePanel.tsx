
import React, { useState } from 'react';
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
  Sparkles
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
import HumanSilhouette from '@/components/entry-animation/cosmic/HumanSilhouette';
import { CHAKRA_NAMES, ENERGY_THRESHOLDS } from '@/components/entry-animation/cosmic/types';

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
  
  // Calculate chakra intensity based on selected chakras
  const getChakraIntensity = (chakraIndex: number) => {
    if (showAllChakras) return 1;
    return selectedChakras.includes(chakraIndex) ? 1 : 0.3;
  };
  
  const handleChakraToggle = (index: number) => {
    setSelectedChakras(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  // Handle "Show All Chakras" toggle
  const handleShowAllChakras = (show: boolean) => {
    setShowAllChakras(show);
    if (show) {
      setSelectedChakras([0, 1, 2, 3, 4, 5, 6]);
    }
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
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Show Details</span>
                          <Switch 
                            checked={showDetails} 
                            onCheckedChange={setShowDetails} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Show Illumination</span>
                          <Switch 
                            checked={showIllumination} 
                            onCheckedChange={setShowIllumination} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Show Fractal</span>
                          <Switch 
                            checked={showFractal} 
                            onCheckedChange={setShowFractal} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Show Transcendence</span>
                          <Switch 
                            checked={showTranscendence} 
                            onCheckedChange={setShowTranscendence} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Show Infinity</span>
                          <Switch 
                            checked={showInfinity} 
                            onCheckedChange={setShowInfinity} 
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="chakras" className="p-4 space-y-6">
            <Card className="bg-black/50 border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Chakra Activation</CardTitle>
                <CardDescription>
                  Customize which chakras are active and their intensity
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
                
                <Separator className="bg-white/10 my-4" />
                
                <div className="space-y-3">
                  {CHAKRA_NAMES.map((name, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ 
                            background: selectedChakras.includes(index) 
                              ? `var(--chakra-color-${index})` 
                              : 'rgba(255,255,255,0.2)'
                          }}
                        ></div>
                        <span className="text-white/80">{name} Chakra</span>
                      </div>
                      <Switch 
                        checked={selectedChakras.includes(index)}
                        onCheckedChange={() => handleChakraToggle(index)}
                        disabled={showAllChakras}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
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
              </CardContent>
            </Card>
            
            <Card className="bg-black/50 border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Advanced Controls</CardTitle>
                <CardDescription>
                  Test and preview more advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="border-white/10 bg-transparent text-white/80 justify-start">
                    <Settings2 size={14} className="mr-2" />
                    Manual Chakra Activation
                  </Button>
                  <Button variant="outline" className="border-white/10 bg-transparent text-white/80 justify-start">
                    <PanelRight size={14} className="mr-2" />
                    Emotional Analysis Panel
                  </Button>
                  <Button variant="outline" className="border-white/10 bg-transparent text-white/80 justify-start">
                    <Sparkles size={14} className="mr-2" />
                    Astral Transition Demo
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
        <span className="text-xs text-white/40">Developer Mode v1.0</span>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white" onClick={onClose}>
          Close Panel
        </Button>
      </div>
    </motion.div>
  );
};

export default DevModePanel;
