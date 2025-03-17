
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

/**
 * Onboarding Page
 * 
 * Initial user onboarding experience
 */
const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleContinue = () => {
    navigate('/entry');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quantum-900 to-quantum-950">
      <Card className="w-full max-w-md mx-4 bg-quantum-800/40 border-quantum-700 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-quantum-100">Welcome to the Journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-quantum-200">
            You're about to embark on a transformative experience to expand your consciousness
            and discover new dimensions of your inner self.
          </p>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-quantum-100">What to expect:</h3>
            <ul className="space-y-2 text-quantum-200">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <span>Chakra activation and balancing</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span>Guided meditation practices</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span>Energy tracking and enhancement</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <span>Dream recording and analysis</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                <span>Astral projection preparation</span>
              </li>
            </ul>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={handleContinue}
          >
            Begin Your Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
