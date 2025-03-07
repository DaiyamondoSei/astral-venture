
import React from 'react';
import { motion } from 'framer-motion';
import { DownloadableMaterial as SacredGeometryMaterial } from '@/components/sacred-geometry/types/geometry';
import { DownloadableMaterial } from './types';
import PracticesList from './PracticesList';
import PracticeActionButton from './PracticeActionButton';
import { nodeDetailsData } from './nodeDetailsData';
import DownloadableMaterialsPanel from '@/components/home/DownloadableMaterialsPanel';

interface NodeDetailContentProps {
  nodeId: string;
  title?: string;
  description?: string;
  downloadableMaterials?: SacredGeometryMaterial[] | DownloadableMaterial[];
  consciousnessLevel?: number;
}

const NodeDetailContent: React.FC<NodeDetailContentProps> = ({ 
  nodeId, 
  title,
  description,
  downloadableMaterials,
  consciousnessLevel
}) => {
  const details = nodeDetailsData[nodeId] || {
    title: title || 'Unknown Node',
    description: description || 'Information about this node is not available.',
    practices: []
  };

  // Convert materials to the format expected by DownloadableMaterialsPanel if needed
  const formattedMaterials = downloadableMaterials?.map(material => {
    // Check if it's already in the expected format
    if ('id' in material && 'name' in material && 'type' in material) {
      return material as SacredGeometryMaterial;
    }
    
    // Convert to the expected format
    return {
      id: Math.random().toString(36).substring(2, 9), // Generate a random ID
      name: material.title || 'Resource',
      description: material.description || '',
      type: (material.format === 'pdf' ? 'pdf' : 
            material.format === 'audio' ? 'audio' :
            material.format === 'video' ? 'video' : 'practice') as any,
      icon: null // We'll let the component handle default icons
    } as SacredGeometryMaterial;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-display mb-2">{title || details.title}</h2>
      <p className="text-white/80 mb-6">{description || details.description}</p>
      
      {consciousnessLevel && consciousnessLevel > 1 && (
        <div className="my-4 p-3 bg-quantum-900/30 border border-quantum-400/20 rounded-lg">
          <p className="text-quantum-300 text-sm">
            Consciousness Level {consciousnessLevel} insights available
          </p>
        </div>
      )}
      
      {details.practices && details.practices.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Suggested Practices</h3>
          <PracticesList practices={details.practices} />
        </div>
      )}
      
      {/* Add downloadable materials panel if available */}
      {formattedMaterials && formattedMaterials.length > 0 && (
        <DownloadableMaterialsPanel 
          materials={formattedMaterials as SacredGeometryMaterial[]}
          nodeName={details.title}
        />
      )}
    </motion.div>
  );
};

export default NodeDetailContent;
