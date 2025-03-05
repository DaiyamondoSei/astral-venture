
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartHandshake, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { calculateConsciousnessPoints } from './consciousnessAnalyzer';
import QuoteDisplay from './QuoteDisplay';
import ContemplationPrompt from './ContemplationPrompt';
import ReflectionInput from './ReflectionInput';
import ReflectionResults from './ReflectionResults';
import { quotes, reflectionPrompts } from './reflectionData';

const PhilosophicalReflection: React.FC = () => {
  // State for the reflection input
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Randomly select a quote and prompt each time component renders
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const randomPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];

  const handleSubmitReflection = () => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "You need to be signed in to submit reflections",
        variant: "destructive"
      });
      return;
    }
    
    if (reflection.trim().length < 20) {
      toast({
        title: "Reflection too short",
        description: "Please share more about your thoughts on consciousness (at least 20 characters)",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Analyze the reflection content for consciousness insights
      const { points, insights } = calculateConsciousnessPoints(reflection);
      
      // Store the reflection and points in localStorage for now
      try {
        const existingReflections = JSON.parse(localStorage.getItem('philosophicalReflections') || '[]');
        existingReflections.unshift({
          id: Date.now(),
          content: reflection,
          prompt: randomPrompt,
          points: points,
          timestamp: new Date().toISOString(),
          insights: insights
        });
        localStorage.setItem('philosophicalReflections', JSON.stringify(existingReflections));
      } catch (error) {
        console.error('Error storing philosophical reflection:', error);
      }
      
      setEarnedPoints(points);
      setHasSubmitted(true);
      
      toast({
        title: "Consciousness Reflection Submitted",
        description: `Thank you for your reflection! You earned ${points} consciousness points.`,
      });
    } catch (error: any) {
      console.error('Error submitting reflection:', error);
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewReflection = () => {
    setReflection('');
    setHasSubmitted(false);
    setEarnedPoints(0);
    
    // Refresh the page to get a new quote and prompt
    window.location.reload();
  };

  return (
    <Card className="glass-card border-quantum-500/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="font-display text-lg flex items-center">
            <Sparkles size={18} className="mr-2 text-primary" />
            Philosophical Reflection
          </CardTitle>
          <Badge variant="outline" className="bg-quantum-500/10 text-white/70">
            {randomQuote.theme}
          </Badge>
        </div>
        <CardDescription className="text-white/60">
          Contemplate the nature of consciousness and energy
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <QuoteDisplay quote={randomQuote} />
        <ContemplationPrompt prompt={randomPrompt} />
        
        {!hasSubmitted ? (
          <ReflectionInput 
            reflection={reflection}
            setReflection={setReflection}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitReflection}
          />
        ) : (
          <ReflectionResults 
            earnedPoints={earnedPoints}
            onNewReflection={handleNewReflection}
          />
        )}
        
        <div className="flex items-center pt-2 text-xs text-white/50">
          <HeartHandshake size={14} className="mr-1 text-primary/50" />
          <span>Reflect regularly to expand your consciousness</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhilosophicalReflection;
