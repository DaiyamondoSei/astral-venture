
import React from 'react';
import { Eye, LayoutGrid, Settings, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface VisualizationSettingsProps {
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
}

const VisualizationSettings: React.FC<VisualizationSettingsProps> = ({
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
  setGlowIntensity
}) => {
  const handlePresetBasic = () => {
    setShowDetails(true);
    setShowIllumination(false);
    setShowFractal(false);
    setShowTranscendence(false);
    setShowInfinity(false);
    setFractalComplexity(3);
    setGlowIntensity(0.5);
  };

  const handlePresetAdvanced = () => {
    setShowDetails(true);
    setShowIllumination(true);
    setShowFractal(true);
    setShowTranscendence(false);
    setShowInfinity(false);
    setFractalComplexity(6);
    setGlowIntensity(0.7);
  };

  const handlePresetUltimate = () => {
    setShowDetails(true);
    setShowIllumination(true);
    setShowFractal(true);
    setShowTranscendence(true);
    setShowInfinity(true);
    setFractalComplexity(10);
    setGlowIntensity(0.9);
  };

  return (
    <Card className="bg-black/50 border border-white/10 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center">
          <Eye size={16} className="mr-2" />
          Advanced Visualization Settings
        </CardTitle>
        <CardDescription>
          Fine-tune visual effects and rendering options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Show Details</span>
            <Switch checked={showDetails} onCheckedChange={setShowDetails} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Show Illumination</span>
            <Switch checked={showIllumination} onCheckedChange={setShowIllumination} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Show Fractal</span>
            <Switch checked={showFractal} onCheckedChange={setShowFractal} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Show Transcendence</span>
            <Switch checked={showTranscendence} onCheckedChange={setShowTranscendence} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Show Infinity</span>
            <Switch checked={showInfinity} onCheckedChange={setShowInfinity} />
          </div>
        </div>

        <Separator className="bg-white/10 my-4" />

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/70 text-sm">Fractal Complexity</span>
              <span className="text-white/90 text-sm">{fractalComplexity.toFixed(1)}</span>
            </div>
            <Slider
              value={[fractalComplexity]}
              min={1}
              max={10}
              step={0.1}
              onValueChange={([value]) => setFractalComplexity(value)}
              className="py-2"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/70 text-sm">Glow Intensity</span>
              <span className="text-white/90 text-sm">{(glowIntensity * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[glowIntensity * 100]}
              min={10}
              max={100}
              step={5}
              onValueChange={([value]) => setGlowIntensity(value / 100)}
              className="py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePresetBasic}
            className="border-white/10 bg-transparent text-white/80"
          >
            <LayoutGrid size={14} className="mr-1" />
            Basic
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePresetAdvanced}
            className="border-white/10 bg-transparent text-white/80"
          >
            <Settings size={14} className="mr-1" />
            Advanced
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePresetUltimate}
            className="border-white/10 bg-quantum-500/30 text-white"
          >
            <Zap size={14} className="mr-1" />
            Ultimate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualizationSettings;
