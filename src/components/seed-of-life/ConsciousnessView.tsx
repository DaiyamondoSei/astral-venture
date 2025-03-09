
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

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
              <ChakraVisualization level={userLevel} />
            </TabsContent>
            
            <TabsContent value="progress" className="h-full">
              <ConsciousnessProgress level={userLevel} />
            </TabsContent>
            
            <TabsContent value="practices" className="h-full">
              <PracticeRecommendations level={userLevel} />
            </TabsContent>
            
            <TabsContent value="emotional" className="h-full">
              <EmotionalMatrix level={userLevel} />
            </TabsContent>
            
            <TabsContent value="dreams" className="h-full">
              <DreamIntegration level={userLevel} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
};

/**
 * Displays the chakra visualization component
 */
const ChakraVisualization: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-white/5 rounded-lg p-4 backdrop-blur text-white w-full">
        <h3 className="text-lg font-semibold mb-2">Chakra System - Level {level}</h3>
        <p className="text-white/70 mb-4">
          Your energetic centers are developing as you progress on your journey.
        </p>
        
        <div className="space-y-3">
          {/* Placeholder for chakra visualization that will be improved later */}
          {['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'].map((chakra, index) => (
            <div key={chakra} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ 
                  background: `hsl(${index * 51}, 70%, 50%)`,
                  boxShadow: `0 0 10px hsl(${index * 51}, 70%, 50%)`
                }}
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>{chakra}</span>
                  <span>{Math.min(100, Math.max(10, (level * 20) - (7-index) * 10))}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                  <div 
                    className="h-1 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, Math.max(10, (level * 20) - (7-index) * 10))}%`,
                      background: `hsl(${index * 51}, 70%, 50%)`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Displays the consciousness progress component
 */
const ConsciousnessProgress: React.FC<{ level: number }> = ({ level }) => {
  const abilities = [
    { name: 'Awareness', level: 1, description: 'Basic awareness of energy and consciousness' },
    { name: 'Presence', level: 2, description: 'Sustained present-moment awareness' },
    { name: 'Insight', level: 3, description: 'Deep insights into patterns and connections' },
    { name: 'Integration', level: 4, description: 'Integration of wisdom into daily life' },
    { name: 'Transcendence', level: 5, description: 'Transcending limited perspectives' }
  ];
  
  return (
    <div className="flex flex-col p-4">
      <div className="bg-white/5 rounded-lg p-4 backdrop-blur text-white">
        <h3 className="text-lg font-semibold mb-2">Consciousness Progress</h3>
        <p className="text-white/70 mb-4">
          Your journey through expanding consciousness unlocks new abilities.
        </p>
        
        <div className="space-y-3">
          {abilities.map((ability) => (
            <div key={ability.name} className="p-3 rounded-lg bg-white/5 relative overflow-hidden">
              {ability.level <= level ? (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
              ) : (
                <div className="absolute inset-0 bg-white/5" />
              )}
              <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{ability.name}</h4>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    ability.level <= level ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'
                  }`}>
                    {ability.level <= level ? 'Unlocked' : `Level ${ability.level}`}
                  </div>
                </div>
                <p className="text-sm text-white/70 mt-1">{ability.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Displays practice recommendations component
 */
const PracticeRecommendations: React.FC<{ level: number }> = ({ level }) => {
  const practices = [
    { name: 'Basic Mindfulness', duration: '5 min', benefit: 'Increases present awareness' },
    { name: 'Chakra Balancing', duration: '10 min', benefit: 'Harmonizes energy centers' },
    { name: 'Quantum Coherence', duration: '15 min', benefit: 'Creates coherent thought patterns' },
    { name: 'Cosmic Connection', duration: '20 min', benefit: 'Links individual to universal consciousness' }
  ];

  return (
    <div className="flex flex-col p-4">
      <div className="bg-white/5 rounded-lg p-4 backdrop-blur text-white">
        <h3 className="text-lg font-semibold mb-2">Recommended Practices</h3>
        <p className="text-white/70 mb-4">
          These practices are tailored to your current consciousness level.
        </p>
        
        <div className="space-y-3">
          {practices.map((practice, index) => (
            <div 
              key={practice.name} 
              className="p-3 rounded-lg bg-gradient-to-r from-white/5 to-white/10 flex justify-between items-center"
            >
              <div>
                <h4 className="font-medium">{practice.name}</h4>
                <p className="text-xs text-white/70">{practice.benefit}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-white/50">{practice.duration}</span>
                <button 
                  className="px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/40 text-xs text-white transition-colors"
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Displays emotional matrix component
 */
const EmotionalMatrix: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="flex flex-col p-4">
      <div className="bg-white/5 rounded-lg p-4 backdrop-blur text-white">
        <h3 className="text-lg font-semibold mb-2">Emotional Intelligence Matrix</h3>
        <p className="text-white/70 mb-4">
          Your emotional development is tracked across these dimensions.
        </p>
        
        <div className="space-y-4">
          {[
            { name: 'Self-Awareness', value: Math.min(100, level * 20 + 10), color: 'bg-blue-500' },
            { name: 'Self-Regulation', value: Math.min(100, level * 18 + 5), color: 'bg-green-500' },
            { name: 'Emotional Processing', value: Math.min(100, level * 19), color: 'bg-purple-500' },
            { name: 'Empathic Connection', value: Math.min(100, level * 17 + 15), color: 'bg-pink-500' }
          ].map((dimension) => (
            <div key={dimension.name} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">{dimension.name}</span>
                <span className="text-sm">{dimension.value}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${dimension.color}/60`}
                  style={{ width: `${dimension.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Displays dream integration component
 */
const DreamIntegration: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="flex flex-col p-4">
      <div className="bg-white/5 rounded-lg p-4 backdrop-blur text-white">
        <h3 className="text-lg font-semibold mb-2">Dream Integration</h3>
        <p className="text-white/70 mb-4">
          See how your dreams are manifesting through quantum consciousness.
        </p>
        
        <div className="p-4 rounded-lg bg-white/5 text-center">
          <p className="text-white/70 italic">
            "As you reach higher consciousness levels, your dreams will appear here, showing your journey toward manifestation."
          </p>
          <button className="mt-4 px-4 py-2 rounded bg-purple-500/30 hover:bg-purple-500/50 text-white transition-colors">
            Add Dream/Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessView;
