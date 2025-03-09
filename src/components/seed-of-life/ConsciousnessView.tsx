
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Star, Sparkles, Activity, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import ChakraVisualization from './consciousness/ChakraVisualization';
import ConsciousnessProgress from './consciousness/ConsciousnessProgress';
import PracticeRecommendations from './consciousness/PracticeRecommendations';
import EmotionalMatrix from './consciousness/EmotionalMatrix';
import DreamIntegration from './consciousness/DreamIntegration';
import { cn } from '@/lib/utils';

interface ConsciousnessViewProps {
  userLevel?: number;
  primaryColor?: string;
  secondaryColor?: string;
  onBack: () => void;
}

/**
 * ConsciousnessView displays the user's personal quantum journey and 
 * consciousness development after entering through the Seed of Life portal
 */
const ConsciousnessView: React.FC<ConsciousnessViewProps> = ({
  userLevel = 1,
  primaryColor = '#8B5CF6',
  secondaryColor = '#EC4899',
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('chakras');
  
  return (
    <motion.div
      className="relative w-full h-full min-h-[500px] overflow-hidden rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Glassmorphic background container */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-lg z-0" />
      
      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full bg-black/20 hover:bg-black/40 text-white"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Header section */}
      <div className="relative z-10 p-6 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">Consciousness Journey</h2>
            <p className="text-white/70">Explore your quantum development</p>
          </div>
          
          {/* Level indicator */}
          <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-full">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-white/90 font-medium">Level {userLevel}</span>
          </div>
        </div>
        
        {/* Overall progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white/70 mb-1">
            <span>Consciousness Expansion</span>
            <span>{userLevel * 10}%</span>
          </div>
          <Progress 
            value={userLevel * 10} 
            className="h-2 bg-gray-800/60" 
            indicatorClassName="bg-gradient-to-r from-purple-600 to-pink-500" 
          />
        </div>
      </div>
      
      {/* Tabs for different consciousness aspects */}
      <div className="relative z-10 px-6 mt-2">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 bg-black/30">
            <TabsTrigger value="chakras" className="data-[state=active]:bg-purple-700/30">
              <span className="hidden md:block">Chakras</span>
              <Star className="h-4 w-4 md:hidden" />
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-blue-700/30">
              <span className="hidden md:block">Progress</span>
              <Activity className="h-4 w-4 md:hidden" />
            </TabsTrigger>
            <TabsTrigger value="practices" className="data-[state=active]:bg-green-700/30">
              <span className="hidden md:block">Practices</span>
              <Brain className="h-4 w-4 md:hidden" />
            </TabsTrigger>
            <TabsTrigger value="emotional" className="data-[state=active]:bg-pink-700/30">
              <span className="hidden md:block">Emotional</span>
              <Sparkles className="h-4 w-4 md:hidden" />
            </TabsTrigger>
            <TabsTrigger value="dream" className="data-[state=active]:bg-indigo-700/30">
              <span className="hidden md:block">Dream</span>
              <ChevronRight className="h-4 w-4 md:hidden" />
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 rounded-md bg-black/20 p-4 min-h-[400px]">
            <TabsContent value="chakras" className="mt-0">
              <ChakraVisualization 
                userLevel={userLevel} 
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            </TabsContent>
            
            <TabsContent value="progress" className="mt-0">
              <ConsciousnessProgress 
                userLevel={userLevel}
              />
            </TabsContent>
            
            <TabsContent value="practices" className="mt-0">
              <PracticeRecommendations 
                userLevel={userLevel}
              />
            </TabsContent>
            
            <TabsContent value="emotional" className="mt-0">
              <EmotionalMatrix 
                userLevel={userLevel}
              />
            </TabsContent>
            
            <TabsContent value="dream" className="mt-0">
              <DreamIntegration 
                userLevel={userLevel}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Bottom actions and insights */}
      <div className="relative z-10 px-6 mt-6">
        <Separator className="my-2 bg-white/10" />
        
        <div className="flex justify-between items-center py-2">
          <span className="text-white/60 text-sm">Daily wisdom insight:</span>
          <p className="text-white/90 text-sm italic">
            "Consciousness expands through mindful attention to the present moment."
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsciousnessView;
