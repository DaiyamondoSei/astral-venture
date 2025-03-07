
import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import InteractiveEnergyField from '@/components/effects/energy-field/InteractiveEnergyField';
import CubeWrapper from '@/components/home/widgets/CubeWrapper';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import GlassmorphicContainer from '@/components/background/GlassmorphicContainer';
import { getPerformanceCategory } from '@/utils/performanceUtils';

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
  const performanceCategory = getPerformanceCategory();
  
  const fadeInUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Adjust particle density based on performance category
  const getParticleDensity = () => {
    if (performanceCategory === 'low') return 0.1;
    if (performanceCategory === 'medium') return 0.2;
    return isMobile ? 0.2 : 0.3;
  };

  return (
    <motion.div 
      className={cn("relative", className)}
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
      // Add layout=true to optimize Framer Motion's calculations
      layout={false}
    >
      <GlassmorphicContainer 
        variant={isMobile ? "subtle" : "medium"} 
        blur={isMobile ? "light" : "medium"}
        className="p-1 md:p-3 relative overflow-hidden rounded-full aspect-square max-w-3xl mx-auto"
        animate={true}
        motionProps={{
          whileHover: performanceCategory !== 'low' ? { scale: 1.01 } : undefined,
          transition: { duration: 0.3 }
        }}
        centerContent={true}
        glowEffect={performanceCategory !== 'low'}
        shimmer={performanceCategory !== 'low'}
      >
        {/* Reduced opacity for better cube visibility */}
        <div className="absolute inset-0 opacity-20">
          <InteractiveEnergyField 
            energyPoints={energyPoints} 
            particleDensity={getParticleDensity()}
            className="w-full h-full"
          />
        </div>
        
        {/* Added higher z-index and contrast background for better visibility */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            {/* Add subtle contrasting backdrop to make the cube more visible */}
            <div className="absolute inset-0 bg-gradient-radial from-black/40 via-black/20 to-transparent"></div>
            
            <CubeWrapper 
              userId={userId}
              energyPoints={energyPoints}
              onSelectNode={onNodeSelect}
            />
          </div>
        </div>
      </GlassmorphicContainer>
    </motion.div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(MainContent);
