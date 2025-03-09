
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavCubeProvider } from '@/contexts/NavCubeContext';
import MetatronsCubeNavigation from '@/components/navigation/MetatronsCubeNavigation';
import { useQuantumTheme } from '@/components/visual-foundation';
import GlassmorphicContainer from '@/components/visual-foundation/GlassmorphicContainer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SacredGeometryIconType } from '../navigation/SacredGeometryIcon';

// Define the initial navigation nodes and connections
const initialNodes = [
  {
    id: '0',
    label: 'Core',
    description: 'Your spiritual journey center',
    iconType: 'seed-of-life' as SacredGeometryIconType,
    x: 50,
    y: 50,
    route: '/dashboard'
  },
  {
    id: '1',
    label: 'Practices',
    description: 'Daily meditation and exercises',
    iconType: 'flower-of-life' as SacredGeometryIconType,
    x: 30,
    y: 25,
    route: '/practices'
  },
  {
    id: '2',
    label: 'Wisdom',
    description: 'Unlock quantum consciousness insights',
    iconType: 'tree-of-life' as SacredGeometryIconType,
    x: 70,
    y: 25,
    route: '/wisdom'
  },
  {
    id: '3',
    label: 'Progress',
    description: 'Track your spiritual evolution',
    iconType: 'golden-ratio' as SacredGeometryIconType,
    x: 20,
    y: 50,
    route: '/progress'
  },
  {
    id: '4',
    label: 'Dreams',
    description: 'Capture and manifest your aspirations',
    iconType: 'merkaba' as SacredGeometryIconType,
    x: 80,
    y: 50,
    route: '/dreams'
  },
  {
    id: '5',
    label: 'Insights',
    description: 'Personalized guidance and reflections',
    iconType: 'fibonacci' as SacredGeometryIconType,
    x: 30,
    y: 75,
    route: '/insights'
  },
  {
    id: '6',
    label: 'Community',
    description: 'Connect with fellow seekers',
    iconType: 'torus' as SacredGeometryIconType,
    x: 70,
    y: 75,
    route: '/community'
  }
];

// Connect all nodes to the center
const initialConnections = [
  { id: 'c0-1', from: '0', to: '1' },
  { id: 'c0-2', from: '0', to: '2' },
  { id: 'c0-3', from: '0', to: '3' },
  { id: 'c0-4', from: '0', to: '4' },
  { id: 'c0-5', from: '0', to: '5' },
  { id: 'c0-6', from: '0', to: '6' },
  // Additional connections to create a hexagon pattern
  { id: 'c1-2', from: '1', to: '2' },
  { id: 'c2-4', from: '2', to: '4' },
  { id: 'c4-6', from: '4', to: '6' },
  { id: 'c6-5', from: '6', to: '5' },
  { id: 'c5-3', from: '5', to: '3' },
  { id: 'c3-1', from: '3', to: '1' },
  // Cross connections
  { id: 'c1-5', from: '1', to: '5' },
  { id: 'c2-6', from: '2', to: '6' },
  { id: 'c3-4', from: '3', to: '4' }
];

interface HomeNavigationProps {
  className?: string;
}

const HomeNavigation: React.FC<HomeNavigationProps> = ({ className }) => {
  const { theme } = useQuantumTheme();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Find the selected node for panel details
  const selectedNode = selectedNodeId 
    ? initialNodes.find(node => node.id === selectedNodeId) 
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
  
  // Animation variants for the info panel
  const infoPanelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      x: 50,
      transition: {
        duration: 0.2
      }
    }
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
        <NavCubeProvider 
          initialNodes={initialNodes}
          initialConnections={initialConnections}
          initialActiveNodeId="0"
        >
          <MetatronsCubeNavigation 
            variant={theme === 'default' ? 'default' : theme} 
            size="lg"
            onNodeSelect={handleNodeSelect}
          />
        </NavCubeProvider>
        
        {/* Information sidebar that appears when a node is selected */}
        <AnimatePresence mode="wait">
          {showInfo && selectedNode && (
            <motion.div
              className="absolute left-full ml-6 w-64"
              variants={infoPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <GlassmorphicContainer
                className="p-4 relative"
                variant={theme === 'default' ? 'default' : theme}
                intensity="medium"
                withGlow
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2"
                  onClick={handleCloseInfo}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <h3 className="text-xl font-display mb-2">{selectedNode.label}</h3>
                <p className="text-sm text-white/80 mb-4">{selectedNode.description}</p>
                
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = selectedNode.route || '/'}
                >
                  Explore
                </Button>
              </GlassmorphicContainer>
            </motion.div>
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
