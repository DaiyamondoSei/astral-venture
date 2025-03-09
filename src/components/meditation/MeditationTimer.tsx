
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_DURATION = 5; // 5 minutes
const DEFAULT_INTERVAL = 60; // 60 seconds

const MeditationTimer = () => {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // Effect for countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      setIsActive(false);
      setIsComplete(true);
      
      // Play completion sound
      const audio = new Audio('/meditation-complete.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
      
      // Show completion notification
      toast({
        title: "Meditation Complete",
        description: `You've completed a ${duration} minute meditation session.`,
      });
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, duration, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsActive(true);
    setIsComplete(false);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsComplete(false);
    setTimeRemaining(duration * 60);
  };

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setDuration(newDuration);
    setTimeRemaining(newDuration * 60);
    setIsActive(false);
    setIsComplete(false);
  };

  return (
    <Card className="p-6 max-w-md mx-auto bg-white/10 backdrop-blur-md border-0">
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-semibold">Meditation Timer</h2>
        
        <div className="text-6xl font-mono">
          {formatTime(timeRemaining)}
        </div>
        
        {!isActive && !isComplete && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm">
                Duration: {duration} minutes
              </label>
              <Slider
                min={1}
                max={60}
                step={1}
                value={[duration]}
                onValueChange={handleDurationChange}
                disabled={isActive}
              />
              <div className="flex justify-between text-xs">
                <span>1 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          {!isActive && !isComplete && (
            <Button onClick={startTimer} size="lg" className="px-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Play className="mr-2 h-5 w-5" />
              Begin
            </Button>
          )}
          
          {isActive && (
            <Button onClick={pauseTimer} variant="outline" size="lg" className="px-8 rounded-full">
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </Button>
          )}
          
          {(isActive || timeRemaining < duration * 60) && (
            <Button onClick={resetTimer} variant="outline" size="lg" className="px-8 rounded-full">
              <RotateCcw className="mr-2 h-5 w-5" />
              Reset
            </Button>
          )}
          
          {isComplete && (
            <Button 
              onClick={resetTimer} 
              size="lg" 
              className="px-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500"
            >
              <Check className="mr-2 h-5 w-5" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MeditationTimer;
