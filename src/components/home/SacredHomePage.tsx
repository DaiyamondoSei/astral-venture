
import React from 'react';
import { motion } from 'framer-motion';
import { usePanel } from '@/contexts/PanelContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SwipeablePanel from '@/components/ui/swipeable-panel';
import HomeNavigation from './HomeNavigation';
import NodeDetailPanel from './NodeDetailPanel';

interface SacredHomePageProps {
  className?: string;
}

const SacredHomePage: React.FC<SacredHomePageProps> = ({ className }) => {
  const navigate = useNavigate();
  const { isProfileOpen, isNodeDetailOpen, closePanel, selectedNode } = usePanel();
  
  return (
    <motion.div
      className={cn("min-h-screen bg-gradient-to-b from-black to-purple-950", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main content with sacred geometry */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
        {/* Sacred geometry navigation */}
        <HomeNavigation />
        
        {/* Footer navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center">
          <div className="flex space-x-4">
            <button 
              className="px-4 py-2 rounded-full bg-purple-800/50 backdrop-blur-sm text-white hover:bg-purple-700"
              onClick={() => navigate('/practice')}
            >
              Practices
            </button>
            <button 
              className="px-4 py-2 rounded-full bg-blue-800/50 backdrop-blur-sm text-white hover:bg-blue-700"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
      
      {/* Node detail panel */}
      <SwipeablePanel
        isOpen={isNodeDetailOpen}
        onOpenChange={(open) => !open && closePanel('nodeDetail')}
        height={{ peek: '25%', half: '60%', full: '85%' }}
        initialState="half"
        position="bottom"
      >
        <NodeDetailPanel node={selectedNode} />
      </SwipeablePanel>
    </motion.div>
  );
};

export default SacredHomePage;
