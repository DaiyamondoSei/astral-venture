
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MetatronsCube from '@/components/sacred-geometry/MetatronsCube';
import InteractiveMetatronsPortal from '@/components/sacred-geometry/components/InteractiveMetatronsPortal';
import { toast } from '@/components/ui/use-toast';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CubeWrapperProps {
  userId?: string;
  energyPoints: number;
  onSelectNode: (nodeId: string, downloadables?: DownloadableMaterial[]) => void;
  onBack?: () => void;
  isFullscreen?: boolean;
}

const CubeWrapper: React.FC<CubeWrapperProps> = ({
  userId,
  energyPoints,
  onSelectNode,
  onBack,
  isFullscreen = false
}) => {
  const [portalActivated, setPortalActivated] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState(1);
  const navigate = useNavigate();
  
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

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black/90' : 'lg:col-span-2'} flex flex-col items-center justify-center`}>
      {isFullscreen && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 left-4 text-white/80 hover:text-white"
          onClick={handleBackNavigation}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Button>
      )}
      
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
            onBack={onBack}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default CubeWrapper;
