
import React from 'react';
import { motion } from 'framer-motion';
import { User, Award } from 'lucide-react';
import HomeNavigation from '@/components/home/HomeNavigation';
import VisualSystem from '@/components/visual-foundation/VisualSystem';
import { useQuantumTheme } from '@/components/visual-foundation';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { usePanel } from '@/contexts/PanelContext';
import { Button } from '@/components/ui/button';
import SeedOfLifePortal from '@/components/seed-of-life/SeedOfLifePortal';
import SwipeIndicator from '@/components/panels/SwipeIndicator';
import SwipeablePanelController from '@/components/panels/SwipeablePanelController';
import { preloadPanelData } from '@/utils/panelDataPreloader';
import { toast } from 'sonner';

const HomePage: React.FC = () => {
  const { cosmicIntensity } = useQuantumTheme();
  const { config } = usePerfConfig();
  const { togglePanel } = usePanel();

  // Preload panel data for smoother experience
  React.useEffect(() => {
    preloadPanelData().catch(console.error);
  }, []);
  
  // Handle Seed of Life portal activation
  const handlePortalActivate = () => {
    toast.success("Seed of Life activated! Your consciousness journey begins.", {
      duration: 3000,
    });
  };
  
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
      
      {/* Swipe indicators for mobile users */}
      <SwipeIndicator position="top" />
      <SwipeIndicator position="bottom" />
      
      {/* Main content */}
      <motion.div
        className="min-h-screen w-full py-8 px-4 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-medium text-white mb-2">
            Quantum Consciousness
          </h1>
          <p className="text-white/70 max-w-md mx-auto text-center">
            Navigate the cosmic web of consciousness development through sacred geometry
          </p>
        </div>
        
        {/* Central Seed of Life Portal */}
        <div className="mb-8">
          <SeedOfLifePortal
            userLevel={1}
            onActivate={handlePortalActivate}
          />
        </div>
        
        {/* Navigation System */}
        <HomeNavigation />
      </motion.div>
      
      {/* Swipeable panels */}
      <SwipeablePanelController />
    </VisualSystem>
  );
};

export default HomePage;
