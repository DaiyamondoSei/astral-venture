
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Brain, Heart, Star, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuantumTheme } from '@/components/visual-foundation';
import { cn } from '@/lib/utils';

interface ConsciousnessViewProps {
  userLevel?: number;
  onReturn: () => void;
}

/**
 * The main consciousness view that appears after activating the Seed of Life portal
 * Features tabbed interface for different aspects of consciousness development
 */
const ConsciousnessView: React.FC<ConsciousnessViewProps> = ({
  userLevel = 1,
  onReturn
}) => {
  const [activeTab, setActiveTab] = useState('chakras');
  const { theme } = useQuantumTheme();
  
  // Get theme color for styling elements
  const getThemeColor = () => {
    switch (theme) {
      case 'ethereal': return 'from-ethereal-400 to-ethereal-600';
      case 'astral': return 'from-astral-400 to-astral-600';
      case 'quantum': 
      default: return 'from-quantum-400 to-quantum-600';
    }
  };
  
  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back button */}
      <div className="absolute top-0 left-0 z-10">
        <Button
          variant="glass"
          size="icon"
          onClick={onReturn}
          className="rounded-full bg-black/20"
        >
          <ArrowLeft className="text-white" size={18} />
        </Button>
      </div>
      
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
          Consciousness Explorer
        </h2>
        <p className="text-white/70 max-w-md mx-auto">
          Journey through your inner realms and discover the dimensions of your consciousness
        </p>
      </div>
      
      {/* Tabs navigation */}
      <Tabs 
        defaultValue="chakras" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-1 mb-6">
          <TabsTrigger value="chakras" className="data-[state=active]:bg-gradient-to-r data-[state=active]:text-white">
            <Sparkles size={16} className="mr-2" />
            <span className="hidden sm:inline">Chakras</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:text-white">
            <Brain size={16} className="mr-2" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="practices" className="data-[state=active]:bg-gradient-to-r data-[state=active]:text-white">
            <Star size={16} className="mr-2" />
            <span className="hidden sm:inline">Practices</span>
          </TabsTrigger>
          <TabsTrigger value="emotional" className="data-[state=active]:bg-gradient-to-r data-[state=active]:text-white">
            <Heart size={16} className="mr-2" />
            <span className="hidden sm:inline">Emotional</span>
          </TabsTrigger>
          <TabsTrigger value="dreams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:text-white">
            <Moon size={16} className="mr-2" />
            <span className="hidden sm:inline">Dreams</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Tab content */}
        <div className="p-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg">
          <TabsContent value="chakras" className="mt-0">
            <ChakraVisualization userLevel={userLevel} />
          </TabsContent>
          
          <TabsContent value="progress" className="mt-0">
            <ConsciousnessProgress userLevel={userLevel} />
          </TabsContent>
          
          <TabsContent value="practices" className="mt-0">
            <PracticeRecommendations userLevel={userLevel} />
          </TabsContent>
          
          <TabsContent value="emotional" className="mt-0">
            <EmotionalMatrix userLevel={userLevel} />
          </TabsContent>
          
          <TabsContent value="dreams" className="mt-0">
            <DreamIntegration userLevel={userLevel} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};

