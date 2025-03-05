
import React from 'react';
import { Play, Pause, RotateCcw, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface AnimationControlsProps {
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
  animationPreset: string;
  setAnimationPreset: (value: string) => void;
  onResetAnimations: () => void;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  animationSpeed,
  setAnimationSpeed,
  animationsEnabled,
  setAnimationsEnabled,
  animationPreset,
  setAnimationPreset,
  onResetAnimations
}) => {
  return (
    <Card className="bg-black/50 border border-white/10 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center">
          <Clock size={16} className="mr-2" />
          Animation Controls
        </CardTitle>
        <CardDescription>
          Adjust animation speeds and timing parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80">Enable Animations</span>
          <Switch 
            checked={animationsEnabled} 
            onCheckedChange={setAnimationsEnabled} 
          />
        </div>
        
        {animationsEnabled && (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70 text-sm">Animation Speed</span>
                <span className="text-white/90 text-sm">
                  {animationSpeed === 1 ? "Normal" : 
                   animationSpeed < 1 ? `${animationSpeed.toFixed(1)}x (Slower)` : 
                   `${animationSpeed.toFixed(1)}x (Faster)`}
                </span>
              </div>
              <Slider
                value={[animationSpeed * 100]}
                min={10}
                max={300}
                step={10}
                onValueChange={([value]) => setAnimationSpeed(value / 100)}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-white/50 px-1 mt-1">
                <span>0.1x</span>
                <span>1.0x</span>
                <span>3.0x</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/10 bg-transparent hover:bg-white/5 text-white/80 flex-1"
                onClick={() => setAnimationSpeed(1.0)}
              >
                <RotateCcw size={14} className="mr-1" />
                Reset Speed
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`border-white/10 ${animationsEnabled ? 'bg-white/5' : 'bg-transparent'} hover:bg-white/10 text-white/80 flex-1`}
                onClick={() => setAnimationsEnabled(!animationsEnabled)}
              >
                {animationsEnabled ? (
                  <><Pause size={14} className="mr-1" />Pause</>
                ) : (
                  <><Play size={14} className="mr-1" />Resume</>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                variant={animationPreset === 'smooth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnimationPreset('smooth')}
                className={animationPreset === 'smooth' ? 'bg-quantum-500/30' : 'bg-transparent border-white/10'}
              >
                Smooth
              </Button>
              <Button
                variant={animationPreset === 'pulse' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnimationPreset('pulse')}
                className={animationPreset === 'pulse' ? 'bg-quantum-500/30' : 'bg-transparent border-white/10'}
              >
                Pulse
              </Button>
              <Button
                variant={animationPreset === 'energetic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnimationPreset('energetic')}
                className={animationPreset === 'energetic' ? 'bg-quantum-500/30' : 'bg-transparent border-white/10'}
              >
                <Zap size={14} className="mr-1" />
                Energetic
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onResetAnimations}
              className="w-full mt-2 border-white/10 bg-transparent text-white/80"
            >
              <RotateCcw size={14} className="mr-1" />
              Reset All Animations
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AnimationControls;
