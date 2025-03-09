
import React from 'react';
import { motion } from 'framer-motion';
import { User, Award } from 'lucide-react';
import HomeNavigation from '@/components/home/HomeNavigation';
import VisualSystem from '@/components/visual-foundation/VisualSystem';
import { useQuantumTheme } from '@/components/visual-foundation';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { usePanel } from '@/contexts/PanelContext';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const { cosmicIntensity } = useQuantumTheme();
  const { config } = usePerfConfig();
  const { togglePanel } = usePanel();
  
  return (
    <VisualSystem 
      showBackground={true}
      showMetatronsCube={config.deviceCapability !== 'low'}
      backgroundIntensity={cosmicIntensity}
    >
      {/* Profile panel trigger at top of screen */}
      <div className="fixed top-4 right-4 z-30">
        <Button 
          variant="glass" 
          size="icon"
          className="rounded-full"
          onClick={() => togglePanel('profile')}
        >
          <User className="text-white" />
        </Button>
      </div>
      
      {/* Achievements panel trigger at bottom of screen */}
      <div className="fixed bottom-4 right-4 z-30">
        <Button 
          variant="glass" 
          size="icon"
          className="rounded-full"
          onClick={() => togglePanel('achievements')}
        >
          <Award className="text-white" />
        </Button>
      </div>
      
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
