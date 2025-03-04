
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlowEffect from './GlowEffect';
import { ArrowRight, Brain, Sparkles, Zap } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
  className?: string;
}

const OnboardingFlow = ({ onComplete, className }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    intention: '',
    experience: 'beginner', // beginner, intermediate, advanced
    areas: [] as string[]
  });

  const steps = [
    {
      title: "Welcome to Quanex",
      description: "Your journey to expanded consciousness begins here. Let's start by getting to know you.",
      fields: (
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <Input 
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              placeholder="Enter your name"
              className="bg-white/10 border-white/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Intention</label>
            <Input 
              value={userData.intention}
              onChange={(e) => setUserData({...userData, intention: e.target.value})}
              placeholder="Why are you here?"
              className="bg-white/10 border-white/20"
            />
          </div>
        </div>
      )
    },
    {
      title: "Energy Scan",
      description: "Let's assess your current energetic state to customize your journey.",
      fields: (
        <div className="space-y-6 mt-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Experience Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <div 
                  key={level}
                  className={cn(
                    "py-3 px-4 rounded-xl text-center cursor-pointer transition-all duration-300",
                    userData.experience === level 
                      ? "bg-quantum-500/30 border-2 border-quantum-400" 
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  )}
                  onClick={() => setUserData({...userData, experience: level})}
                >
                  <div className="capitalize font-medium">{level}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Areas of Interest</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {id: 'meditation', label: 'Meditation', icon: <Brain size={16} />},
                {id: 'energy', label: 'Energy Work', icon: <Zap size={16} />},
                {id: 'astral', label: 'Astral Travel', icon: <Sparkles size={16} />},
                {id: 'dreams', label: 'Lucid Dreams', icon: <Sparkles size={16} />}
              ].map((area) => (
                <div 
                  key={area.id}
                  className={cn(
                    "py-2 px-3 rounded-lg flex items-center space-x-2 cursor-pointer transition-all duration-300",
                    userData.areas.includes(area.id) 
                      ? "bg-quantum-500/30 border-2 border-quantum-400" 
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  )}
                  onClick={() => {
                    const newAreas = userData.areas.includes(area.id)
                      ? userData.areas.filter(a => a !== area.id)
                      : [...userData.areas, area.id];
                    setUserData({...userData, areas: newAreas});
                  }}
                >
                  {area.icon}
                  <div className="text-sm">{area.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Energy Scan Complete",
      description: "We've analyzed your energetic signature and prepared a personalized journey for you.",
      fields: (
        <div className="space-y-6 mt-8 flex flex-col items-center">
          <GlowEffect 
            className="w-32 h-32 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700 
                       flex items-center justify-center"
            animation="pulse"
          >
            <div className="text-white font-display text-4xl font-semibold">
              1
            </div>
          </GlowEffect>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Your Current Level</p>
            <p className="text-sm text-muted-foreground">Ready to begin your quantum journey</p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(userData);
    }
  };

  const isCurrentStepValid = () => {
    if (step === 0) {
      return userData.name.trim() !== '' && userData.intention.trim() !== '';
    }
    if (step === 1) {
      return userData.areas.length > 0;
    }
    return true;
  };

  return (
    <div className={cn(
      "w-full max-w-md mx-auto glass-card p-6 md:p-8 animate-fade-in",
      className
    )}>
      <div className="relative mb-8 h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="absolute h-full left-0 bg-gradient-to-r from-quantum-400 to-quantum-600 rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <h2 className="text-2xl font-display font-medium glow-text">{steps[step].title}</h2>
      <p className="mt-2 text-muted-foreground">{steps[step].description}</p>
      
      {steps[step].fields}
      
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!isCurrentStepValid()}
          className="astral-button"
        >
          {step === steps.length - 1 ? 'Begin Journey' : 'Continue'}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
