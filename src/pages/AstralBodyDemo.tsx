
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
        duration: 0.8
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };
  
  // Get the stage label based on energy points
  const getStageLabel = () => {
    if (energyPoints < 200) return 'Beginning Stage';
    if (energyPoints < 500) return 'Awakening Stage';
    if (energyPoints < 1000) return 'Illumination Stage';
    if (energyPoints < 1500) return 'Transcendence Stage';
    return 'Infinite Consciousness Stage';
  };
  
  return (
    <Layout>
      <motion.div
        className="min-h-screen py-8 bg-gradient-to-b from-black via-indigo-950/20 to-quantum-900/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <DemoContainer>
          <motion.div variants={itemVariants} className="mb-8">
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
          
          {/* Stage indicator */}
          {energyPoints > 0 && (
            <motion.div
              variants={itemVariants}
              className="text-center mb-10"
            >
              <motion.div 
                className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-quantum-500/20 to-astral-500/20 border border-quantum-500/30 shadow-[0_0_15px_rgba(138,92,246,0.2)]"
                animate={{ 
                  boxShadow: ['0 0 15px rgba(138,92,246,0.1)', '0 0 20px rgba(138,92,246,0.3)', '0 0 15px rgba(138,92,246,0.1)'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <p className="text-sm font-medium text-white/90">{getStageLabel()}</p>
              </motion.div>
            </motion.div>
          )}
          
          <motion.div 
            variants={itemVariants}
            className="mb-12"
          >
            <VisualizationTabs energyPoints={energyPoints} />
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="mb-10"
          >
            <EnergyThresholds />
          </motion.div>
          
          {/* Visual journey label - enhanced version */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-10 mb-8"
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              <p className="text-sm text-white/60 italic max-w-md">
                Your astral body visualization reflects your energy progress and evolutionary journey through consciousness
              </p>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          </motion.div>
        </DemoContainer>
      </motion.div>
    </Layout>
  );
};

export default AstralBodyDemo;
