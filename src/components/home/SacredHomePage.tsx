
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MetatronsCube from '@/components/sacred-geometry/MetatronsCube';
import UserWelcome from '@/components/UserWelcome';
import NodeDetailPanel from '@/components/home/NodeDetailPanel';
import EnergyInfoCard from '@/components/home/EnergyInfoCard';
import { Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Define the DownloadableMaterial interface
interface DownloadableMaterial {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'practice' | 'guide';
  icon: React.ReactNode;
}

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
      <UserWelcome 
        username={username}
        onLogout={onLogout}
        astralLevel={astralLevel}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left column with energy information */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EnergyInfoCard 
              energyPoints={energyPoints}
              astralLevel={astralLevel}
              streakDays={userStreak.current}
              progressPercentage={getProgressPercentage()}
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
        
        {/* Center column with Metatron's Cube */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full"
          >
            <MetatronsCube 
              userId={user?.id}
              energyPoints={energyPoints}
              onSelectNode={handleNodeSelect}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Selected node detail panel (desktop only) */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 hidden lg:block"
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

export default SacredHomePage;
