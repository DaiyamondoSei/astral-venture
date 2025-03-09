
import React from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate('/');
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
};

export default OnboardingPage;
