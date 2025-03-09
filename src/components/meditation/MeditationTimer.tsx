
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import HumanSilhouette from '@/components/entry-animation/cosmic/silhouette/HumanSilhouette';

interface MeditationTimerProps {
  defaultDuration?: number; // in minutes
  onComplete?: (duration: number) => void;
  showChakras?: boolean;
  activatedChakras?: number[];
}

const MeditationTimer: React.FC<MeditationTimerProps> = ({
  defaultDuration = 5,
  onComplete,
  showChakras = true,
  activatedChakras = []
}) => {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate chakra intensity based on progress
  const getChakraIntensity = useCallback((chakraIndex: number) => {
    const baseIntensity = 0.3;
    const progressEffect = progress * 0.7;
    
    // If this chakra is activated, give it more intensity
    const isActivated = activatedChakras.includes(chakraIndex);
    const activationBonus = isActivated ? 0.3 : 0;
    
    // Make some chakras more prominent during specific progress points
    let phaseBonus = 0;
    
    if (progress < 0.3) {
      // Root and sacral more active in early meditation
      if (chakraIndex === 0 || chakraIndex === 1) {
        phaseBonus = 0.2;
      }
    } else if (progress < 0.6) {
      // Solar plexus and heart more active in mid meditation
      if (chakraIndex === 2 || chakraIndex === 3) {
        phaseBonus = 0.2;
      }
    } else {
      // Throat, third eye, and crown more active in later meditation
      if (chakraIndex === 4 || chakraIndex === 5 || chakraIndex === 6) {
        phaseBonus = 0.2;
      }
    }
    
    return Math.min(baseIntensity + progressEffect + activationBonus + phaseBonus, 1);
  }, [progress, activatedChakras]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          const newProgress = 1 - (newTime / (duration * 60));
          setProgress(newProgress);
          return newTime;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsCompleted(true);
      if (onComplete) {
        onComplete(duration);
      }
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, duration, onComplete]);
  
  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    setProgress(0);
    setIsCompleted(false);
  };
  
  // Handle duration change
  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setDuration(newDuration);
    setTimeLeft(newDuration * 60);
    setProgress(0);
  };
  
  return (
    <div className="relative w-full max-w-md mx-auto rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 p-6 shadow-lg">
      {/* Human silhouette visualization */}
      <div className="mb-8 w-full max-w-[200px] mx-auto">
        <HumanSilhouette 
          showChakras={showChakras}
          showDetails={progress > 0.3}
          showIllumination={progress > 0.5}
          showFractal={progress > 0.7}
          showTranscendence={progress > 0.9}
          showInfinity={isCompleted}
          baseProgressPercentage={progress * 100}
          getChakraIntensity={getChakraIntensity}
          activatedChakras={activatedChakras}
        />
      </div>
      
      {/* Timer display */}
      <div className="text-center mb-8">
        <motion.div 
          className="text-4xl font-mono font-light text-white"
          animate={isActive ? { scale: [1, 1.03, 1] } : {}}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0, repeatType: "reverse" }}
        >
          {formatTime(timeLeft)}
        </motion.div>
        
        <div className="mt-2 text-white/60 text-sm">
          {isActive ? "Meditating..." : isCompleted ? "Meditation Complete" : "Set your meditation time"}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
        <motion.div 
          className="h-full bg-gradient-to-r from-quantum-400 to-quantum-600"
          initial={{ width: '0%' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {/* Duration slider (only shown when timer is not active) */}
      {!isActive && !isCompleted && (
        <div className="mb-8">
          <div className="flex justify-between text-white/60 text-xs mb-2">
            <span>1 min</span>
            <span>{duration} min</span>
            <span>20 min</span>
          </div>
          <Slider
            value={[duration]}
            min={1}
            max={20}
            step={1}
            onValueChange={handleDurationChange}
            className="my-4"
          />
        </div>
      )}
      
      {/* Control buttons */}
      <div className="flex justify-center space-x-4">
        {isCompleted ? (
          <Button
            className="bg-green-600 hover:bg-green-500 text-white"
            onClick={resetTimer}
          >
            <Check className="mr-2 w-4 h-4" />
            Complete
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="border-white/20 text-white"
              onClick={resetTimer}
              disabled={!isActive && timeLeft === duration * 60}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              className={isActive 
                ? "bg-quantum-600 hover:bg-quantum-500 text-white" 
                : "bg-quantum-500 hover:bg-quantum-400 text-white"}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? (
                <>
                  <Pause className="mr-2 w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 w-4 h-4" />
                  {timeLeft < duration * 60 ? "Resume" : "Begin"}
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MeditationTimer;
