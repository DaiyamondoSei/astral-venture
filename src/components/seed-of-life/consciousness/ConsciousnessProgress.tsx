
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, Shield, Brain, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsciousnessProgressProps {
  userLevel?: number;
  className?: string;
}

// Abilities unlocked at different consciousness levels
const abilities = [
  { 
    id: 'perception',
    name: 'Heightened Perception', 
    description: 'Increased awareness of subtle energies and patterns',
    icon: Star,
    unlockedAt: 1
  },
  { 
    id: 'shield',
    name: 'Energy Shielding', 
    description: 'Ability to protect your energy field from negative influences',
    icon: Shield,
    unlockedAt: 2
  },
  { 
    id: 'insight',
    name: 'Quantum Insight', 
    description: 'Deeper understanding of the interconnectedness of all things',
    icon: Brain,
    unlockedAt: 3
  },
  { 
    id: 'manifestation',
    name: 'Conscious Manifestation', 
    description: 'Aligned intention setting with increased manifestation power',
    icon: Zap,
    unlockedAt: 5
  },
  { 
    id: 'transcendence',
    name: 'Dimensional Transcendence', 
    description: 'Access to higher dimensions of consciousness',
    icon: Gem,
    unlockedAt: 7
  }
];

// Consciousness levels and their descriptions
const levels = [
  { level: 1, name: "Awakening", description: "Beginning of the conscious journey" },
  { level: 2, name: "Awareness", description: "Growing awareness of energy and consciousness" },
  { level: 3, name: "Integration", description: "Integrating awareness into daily life" },
  { level: 5, name: "Expansion", description: "Expanded perception beyond normal boundaries" },
  { level: 7, name: "Resonance", description: "Deep resonance with universal consciousness" },
  { level: 10, name: "Unity", description: "Experiencing unity with all of existence" }
];

const ConsciousnessProgress: React.FC<ConsciousnessProgressProps> = ({
  userLevel = 1,
  className
}) => {
  // Get the current consciousness level name
  const getCurrentLevelName = () => {
    const currentLevel = levels
      .filter(l => l.level <= userLevel)
      .sort((a, b) => b.level - a.level)[0];
    
    return currentLevel ? currentLevel.name : "Awakening";
  };
  
  // Get the next consciousness level
  const getNextLevel = () => {
    const nextLevel = levels
      .filter(l => l.level > userLevel)
      .sort((a, b) => a.level - b.level)[0];
    
    return nextLevel || { level: 10, name: "Unity", description: "The highest level of consciousness" };
  };
  
  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    const nextLevel = getNextLevel();
    const currentLevelObj = levels
      .filter(l => l.level <= userLevel)
      .sort((a, b) => b.level - a.level)[0];
    
    const currentLevelValue = currentLevelObj ? currentLevelObj.level : 0;
    const totalLevelsToNext = nextLevel.level - currentLevelValue;
    const progress = (userLevel - currentLevelValue) / totalLevelsToNext * 100;
    
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-xl text-white/90 mb-4 text-center">Consciousness Development</h3>
        
        {/* Current level and progress to next */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="text-white/90 font-medium">{getCurrentLevelName()}</h4>
              <p className="text-white/60 text-sm">Level {userLevel}</p>
            </div>
            <div className="text-right">
              <h4 className="text-white/80">Next: {getNextLevel().name}</h4>
              <p className="text-white/60 text-sm">Level {getNextLevel().level}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              initial={{ width: '0%' }}
              animate={{ width: `${getProgressToNextLevel()}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-white/60 text-sm mt-2">
            {getNextLevel().description}
          </p>
        </div>
      </div>
      
      {/* Unlocked and locked abilities */}
      <div>
        <h4 className="text-white/90 font-medium mb-3">Quantum Abilities</h4>
        
        <div className="space-y-3">
          {abilities.map((ability) => {
            const isUnlocked = userLevel >= ability.unlockedAt;
            const Icon = ability.icon;
            
            return (
              <motion.div
                key={ability.id}
                className={`rounded-lg p-3 ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30' 
                    : 'bg-gray-900/30 border border-gray-700/30'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full p-2 ${
                    isUnlocked ? 'bg-purple-600/30 text-purple-300' : 'bg-gray-800/30 text-gray-500'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className={isUnlocked ? 'text-white/90' : 'text-white/50'}>
                      {ability.name}
                      {!isUnlocked && ` (Level ${ability.unlockedAt})`}
                    </h5>
                    <p className={`text-sm ${isUnlocked ? 'text-white/70' : 'text-white/40'}`}>
                      {ability.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessProgress;
