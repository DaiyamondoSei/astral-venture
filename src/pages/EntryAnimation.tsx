
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useEntryAnimationState } from '@/hooks/useEntryAnimationState';
import EntryAnimation from '@/components/EntryAnimation';
import { Button } from '@/components/ui/button';

const EntryAnimationPage = () => {
  const navigate = useNavigate();
  const [animationCompleted, setAnimationCompleted] = useState(false);
  
  const handleAnimationComplete = () => {
    setAnimationCompleted(true);
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <Layout className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-lg">
        <EntryAnimation onComplete={handleAnimationComplete} />
        
        {animationCompleted && (
          <div className="text-center mt-6 animate-fade-in">
            <p className="text-white/80 mb-4">
              Your astral field is now calibrated to your current energy frequency.
            </p>
            <Button 
              onClick={handleContinue}
              className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600"
            >
              Continue to Your Practice
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EntryAnimationPage;
