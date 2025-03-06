
import React from 'react';
import { 
  WelcomeStep,
  SacredGeometryStep,
  ChakrasStep,
  EnergyPointsStep,
  MeditationStep,
  ReflectionStep,
  CompleteStep
} from './steps';

interface StepContentProps {
  step: string;
  onInteraction?: (interactionType: string, stepId: string) => void;
}

const StepContent: React.FC<StepContentProps> = ({ step, onInteraction }) => {
  switch (step) {
    case 'welcome':
      return <WelcomeStep onInteraction={onInteraction} />;
      
    case 'sacred-geometry':
      return <SacredGeometryStep onInteraction={onInteraction} />;
      
    case 'chakras':
      return <ChakrasStep onInteraction={onInteraction} />;
      
    case 'energy-points':
      return <EnergyPointsStep onInteraction={onInteraction} />;
      
    case 'meditation':
      return <MeditationStep onInteraction={onInteraction} />;
      
    case 'reflection':
      return <ReflectionStep onInteraction={onInteraction} />;
      
    case 'complete':
      return <CompleteStep onInteraction={onInteraction} />;
      
    default:
      return <div>Unknown step</div>;
  }
};

export default StepContent;
