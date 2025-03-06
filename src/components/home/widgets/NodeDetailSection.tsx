
import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import DetailSection from '@/components/home/widgets/DetailSection';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';

interface NodeDetailSectionProps {
  selectedNode: string | null;
  energyPoints: number;
  selectedNodeMaterials: DownloadableMaterial[] | null;
  consciousnessLevel: number;
}

const NodeDetailSection: React.FC<NodeDetailSectionProps> = ({
  selectedNode,
  energyPoints,
  selectedNodeMaterials,
  consciousnessLevel
}) => {
  if (!selectedNode) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <GlassCard animate variant="dark" className="p-6">
        <DetailSection 
          selectedNode={selectedNode}
          energyPoints={energyPoints}
          selectedNodeMaterials={selectedNodeMaterials}
          consciousnessLevel={consciousnessLevel}
        />
      </GlassCard>
    </motion.div>
  );
};

export default NodeDetailSection;
