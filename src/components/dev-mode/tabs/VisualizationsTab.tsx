
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AstralBody from '@/components/entry-animation/AstralBody';
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody';
import HumanSilhouette from '@/components/entry-animation/cosmic/silhouette/HumanSilhouette';
import VisualizationSettings from '../advanced-controls/VisualizationSettings';

interface VisualizationsTabProps {
  energyPoints: number;
  selectedChakras: number[];
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
  fractalComplexity: number;
  setFractalComplexity: (value: number) => void;
  glowIntensity: number;
  setGlowIntensity: (value: number) => void;
  getChakraIntensity: (chakraIndex: number) => number;
}

const VisualizationsTab: React.FC<VisualizationsTabProps> = ({
  energyPoints,
  selectedChakras,
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
  fractalComplexity,
  setFractalComplexity,
  glowIntensity,
  setGlowIntensity,
  getChakraIntensity
}) => {
  return (
    <div className="p-4 space-y-6">
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
    </div>
  );
};

export default VisualizationsTab;
