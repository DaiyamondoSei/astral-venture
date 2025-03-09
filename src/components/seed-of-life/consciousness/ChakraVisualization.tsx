
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Zap, XCircle, Brain, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChakraVisualization } from '@/hooks/useChakraVisualization';
import { ChakraName, ChakraPractice } from '@/services/chakra/chakraVisualizationService';
import { useToast } from '@/hooks/use-toast';

interface ChakraVisualizationProps {
  userLevel?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

const ChakraVisualization: React.FC<ChakraVisualizationProps> = ({
  userLevel = 1,
  primaryColor = '#8B5CF6',
  secondaryColor = '#EC4899',
  className
}) => {
  const { toast } = useToast();
  const [showPracticeDetails, setShowPracticeDetails] = useState(false);
  
  const {
    chakraData,
    isLoading,
    error,
    selectedChakra,
    selectedPractice,
    selectChakra,
    selectPractice,
    refreshChakraData
  } = useChakraVisualization({ userLevel });
  
  useEffect(() => {
    // Reset practice details view when chakra selection changes
    setShowPracticeDetails(false);
  }, [selectedChakra]);
  
  // Handle practice start
  const handleStartPractice = (practice: ChakraPractice) => {
    selectPractice(practice);
    setShowPracticeDetails(true);
  };
  
  // Handle practice completion
  const handleCompletePractice = () => {
    if (!selectedPractice) return;
    
    toast({
      title: "Practice Completed",
      description: `You've earned ${selectedPractice.energyPoints} energy points!`,
      duration: 3000,
    });
    
    setShowPracticeDetails(false);
    
    // In a real implementation, we would update the backend here
    // and then refresh the chakra data
    setTimeout(() => {
      refreshChakraData();
    }, 500);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-white/70">Loading chakra data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl text-white/90 mb-2">Error Loading Chakra Data</h3>
        <p className="text-white/70 mb-4">{error}</p>
        <Button onClick={refreshChakraData} className="bg-purple-600 hover:bg-purple-700">
          Retry
        </Button>
      </div>
    );
  }
  
  if (!chakraData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-white/70">No chakra data available.</p>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-xl text-white/90 mb-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" />
        Chakra Activation
      </h3>
      
      <AnimatePresence mode="wait">
        {showPracticeDetails && selectedPractice ? (
          <motion.div
            key="practice-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 rounded-lg border border-white/10 p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-white text-lg font-medium">{selectedPractice.title}</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/60 hover:text-white"
                onClick={() => setShowPracticeDetails(false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-white/80 mb-4">{selectedPractice.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-white/60">
                <Clock className="w-4 h-4 mr-1" />
                {selectedPractice.duration} min
              </div>
              <div className="flex items-center text-white/60">
                <Zap className="w-4 h-4 mr-1" />
                {selectedPractice.energyPoints} energy
              </div>
              <div className="flex items-center text-white/60">
                <Brain className="w-4 h-4 mr-1" />
                Level {selectedPractice.difficulty}
              </div>
            </div>
            
            <div className="mb-4">
              <h5 className="text-white/90 mb-2">Instructions:</h5>
              <ol className="text-white/70 space-y-2 list-decimal pl-5">
                <li>Find a quiet place where you won't be disturbed</li>
                <li>Sit comfortably with your spine straight</li>
                <li>Set a timer for {selectedPractice.duration} minutes</li>
                <li>Focus your attention on the {
                  selectedChakra && chakraData.chakras.find(c => c.id === selectedChakra)?.name
                } chakra</li>
                <li>Visualize the energy of this chakra balancing and expanding</li>
              </ol>
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              onClick={handleCompletePractice}
            >
              <Check className="w-4 h-4 mr-2" />
              Complete Practice
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="chakra-visualization"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col md:flex-row items-center"
          >
            {/* Human silhouette with chakra points */}
            <div className="relative flex justify-center mt-4 w-full md:w-1/2">
              <div className="relative h-[400px] w-[120px]">
                {/* Simple human silhouette */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <svg viewBox="0 0 100 300" width="100%" height="100%">
                    <path
                      d="M50,0 C60,0 70,10 70,20 C70,30 65,35 60,40 L63,80 L73,100 L63,140 C63,140 80,160 80,180 C80,200 70,230 65,260 C63,270 60,280 50,280 C40,280 37,270 35,260 C30,230 20,200 20,180 C20,160 37,140 37,140 L27,100 L37,80 L40,40 C35,35 30,30 30,20 C30,10 40,0 50,0 Z"
                      fill="rgba(255, 255, 255, 0.2)"
                      stroke="rgba(255, 255, 255, 0.5)"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
                
                {/* Chakra points */}
                {chakraData.chakras.map((chakra) => {
                  const activation = chakra.activationLevel;
                  const isActive = activation > 30;
                  const isSelected = selectedChakra === chakra.id;
                  const size = 14 + (activation / 100) * 10;
                  
                  return (
                    <motion.div
                      key={chakra.id}
                      className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                      style={{ top: `${chakra.position}%` }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: activation / 100,
                        scale: isActive ? [1, 1.1, 1] : 1,
                        zIndex: isSelected ? 10 : 1
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: isActive ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                      onClick={() => selectChakra(chakra.id as ChakraName)}
                    >
                      <div
                        className={cn(
                          "rounded-full relative",
                          isSelected && "ring-2 ring-white"
                        )}
                        style={{
                          backgroundColor: chakra.color,
                          width: isSelected ? size + 4 : size,
                          height: isSelected ? size + 4 : size,
                          boxShadow: `0 0 ${(activation / 100) * 15}px ${chakra.color}`
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Chakra details and levels */}
            <div className="mt-6 md:mt-0 space-y-2 w-full md:w-1/2">
              {chakraData.chakras.map((chakra) => {
                const activation = chakra.activationLevel;
                const isSelected = selectedChakra === chakra.id;
                
                return (
                  <div 
                    key={chakra.id} 
                    className={cn(
                      "mb-2 p-2 rounded-lg transition-colors cursor-pointer",
                      isSelected ? "bg-white/10" : "hover:bg-white/5"
                    )}
                    onClick={() => selectChakra(chakra.id as ChakraName)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: chakra.color }}
                        />
                        <span className="text-white/90">{chakra.name}</span>
                      </div>
                      <span className="text-white/70 text-sm">{Math.round(activation)}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-black/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: chakra.color }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${activation}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-2"
                      >
                        <p className="text-white/80 text-sm mb-2">{chakra.description}</p>
                        
                        <h5 className="text-white/90 text-sm font-medium mb-1">Associated Emotions:</h5>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {chakra.associatedEmotions.map(emotion => (
                            <span 
                              key={emotion} 
                              className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70"
                            >
                              {emotion}
                            </span>
                          ))}
                        </div>
                        
                        <h5 className="text-white/90 text-sm font-medium mb-1">Recommended Practices:</h5>
                        <div className="space-y-2">
                          {chakra.balancingPractices.map(practice => (
                            <div 
                              key={practice.id}
                              className="p-2 rounded-md bg-black/20 cursor-pointer hover:bg-black/30 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartPractice(practice);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-white/90 text-sm">{practice.title}</span>
                                <span className="text-xs text-white/60">{practice.duration} min</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChakraVisualization;
