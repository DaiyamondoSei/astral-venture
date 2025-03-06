
import React, { useState, useEffect } from 'react';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { toast } from '@/components/ui/use-toast';

// Import our new components
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
  
  // Add logging to debug component mounting and props
  useEffect(() => {
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
  }, [user, userProfile, userStreak, activatedChakras, selectedNode]);
  
  // Derive username from user data
  const username = userProfile?.username || user?.email?.split('@')[0] || 'Seeker';
  const astralLevel = userProfile?.astral_level || 1;
  const energyPoints = userProfile?.energy_points || 0;
  
  const handleNodeSelect = (nodeId: string, downloadables?: DownloadableMaterial[]) => {
    console.log("Node selected in SacredHomePage:", nodeId, downloadables);
    setSelectedNode(nodeId);
    setSelectedNodeMaterials(downloadables || null);
    
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

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Welcome Header */}
      <WelcomeHeader 
        username={username}
        onLogout={onLogout}
        astralLevel={astralLevel}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left column with energy information */}
        <LeftSidebar 
          energyPoints={energyPoints}
          astralLevel={astralLevel}
          streakDays={userStreak.current}
          progressPercentage={getProgressPercentage()}
          activatedChakras={activatedChakras}
          selectedNode={selectedNode}
          selectedNodeMaterials={selectedNodeMaterials}
        />
        
        {/* Center column with Metatron's Cube */}
        <CubeWrapper 
          userId={user?.id}
          energyPoints={energyPoints}
          onSelectNode={handleNodeSelect}
        />
      </div>
      
      {/* Selected node detail panel (desktop only) */}
      <DetailSection 
        selectedNode={selectedNode}
        energyPoints={energyPoints}
        selectedNodeMaterials={selectedNodeMaterials}
      />
    </div>
  );
};

export default SacredHomePage;
