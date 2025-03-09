
import React, { useEffect, useState } from 'react';
import { VisualSystem } from '@/components/visual-foundation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const EntryAnimationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        // Check if user has either dream or discovery path set
        const dreamCaptureCompleted = localStorage.getItem('dreamCaptureCompleted');
        const discoveryPathSelected = localStorage.getItem('discoveryPathSelected');
        const initialAssessmentCompleted = localStorage.getItem('initialAssessmentCompleted');
        
        // All steps must be completed for onboarding to be complete
        setOnboardingComplete(
          (!!dreamCaptureCompleted || !!discoveryPathSelected) && 
          !!initialAssessmentCompleted
        );
        
        // Check for user preferences in database
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        if (!error && data?.preferences?.completedOnboarding) {
          setOnboardingComplete(true);
        }
        
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user]);
  
  // Handle navigation based on onboarding status
  const handleBeginJourney = () => {
    if (user) {
      if (onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } else {
      navigate('/login');
    }
  };
  
  // Show loading state while checking onboarding status
  if (user && loadingStatus) {
    return (
      <VisualSystem showBackground={true} showMetatronsCube={true} backgroundIntensity="high">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-white text-xl">Preparing your journey...</div>
        </div>
      </VisualSystem>
    );
  }
  
  return (
    <VisualSystem showBackground={true} showMetatronsCube={true} backgroundIntensity="high">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Welcome to Quantum Consciousness
          </h1>
          
          <p className="text-xl text-white/80">
            Begin your journey through expanded awareness and sacred geometry.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
              onClick={handleBeginJourney}
            >
              {user 
                ? onboardingComplete 
                  ? 'Continue Journey' 
                  : 'Begin Journey'
                : 'Sign In to Begin'
              }
            </Button>
            
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={() => navigate('/')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </VisualSystem>
  );
};

export default EntryAnimationPage;
