
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GlassmorphicContainer } from '@/components/visual-foundation';
import { Brain, Gauge, Activity, SlidersHorizontal, Heart, Eye, Timeline } from 'lucide-react';

interface AssessmentQuestion {
  id: string;
  question: string;
  description: string;
  min: string;
  max: string;
  icon: React.ReactNode;
  metric: string;
}

export function ConsciousnessAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const questions: AssessmentQuestion[] = [
    {
      id: 'awareness',
      question: 'How aware are you of your thoughts and emotions?',
      description: 'Your ability to observe your mental and emotional states without being consumed by them',
      min: 'Rarely Notice',
      max: 'Constantly Aware',
      icon: <Brain size={24} />,
      metric: 'awareness_score'
    },
    {
      id: 'reflection',
      question: 'How often do you reflect on your experiences?',
      description: 'Your tendency to contemplate the meaning of events and extract wisdom from them',
      min: 'Almost Never',
      max: 'Very Frequently',
      icon: <Eye size={24} />,
      metric: 'reflection_quality'
    },
    {
      id: 'meditation',
      question: 'How consistent is your meditation practice?',
      description: 'The regularity with which you engage in meditation or mindfulness practices',
      min: 'No Practice',
      max: 'Daily Practice',
      icon: <Activity size={24} />,
      metric: 'meditation_consistency'
    },
    {
      id: 'insight',
      question: 'How deeply do you explore insights that arise?',
      description: 'Your tendency to investigate revelations about yourself or existence',
      min: 'Surface Level',
      max: 'Deep Exploration',
      icon: <Gauge size={24} />,
      metric: 'insight_depth'
    },
    {
      id: 'energy',
      question: 'How attuned are you to subtle energies in yourself and others?',
      description: 'Your sensitivity to energetic states, moods, and non-verbal information',
      min: 'Not Sensitive',
      max: 'Highly Sensitive',
      icon: <Heart size={24} />,
      metric: 'energy_clarity'
    },
    {
      id: 'expansion',
      question: 'How open are you to expanding your consciousness?',
      description: 'Your willingness to explore new perspectives and states of awareness',
      min: 'Comfortable As Is',
      max: 'Eager To Expand',
      icon: <SlidersHorizontal size={24} />,
      metric: 'expansion_rate'
    },
    {
      id: 'chakra',
      question: 'How balanced do you feel your energy centers are?',
      description: 'The harmony you sense between different aspects of your being',
      min: 'Very Imbalanced',
      max: 'Perfectly Balanced',
      icon: <Timeline size={24} />,
      metric: 'chakra_balance'
    }
  ];
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleSubmit();
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your assessment.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert answers to metrics format for database
      const metrics: Record<string, number> = {};
      const historyEntry = {
        date: new Date().toISOString(),
        scores: { ...answers }
      };
      
      questions.forEach(q => {
        const value = answers[q.id] ?? 0;
        metrics[q.metric] = value * 20; // Scale 0-5 to 0-100
      });
      
      // Determine consciousness level based on average score
      const scores = Object.values(answers);
      const average = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
      
      let level = 'awakening';
      if (average >= 4) level = 'illuminated';
      else if (average >= 3) level = 'expanded';
      else if (average >= 2) level = 'aware';
      else if (average >= 1) level = 'seeking';
      
      // Check if user already has consciousness metrics
      const { data: existingMetrics } = await supabase
        .from('consciousness_metrics')
        .select('id, history')
        .eq('user_id', user.id)
        .single();
      
      let error;
      
      if (existingMetrics) {
        // Update existing metrics
        const history = Array.isArray(existingMetrics.history) 
          ? [...existingMetrics.history, historyEntry]
          : [historyEntry];
        
        const { error: updateError } = await supabase
          .from('consciousness_metrics')
          .update({
            ...metrics,
            level,
            history,
            last_assessment: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        error = updateError;
      } else {
        // Insert new metrics
        const { error: insertError } = await supabase
          .from('consciousness_metrics')
          .insert({
            user_id: user.id,
            ...metrics,
            level,
            history: [historyEntry],
            last_assessment: new Date().toISOString()
          });
          
        error = insertError;
      }
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Assessment Complete",
        description: "Your consciousness profile has been created.",
      });
      
      // Store completion in localStorage
      localStorage.setItem('initialAssessmentCompleted', 'true');
      
      // Navigate to entry animation
      navigate('/entry-animation');
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error Saving Assessment",
        description: "There was a problem saving your assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const questionValue = currentQuestion.id in answers ? answers[currentQuestion.id] : 2.5;
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <GlassmorphicContainer 
        className="p-6" 
        variant="ethereal" 
        intensity="medium" 
        withGlow
        glowColor="rgba(80, 219, 207, 0.4)"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white">Consciousness Assessment</h2>
            <p className="text-white/80 mt-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          
          <div className="relative pt-2">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-teal-400">
              {currentQuestion.icon}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{currentQuestion.question}</h3>
              <p className="text-sm text-white/70 mt-1">{currentQuestion.description}</p>
            </div>
          </div>
          
          <div className="pt-6 pb-2">
            <Slider
              value={[questionValue]}
              min={0}
              max={5}
              step={0.5}
              onValueChange={values => handleAnswer(values[0])}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-white/70 mt-2">
              <div className="max-w-[100px] text-left">{currentQuestion.min}</div>
              <div className="max-w-[100px] text-right">{currentQuestion.max}</div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button"
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={prevQuestion}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Previous
            </Button>
            <Button 
              type="button"
              onClick={nextQuestion}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              {currentQuestionIndex < questions.length - 1 
                ? 'Next' 
                : isSubmitting 
                  ? 'Completing Assessment...' 
                  : 'Complete Assessment'
              }
            </Button>
          </div>
        </div>
      </GlassmorphicContainer>
    </div>
  );
}
