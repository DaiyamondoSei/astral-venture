
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PracticeRecommendationsProps {
  userLevel?: number;
  className?: string;
}

// Sample practice recommendations
const practices = [
  {
    id: 'chakra-meditation',
    title: 'Root Chakra Meditation',
    description: 'Ground your energy and strengthen your foundation',
    duration: 10,
    energyPoints: 15,
    chakra: 'Root',
    chakraColor: '#FF5757',
    recommendedLevel: 1
  },
  {
    id: 'energy-breathing',
    title: 'Quantum Breathing',
    description: 'Expand your energy field through conscious breathing',
    duration: 5,
    energyPoints: 8,
    chakra: 'Heart',
    chakraColor: '#7ED957',
    recommendedLevel: 1
  },
  {
    id: 'third-eye',
    title: 'Third Eye Activation',
    description: 'Enhance intuition and clairvoyant abilities',
    duration: 15,
    energyPoints: 20,
    chakra: 'Third Eye',
    chakraColor: '#A85CFF',
    recommendedLevel: 2
  },
  {
    id: 'manifestation',
    title: 'Conscious Manifestation',
    description: 'Align your intentions with universal consciousness',
    duration: 12,
    energyPoints: 18,
    chakra: 'Solar Plexus',
    chakraColor: '#FFDE59',
    recommendedLevel: 3
  }
];

const PracticeRecommendations: React.FC<PracticeRecommendationsProps> = ({
  userLevel = 1,
  className
}) => {
  // Filter practices based on user level
  const filteredPractices = practices
    .filter(practice => practice.recommendedLevel <= userLevel)
    .sort((a, b) => a.recommendedLevel - b.recommendedLevel);
  
  // Calculate if there are locked practices
  const lockedPractices = practices
    .filter(practice => practice.recommendedLevel > userLevel)
    .sort((a, b) => a.recommendedLevel - b.recommendedLevel);
  
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-xl text-white/90 mb-4 text-center">Practice Recommendations</h3>
        <p className="text-white/70 text-center text-sm mb-6">
          Personalized practices to enhance your quantum consciousness
        </p>
        
        {/* Recommended practices */}
        <div className="space-y-4">
          {filteredPractices.map((practice) => (
            <motion.div
              key={practice.id}
              className="rounded-lg bg-black/20 border border-gray-700/30 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Chakra color bar */}
                <div 
                  className="w-full h-2 md:w-2 md:h-auto" 
                  style={{ backgroundColor: practice.chakraColor }}
                />
                
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white/90 font-medium">{practice.title}</h4>
                      <p className="text-white/60 text-sm">{practice.description}</p>
                    </div>
                    
                    <div 
                      className="px-2 py-1 rounded text-xs font-medium" 
                      style={{ 
                        backgroundColor: `${practice.chakraColor}40`, 
                        color: practice.chakraColor 
                      }}
                    >
                      {practice.chakra}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center mt-3 gap-3">
                    <div className="flex items-center text-white/60 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {practice.duration} min
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <Zap className="w-4 h-4 mr-1" />
                      {practice.energyPoints} energy points
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <Award className="w-4 h-4 mr-1" />
                      Level {practice.recommendedLevel}+
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      Begin Practice
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Show a preview of locked practices */}
          {lockedPractices.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white/80 font-medium mb-3">Unlock at Higher Levels</h4>
              
              {lockedPractices.slice(0, 2).map((practice) => (
                <div
                  key={practice.id}
                  className="rounded-lg bg-black/20 border border-gray-700/30 p-4 mb-3 opacity-60"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white/70 font-medium">{practice.title}</h4>
                      <p className="text-white/50 text-sm">{practice.description}</p>
                    </div>
                    <div className="bg-gray-800 px-2 py-1 rounded text-white/70 text-xs">
                      Level {practice.recommendedLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeRecommendations;
