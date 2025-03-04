
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import OnboardingFlow from '@/components/OnboardingFlow';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const handleOnboardingComplete = (userData: any) => {
    // In a real app, we would save this data to a backend
    console.log('Onboarding completed:', userData);
    navigate('/dashboard');
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
        {!showOnboarding ? (
          <div className="text-center space-y-8 animate-fade-in max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium glow-text tracking-tight leading-tight">
              Your Quantum Nexus to Expanded Consciousness
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Discover your true potential through gamified energy work, 
              astral exploration, and self-discovery practices.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
              <Button 
                className="astral-button text-lg py-6 px-8"
                onClick={() => setShowOnboarding(true)}
              >
                Begin Your Journey
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  title: "Energy Work",
                  description: "Learn to sense and direct subtle energies for healing and growth."
                },
                {
                  title: "Astral Exploration",
                  description: "Venture beyond physical limitations into expanded states of awareness."
                },
                {
                  title: "Self Mastery",
                  description: "Develop mental discipline and emotional intelligence through practice."
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-card p-6 text-center animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <h3 className="text-lg font-display font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </div>
    </Layout>
  );
};

export default Index;
