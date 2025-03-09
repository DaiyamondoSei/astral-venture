
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MeditationTimerProps {
  initialDuration: number;
  onComplete: (actualDuration: number) => void;
  chakraColors?: string[];
  className?: string;
}

const MeditationTimer: React.FC<MeditationTimerProps> = ({
  initialDuration,
  onComplete,
  chakraColors = [],
  className
}) => {
  // Convert minutes to seconds
  const totalSeconds = initialDuration * 60;
  
  const [timeRemaining, setTimeRemaining] = useState<number>(totalSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Calculate progress percentage
  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Toggle timer
  const toggleTimer = () => {
    if (isCompleted) return;
    
    if (isActive) {
      // Pause
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Start/Resume
      startTimeRef.current = startTimeRef.current || Date.now();
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer complete
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsActive(false);
            setIsCompleted(true);
            
            // Calculate actual duration in minutes
            const actualDuration = Math.round((Date.now() - startTimeRef.current!) / 60000);
            onComplete(actualDuration);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    setIsActive(!isActive);
  };
  
  // Reset timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeRemaining(totalSeconds);
    setIsActive(false);
    setIsCompleted(false);
    startTimeRef.current = null;
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Get gradient based on chakra colors or use default
  const getGradient = () => {
    if (chakraColors && chakraColors.length > 0) {
      return `conic-gradient(
        ${chakraColors.join(', ')}
      )`;
    }
    return 'conic-gradient(#A85CFF, #5CC9F5, #7ED957, #FFDE59, #FF9E43, #FF5757, #A85CFF)';
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6",
      "bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-800/50",
      className
    )}>
      <div className="relative w-64 h-64 mb-6">
        {/* Background circle */}
        <div 
          className="absolute inset-0 rounded-full opacity-20"
          style={{ background: getGradient() }}
        />
        
        {/* Progress circle */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{ 
            background: getGradient(),
            clipPath: `polygon(50% 50%, 50% 0%, ${progress > 75 ? '100% 0%, 100% 100%, 0% 100%, 0% 0%' : 
              progress > 50 ? '100% 0%, 100% 100%, 0% 100%' : 
              progress > 25 ? '100% 0%, 100% 100%' : '100% 0%'}, 50% 50%)`
          }}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: isActive ? 1 : 0.6 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Inner circle */}
        <div className="absolute inset-4 bg-gray-900 rounded-full flex items-center justify-center">
          <motion.div
            className="text-4xl font-semibold text-white"
            initial={{ scale: 1 }}
            animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
        </div>
        
        {/* Completion overlay */}
        {isCompleted && (
          <motion.div 
            className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-lg font-medium text-white">Meditation Complete</span>
          </motion.div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <Button
          onClick={toggleTimer}
          variant="outline"
          size="lg"
          className="rounded-full"
          disabled={isCompleted}
        >
          {isActive ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
          <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
        </Button>
        
        <Button
          onClick={resetTimer}
          variant="ghost"
          size="lg"
          className="rounded-full"
          disabled={isCompleted && timeRemaining === totalSeconds}
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default MeditationTimer;
