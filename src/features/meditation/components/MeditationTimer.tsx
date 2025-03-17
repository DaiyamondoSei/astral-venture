
import React, { useState, useEffect, useCallback } from 'react';
import { useMeditationTimer } from '../hooks/useMeditationTimer';

export interface MeditationTimerProps {
  duration?: number; // Duration in minutes
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  chakraFocus?: string[];
  className?: string;
}

/**
 * MeditationTimer Component
 * 
 * Displays a timer for meditation sessions with progress indicator
 */
export const MeditationTimer: React.FC<MeditationTimerProps> = ({
  duration = 10,
  onComplete,
  onProgress,
  chakraFocus = [],
  className = '',
}) => {
  const { 
    isRunning, 
    timeRemaining, 
    progress, 
    start, 
    pause, 
    reset 
  } = useMeditationTimer({
    duration,
    onComplete,
    onProgress,
    chakraFocus
  });
  
  // Format time as mm:ss
  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  return (
    <div className={`meditation-timer ${className}`}>
      <div className="flex flex-col items-center">
        <div className="relative w-64 h-64">
          {/* Circular progress indicator */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#2d3748"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#9f7aea"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-medium">
            {formatTime(timeRemaining)}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-4 mt-6">
          {isRunning ? (
            <button 
              onClick={pause}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
            >
              Pause
            </button>
          ) : (
            <button 
              onClick={start}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
            >
              {timeRemaining < duration * 60 ? 'Resume' : 'Start'}
            </button>
          )}
          
          <button 
            onClick={reset}
            className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
