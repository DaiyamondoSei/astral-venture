
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MetatronsCube from '@/components/sacred-geometry/MetatronsCube';
import InteractiveMetatronsPortal from '@/components/sacred-geometry/components/InteractiveMetatronsPortal';
import { toast } from '@/components/ui/use-toast';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2, Info } from 'lucide-react';

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
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Calculate consciousness level based on energy points
    // More refined algorithm to provide smoother transition
    const baseLevel = Math.floor(energyPoints / 200);
    const remainder = (energyPoints % 200) / 200;
    const smoothLevel = baseLevel + remainder;
    
    setConsciousnessLevel(Math.max(1, smoothLevel));
  }, [energyPoints]);
  
  const handlePortalActivation = () => {
    setPortalActivated(true);
    
    toast({
      title: "Dimensional Portal Activated",
      description: `Your consciousness has aligned with dimensional frequency level ${consciousnessLevel.toFixed(1)}.`,
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

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black/90' : 'lg:col-span-2'} flex flex-col items-center justify-center relative`}>
      <div className="absolute top-4 left-4 flex space-x-2 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/80 hover:text-white"
          onClick={handleBackNavigation}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white"
          onClick={toggleHelp}
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>
      
      {showHelp && (
        <div className="absolute top-20 left-4 bg-black/70 backdrop-blur-md p-4 rounded-lg max-w-xs z-50 border border-quantum-800/50">
          <h3 className="text-quantum-300 text-sm font-semibold mb-2">Metatron's Cube Navigation</h3>
          <p className="text-xs text-white/80 mb-2">
            Each node in Metatron's Cube represents a different aspect of consciousness and spiritual growth.
          </p>
          <p className="text-xs text-white/80 mb-2">
            Click on the nodes to explore different practices and teachings. Nodes with a glowing border contain downloadable materials.
          </p>
          <p className="text-xs text-quantum-400">
            Unlock more nodes by increasing your energy points through practice and reflection.
          </p>
          <p className="text-xs text-quantum-400 mt-2">
            Current level: {consciousnessLevel.toFixed(1)}
          </p>
        </div>
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
            consciousnessLevel={consciousnessLevel}
          />
        </div>
      </motion.div>
      
      {isFullscreen && (
        <div className="absolute bottom-4 right-4 text-xs text-white/50">
          <p>Energy Points: {energyPoints} • Consciousness Level: {consciousnessLevel.toFixed(1)}</p>
        </div>
      )}
    </div>
  );
};

export default CubeWrapper;
