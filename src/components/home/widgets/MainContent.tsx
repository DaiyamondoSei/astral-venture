
import React from 'react';
import { motion, Variants } from 'framer-motion';
import InteractiveEnergyField from '@/components/effects/energy-field/InteractiveEnergyField';
import CubeWrapper from '@/components/home/widgets/CubeWrapper';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import GlassmorphicContainer from '@/components/background/GlassmorphicContainer';

interface MainContentProps {
  userId?: string;
  energyPoints: number;
  onNodeSelect: (nodeId: string, downloadables?: DownloadableMaterial[] | any[]) => void;
  className?: string;
}

const MainContent: React.FC<MainContentProps> = ({
  userId,
  energyPoints,
  onNodeSelect,
  className
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
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
      className={cn("relative", className)}
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
    >
      <GlassmorphicContainer 
        variant={isMobile ? "subtle" : "medium"} 
        blur={isMobile ? "light" : "medium"}
        className="p-1 md:p-3 relative overflow-hidden rounded-full aspect-square"
        animate={true}
        motionProps={{
          whileHover: { scale: 1.01 },
          transition: { duration: 0.3 }
        }}
        centerContent={true}
        glowEffect={true}
        shimmer={true}
      >
        <div className="absolute inset-0 opacity-40">
          <InteractiveEnergyField 
            energyPoints={energyPoints} 
            particleDensity={isMobile ? 0.3 : 0.5}
            className="w-full h-full"
          />
        </div>
        
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <CubeWrapper 
            userId={userId}
            energyPoints={energyPoints}
            onSelectNode={onNodeSelect}
          />
        </div>
      </GlassmorphicContainer>
    </motion.div>
  );
};

export default MainContent;
