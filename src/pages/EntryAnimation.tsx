
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import OrbToAstralTransition from '@/components/OrbToAstralTransition';
import { Button } from '@/components/ui/button';

const EntryAnimationPage = () => {
  const navigate = useNavigate();
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [futureMessage, setFutureMessage] = useState('');
  
  const handleAnimationComplete = () => {
    setAnimationCompleted(true);
    
    // Generate a personalized message from the "future self"
    const messages = [
      "Your path to inner awakening begins with stillness",
      "The quantum field responds to your conscious intention",
      "Your future self is already aligned with your highest purpose",
      "Today's practice builds the foundation for tomorrow's enlightenment",
      "The energy you cultivate now ripples through your entire timeline",
      "Your astral field is resonating with unlimited potential"
    ];
    
    setFutureMessage(messages[Math.floor(Math.random() * messages.length)]);
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <Layout className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-lg">
        <OrbToAstralTransition onComplete={handleAnimationComplete} />
        
        {animationCompleted && (
          <div className="text-center mt-6 animate-fade-in">
            <p className="text-white/90 mb-4 font-display text-xl">
              Message from your future self:
            </p>
            <p className="text-white/80 mb-6 italic">
              "{futureMessage}"
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
