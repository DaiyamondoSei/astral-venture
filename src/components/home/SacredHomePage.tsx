
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SacredGeometryGuide from '@/components/sacred-geometry/SacredGeometryGuide';
import ChakraExplorer from '@/components/chakra/ChakraExplorer';
import SwipeablePanel from '@/components/ui/swipeable-panel';
import UserEnergyLevel from '@/components/user/UserEnergyLevel';
import MeditationTimer from '@/components/meditation/MeditationTimer';

const SacredHomePage: React.FC = () => {
  const [activePanelContent, setActivePanelContent] = useState<string | null>(null);
  
  const handleOpenPanel = (content: string) => {
    setActivePanelContent(content);
  };
  
  const handleClosePanel = () => {
    setActivePanelContent(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/30 to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Sacred Geometry Portal</h1>
          <p className="text-purple-300">Explore the patterns of consciousness</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sacred Geometry Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20"
            onClick={() => handleOpenPanel('geometry')}
          >
            <h2 className="text-xl font-semibold text-white mb-3">Sacred Geometry</h2>
            <p className="text-white/70 mb-4">
              Explore the sacred patterns that form the universe and expand consciousness.
            </p>
            <div className="flex justify-center">
              {/* Placeholder for sacred geometry visual */}
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-purple-400/50 rounded-full"></div>
              </div>
            </div>
          </motion.div>
          
          {/* Chakra System Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-teal-500/20"
            onClick={() => handleOpenPanel('chakra')}
          >
            <h2 className="text-xl font-semibold text-white mb-3">Chakra System</h2>
            <p className="text-white/70 mb-4">
              Understand your energy centers and learn practices to balance them.
            </p>
            <div className="flex justify-center">
              {/* Placeholder for chakra visual */}
              <div className="w-32 h-32 bg-gradient-to-br from-teal-500/30 to-emerald-500/30 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-teal-400/50 rounded-full"></div>
              </div>
            </div>
          </motion.div>
          
          {/* Meditation Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20"
            onClick={() => handleOpenPanel('meditation')}
          >
            <h2 className="text-xl font-semibold text-white mb-3">Meditation</h2>
            <p className="text-white/70 mb-4">
              Begin your meditation practice with guided sessions and timers.
            </p>
            <div className="flex justify-center">
              {/* Placeholder for meditation visual */}
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-blue-400/50 rounded-full"></div>
              </div>
            </div>
          </motion.div>
          
          {/* Energy Level Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-amber-500/20"
            onClick={() => handleOpenPanel('energy')}
          >
            <h2 className="text-xl font-semibold text-white mb-3">Energy Level</h2>
            <p className="text-white/70 mb-4">
              Track your energy levels and spiritual progress over time.
            </p>
            <div className="flex justify-center">
              {/* Placeholder for energy level visual */}
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-amber-400/50 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Swipeable Panel */}
      <SwipeablePanel
        isOpen={activePanelContent !== null}
        onClose={handleClosePanel}
        height="80%"
      >
        <div className="p-4">
          {activePanelContent === 'geometry' && <SacredGeometryGuide />}
          {activePanelContent === 'chakra' && <ChakraExplorer />}
          {activePanelContent === 'meditation' && <MeditationTimer />}
          {activePanelContent === 'energy' && <UserEnergyLevel />}
        </div>
      </SwipeablePanel>
    </div>
  );
};

export default SacredHomePage;
