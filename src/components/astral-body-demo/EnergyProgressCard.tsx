
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { incrementEnergyPoints } from '@/integrations/supabase/client';
import EnergyAvatar from '@/components/EnergyAvatar';
import ProgressTracker from '@/components/ProgressTracker';

interface EnergyProgressCardProps {
  userProfile: any;
  updateUserProfile: (updates: any) => void;
  energyPoints: number;
  incrementAmount: number;
  setIncrementAmount: (amount: number) => void;
}

const EnergyProgressCard = ({ 
  userProfile, 
  updateUserProfile, 
  energyPoints, 
  incrementAmount, 
  setIncrementAmount 
}: EnergyProgressCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

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
      // Add energy points to the user's profile
      const newPoints = await incrementEnergyPoints(user.id, incrementAmount);
      
      // Update the local state
      updateUserProfile({ energy_points: newPoints });
      
      toast({
        title: "Energy Increased!",
        description: `+${incrementAmount} energy points added to your astral body`,
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
            progress={Math.min(Math.round((energyPoints / 2000) * 100), 100)} 
            label="Astral Development" 
          />
          
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map((amount) => (
                <Button 
                  key={amount}
                  variant={incrementAmount === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIncrementAmount(amount)}
                >
                  +{amount}
                </Button>
              ))}
            </div>
            <Button onClick={handleAddPoints} className="w-full">
              Add {incrementAmount} Energy Points
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          <p>Sign in to track your energy progress</p>
        </div>
      )}
    </Card>
  );
};

export default EnergyProgressCard;
