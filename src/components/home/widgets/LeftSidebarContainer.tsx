
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import LeftSidebar from '@/components/home/widgets/LeftSidebar';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';

interface LeftSidebarContainerProps {
  energyPoints: number;
  astralLevel: number;
  userStreak: { current: number; longest: number };
  progressPercentage: number;
  activatedChakras: number[];
  selectedNode: string | null;
  selectedNodeMaterials: DownloadableMaterial[] | null;
  consciousnessLevel: number;
}

const LeftSidebarContainer: React.FC<LeftSidebarContainerProps> = ({
  energyPoints,
  astralLevel,
  userStreak,
  progressPercentage,
  activatedChakras,
  selectedNode,
  selectedNodeMaterials,
  consciousnessLevel
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
    <motion.div variants={fadeInUpVariants}>
      <GlassCard animate variant="purple" className="p-6">
        <LeftSidebar 
          energyPoints={energyPoints}
          astralLevel={astralLevel}
          streakDays={userStreak.current}
          progressPercentage={progressPercentage}
          activatedChakras={activatedChakras}
          selectedNode={selectedNode}
          selectedNodeMaterials={selectedNodeMaterials}
          consciousnessLevel={consciousnessLevel}
        />
      </GlassCard>
    </motion.div>
  );
};

export default LeftSidebarContainer;
