
import React, { useState, useEffect } from 'react';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { motion, Variants } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { GlassCard } from '@/components/ui/glass-card';
import QuantumParticles from '@/components/effects/QuantumParticles';
import InteractiveEnergyField from '@/components/effects/InteractiveEnergyField';

// Import our components
import WelcomeHeader from '@/components/home/widgets/WelcomeHeader';
import LeftSidebar from '@/components/home/widgets/LeftSidebar';
import CubeWrapper from '@/components/home/widgets/CubeWrapper';
import DetailSection from '@/components/home/widgets/DetailSection';

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
  
  // Add loading effect
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setPageLoaded(true);
      toast({
        title: "Connection established",
        description: "Quantum field synchronization complete.",
      });
    }, 800);
    
    // Add logging to debug component mounting and props
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
  
  // Derive username from user data
  const username = userProfile?.username || user?.email?.split('@')[0] || 'Seeker';
  const astralLevel = userProfile?.astral_level || 1;
  const energyPoints = userProfile?.energy_points || 0;
  
  const handleNodeSelect = (nodeId: string, downloadables?: DownloadableMaterial[]) => {
    console.log("Node selected in SacredHomePage:", nodeId, downloadables);
    setSelectedNode(nodeId);
    setSelectedNodeMaterials(downloadables || null);
    
    // Add visual feedback
    toast({
      title: `${nodeId.charAt(0).toUpperCase() + nodeId.slice(1)} node activated`,
      description: "Quantum resonance established.",
    });
    
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };
  
  const getProgressPercentage = () => {
    // Calculate progress percentage based on current level
    const nextLevelThreshold = astralLevel * 100;
    const currentLevelThreshold = (astralLevel - 1) * 100;
    const pointsInCurrentLevel = energyPoints - currentLevelThreshold;
    const pointsNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
    
    return Math.min(Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100), 100);
  };

  // Properly defined variants for animations
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

  const fadeInUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate={pageLoaded ? "visible" : "hidden"}
      variants={pageVariants}
      className="min-h-screen px-4 py-8 relative"
    >
      {/* Background effects */}
      <QuantumParticles count={20} interactive={true} className="z-0" />
      
      {/* Welcome Header */}
      <motion.div variants={fadeInUpVariants}>
        <WelcomeHeader 
          username={username}
          onLogout={onLogout}
          astralLevel={astralLevel}
        />
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 relative z-10">
        {/* Left column with energy information */}
        <motion.div variants={fadeInUpVariants}>
          <GlassCard animate variant="purple" className="p-6">
            <LeftSidebar 
              energyPoints={energyPoints}
              astralLevel={astralLevel}
              streakDays={userStreak.current}
              progressPercentage={getProgressPercentage()}
              activatedChakras={activatedChakras}
              selectedNode={selectedNode}
              selectedNodeMaterials={selectedNodeMaterials}
            />
          </GlassCard>
        </motion.div>
        
        {/* Center column with Metatron's Cube */}
        <motion.div 
          className="lg:col-span-2"
          variants={fadeInUpVariants}
        >
          <GlassCard animate variant="default" className="p-4 relative overflow-hidden">
            {/* Energy field background effect */}
            <div className="absolute inset-0 opacity-50">
              <InteractiveEnergyField 
                energyPoints={energyPoints} 
                particleDensity={0.5}
                className="w-full h-full"
              />
            </div>
            
            <div className="relative z-10">
              <CubeWrapper 
                userId={user?.id}
                energyPoints={energyPoints}
                onSelectNode={handleNodeSelect}
              />
            </div>
          </GlassCard>
        </motion.div>
      </div>
      
      {/* Selected node detail panel */}
      {selectedNode && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <GlassCard animate variant="dark" className="p-6">
            <DetailSection 
              selectedNode={selectedNode}
              energyPoints={energyPoints}
              selectedNodeMaterials={selectedNodeMaterials}
            />
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SacredHomePage;
