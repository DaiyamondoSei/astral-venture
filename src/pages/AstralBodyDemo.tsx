
import React from 'react';
import Layout from '@/components/Layout';
import DemoHeader from '@/components/astral-body-demo/DemoHeader';
import DemoContainer from '@/components/astral-body-demo/DemoContainer';
import DemoCards from '@/components/astral-body-demo/DemoCards';
import VisualizationTabs from '@/components/astral-body-demo/VisualizationTabs';
import EnergyThresholds from '@/components/astral-body-demo/EnergyThresholds';
import { useAstralDemo } from '@/hooks/useAstralDemo';
import { motion } from 'framer-motion';

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
  
  // Animation variants for page elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <Layout>
      <motion.div
        className="min-h-screen py-8 bg-gradient-to-b from-black to-indigo-950/30"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <DemoContainer>
          <motion.div variants={itemVariants}>
            <DemoHeader />
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="my-8"
          >
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
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="mb-8"
          >
            <VisualizationTabs energyPoints={energyPoints} />
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="mb-4"
          >
            <EnergyThresholds />
          </motion.div>
          
          {/* Enhancement: Visual journey label */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-8 mb-4"
          >
            <p className="text-sm text-white/50 italic">
              Your astral body visualization represents your current energy progress and evolutionary stage
            </p>
            {energyPoints > 0 && (
              <div className="inline-block mt-3 px-3 py-1 rounded-full bg-quantum-500/20 border border-quantum-500/30">
                <p className="text-xs text-white/80">
                  {energyPoints < 200 ? 'Beginning Stage' : 
                   energyPoints < 500 ? 'Awakening Stage' : 
                   energyPoints < 1000 ? 'Illumination Stage' : 
                   energyPoints < 1500 ? 'Transcendence Stage' : 
                   'Infinite Consciousness Stage'}
                </p>
              </div>
            )}
          </motion.div>
        </DemoContainer>
      </motion.div>
    </Layout>
  );
};

export default AstralBodyDemo;
