
import React from 'react';
import { motion } from 'framer-motion';
import EnergyInfoCard from '@/components/home/EnergyInfoCard';
import { Sparkles } from 'lucide-react';

interface LeftSidebarProps {
  energyPoints: number;
  astralLevel: number;
  streakDays: number;
  progressPercentage: number;
  activatedChakras: number[];
  selectedNode: string | null;
  selectedNodeMaterials: any[] | null;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  energyPoints,
  astralLevel,
  streakDays,
  progressPercentage,
  activatedChakras,
  selectedNode,
  selectedNodeMaterials
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <EnergyInfoCard 
          energyPoints={energyPoints}
          astralLevel={astralLevel}
          streakDays={streakDays}
          progressPercentage={progressPercentage}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-4"
      >
        <h3 className="font-display text-lg mb-3 flex items-center">
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          Active Energy Centers
        </h3>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div 
              key={i}
              className={`w-full aspect-square rounded-full flex items-center justify-center ${
                activatedChakras.includes(i) 
                  ? 'bg-gradient-to-br from-quantum-400/80 to-quantum-700 shadow-glow-sm' 
                  : 'bg-black/30 border border-white/10'
              }`}
              title={`${['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'][i]} Chakra`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </motion.div>
      
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="lg:hidden"
        >
          <NodeDetailPanel 
            nodeId={selectedNode} 
            energyPoints={energyPoints}
            downloadableMaterials={selectedNodeMaterials || undefined}
          />
        </motion.div>
      )}
    </div>
  );
};

import NodeDetailPanel from '@/components/home/NodeDetailPanel';

export default LeftSidebar;
