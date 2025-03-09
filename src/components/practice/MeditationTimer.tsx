
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MeditationTimerProps {
  initialDuration?: number;
  onComplete?: (duration: number) => void;
  className?: string;
}

const MeditationTimer: React.FC<MeditationTimerProps> = ({
  initialDuration = 5, // Default 5 minutes
  onComplete,
  className
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60); // Convert to seconds
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  
  // Calculate progress percentage
  const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start the timer
  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      
      intervalRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        const remaining = Math.max(0, duration * 60 - elapsedSeconds);
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          handleComplete();
        }
      }, 1000);
    }
  };
  
  // Pause the timer
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedTimeRef.current = Date.now() - (startTimeRef.current || 0);
    setIsPaused(true);
  };
  
  // Reset the timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(duration * 60);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setIsCompleted(false);
  };
  
  // Handle timer completion
  const handleComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    setIsCompleted(true);
    if (onComplete) {
      onComplete(duration);
    }
  };
  
  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Update timeRemaining when duration changes
  useEffect(() => {
    if (!isActive) {
      setTimeRemaining(duration * 60);
    }
  }, [duration, isActive]);
  
  return (
    <div className={cn("flex flex-col items-center space-y-6", className)}>
      {/* Timer Circle */}
      <div className="relative w-60 h-60">
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-700/30" />
        
        {/* Progress Circle */}
        <svg className="absolute inset-0 -rotate-90 transform" width="100%" height="100%">
          <circle
            cx="50%"
            cy="50%"
            r="calc(50% - 10px)"
            strokeWidth="8"
            fill="transparent"
            stroke="rgba(60, 60, 80, 0.2)"
            strokeLinecap="round"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="calc(50% - 10px)"
            strokeWidth="8"
            fill="transparent"
            stroke="url(#gradient)"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ type: "spring", stiffness: 30 }}
            strokeDasharray="100"
            strokeDashoffset="100"
            style={{ strokeDashoffset: (100 - progress).toString() }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white mb-2">
            {formatTime(timeRemaining)}
          </span>
          <span className="text-sm text-white/70">
            {isCompleted ? "Meditation Complete" : isActive ? "Meditating..." : "Ready to begin"}
          </span>
        </div>
      </div>
      
      {/* Duration Selection */}
      {!isActive && !isCompleted && (
        <div className="flex space-x-2">
          {[5, 10, 15, 20].map((mins) => (
            <Button
              key={mins}
              variant={duration === mins ? "default" : "outline"}
              className={`px-3 py-1 ${
                duration === mins 
                  ? "bg-gradient-to-r from-purple-700 to-indigo-700" 
                  : "bg-gray-800/50"
              }`}
              onClick={() => setDuration(mins)}
            >
              {mins} min
            </Button>
          ))}
        </div>
      )}
      
      {/* Control Buttons */}
      <div className="flex space-x-4">
        {isCompleted ? (
          <Button
            variant="default"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            onClick={resetTimer}
          >
            <Check className="mr-2 h-4 w-4" />
            Done
          </Button>
        ) : isActive ? (
          <>
            <Button
              variant="outline"
              className="border-gray-600 bg-gray-800/50"
              onClick={resetTimer}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="default"
              className={`bg-gradient-to-r ${
                isPaused
                  ? "from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  : "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              }`}
              onClick={isPaused ? startTimer : pauseTimer}
            >
              {isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={startTimer}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Meditation
          </Button>
        )}
      </div>
    </div>
  );
};

export default MeditationTimer;
