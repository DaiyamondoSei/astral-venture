
import React from 'react';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { Progress } from '@/components/ui/progress';
import { StarIcon, SparklesIcon, BoltIcon, ClockIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeftSidebarProps {
  energyPoints: number;
  astralLevel: number;
  streakDays: number;
  progressPercentage: number;
  activatedChakras: number[];
  selectedNode: string | null;
  selectedNodeMaterials: DownloadableMaterial[] | null;
  consciousnessLevel?: number;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  energyPoints,
  astralLevel,
  streakDays,
  progressPercentage,
  activatedChakras,
  selectedNode,
  selectedNodeMaterials,
  consciousnessLevel = 1
}) => {
  // Map chakra names
  const chakraNames = [
    "Crown", "Third Eye", "Throat", "Heart", "Solar Plexus", "Sacral", "Root"
  ];
  
  // Get activated chakra names
  const activatedChakraNames = activatedChakras.map(index => chakraNames[index]);
  
  // Map consciousness level to description
  const getConsciousnessDescription = (level: number): string => {
    switch(level) {
      case 1: return "Physical Awareness";
      case 2: return "Emotional Sensitivity";
      case 3: return "Mental Clarity";
      case 4: return "Heart Expansion";
      case 5: return "Expressed Intuition";
      case 6: return "Enhanced Perception";
      case 7: return "Cosmic Unity";
      default: return "Physical Awareness";
    }
  };
  
  // Calculate color based on consciousness level
  const getConsciousnessColor = (level: number): string => {
    const colors = [
      "bg-red-500", "bg-orange-500", "bg-yellow-500", 
      "bg-green-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500"
    ];
    return colors[Math.min(level, 7) - 1];
  };

  return (
    <div className="space-y-6">
      {/* Energy Points Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-white">Energy Points</h2>
          <span className="text-xl font-bold text-quantum-300">{energyPoints}</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-quantum-300 mb-1">
              <span>Level {astralLevel}</span>
              <span>Level {astralLevel + 1}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="flex items-center mb-1">
                <StarIcon className="h-4 w-4 text-quantum-300 mr-1" />
                <span className="text-sm text-white">Astral Level</span>
              </div>
              <p className="text-lg font-semibold text-quantum-300">{astralLevel}</p>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="flex items-center mb-1">
                <ClockIcon className="h-4 w-4 text-quantum-300 mr-1" />
                <span className="text-sm text-white">Streak</span>
              </div>
              <p className="text-lg font-semibold text-quantum-300">{streakDays} days</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Consciousness Level (New) */}
      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
        <h3 className="text-white font-medium mb-2">Consciousness Level</h3>
        
        <div className="flex items-center mb-3">
          <div className={`w-6 h-6 rounded-full ${getConsciousnessColor(consciousnessLevel)} mr-2 flex items-center justify-center`}>
            <span className="text-xs font-bold text-white">{consciousnessLevel}</span>
          </div>
          <span className="text-lg font-medium text-white">{getConsciousnessDescription(consciousnessLevel)}</span>
        </div>
        
        <Progress 
          value={(consciousnessLevel / 7) * 100} 
          className="h-1.5 bg-black/50"
          indicatorClassName={`${getConsciousnessColor(consciousnessLevel)}`} 
        />
        
        <p className="text-xs text-white/70 mt-2">
          Your consciousness has expanded to level {consciousnessLevel}. Continue your practice to reach higher states.
        </p>
      </div>
      
      {/* Activated Chakras */}
      <div>
        <h3 className="text-white font-medium mb-2">Activated Energy Centers</h3>
        
        <div className="space-y-2">
          {activatedChakraNames.length > 0 ? (
            activatedChakraNames.map((name, index) => (
              <motion.div 
                key={index}
                className="bg-black/30 rounded-lg p-2 border border-white/5 flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SparklesIcon className="h-4 w-4 text-quantum-300 mr-2" />
                <span className="text-sm text-white">{name} Chakra</span>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-white/70">No chakras activated yet</p>
          )}
        </div>
      </div>
      
      {/* Selected Node Information (Only shown when a node is selected) */}
      {selectedNode && (
        <div className="bg-black/30 p-3 rounded-lg border border-white/10">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <BoltIcon className="h-4 w-4 text-quantum-300 mr-1" />
            Selected Node: {selectedNode.charAt(0).toUpperCase() + selectedNode.slice(1)}
          </h3>
          
          {selectedNodeMaterials && selectedNodeMaterials.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm text-white/80 mb-1">Materials:</h4>
              <ul className="space-y-1">
                {selectedNodeMaterials.map((material, index) => (
                  <li key={index} className="text-xs text-quantum-300">
                    • {material.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;