// Tab content components
const ChakraVisualization: React.FC<{ userLevel: number }> = ({ userLevel }) => (
  <div className="text-center p-4">
    <h3 className="text-xl text-white mb-2">Chakra System</h3>
    <p className="text-white/70 mb-6">Visualization of your activated energy centers</p>
    
    <div className="flex justify-center">
      <div className="relative w-64 h-96 bg-gradient-to-b from-black/30 to-purple-900/10 rounded-full backdrop-blur-sm">
        {/* Placeholder for chakra visualization */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-red-500/50 blur-sm"></div>
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-orange-500/50 blur-sm"></div>
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-yellow-500/50 blur-sm"></div>
        <div className="absolute bottom-56 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-green-500/50 blur-sm"></div>
        <div className="absolute bottom-72 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-blue-500/50 blur-sm"></div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-indigo-500/50 blur-sm"></div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-violet-500/50 blur-sm"></div>
      </div>
    </div>
  </div>
);

const ConsciousnessProgress: React.FC<{ userLevel: number }> = ({ userLevel }) => (
  <div className="text-center p-4">
    <h3 className="text-xl text-white mb-2">Consciousness Level: {userLevel}</h3>
    <p className="text-white/70 mb-6">Your journey through expanding awareness</p>
    
    <div className="space-y-4">
      <div className="bg-black/30 p-4 rounded-lg">
        <h4 className="text-white mb-2">Awareness</h4>
        <div className="w-full h-2 bg-gray-700 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            style={{ width: `${Math.min(100, userLevel * 20)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg">
        <h4 className="text-white mb-2">Integration</h4>
        <div className="w-full h-2 bg-gray-700 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full"
            style={{ width: `${Math.min(100, userLevel * 15)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg">
        <h4 className="text-white mb-2">Intuition</h4>
        <div className="w-full h-2 bg-gray-700 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
            style={{ width: `${Math.min(100, userLevel * 18)}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

const PracticeRecommendations: React.FC<{ userLevel: number }> = ({ userLevel }) => (
  <div className="text-center p-4">
    <h3 className="text-xl text-white mb-2">Recommended Practices</h3>
    <p className="text-white/70 mb-6">Activities to deepen your consciousness</p>
    
    <div className="space-y-4">
      <div className="bg-black/30 p-4 rounded-lg text-left">
        <h4 className="text-white mb-2">Morning Meditation</h4>
        <p className="text-white/70 text-sm">Start your day with 10 minutes of mindfulness to center your energy</p>
        <Button variant="outline" size="sm" className="mt-2">
          Start Practice
        </Button>
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg text-left">
        <h4 className="text-white mb-2">Chakra Balancing</h4>
        <p className="text-white/70 text-sm">Focus on harmonizing your energy centers with guided visualization</p>
        <Button variant="outline" size="sm" className="mt-2">
          Start Practice
        </Button>
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg text-left">
        <h4 className="text-white mb-2">Dream Journaling</h4>
        <p className="text-white/70 text-sm">Record and analyze your dreams to access your subconscious wisdom</p>
        <Button variant="outline" size="sm" className="mt-2">
          Start Practice
        </Button>
      </div>
    </div>
  </div>
);

const EmotionalMatrix: React.FC<{ userLevel: number }> = ({ userLevel }) => (
  <div className="text-center p-4">
    <h3 className="text-xl text-white mb-2">Emotional Intelligence</h3>
    <p className="text-white/70 mb-6">Your emotional awareness and regulation</p>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-black/30 p-4 rounded-lg">
        <h4 className="text-white mb-2">Self-Awareness</h4>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                {Math.min(100, userLevel * 15)}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              style={{ width: `${Math.min(100, userLevel * 15)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg">
        <h4 className="text-white mb-2">Empathy</h4>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                {Math.min(100, userLevel * 12)}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              style={{ width: `${Math.min(100, userLevel * 12)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg">
        <h4 className="text-white mb-2">Emotional Regulation</h4>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                {Math.min(100, userLevel * 10)}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
              style={{ width: `${Math.min(100, userLevel * 10)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg">
        <h4 className="text-white mb-2">Social Navigation</h4>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200">
                {Math.min(100, userLevel * 14)}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
              style={{ width: `${Math.min(100, userLevel * 14)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DreamIntegration: React.FC<{ userLevel: number }> = ({ userLevel }) => (
  <div className="text-center p-4">
    <h3 className="text-xl text-white mb-2">Dream Integration</h3>
    <p className="text-white/70 mb-6">Connecting your aspirations with quantum consciousness</p>
    
    <div className="bg-black/30 p-6 rounded-lg">
      <div className="mb-4">
        <h4 className="text-white mb-2">Your Dream Essence</h4>
        <p className="text-white/70 italic">
          "To achieve harmony between mind, body, and spirit through conscious living."
        </p>
      </div>
      
      <div className="mb-4">
        <h4 className="text-white mb-2">Manifestation Progress</h4>
        <div className="w-full h-4 bg-gray-700 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-full"
            style={{ width: `${Math.min(100, userLevel * 10)}%` }}
          ></div>
        </div>
        <p className="text-white/70 text-sm mt-2">
          {Math.min(100, userLevel * 10)}% alignment with quantum field
        </p>
      </div>
      
      <div>
        <h4 className="text-white mb-2">Next Integration Step</h4>
        <p className="text-white/70 text-sm">
          Focus on heart-centered practices to deepen your connection with your dream essence.
        </p>
        <Button 
          variant="default" 
          size="sm" 
          className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          Begin Integration
        </Button>
      </div>
    </div>
  </div>
);

export default ConsciousnessView;
