
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import ChakraVisualization from './consciousness/ChakraVisualization';
import ConsciousnessProgress from './consciousness/ConsciousnessProgress';
import PracticeRecommendations from './consciousness/PracticeRecommendations';
import EmotionalMatrix from './consciousness/EmotionalMatrix';
import DreamIntegration from './consciousness/DreamIntegration';

interface ConsciousnessViewProps {
  onReturn: () => void;
  userLevel: number;
}

/**
 * Displays the Consciousness View after entering the Seed of Life portal
 */
const ConsciousnessView: React.FC<ConsciousnessViewProps> = ({
  onReturn,
  userLevel
}) => {
  const [activeTab, setActiveTab] = useState('chakra');
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full bg-gradient-to-b from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-lg p-4 overflow-hidden"
    >
      {/* Return button */}
      <button
        onClick={onReturn}
        className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <ArrowLeft className="h-5 w-5 text-white" />
      </button>
      
      <div className="flex flex-col h-full">
        <h2 className="text-xl font-bold text-white text-center mb-4">
          Consciousness Portal
        </h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-5 bg-white/10 backdrop-blur border-white/10">
            <TabsTrigger value="chakra" className="text-white text-xs">Chakras</TabsTrigger>
            <TabsTrigger value="progress" className="text-white text-xs">Progress</TabsTrigger>
            <TabsTrigger value="practices" className="text-white text-xs">Practices</TabsTrigger>
            <TabsTrigger value="emotional" className="text-white text-xs">Emotional</TabsTrigger>
            <TabsTrigger value="dreams" className="text-white text-xs">Dreams</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="chakra" className="h-full">
              <ChakraVisualization userLevel={userLevel} />
            </TabsContent>
            
            <TabsContent value="progress" className="h-full">
              <ConsciousnessProgress userLevel={userLevel} />
            </TabsContent>
            
            <TabsContent value="practices" className="h-full">
              <PracticeRecommendations userLevel={userLevel} />
            </TabsContent>
            
            <TabsContent value="emotional" className="h-full">
              <EmotionalMatrix userLevel={userLevel} />
            </TabsContent>
            
            <TabsContent value="dreams" className="h-full">
              <DreamIntegration userLevel={userLevel} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default ConsciousnessView;
