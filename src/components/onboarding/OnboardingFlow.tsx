
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DreamCaptureForm } from './DreamCaptureForm';
import { AlternativePathForm } from './AlternativePathForm';
import { ConsciousnessAssessment } from './ConsciousnessAssessment';
import { VisualSystem } from '@/components/visual-foundation';

type OnboardingStep = 'welcome' | 'dream-capture' | 'alternative-path' | 'assessment' | 'complete';

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [pathChoice, setPathChoice] = useState<'dream' | 'discovery' | null>(null);
  
  // Check if user has completed onboarding before
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      const dreamCaptureCompleted = localStorage.getItem('dreamCaptureCompleted');
      const discoveryPathSelected = localStorage.getItem('discoveryPathSelected');
      const initialAssessmentCompleted = localStorage.getItem('initialAssessmentCompleted');
      
      // If all steps completed, skip to dashboard
      if (dreamCaptureCompleted || discoveryPathSelected) {
        if (initialAssessmentCompleted) {
          navigate('/dashboard');
        } else {
          setCurrentStep('assessment');
        }
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate]);
  
  const handlePathSelect = (path: 'dream' | 'discovery') => {
    setPathChoice(path);
    setCurrentStep(path === 'dream' ? 'dream-capture' : 'alternative-path');
  };
  
  const handleSkipToAssessment = () => {
    setCurrentStep('assessment');
  };
  
  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="max-w-3xl mx-auto text-center space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Begin Your Quantum Journey</h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Your path to expanded consciousness starts with a simple choice. 
                Which approach resonates with you?
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 pt-8">
              <div 
                onClick={() => handlePathSelect('dream')}
                className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/30"
              >
                <h3 className="text-2xl font-semibold text-purple-400 mb-3">Dream-Driven Path</h3>
                <p className="text-white/70 mb-6">
                  I have a clear dream, aspiration, or goal I want to manifest through my consciousness journey.
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  Define My Dream
                </Button>
              </div>
              
              <div 
                onClick={() => handlePathSelect('discovery')}
                className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30"
              >
                <h3 className="text-2xl font-semibold text-blue-400 mb-3">Discovery Path</h3>
                <p className="text-white/70 mb-6">
                  I prefer to explore possibilities first and discover my true aspirations through the journey itself.
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  Explore Possibilities
                </Button>
              </div>
            </div>
            
            {user && (
              <div className="pt-4">
                <button 
                  onClick={handleSkipToAssessment} 
                  className="text-white/50 hover:text-white/80 text-sm underline underline-offset-4"
                >
                  Skip to consciousness assessment
                </button>
              </div>
            )}
          </div>
        );
      
      case 'dream-capture':
        return <DreamCaptureForm />;
        
      case 'alternative-path':
        return <AlternativePathForm />;
        
      case 'assessment':
        return <ConsciousnessAssessment />;
        
      case 'complete':
        return (
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">Onboarding Complete</h2>
            <p className="text-white/80">
              Your journey has begun. Let's continue to your dashboard.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Go to Dashboard
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <VisualSystem showBackground={true} showMetatronsCube={true} backgroundIntensity="high">
      <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center">
        {renderStep()}
      </div>
    </VisualSystem>
  );
}

export default OnboardingFlow;
