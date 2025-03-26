
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MeditationTimerProps {
  initialDuration?: number; // in minutes
  onComplete?: () => void;
  onStart?: () => void;
  onPause?: () => void;
}

/**
 * Simplified MeditationTimer Component
 * 
 * A basic meditation timer with minimal controls for duration and playback.
 */
const MeditationTimer: React.FC<MeditationTimerProps> = ({
  initialDuration = 5,
  onComplete,
  onStart,
  onPause
}) => {
  const [duration, setDuration] = useState(initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeRemaining(duration * 60);
    setIsComplete(false);
  }, [duration]);

  // Timer functionality
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      setIsRunning(false);
      setIsComplete(true);
      if (onComplete) onComplete();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, timeRemaining, onComplete]);

  const toggleTimer = () => {
    if (isComplete) {
      // Reset timer if complete
      setTimeRemaining(duration * 60);
      setIsComplete(false);
      setIsRunning(true);
      if (onStart) onStart();
    } else if (isRunning) {
      // Pause timer
      setIsRunning(false);
      if (onPause) onPause();
    } else {
      // Start or resume timer
      setIsRunning(true);
      if (onStart) onStart();
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meditation Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Duration: {duration} minutes</label>
          <Slider
            value={[duration]}
            min={1}
            max={30}
            step={1}
            onValueChange={(value) => {
              if (!isRunning) {
                setDuration(value[0]);
              }
            }}
            disabled={isRunning}
          />
        </div>

        <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">{formatTime(timeRemaining)}</div>
            <Button onClick={toggleTimer}>
              {isComplete ? 'Restart' : isRunning ? 'Pause' : 'Start'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeditationTimer;
