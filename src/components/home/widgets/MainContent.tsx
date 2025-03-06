
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import InteractiveEnergyField from '@/components/effects/InteractiveEnergyField';
import CubeWrapper from '@/components/home/widgets/CubeWrapper';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';

interface MainContentProps {
  userId?: string;
  energyPoints: number;
  onNodeSelect: (nodeId: string, downloadables?: DownloadableMaterial[]) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  userId,
  energyPoints,
  onNodeSelect
}) => {
  const fadeInUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="lg:col-span-2"
      variants={fadeInUpVariants}
    >
      <GlassCard animate variant="default" className="p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <InteractiveEnergyField 
            energyPoints={energyPoints} 
            particleDensity={0.5}
            className="w-full h-full"
          />
        </div>
        
        <div className="relative z-10">
          <CubeWrapper 
            userId={userId}
            energyPoints={energyPoints}
            onNodeSelect={onNodeSelect}
          />
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default MainContent;
