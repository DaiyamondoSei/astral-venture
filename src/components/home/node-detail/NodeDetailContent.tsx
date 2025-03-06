
import React from 'react';
import { motion } from 'framer-motion';
import { DownloadableMaterial } from './types';
import PracticesList from './PracticesList';
import PracticeActionButton from './PracticeActionButton';
import { nodeDetailsData } from './nodeDetailsData';
import DownloadableMaterialsPanel from '@/components/home/DownloadableMaterialsPanel';

interface NodeDetailContentProps {
  nodeId: string;
  downloadableMaterials?: DownloadableMaterial[];
}

const NodeDetailContent: React.FC<NodeDetailContentProps> = ({ 
  nodeId, 
  downloadableMaterials 
}) => {
  const details = nodeDetailsData[nodeId] || {
    title: 'Unknown Node',
    description: 'Information about this node is not available.',
    practices: []
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-display mb-2">{details.title}</h2>
      <p className="text-white/80 mb-6">{details.description}</p>
      
      <PracticesList practices={details.practices} />
      
      <PracticeActionButton />

      {/* Add downloadable materials panel if available */}
      {downloadableMaterials && downloadableMaterials.length > 0 && (
        <DownloadableMaterialsPanel 
          materials={downloadableMaterials}
          nodeName={details.title}
        />
      )}
    </motion.div>
  );
};

export default NodeDetailContent;
