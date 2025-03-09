
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import WelcomeStep from './step-content/steps/WelcomeStep';
import ChakrasStep from './step-content/steps/ChakrasStep';
import EnergyPointsStep from './step-content/steps/EnergyPointsStep';
import MeditationStep from './step-content/steps/MeditationStep';
import ReflectionStep from './step-content/steps/ReflectionStep';
import SacredGeometryStep from './step-content/steps/SacredGeometryStep';
import CompleteStep from './step-content/steps/CompleteStep';
import ConsciousnessAssessment from './ConsciousnessAssessment';
import { StepProps } from './step-content/types';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [consciousnessScore, setConsciousnessScore] = useState<number | null>(null);
  
  // Create a handler for CompleteStep
  const handleStepComplete = () => {
    if (step === steps.length - 1) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };
  
  // Define all the steps with their components
  const steps = [
    { title: "Welcome", component: <WelcomeStep onComplete={handleStepComplete} /> },
    { title: "Assessment", component: <ConsciousnessAssessment onComplete={setConsciousnessScore} /> },
    { title: "Sacred Geometry", component: <SacredGeometryStep onComplete={handleStepComplete} /> },
    { title: "Chakras", component: <ChakrasStep onComplete={handleStepComplete} /> },
    { title: "Energy Points", component: <EnergyPointsStep onComplete={handleStepComplete} /> },
    { title: "Meditation", component: <MeditationStep onComplete={handleStepComplete} /> },
    { title: "Reflection", component: <ReflectionStep onComplete={handleStepComplete} /> },
    { title: "Complete", component: <CompleteStep onComplete={onComplete} /> }
  ];
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md p-6 bg-black/30 backdrop-blur-md border-purple-300/30">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">{steps[step].title}</h2>
          <div className="text-white/60 text-sm">
            Step {step + 1} of {steps.length}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-700 rounded-full mb-6">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Step content */}
        <div className="mb-6">
          {steps[step].component}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </Button>
          
          <Button
            variant="default"
            onClick={handleNext}
            disabled={step === 1 && consciousnessScore === null}
            className="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            {step < steps.length - 1 ? 'Next' : 'Complete'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default OnboardingFlow;
