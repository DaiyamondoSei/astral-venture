
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GlassmorphicContainer } from '@/components/visual-foundation';
import { Sparkles, Star, Feather, Check } from 'lucide-react';

export type DreamFormData = {
  title: string;
  content: string;
  lucidity: number;
  emotionalTones: string[];
};

export function DreamCaptureForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<DreamFormData>({
    title: '',
    content: '',
    lucidity: 0,
    emotionalTones: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (field: keyof DreamFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmotionalToneToggle = (tone: string) => {
    setFormData(prev => {
      const tones = prev.emotionalTones.includes(tone)
        ? prev.emotionalTones.filter(t => t !== tone)
        : [...prev.emotionalTones, tone];
      return { ...prev, emotionalTones: tones };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your dream record.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Empty Dream Content",
        description: "Please describe your dream before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare dream record
      const dreamRecord = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        lucidity: formData.lucidity,
        emotional_tone: formData.emotionalTones,
        // Default values for other fields
        chakras_activated: ['heart', 'crown'],
        consciousness_depth: Math.min(10, Math.max(1, formData.lucidity * 2)),
        symbols: [],
        analysis_theme: 'Personal Growth',
        analysis_interpretation: 'Your dream reflects your aspirations and personal growth journey.',
        analysis_guidance: 'Consider reflecting on how this dream aligns with your conscious goals.'
      };
      
      // Save the dream to Supabase
      const { error } = await supabase
        .from('dreams')
        .insert(dreamRecord);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Dream Captured",
        description: "Your dream has been recorded successfully.",
      });
      
      // Store completion in localStorage
      localStorage.setItem('dreamCaptureCompleted', 'true');
      
      // Navigate to entry animation
      navigate('/entry-animation');
      
    } catch (error) {
      console.error('Error saving dream:', error);
      toast({
        title: "Error Saving Dream",
        description: "There was a problem saving your dream. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your dream or goal.",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && !formData.content.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe your dream in more detail.",
        variant: "destructive"
      });
      return;
    }
    
    setStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setStep(prevStep => Math.max(1, prevStep - 1));
  };

  // Available emotional tones
  const emotionalTones = [
    { value: 'joy', label: 'Joy', icon: <Star size={16} /> },
    { value: 'passion', label: 'Passion', icon: <Sparkles size={16} /> },
    { value: 'peace', label: 'Peace', icon: <Feather size={16} /> },
    { value: 'curiosity', label: 'Curiosity', icon: <Star size={16} /> },
    { value: 'wonder', label: 'Wonder', icon: <Sparkles size={16} /> },
    { value: 'transcendence', label: 'Transcendence', icon: <Feather size={16} /> }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <GlassmorphicContainer 
        className="p-6" 
        variant="quantum" 
        intensity="medium" 
        withGlow
      >
        {/* Step 1: Dream Title */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">Define Your Dream</h2>
              <p className="text-white/80 mt-2">What is the highest aspiration that resonates with your soul?</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dreamTitle" className="block text-sm font-medium text-white/90">
                Dream Title
              </label>
              <Input
                id="dreamTitle"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="A concise name for your dream or goal"
                className="bg-white/10 border-white/30 text-white"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 2: Dream Description */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">Describe Your Dream</h2>
              <p className="text-white/80 mt-2">Share the details of your aspiration so we can help manifest it</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dreamContent" className="block text-sm font-medium text-white/90">
                Dream Details
              </label>
              <Textarea
                id="dreamContent"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Describe your dream in detail, including how it would feel to achieve it..."
                rows={6}
                className="bg-white/10 border-white/30 text-white"
                required
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
                type="button" 
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Emotion & Energy */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">Energy & Emotion</h2>
              <p className="text-white/80 mt-2">Define the emotional resonance of your dream</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="lucidity" className="block text-sm font-medium text-white/90">
                  Intensity Level: {formData.lucidity}
                </label>
                <p className="text-xs text-white/60">
                  How strongly do you feel this dream calling to you? (0 = faint whisper, 5 = powerful calling)
                </p>
                <Slider
                  id="lucidity"
                  min={0}
                  max={5}
                  step={1}
                  value={[formData.lucidity]}
                  onValueChange={(value) => handleChange('lucidity', value[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-white/70">
                  <span>Subtle Feeling</span>
                  <span>Clear Vision</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Emotional Tones (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {emotionalTones.map((tone) => (
                    <div 
                      key={tone.value}
                      className={`
                        p-3 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-300
                        ${formData.emotionalTones.includes(tone.value) 
                          ? "bg-purple-600/40 border border-purple-500" 
                          : "bg-white/5 border border-white/10 hover:bg-white/10"}
                      `}
                      onClick={() => handleEmotionalToneToggle(tone.value)}
                    >
                      {tone.icon}
                      <span className="text-sm text-white/90">{tone.label}</span>
                      {formData.emotionalTones.includes(tone.value) && (
                        <Check size={14} className="ml-auto text-purple-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                {isSubmitting ? 'Capturing Dream...' : 'Complete'}
              </Button>
            </div>
          </div>
        )}
      </GlassmorphicContainer>
    </form>
  );
}
