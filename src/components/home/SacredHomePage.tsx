
import React, { useState, useEffect, useRef } from 'react';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SwipeablePanel } from '@/components/ui/swipeable-panel';
import { 
  Settings, LogOut, Bell, Info, 
  ChevronUp, ChevronDown, BookOpen, User 
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Import our refactored components
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
  const [topPanelOpen, setTopPanelOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [showMainContent, setShowMainContent] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const mainRef = useRef<HTMLDivElement>(null);
  
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

  const panelVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const toggleTopPanel = () => {
    setTopPanelOpen(!topPanelOpen);
    if (bottomPanelOpen) setBottomPanelOpen(false);
  };

  const toggleBottomPanel = () => {
    setBottomPanelOpen(!bottomPanelOpen);
    if (topPanelOpen) setTopPanelOpen(false);
  };

  const toggleMainContentFocus = () => {
    if (mainRef.current) {
      mainRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen request denied:', err);
        // Fallback for when fullscreen isn't available
        setShowMainContent(!showMainContent);
      });
    }
  };

  return (
    <ErrorBoundary>
      <motion.div 
        initial="hidden"
        animate={pageLoaded ? "visible" : "hidden"}
        variants={pageVariants}
        className="min-h-screen relative overflow-hidden"
      >
        <PageBackground 
          energyPoints={energyPoints} 
          consciousnessLevel={consciousnessLevel} 
        />
        
        {/* Top Indicator Button */}
        <motion.div 
          className="absolute top-2 left-1/2 -translate-x-1/2 z-40"
          variants={panelVariants}
        >
          <button 
            onClick={toggleTopPanel}
            className="rounded-full w-12 h-12 bg-quantum-500/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-quantum-400/90 transition-colors"
            aria-label="Open top panel"
          >
            {topPanelOpen ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </button>
        </motion.div>

        {/* Bottom Indicator Button */}
        <motion.div 
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40"
          variants={panelVariants}
        >
          <button
            onClick={toggleBottomPanel}
            className="rounded-full w-12 h-12 bg-quantum-500/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-quantum-400/90 transition-colors"
            aria-label="Open bottom panel"
          >
            {bottomPanelOpen ? (
              <ChevronDown className="w-5 h-5 text-white" />
            ) : (
              <Bell className="w-5 h-5 text-white" />
            )}
          </button>
        </motion.div>
        
        {/* Top Swipeable Panel - User Info & Settings */}
        <SwipeablePanel 
          position="top"
          isOpen={topPanelOpen}
          onClose={() => setTopPanelOpen(false)}
          size={isMobile ? "medium" : "small"}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-quantum-400 to-quantum-600 flex items-center justify-center text-white font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-lg">{username}</h3>
                  <p className="text-xs text-white/70">Level {astralLevel} • {energyPoints} Energy Points</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-black/20"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5 text-white/80" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <Settings className="w-5 h-5 text-white/80 mb-1" />
                <span className="text-xs">Settings</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <User className="w-5 h-5 text-white/80 mb-1" />
                <span className="text-xs">Profile</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <BookOpen className="w-5 h-5 text-white/80 mb-1" />
                <span className="text-xs">Guide</span>
              </button>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/70">Progress to Level {astralLevel + 1}</span>
                <span className="text-xs text-white/70">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-quantum-400 to-quantum-600" 
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>
        </SwipeablePanel>
        
        {/* Bottom Swipeable Panel - Notifications & Quick Actions */}
        <SwipeablePanel 
          position="bottom"
          isOpen={bottomPanelOpen}
          onClose={() => setBottomPanelOpen(false)}
          size={isMobile ? "medium" : "small"}
        >
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg">Notifications & Actions</h3>
              <button 
                onClick={() => setBottomPanelOpen(false)}
                className="p-2 rounded-full hover:bg-black/20"
              >
                <ChevronDown className="w-5 h-5 text-white/80" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-black/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-quantum-500/50 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Daily challenge available</p>
                  <p className="text-xs text-white/70">Complete to earn energy points</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-black/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ethereal-500/50 flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Continue your meditation streak</p>
                  <p className="text-xs text-white/70">Current streak: {userStreak.current} days</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm mb-2">Quick actions</h4>
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors text-xs">
                  Meditation
                </button>
                <button className="p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors text-xs">
                  Reflection
                </button>
                <button 
                  className="p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors text-xs"
                  onClick={toggleMainContentFocus}
                >
                  Expand
                </button>
              </div>
            </div>
          </div>
        </SwipeablePanel>
        
        {/* Main Content - Centered Metatron's Cube */}
        <motion.div 
          className="flex justify-center items-center min-h-screen"
          variants={fadeInUpVariants}
          ref={mainRef}
        >
          <div className="w-full max-w-screen-xl px-4 py-16 md:py-24">
            <MainContent 
              userId={user?.id}
              energyPoints={energyPoints}
              onNodeSelect={handleNodeSelect}
              className="w-full aspect-square max-w-full md:max-w-3xl mx-auto"
            />
          </div>
        </motion.div>
        
        {/* Node Detail Section - Only shown when a node is selected */}
        <AnimatePresence>
          {selectedNode && (
            <NodeDetailSection 
              selectedNode={selectedNode}
              energyPoints={energyPoints}
              selectedNodeMaterials={selectedNodeMaterials}
              consciousnessLevel={consciousnessLevel}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </AnimatePresence>
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
