
import React, { useState } from 'react';
import MetatronsCubeNavigation from '@/components/navigation/MetatronsCubeNavigation';
import InfoPanel from '@/components/home/navigation/InfoPanel';
import NodeDetailPanel from '@/components/home/NodeDetailPanel';
import DownloadableMaterialsPanel from '@/components/home/DownloadableMaterialsPanel';
import SwipeablePanel from '@/components/panels/SwipeablePanelController';
import { ISacredHomePageProps } from '@/components/ui/types';

/**
 * SacredHomePage component that displays the sacred geometry navigation
 * and related panels
 */
const SacredHomePage: React.FC<ISacredHomePageProps> = ({ 
  user,
  userProfile,
  userStreak,
  activatedChakras,
  onLogout,
  onNodeSelect
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDynamicPanelOpen, setIsDynamicPanelOpen] = useState(false);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    setIsPanelOpen(true);
    // Call the parent handler if provided
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-200px)]">
      {/* Main content with Metatron's Cube */}
      <div className="relative w-full h-full flex flex-col items-center">
        <div className="w-full flex-grow flex flex-col items-center justify-center">
          {/* Sacred geometry navigation */}
          <MetatronsCubeNavigation 
            onNodeSelect={handleNodeSelect}
          />
        </div>
      </div>

      {/* Info panel */}
      <div className="mt-4">
        <InfoPanel 
          node={selectedNode} 
          onClose={handlePanelClose}
          theme="default"
        />
      </div>

      {/* Node detail panel */}
      {selectedNode && (
        <SwipeablePanel
          position="bottom"
          title={`Node: ${selectedNode}`}
          height="75vh"
        >
          <NodeDetailPanel
            nodeId={selectedNode}
            energyPoints={[]}
          />
        </SwipeablePanel>
      )}

      {/* Downloadable materials panel */}
      {isDynamicPanelOpen && (
        <SwipeablePanel
          position="bottom"
          title="Materials"
          height="50vh"
        >
          <DownloadableMaterialsPanel 
            materials={[]}
            nodeName={selectedNode || 'Unknown'}
          />
        </SwipeablePanel>
      )}
    </div>
  );
};

export default SacredHomePage;
