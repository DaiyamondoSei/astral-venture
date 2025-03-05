
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Eye, Layers, Settings2 } from 'lucide-react';
import AnimationControls from '../advanced-controls/AnimationControls';
import ComponentIsolation from '../advanced-controls/ComponentIsolation';
import PerformanceMonitor from '../advanced-controls/PerformanceMonitor';
import { ComponentOption } from '../hooks/useDevModeState';

interface AdvancedTabProps {
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

const AdvancedTab: React.FC<AdvancedTabProps> = ({
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
    <div className="p-4 space-y-6">
      <AnimationControls 
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        animationsEnabled={animationsEnabled}
        setAnimationsEnabled={setAnimationsEnabled}
        animationPreset={animationPreset}
        setAnimationPreset={setAnimationPreset}
        onResetAnimations={onResetAnimations}
      />
      
      <ComponentIsolation 
        componentOptions={componentOptions}
        onToggleComponent={onToggleComponent}
        isolationMode={isolationMode}
        setIsolationMode={setIsolationMode}
        onShowAll={onShowAll}
        onHideAll={onHideAll}
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
    </div>
  );
};

export default AdvancedTab;
