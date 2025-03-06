
import React, { useState, useEffect } from 'react';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { motion, Variants } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import our refactored components
import WelcomeHeader from '@/components/home/widgets/WelcomeHeader';
import LeftSidebarContainer from '@/components/home/widgets/LeftSidebarContainer';
import MainContent from '@/components/home/widgets/MainContent';
import NodeDetailSection from '@/components/home/widgets/NodeDetailSection';
import PageBackground from '@/components/home/widgets/PageBackground';

interface SacredHomePageProps {
  user: any;
  userProfile: any;
  userStreak: { current: number; longest: number };
  activatedChakras: number[];
  onLogout: () => void;
  onNodeSelect?: (nodeId: string) => void;
}

const SacredHomePage: React.FC<SacredHomePageProps> = ({
  user,
  userProfile,
  userStreak,
  activatedChakras,
  onLogout,
  onNodeSelect
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedNodeMaterials, setSelectedNodeMaterials] = useState<DownloadableMaterial[] | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState(1);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
      toast({
        title: "Connection established",
        description: "Quantum field synchronization complete.",
      });
    }, 800);
    
    console.log("SacredHomePage mounted with:", {
      user: !!user,
      userProfile: !!userProfile,
      userStreak,
      activatedChakras,
      selectedNode
    });
    
    if (!userProfile) {
      console.warn("User profile is missing in SacredHomePage");
    }
    
    return () => clearTimeout(timer);
  }, [user, userProfile, userStreak, activatedChakras, selectedNode]);
  
  useEffect(() => {
    const energyPoints = userProfile?.energy_points || 0;
    const baseLevel = Math.max(1, Math.floor(energyPoints / 200));
    
    const chakraBonus = Math.min(activatedChakras.length / 2, 1.5);
    
    const streakBonus = Math.min(userStreak.current / 10, 1);
    
    const calculatedLevel = Math.min(Math.floor(baseLevel + chakraBonus + streakBonus), 7);
    
    setConsciousnessLevel(calculatedLevel);
    
    console.log("Consciousness level calculated:", calculatedLevel, { 
      baseLevel, chakraBonus, streakBonus 
    });
  }, [userProfile, activatedChakras, userStreak]);
  
  const username = userProfile?.username || user?.email?.split('@')[0] || 'Seeker';
  const astralLevel = userProfile?.astral_level || 1;
  const energyPoints = userProfile?.energy_points || 0;
  
  const handleNodeSelect = (nodeId: string, downloadables?: DownloadableMaterial[]) => {
    console.log("Node selected in SacredHomePage:", nodeId, downloadables);
    setSelectedNode(nodeId);
    setSelectedNodeMaterials(downloadables || null);
    
    const nodeDisplayName = nodeId === 'portal-center' 
      ? 'Dimensional Portal' 
      : nodeId.charAt(0).toUpperCase() + nodeId.slice(1);
    
    toast({
      title: `${nodeDisplayName} activated`,
      description: nodeId === 'portal-center' 
        ? "Consciousness alignment in progress..." 
        : "Quantum resonance established.",
    });
    
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };
  
  const getProgressPercentage = () => {
    const nextLevelThreshold = astralLevel * 100;
    const currentLevelThreshold = (astralLevel - 1) * 100;
    const pointsInCurrentLevel = energyPoints - currentLevelThreshold;
    const pointsNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
    
    return Math.min(Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100), 100);
  };

  const pageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  return (
    <ErrorBoundary>
      <motion.div 
        initial="hidden"
        animate={pageLoaded ? "visible" : "hidden"}
        variants={pageVariants}
        className="min-h-screen px-4 py-8 relative"
      >
        <PageBackground 
          energyPoints={energyPoints} 
          consciousnessLevel={consciousnessLevel} 
        />
        
        <motion.div variants={fadeInUpVariants} className="relative z-10">
          <WelcomeHeader 
            username={username}
            onLogout={onLogout}
            astralLevel={astralLevel}
          />
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 relative z-10">
          <LeftSidebarContainer 
            energyPoints={energyPoints}
            astralLevel={astralLevel}
            userStreak={userStreak}
            progressPercentage={getProgressPercentage()}
            activatedChakras={activatedChakras}
            selectedNode={selectedNode}
            selectedNodeMaterials={selectedNodeMaterials}
            consciousnessLevel={consciousnessLevel}
          />
          
          <MainContent 
            userId={user?.id}
            energyPoints={energyPoints}
            onNodeSelect={handleNodeSelect}
          />
        </div>
        
        <NodeDetailSection 
          selectedNode={selectedNode}
          energyPoints={energyPoints}
          selectedNodeMaterials={selectedNodeMaterials}
          consciousnessLevel={consciousnessLevel}
        />
      </motion.div>
    </ErrorBoundary>
  );
};

// Define fadeInUpVariants in the same file to avoid circular dependencies
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default SacredHomePage;
