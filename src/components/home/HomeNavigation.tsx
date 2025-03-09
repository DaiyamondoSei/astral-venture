
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NavCubeProvider } from '@/contexts/NavCubeContext';
import MetatronsCubeNavigation from '@/components/navigation/MetatronsCubeNavigation';
import { useQuantumTheme } from '@/components/visual-foundation';
import { cn } from '@/lib/utils';
import InfoPanel from './navigation/InfoPanel';
import { useNavigationData } from '@/hooks/useNavigationData';

interface HomeNavigationProps {
  className?: string;
  userLevel?: number;
}

const HomeNavigation: React.FC<HomeNavigationProps> = ({ 
  className,
  userLevel = 1
}) => {
  const { theme } = useQuantumTheme();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Fetch navigation data from backend
  const { nodes, connections, isLoading, error } = useNavigationData(userLevel);
  
  // Find the selected node for panel details
  const selectedNode = selectedNodeId 
    ? nodes.find(node => node.id === selectedNodeId) 
    : null;
  
  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowInfo(true);
  };
  
  // Close the info panel
  const handleCloseInfo = () => {
    setShowInfo(false);
  };
  
  return (
    <div className={cn("relative flex flex-col items-center justify-center w-full h-full", className)}>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-medium text-white mb-2">
          Quantum Consciousness
        </h1>
        <p className="text-white/70 max-w-md mx-auto">
          Navigate the cosmic web of consciousness development through sacred geometry
        </p>
      </div>
      
      <div className="relative flex items-center justify-center">
        {isLoading ? (
          <div className="text-white/80 animate-pulse">Loading navigation...</div>
        ) : error ? (
          <div className="text-red-400">Error: {error}</div>
        ) : (
          <NavCubeProvider 
            initialNodes={nodes}
            initialConnections={connections}
            initialActiveNodeId="0"
          >
            <MetatronsCubeNavigation 
              variant={theme === 'default' ? 'default' : theme} 
              size="lg"
              onNodeSelect={handleNodeSelect}
            />
          </NavCubeProvider>
        )}
        
        {/* Information sidebar that appears when a node is selected */}
        <AnimatePresence mode="wait">
          {showInfo && selectedNode && (
            <InfoPanel 
              node={selectedNode}
              onClose={handleCloseInfo}
              theme={theme}
            />
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm">
          Select a node to begin your consciousness expansion journey
        </p>
      </div>
    </div>
  );
};

export default HomeNavigation;
