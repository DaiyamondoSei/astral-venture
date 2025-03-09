
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Award } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface QuantumEnergyPointsProps {
  userId: string;
  initialPoints?: number;
  showLabel?: boolean;
  variant?: 'compact' | 'full';
  onPointsUpdate?: (points: number) => void;
}

const QuantumEnergyPoints: React.FC<QuantumEnergyPointsProps> = ({
  userId,
  initialPoints = 0,
  showLabel = true,
  variant = 'full',
  onPointsUpdate
}) => {
  const [points, setPoints] = useState(initialPoints);
  const [isAnimating, setIsAnimating] = useState(false);
  const [levelProgress, setLevelProgress] = useState(0);
  const [level, setLevel] = useState(1);
  
  useEffect(() => {
    // Calculate level and progress
    const newLevel = Math.max(1, Math.floor(points / 100) + 1);
    const prevLevelThreshold = (newLevel - 1) * 100;
    const nextLevelThreshold = newLevel * 100;
    const newLevelProgress = ((points - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100;
    
    setLevel(newLevel);
    setLevelProgress(newLevelProgress);
  }, [points]);
  
  useEffect(() => {
    if (initialPoints !== points) {
      setPoints(initialPoints);
    }
  }, [initialPoints]);
  
  useEffect(() => {
    if (!userId) return;
    
    // Set up real-time subscription for energy points
    const subscription = supabase
      .channel('quantum-energy-points')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'user_profiles',
        filter: `id=eq.${userId}` 
      }, (payload) => {
        const newPoints = payload.new.energy_points;
        const oldPoints = points;
        
        if (newPoints > oldPoints) {
          // Animate points increase
          setIsAnimating(true);
          toast({
            title: "+🌟 Energy Points",
            description: `You earned ${newPoints - oldPoints} quantum energy points!`,
          });
          
          setTimeout(() => setIsAnimating(false), 2000);
        }
        
        setPoints(newPoints);
        if (onPointsUpdate) onPointsUpdate(newPoints);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, points, onPointsUpdate]);
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center">
        <motion.div 
          className="w-5 h-5 flex items-center justify-center mr-1"
          animate={isAnimating ? { 
            scale: [1, 1.3, 1],
            rotate: [0, 15, -15, 0] 
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="w-4 h-4 text-quantum-300" />
        </motion.div>
        <motion.span 
          className="text-sm font-medium"
          animate={isAnimating ? { color: ['#FFFFFF', '#A78BFF', '#FFFFFF'] } : {}}
          transition={{ duration: 0.5 }}
        >
          {points}
        </motion.span>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-sm text-white/70">
          <span className="flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            Energy Points
          </span>
          <span className="flex items-center">
            <Award className="w-3 h-3 mr-1" />
            Level {level}
          </span>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <motion.div 
          className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-600"
          animate={isAnimating ? { 
            scale: [1, 1.3, 1],
            rotate: [0, 15, -15, 0] 
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <motion.div 
              className="text-lg font-medium"
              animate={isAnimating ? { color: ['#FFFFFF', '#A78BFF', '#FFFFFF'] } : {}}
              transition={{ duration: 0.5 }}
            >
              {points}
            </motion.div>
            <div className="text-xs text-white/60">
              {Math.round(levelProgress)}% to Level {level + 1}
            </div>
          </div>
          
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-quantum-400 to-quantum-600" 
              initial={{ width: '0%' }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumEnergyPoints;
