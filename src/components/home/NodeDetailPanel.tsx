
import React from 'react';
import { DownloadableMaterial } from './node-detail/types';
import NodeDetailContent from './node-detail/NodeDetailContent';

interface NodeDetailPanelProps {
  nodeId: string;
  energyPoints: number;
  downloadableMaterials?: DownloadableMaterial[];
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ 
  nodeId, 
  energyPoints,
  downloadableMaterials
}) => {
  return (
    <div className="glass-card p-6">
      <NodeDetailContent 
        nodeId={nodeId} 
        downloadableMaterials={downloadableMaterials} 
      />
    </div>
  );
};

export default NodeDetailPanel;
