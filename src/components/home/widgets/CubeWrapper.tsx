
import React from 'react';
import { motion } from 'framer-motion';
import MetatronsCube from '@/components/sacred-geometry/MetatronsCube';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';

interface CubeWrapperProps {
  userId?: string;
  energyPoints: number;
  onSelectNode: (nodeId: string, downloadables?: DownloadableMaterial[]) => void;
}

const CubeWrapper: React.FC<CubeWrapperProps> = ({
  userId,
  energyPoints,
  onSelectNode
}) => {
  return (
    <div className="lg:col-span-2 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full"
      >
        <MetatronsCube 
          userId={userId}
          energyPoints={energyPoints}
          onSelectNode={onSelectNode}
        />
      </motion.div>
    </div>
  );
};

export default CubeWrapper;
