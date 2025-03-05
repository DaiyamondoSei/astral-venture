
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { askAIAssistant } from '@/services/ai/aiService';
import { Sparkles, Play, Pause, SkipForward, Timer } from 'lucide-react';

interface AIGuidedPracticeProps {
  practiceType?: 'meditation' | 'breathwork' | 'reflection' | 'visualization';
  duration?: number; // in minutes
  chakraFocus?: number;
}

const AIGuidedPractice: React.FC<AIGuidedPracticeProps> = ({
  practiceType = 'meditation',
  duration = 5,
  chakraFocus
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [guidanceSteps, setGuidanceSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Fetch AI-generated practice guidance
  useEffect(() => {
    const generatePracticeGuidance = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        let promptContext = `Create a ${duration}-minute guided ${practiceType} practice`;
        
        if (chakraFocus !== undefined) {
          const chakraNames = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
          promptContext += ` focusing on the ${chakraNames[chakraFocus]} chakra`;
        }
        
        const response = await askAIAssistant({
          question: promptContext,
          context: promptContext,
        }, user.id);
        
        // Process the AI response into steps
        // For our simple simulation, we'll just divide the text by sentences
        const steps = response.answer
          .split('. ')
          .filter(s => s.trim().length > 10)
          .map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
        
        // Add standard beginning and ending
        const processedSteps = [
          `Welcome to your ${duration}-minute guided ${practiceType} practice.`,
          `Find a comfortable position and gently close your eyes.`,
          `Take a deep breath in... and slowly exhale.`,
          ...steps,
          `As we conclude this practice, take a few more deep breaths.`,
          `When you're ready, slowly open your eyes and return to the present moment.`,
          `Thank you for your practice today.`
        ];
        
        setGuidanceSteps(processedSteps);
      } catch (error) {
        console.error('Error generating practice guidance:', error);
        // Fallback guidance
        setGuidanceSteps([
          `Welcome to your ${duration}-minute guided ${practiceType} practice.`,
          `Find a comfortable position and gently close your eyes.`,
          `Take a deep breath in... and slowly exhale.`,
          `Focus on your breath, allowing your mind to become still.`,
          `Continue breathing deeply and naturally.`,
          `As we conclude this practice, take a few more deep breaths.`,
          `When you're ready, slowly open your eyes and return to the present moment.`,
          `Thank you for your practice today.`
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    generatePracticeGuidance();
  }, [practiceType, duration, chakraFocus, user]);
  
  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle next step
  const nextStep = () => {
    if (currentStep < guidanceSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          // Move to next step when appropriate
          if (time % Math.floor((duration * 60) / guidanceSteps.length) === 0) {
            nextStep();
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeRemaining <= 0) {
      setIsPlaying(false);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, guidanceSteps.length, duration]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="glass-card-dark border-quantum-500/20">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Sparkles size={16} className="text-quantum-400" />
          {`Guided ${practiceType.charAt(0).toUpperCase() + practiceType.slice(1)}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="min-h-[100px] flex items-center justify-center">
            <p className="text-white/80 text-center">
              {guidanceSteps[currentStep] || "Preparing your practice..."}
            </p>
          </div>
        )}
        
        <div className="mt-4 flex justify-center items-center text-white/70">
          <Timer size={16} className="mr-2 text-quantum-400" />
          {formatTime(timeRemaining)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-12 h-12 rounded-full p-0 border-quantum-400/30 hover:bg-quantum-500/10"
          onClick={togglePlay}
          disabled={loading || guidanceSteps.length === 0}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-12 h-12 rounded-full p-0 border-quantum-400/30 hover:bg-quantum-500/10"
          onClick={nextStep}
          disabled={loading || currentStep >= guidanceSteps.length - 1 || !isPlaying}
        >
          <SkipForward size={18} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIGuidedPractice;
