
import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import CubeWrapper from '@/components/home/widgets/CubeWrapper';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import GlassmorphicContainer from '@/components/background/GlassmorphicContainer';
import { usePerformance } from '@/hooks/usePerformance';
import MainContentBackground from './MainContentBackground';

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
  const { 
    isLowPerformance, 
    enableComplexAnimations, 
    enableBlur,
    enableShadows 
  } = usePerformance();
  
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
      layout={false}
    >
      <GlassmorphicContainer 
        variant={isMobile ? "subtle" : "medium"} 
        className="p-1 md:p-3 relative overflow-hidden rounded-full aspect-square max-w-3xl mx-auto"
        animate={enableComplexAnimations}
        motionProps={
          enableComplexAnimations && !isLowPerformance
            ? {
                whileHover: { scale: 1.01 },
                transition: { duration: 0.3 }
              }
            : undefined
        }
        centerContent={true}
        glowEffect={enableShadows && !isLowPerformance}
        shimmer={enableComplexAnimations && !isLowPerformance}
      >
        <MainContentBackground energyPoints={energyPoints} />
        
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="relative w-full h-full rounded-full overflow-hidden">
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

export default memo(MainContent);
