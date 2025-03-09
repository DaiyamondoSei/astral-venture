
import React from 'react';
import { motion } from 'framer-motion';
import HomeNavigation from '@/components/home/HomeNavigation';
import VisualSystem from '@/components/visual-foundation/VisualSystem';
import { useQuantumTheme } from '@/components/visual-foundation';
import { usePerfConfig } from '@/hooks/usePerfConfig';

const HomePage: React.FC = () => {
  const { cosmicIntensity } = useQuantumTheme();
  const { config } = usePerfConfig();
  
  return (
    <VisualSystem 
      showBackground={true}
      showMetatronsCube={config.deviceCapability !== 'low'}
      backgroundIntensity={cosmicIntensity}
    >
      <motion.div
        className="min-h-screen w-full py-8 px-4 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <HomeNavigation />
      </motion.div>
    </VisualSystem>
  );
};

export default HomePage;
