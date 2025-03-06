
import React from 'react';
import { DownloadableMaterial } from './node-detail/types';
import NodeDetailContent from './node-detail/NodeDetailContent';

interface NodeDetailPanelProps {
  nodeId: string;
  energyPoints: number;
  downloadableMaterials?: DownloadableMaterial[];
  consciousnessLevel?: number;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ 
  nodeId, 
  energyPoints,
  downloadableMaterials,
  consciousnessLevel
}) => {
  return (
    <div className="glass-card p-6">
      <NodeDetailContent 
        nodeId={nodeId} 
        downloadableMaterials={downloadableMaterials}
        consciousnessLevel={consciousnessLevel}
      />
    </div>
  );
};

export default NodeDetailPanel;
