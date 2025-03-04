
import React from 'react';
import Layout from '@/components/Layout';
import DemoHeader from '@/components/astral-body-demo/DemoHeader';
import DemoContainer from '@/components/astral-body-demo/DemoContainer';
import DemoCards from '@/components/astral-body-demo/DemoCards';
import VisualizationTabs from '@/components/astral-body-demo/VisualizationTabs';
import EnergyThresholds from '@/components/astral-body-demo/EnergyThresholds';
import { useAstralDemo } from '@/hooks/useAstralDemo';

/**
 * AstralBodyDemo Page
 * 
 * This page allows users to view and interact with their astral body visualization,
 * which evolves based on the user's energy points.
 */
const AstralBodyDemo = () => {
  const {
    userProfile,
    updateUserProfile,
    simulatedPoints,
    setSimulatedPoints,
    isSimulating,
    setIsSimulating,
    incrementAmount,
    setIncrementAmount,
    energyPoints
  } = useAstralDemo();
  
  return (
    <Layout>
      <DemoContainer>
        <DemoHeader />
        
        <DemoCards 
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
          energyPoints={energyPoints}
          incrementAmount={incrementAmount}
          setIncrementAmount={setIncrementAmount}
          simulatedPoints={simulatedPoints}
          setSimulatedPoints={setSimulatedPoints}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
        />
        
        <VisualizationTabs energyPoints={energyPoints} />
        
        <EnergyThresholds />
      </DemoContainer>
    </Layout>
  );
};

export default AstralBodyDemo;
