
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DreamIntegrationProps {
  userLevel?: number;
  className?: string;
}

// Sample dream/goal data (in a real app, this would come from the user's profile)
const userDream = {
  dream: "Achieve perfect balance between career success and spiritual growth",
  aspects: [
    { 
      name: "Career Success", 
      progress: 65, 
      insights: ["Focus more on meaningful projects", "Align work with core values"] 
    },
    { 
      name: "Spiritual Growth", 
      progress: 50, 
      insights: ["Deepen daily meditation practice", "Study quantum consciousness principles"] 
    },
    { 
      name: "Balance & Integration", 
      progress: 40, 
      insights: ["Develop better boundaries", "Create rituals that connect both worlds"] 
    }
  ]
};

const DreamIntegration: React.FC<DreamIntegrationProps> = ({
  userLevel = 1,
  className
}) => {
  const [showEditDream, setShowEditDream] = useState(false);
  
  // Calculate overall dream manifestation progress
  const getOverallProgress = () => {
    const totalProgress = userDream.aspects.reduce((sum, aspect) => sum + aspect.progress, 0);
    return Math.round(totalProgress / userDream.aspects.length);
  };
  
  // Get color based on progress
  const getColorForProgress = (progress: number) => {
    if (progress < 30) return '#FF5757'; // Red
    if (progress < 50) return '#FFA726'; // Orange
    if (progress < 70) return '#FFDE59'; // Yellow
    if (progress < 90) return '#7ED957'; // Green
    return '#5271FF'; // Blue
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-xl text-white/90 mb-4 text-center">Dream Integration</h3>
        <p className="text-white/70 text-center text-sm mb-6">
          Tracking the manifestation of your quantum dream
        </p>
        
        {/* Dream visualization */}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-white/90 font-medium">Your Dream</h4>
              <p className="text-white/80 italic">{userDream.dream}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white/60 hover:text-white/90"
              onClick={() => setShowEditDream(!showEditDream)}
            >
              <Edit className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Dream edit form (simplified placeholder) */}
          {showEditDream && (
            <motion.div
              className="mt-4 bg-black/20 p-3 rounded-md"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <textarea
                className="w-full bg-black/30 border border-purple-500/30 rounded-md p-2 text-white/90"
                rows={3}
                placeholder="Describe your dream or goal..."
                defaultValue={userDream.dream}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  variant="default"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowEditDream(false)}
                >
                  Save Dream
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Overall manifestation progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>Overall Manifestation</span>
              <span>{getOverallProgress()}%</span>
            </div>
            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                initial={{ width: '0%' }}
                animate={{ width: `${getOverallProgress()}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
        
        {/* Dream aspects */}
        <div className="space-y-4">
          <h4 className="text-white/90 font-medium">Dream Aspects</h4>
          
          {userDream.aspects.map((aspect, index) => {
            const aspectColor = getColorForProgress(aspect.progress);
            
            return (
              <motion.div
                key={`aspect-${index}`}
                className="bg-black/20 rounded-lg p-4 border border-gray-700/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-white/90">{aspect.name}</h5>
                  <div 
                    className="px-2 py-1 rounded text-xs font-medium" 
                    style={{ backgroundColor: `${aspectColor}30`, color: aspectColor }}
                  >
                    {aspect.progress}%
                  </div>
                </div>
                
                <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: aspectColor }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${aspect.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                
                {/* Insights */}
                <div className="space-y-2">
                  <h6 className="text-white/70 text-sm">Insights:</h6>
                  {aspect.insights.map((insight, i) => (
                    <div key={`insight-${index}-${i}`} className="flex items-start">
                      <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                      <p className="text-white/60 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white/70 hover:text-white/90"
                  >
                    <span>Explore</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DreamIntegration;
