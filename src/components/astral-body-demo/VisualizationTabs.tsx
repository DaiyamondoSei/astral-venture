
import React, { memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AstralBody from '@/components/entry-animation/AstralBody';
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody';
import { motion } from 'framer-motion';

interface VisualizationTabsProps {
  energyPoints: number;
}

// Use memo to prevent unnecessary re-renders of complex visualizations
const VisualizationTabs: React.FC<VisualizationTabsProps> = memo(({ energyPoints }) => {
  return (
    <Tabs defaultValue="cosmic" className="w-full">
      <TabsList className="w-full max-w-sm mx-auto mb-6 bg-black/40 border border-white/10">
        <TabsTrigger 
          value="cosmic" 
          className="w-1/2 data-[state=active]:bg-quantum-500/30 data-[state=active]:text-white"
        >
          Cosmic Version
        </TabsTrigger>
        <TabsTrigger 
          value="classic" 
          className="w-1/2 data-[state=active]:bg-quantum-500/30 data-[state=active]:text-white"
        >
          Classic Version
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="cosmic" className="mt-0">
        <motion.div 
          className="glass-card border border-quantum-500/20 p-8 md:p-12 max-w-md mx-auto relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced background aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-quantum-900/30"></div>
          
          {/* Cosmic energy particles */}
          {energyPoints > 300 && Array.from({ length: Math.min(Math.floor(energyPoints / 200), 12) }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full bg-white/80"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 50],
                y: [0, (Math.random() - 0.5) * 50],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
          
          <div className="relative z-10">
            <CosmicAstralBody energyPoints={energyPoints} />
          </div>
        </motion.div>
        
        <motion.p 
          className="text-center mt-8 text-white/70 max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          This visualization represents your quantum energy field as it extends through the universal consciousness network
        </motion.p>
      </TabsContent>
      
      <TabsContent value="classic" className="mt-0">
        <motion.div 
          className="bg-black/30 backdrop-blur-md p-8 rounded-xl max-w-lg mx-auto border border-white/10 shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Classic background aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-b from-quantum-900/20 to-astral-900/20"></div>
          
          <div className="relative z-10">
            <AstralBody />
          </div>
        </motion.div>
        
        <motion.p 
          className="text-center mt-8 text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          This visualization represents your energy field in the quantum realm
        </motion.p>
      </TabsContent>
    </Tabs>
  );
});

VisualizationTabs.displayName = 'VisualizationTabs';

export default VisualizationTabs;
