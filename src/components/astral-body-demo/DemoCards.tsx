
import React from 'react';
import EnergyProgressCard from './EnergyProgressCard';
import SimulationModeCard from './SimulationModeCard';

interface DemoCardsProps {
  userProfile: any;
  updateUserProfile: (updates: any) => void;
  energyPoints: number;
  incrementAmount: number;
  setIncrementAmount: (amount: number) => void;
  simulatedPoints: number;
  setSimulatedPoints: (points: number) => void;
  isSimulating: boolean;
  setIsSimulating: (isSimulating: boolean) => void;
}

/**
 * DemoCards component
 * 
 * Displays the main control cards for the AstralBodyDemo
 */
const DemoCards: React.FC<DemoCardsProps> = ({
  userProfile,
  updateUserProfile,
  energyPoints,
  incrementAmount,
  setIncrementAmount,
  simulatedPoints,
  setSimulatedPoints,
  isSimulating,
  setIsSimulating
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <EnergyProgressCard
        userProfile={userProfile}
        updateUserProfile={updateUserProfile}
        energyPoints={energyPoints}
        incrementAmount={incrementAmount}
        setIncrementAmount={setIncrementAmount}
      />
      
      <SimulationModeCard
        simulatedPoints={simulatedPoints}
        setSimulatedPoints={setSimulatedPoints}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
      />
    </div>
  );
};

export default DemoCards;
