
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface SimulationModeCardProps {
  simulatedPoints: number;
  setSimulatedPoints: (points: number) => void;
  isSimulating: boolean;
  setIsSimulating: (isSimulating: boolean) => void;
}

const SimulationModeCard = ({
  simulatedPoints,
  setSimulatedPoints,
  isSimulating,
  setIsSimulating
}: SimulationModeCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-sm bg-black/30">
      <h2 className="text-xl font-display mb-4 text-blue-50">Simulation Mode</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Use the slider below to preview how your astral body will evolve with more energy points
      </p>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center text-sm">
          <span>0 points</span>
          <span>2000 points</span>
        </div>
        
        <Slider
          value={[simulatedPoints]}
          onValueChange={(value) => setSimulatedPoints(value[0])}
          max={2000}
          step={50}
          className="mb-6"
        />
        
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Simulated: <span className="text-primary font-medium">{simulatedPoints} points</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSimulating(!isSimulating)}
          >
            {isSimulating ? "Show Real Progress" : "Show Simulation"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SimulationModeCard;
