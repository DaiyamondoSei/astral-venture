
import React, { memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { LazyAstralBody, LazyCosmicAstralBody } from '@/components/lazy';
import LazyLoadWrapper from '@/components/LazyLoadWrapper';

interface VisualizationTabsProps {
  energyPoints: number;
}

// Use memo to prevent unnecessary re-renders of complex visualizations
const VisualizationTabs: React.FC<VisualizationTabsProps> = memo(({ energyPoints }) => {
  return (
    <Tabs defaultValue="cosmic" className="w-full">
      <TabsList className="w-full max-w-sm mx-auto mb-8 glass-card border-quantum-500/20 shadow-lg">
        <TabsTrigger 
          value="cosmic" 
          className="w-1/2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quantum-500/40 data-[state=active]:to-astral-500/30 data-[state=active]:text-white transition-all duration-300"
        >
          Cosmic Version
        </TabsTrigger>
        <TabsTrigger 
          value="classic" 
          className="w-1/2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quantum-500/40 data-[state=active]:to-astral-500/30 data-[state=active]:text-white transition-all duration-300"
        >
          Classic Version
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="cosmic" className="mt-0">
        <motion.div 
          className="glass-card border border-quantum-500/30 p-8 md:p-12 max-w-md mx-auto relative overflow-hidden shadow-[0_0_25px_rgba(138,92,246,0.15)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Enhanced background aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-quantum-900/20 to-quantum-900/30"></div>
          
          {/* Cosmic energy particles */}
          {energyPoints > 300 && Array.from({ length: Math.min(Math.floor(energyPoints / 200), 16) }).map((_, i) => (
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
                x: [0, (Math.random() - 0.5) * 60],
                y: [0, (Math.random() - 0.5) * 60],
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
            <LazyLoadWrapper>
              <LazyCosmicAstralBody energyPoints={energyPoints} />
            </LazyLoadWrapper>
          </div>
        </motion.div>
        
        <motion.div 
          className="text-center mt-8 text-white/70 max-w-md mx-auto space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="font-medium text-white/80">Quantum Energy Field Visualization</p>
          <p className="text-sm">Your energy field as it extends through the universal consciousness network</p>
        </motion.div>
      </TabsContent>
      
      <TabsContent value="classic" className="mt-0">
        <motion.div 
          className="glass-card border border-astral-500/20 p-8 rounded-xl max-w-lg mx-auto shadow-[0_0_25px_rgba(100,116,189,0.1)] relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Classic background aesthetic with improved gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-quantum-900/20 via-astral-900/15 to-astral-900/20"></div>
          
          <div className="relative z-10">
            <LazyLoadWrapper>
              <LazyAstralBody />
            </LazyLoadWrapper>
          </div>
        </motion.div>
        
        <motion.div 
          className="text-center mt-8 space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="font-medium text-white/80">Classic Energy Visualization</p>
          <p className="text-sm text-white/70">Your energy field in the quantum realm</p>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
});

VisualizationTabs.displayName = 'VisualizationTabs';

export default VisualizationTabs;
