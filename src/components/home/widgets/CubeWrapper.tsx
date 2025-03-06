
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MetatronsCube from '@/components/sacred-geometry/MetatronsCube';
import InteractiveMetatronsPortal from '@/components/sacred-geometry/components/InteractiveMetatronsPortal';
import { toast } from '@/components/ui/use-toast';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';

interface CubeWrapperProps {
  userId?: string;
  energyPoints: number;
  onSelectNode: (nodeId: string, downloadables?: DownloadableMaterial[]) => void;
}

const CubeWrapper: React.FC<CubeWrapperProps> = ({
  userId,
  energyPoints,
  onSelectNode
}) => {
  const [portalActivated, setPortalActivated] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState(1);
  
  const handlePortalActivation = () => {
    setPortalActivated(true);
    
    // Calculate consciousness level based on energy points
    const newLevel = Math.max(1, Math.floor(energyPoints / 200));
    setConsciousnessLevel(newLevel);
    
    toast({
      title: "Dimensional Portal Activated",
      description: `Your consciousness has aligned with dimensional frequency level ${newLevel}.`,
    });
    
    // Notify parent component
    onSelectNode('portal-center', [
      {
        id: 'portal-guide',
        name: 'Portal Activation Guide',
        description: 'Learn to navigate through dimensional frequencies',
        type: 'pdf',
        icon: null
      }
    ]);
  };

  return (
    <div className="lg:col-span-2 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full relative"
      >
        {/* Interactive Portal Layer */}
        <InteractiveMetatronsPortal 
          energyPoints={energyPoints}
          consciousnessLevel={consciousnessLevel}
          isActivated={portalActivated}
          onPortalActivation={handlePortalActivation}
          interactionMode="pulse"
          portalIntensity={0.8}
        />
        
        {/* Main Metatron's Cube with clickable nodes */}
        <div className="relative z-10">
          <MetatronsCube 
            userId={userId}
            energyPoints={energyPoints}
            onSelectNode={onSelectNode}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default CubeWrapper;
