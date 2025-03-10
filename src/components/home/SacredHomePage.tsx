
import React, { useState } from 'react';
import MetatronsCubeNavigation from '@/components/navigation/MetatronsCubeNavigation';
import InfoPanel from '@/components/home/navigation/InfoPanel';
import NodeDetailPanel from '@/components/home/NodeDetailPanel';
import DownloadableMaterialsPanel from '@/components/home/DownloadableMaterialsPanel';
import SwipeablePanel from '@/components/panels/SwipeablePanelController';

interface SacredHomePageProps {
  // No props required
}

const SacredHomePage: React.FC<SacredHomePageProps> = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDynamicPanelOpen, setIsDynamicPanelOpen] = useState(false);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    setIsPanelOpen(true);
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
            activeNodeId={selectedNode}
          />
        </div>
      </div>

      {/* Info panel */}
      <div className="mt-4">
        <InfoPanel />
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
            onClose={handlePanelClose}
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
          <DownloadableMaterialsPanel onClose={() => setIsDynamicPanelOpen(false)} />
        </SwipeablePanel>
      )}
    </div>
  );
};

export default SacredHomePage;
