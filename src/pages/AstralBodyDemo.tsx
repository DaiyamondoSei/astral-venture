
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AstralBody from '@/components/entry-animation/AstralBody';
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useUserProfile } from '@/hooks/useUserProfile';
import { incrementEnergyPoints } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import EnergyAvatar from '@/components/EnergyAvatar';
import ProgressTracker from '@/components/ProgressTracker';

const AstralBodyDemo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile, updateUserProfile } = useUserProfile();
  const { toast } = useToast();
  const [simulatedPoints, setSimulatedPoints] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  
  // Get the actual energy points from the user profile, or use simulated points
  const energyPoints = isSimulating 
    ? simulatedPoints 
    : (userProfile?.energy_points || 0);
  
  const handleAddPoints = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to add energy points",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Add 50 energy points to the user's profile
      const newPoints = await incrementEnergyPoints(user.id, 50);
      
      // Update the local state
      updateUserProfile({ energy_points: newPoints });
      
      toast({
        title: "Energy Increased!",
        description: "+50 energy points added to your astral body",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add energy points",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Layout>
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          onClick={() => navigate('/')}
          className="mb-6"
          variant="outline"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
            <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          Back to Home
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-display text-center mb-8 text-blue-50 glow-text">
            Astral Body Visualization
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 backdrop-blur-sm bg-black/30">
              <h2 className="text-xl font-display mb-4 text-blue-50">Energy Progress</h2>
              
              {userProfile ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <EnergyAvatar level={Math.floor(energyPoints / 50) + 1} className="w-16 h-16" />
                    <div>
                      <div className="text-sm text-muted-foreground">Current Energy</div>
                      <div className="text-2xl font-display text-primary">{energyPoints} points</div>
                    </div>
                  </div>
                  
                  <ProgressTracker 
                    progress={Math.min(Math.round((energyPoints / 600) * 100), 100)} 
                    label="Astral Development" 
                  />
                  
                  <Button onClick={handleAddPoints} className="w-full">
                    Add 50 Energy Points
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>Sign in to track your energy progress</p>
                </div>
              )}
            </Card>
            
            <Card className="p-6 backdrop-blur-sm bg-black/30">
              <h2 className="text-xl font-display mb-4 text-blue-50">Simulation Mode</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Use the slider below to preview how your astral body will evolve with more energy points
              </p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <span>0 points</span>
                  <span>600 points</span>
                </div>
                
                <Slider
                  value={[simulatedPoints]}
                  onValueChange={(value) => setSimulatedPoints(value[0])}
                  max={600}
                  step={10}
                  className="mb-6"
                />
                
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Simulated: <span className="text-primary font-medium">{simulatedPoints} points</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsSimulating(!isSimulating)}
                  >
                    {isSimulating ? "Show Real Progress" : "Show Simulation"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
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
          
          <div className="mt-12 text-center">
            <p className="text-blue-200/80 mb-2 text-sm uppercase tracking-wider">Energy Thresholds</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/60">
              <div>30+ points: <span className="text-blue-300">Chakra Activation</span></div>
              <div>100+ points: <span className="text-blue-300">Aura Field</span></div>
              <div>200+ points: <span className="text-blue-300">Constellation Lines</span></div>
              <div>350+ points: <span className="text-blue-300">Body Illumination</span></div>
              <div>500+ points: <span className="text-blue-300">Full Radiance</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default AstralBodyDemo;
