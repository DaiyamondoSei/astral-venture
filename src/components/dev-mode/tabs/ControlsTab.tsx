
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Zap, Dices } from 'lucide-react';
import { ENERGY_THRESHOLDS } from '@/components/entry-animation/cosmic/types';

interface ControlsTabProps {
  energyPoints: number;
  setEnergyPoints: (value: number) => void;
  handleRandomize: () => void;
}

const ControlsTab: React.FC<ControlsTabProps> = ({
  energyPoints,
  setEnergyPoints,
  handleRandomize
}) => {
  return (
    <div className="p-4 space-y-6">
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
    </div>
  );
};

export default ControlsTab;
