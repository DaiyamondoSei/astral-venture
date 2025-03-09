
import React from 'react';
import { VisualSystem } from '@/components/visual-foundation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EntryAnimationPage = () => {
  const navigate = useNavigate();
  
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
              onClick={() => navigate('/dashboard')}
            >
              Begin Journey
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
