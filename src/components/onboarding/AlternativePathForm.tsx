
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GlassmorphicContainer } from '@/components/visual-foundation';
import { Compass, Search, Lightbulb, Map, Key, Book, Target } from 'lucide-react';

type ExplorationReason = 
  | 'uncertainty' 
  | 'exploration' 
  | 'curiosity' 
  | 'guidance' 
  | 'clarity' 
  | 'openness';

type InterestArea = 
  | 'meditation' 
  | 'energy_work' 
  | 'self_discovery' 
  | 'spiritual_growth' 
  | 'consciousness_expansion';

export function AlternativePathForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [reason, setReason] = useState<ExplorationReason | null>(null);
  const [interests, setInterests] = useState<InterestArea[]>([]);
  const [openResponse, setOpenResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleInterestToggle = (interest: InterestArea) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue your journey.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the user's preference for discovery path
      const userPreference = {
        user_id: user.id,
        preferences: {
          onboardingPath: 'discovery',
          explorationReason: reason,
          interestAreas: interests,
          openResponse: openResponse,
          completedOnboarding: true
        }
      };
      
      // Check if user already has preferences
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      let error;
      
      if (existingPrefs) {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({
            preferences: userPreference.preferences
          })
          .eq('user_id', user.id);
          
        error = updateError;
      } else {
        // Insert new preferences
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert(userPreference);
          
        error = insertError;
      }
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Journey Initialized",
        description: "Your discovery path has been set. Let's begin your journey!",
      });
      
      // Store completion in localStorage
      localStorage.setItem('discoveryPathSelected', 'true');
      
      // Navigate to entry animation
      navigate('/entry-animation');
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error Saving Preferences",
        description: "There was a problem setting your journey path. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !reason) {
      toast({
        title: "Selection Required",
        description: "Please select what brings you here today.",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && interests.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one area of interest.",
        variant: "destructive"
      });
      return;
    }
    
    setStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setStep(prevStep => Math.max(1, prevStep - 1));
  };

  // Discovery reasons with icons
  const reasonOptions = [
    { value: 'uncertainty', label: "I'm not sure what my dream is yet", icon: <Search size={20} /> },
    { value: 'exploration', label: "I want to explore possibilities first", icon: <Compass size={20} /> },
    { value: 'curiosity', label: "I'm curious about consciousness expansion", icon: <Lightbulb size={20} /> },
    { value: 'guidance', label: "I need guidance to find my purpose", icon: <Map size={20} /> },
    { value: 'clarity', label: "I want clarity before committing", icon: <Key size={20} /> },
    { value: 'openness', label: "I prefer to keep an open mind", icon: <Book size={20} /> }
  ];

  // Interest areas with icons
  const interestOptions = [
    { value: 'meditation', label: 'Meditation & Mindfulness', icon: <Target size={20} /> },
    { value: 'energy_work', label: 'Energy & Chakra Work', icon: <Lightbulb size={20} /> },
    { value: 'self_discovery', label: 'Self-Discovery', icon: <Search size={20} /> },
    { value: 'spiritual_growth', label: 'Spiritual Growth', icon: <Compass size={20} /> },
    { value: 'consciousness_expansion', label: 'Consciousness Expansion', icon: <Book size={20} /> }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <GlassmorphicContainer 
        className="p-6" 
        variant="astral" 
        intensity="medium" 
        withGlow
      >
        {/* Step 1: Reason for Exploration */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">Discovery Path</h2>
              <p className="text-white/80 mt-2">What brings you to the path of discovery today?</p>
            </div>
            
            <RadioGroup 
              value={reason || ''} 
              onValueChange={(value) => setReason(value as ExplorationReason)}
              className="space-y-3"
            >
              {reasonOptions.map((option) => (
                <div 
                  key={option.value}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 transition-colors duration-200 p-3 rounded-lg border border-white/10"
                >
                  <RadioGroupItem value={option.value} id={option.value} className="text-blue-400" />
                  <Label 
                    htmlFor={option.value} 
                    className="flex items-center gap-2 text-white cursor-pointer w-full"
                  >
                    <span className="text-blue-400">{option.icon}</span>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 2: Areas of Interest */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">Areas of Interest</h2>
              <p className="text-white/80 mt-2">Select areas you'd like to explore (choose all that apply)</p>
            </div>
            
            <div className="space-y-3">
              {interestOptions.map((option) => (
                <div 
                  key={option.value}
                  onClick={() => handleInterestToggle(option.value as InterestArea)}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-300
                    ${interests.includes(option.value as InterestArea) 
                      ? "bg-blue-600/30 border-blue-500" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"}
                  `}
                >
                  <span className="text-blue-400">{option.icon}</span>
                  <span className="text-white">{option.label}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Open Response */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">Your Aspirations</h2>
              <p className="text-white/80 mt-2">Share anything else about what you hope to discover</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="openResponse" className="block text-sm font-medium text-white/90">
                What do you hope to discover on your journey? (Optional)
              </label>
              <Textarea
                id="openResponse"
                value={openResponse}
                onChange={(e) => setOpenResponse(e.target.value)}
                placeholder="I'm hoping to discover..."
                rows={5}
                className="bg-white/10 border-white/30 text-white"
              />
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isSubmitting ? 'Starting Journey...' : 'Begin Journey'}
              </Button>
            </div>
          </div>
        )}
      </GlassmorphicContainer>
    </form>
  );
}
