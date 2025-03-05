
import React from 'react';
import { cn } from "@/lib/utils";
import GlowEffect from '@/components/GlowEffect';

interface BreathingExerciseProps {
  breathCount: number;
  onBreath: () => void;
}

const BreathingExercise = ({ breathCount, onBreath }: BreathingExerciseProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onBreath();
    }
  };

  return (
    <div className="relative">
      <GlowEffect 
        className={cn(
          "w-40 h-40 mx-auto rounded-full bg-gradient-to-br transition-all duration-1000",
          "from-quantum-400/80 to-quantum-600/80 cursor-pointer"
        )}
        animation="breathe"
        color="rgba(138, 92, 246, 0.8)"
        intensity="high"
        onClick={onBreath}
      >
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center text-white"
          role="button"
          tabIndex={0}
          aria-label={`Breathe in and out. ${breathCount} of 3 breaths completed`}
          onKeyDown={handleKeyDown}
        >
          <div className="text-xl font-display mb-2">Breathe</div>
          <div className="text-sm">{breathCount} / 3</div>
        </div>
      </GlowEffect>
      <p className="text-white/80 mt-6">
        Tap or press Enter on the orb as you inhale deeply, then release.
      </p>
    </div>
  );
};

export default BreathingExercise;
