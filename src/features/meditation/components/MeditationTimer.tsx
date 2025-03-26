
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MeditationTimerProps {
  initialDuration?: number;
  onComplete?: () => void;
  onStart?: () => void;
  onPause?: () => void;
}

const MeditationTimer: React.FC<MeditationTimerProps> = ({
  initialDuration = 5,
  onComplete,
  onStart,
  onPause
}) => {
  const [duration, setDuration] = useState(initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // Reset timer when duration changes
  useEffect(() => {
    setTimeRemaining(duration * 60);
    setIsComplete(false);
  }, [duration]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      setIsActive(false);
      setIsComplete(true);
      
      // Show notification
      toast({
        title: "Meditation Complete",
        description: `You've completed a ${duration} minute meditation session.`,
      });
      
      if (onComplete) onComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, onComplete, duration, toast]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startTimer = useCallback(() => {
    setIsActive(true);
    if (onStart) onStart();
  }, [onStart]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
    if (onPause) onPause();
  }, [onPause]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsComplete(false);
    setTimeRemaining(duration * 60);
  }, [duration]);

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-0">
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Meditation Timer</h2>
          
          <div className="text-6xl font-mono mb-6">
            {formatTime(timeRemaining)}
          </div>
          
          {!isActive && !isComplete && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm mb-2">
                  Duration: {duration} minutes
                </label>
                <Slider
                  min={1}
                  max={60}
                  step={1}
                  value={[duration]}
                  onValueChange={(val) => setDuration(val[0])}
                  disabled={isActive}
                />
                <div className="flex justify-between text-xs">
                  <span>1 min</span>
                  <span>60 min</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-4 mt-6">
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
      </CardContent>
    </Card>
  );
};

export default MeditationTimer;
