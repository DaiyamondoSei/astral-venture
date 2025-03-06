
import React from 'react';
import { motion } from 'framer-motion';
import NodeDetailPanel from '@/components/home/NodeDetailPanel';
import { DownloadableMaterial } from '@/components/home/node-detail/types';

interface DetailSectionProps {
  selectedNode: string | null;
  energyPoints: number;
  selectedNodeMaterials: DownloadableMaterial[] | null;
  consciousnessLevel?: number;
}

const DetailSection: React.FC<DetailSectionProps> = ({
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
      transition={{ duration: 0.3 }}
      className="mt-8 hidden lg:block"
    >
      <NodeDetailPanel 
        nodeId={selectedNode} 
        energyPoints={energyPoints}
        downloadableMaterials={selectedNodeMaterials || undefined}
        consciousnessLevel={consciousnessLevel}
      />
    </motion.div>
  );
};

export default DetailSection;
