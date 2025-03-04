
import React, { memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AstralBody from '@/components/entry-animation/AstralBody';
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody';

interface VisualizationTabsProps {
  energyPoints: number;
}

// Use memo to prevent unnecessary re-renders of complex visualizations
const VisualizationTabs: React.FC<VisualizationTabsProps> = memo(({ energyPoints }) => {
  return (
    <Tabs defaultValue="cosmic" className="w-full">
      <TabsList className="w-full max-w-sm mx-auto mb-6">
        <TabsTrigger value="cosmic" className="w-1/2">Cosmic Version</TabsTrigger>
        <TabsTrigger value="classic" className="w-1/2">Classic Version</TabsTrigger>
      </TabsList>
      
      <TabsContent value="cosmic" className="mt-0">
        <div className="glass-card p-8 md:p-12 max-w-md mx-auto">
          <CosmicAstralBody energyPoints={energyPoints} />
        </div>
        
        <p className="text-center mt-8 text-white/70 max-w-md mx-auto">
          This visualization represents your quantum energy field as it extends through the universal consciousness network
        </p>
      </TabsContent>
      
      <TabsContent value="classic" className="mt-0">
        <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl max-w-lg mx-auto">
          <AstralBody />
        </div>
        
        <p className="text-center mt-8 text-white/70">
          This visualization represents your energy field in the quantum realm
        </p>
      </TabsContent>
    </Tabs>
  );
});

VisualizationTabs.displayName = 'VisualizationTabs';

export default VisualizationTabs;
