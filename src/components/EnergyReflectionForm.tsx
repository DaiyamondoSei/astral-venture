import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { calculateEnergyPoints, getActivatedChakrasFromThemes } from '@/utils/energyPointsCalculator';
import { saveReflection, updateUserPoints } from '@/services/reflectionService';
import ReflectionInstructions from './reflection/ReflectionInstructions';
import ReflectionFormInput from './reflection/ReflectionFormInput';

interface EnergyReflectionFormProps {
  onReflectionComplete?: (pointsEarned: number, emotionalInsights?: any) => void;
}

const EnergyReflectionForm = ({ onReflectionComplete }: EnergyReflectionFormProps) => {
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not signed in",
        description: "You need to be signed in to submit a reflection",
        variant: "destructive"
      });
      return;
    }
    
    if (reflection.trim().length < 20) {
      toast({
        title: "Reflection too short",
        description: "Please share more about your energy practice (at least 20 characters)",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate points based on reflection content with emotional analysis
      const { points: pointsEarned, emotionalAnalysis } = calculateEnergyPoints(reflection);
      
      // Determine chakras that would be activated by this reflection
      const activatedChakras = getActivatedChakrasFromThemes(emotionalAnalysis.emotionalThemes);
      
      // Create comprehensive emotional insights package
      const emotionalInsights = {
        dominantEmotions: emotionalAnalysis.emotionalThemes,
        emotionalDepth: emotionalAnalysis.emotionalDepth,
        selfAwareness: emotionalAnalysis.selfAwareness,
        chakrasActivated: activatedChakras,
        reflectionTimestamp: new Date().toISOString()
      };
      
      // Store emotional insights in localStorage for use across the app
      try {
        // Get existing insights array or create new one
        const existingInsightsString = localStorage.getItem('emotionalInsights');
        const existingInsights = existingInsightsString ? JSON.parse(existingInsightsString) : [];
        
        // Add new insights (keep only last 10)
        existingInsights.unshift(emotionalInsights);
        if (existingInsights.length > 10) {
          existingInsights.pop();
        }
        
        // Store updated insights
        localStorage.setItem('emotionalInsights', JSON.stringify(existingInsights));
      } catch (error) {
        console.error('Error storing emotional insights:', error);
        // Non-critical, so continue even if storing fails
      }
      
      // Save reflection to database
      await saveReflection(user.id, reflection, pointsEarned);
      
      // Update user's energy points and get new total
      await updateUserPoints(user.id, pointsEarned);
      
      // Show success message with emotional feedback
      const dominantEmotion = emotionalAnalysis.emotionalThemes[0] || '';
      const emotionMessage = dominantEmotion ? 
        ` Your reflection shows strong ${dominantEmotion} energy.` : '';
      
      toast({
        title: "Reflection Submitted",
        description: `Thank you for your energy reflection! You earned ${pointsEarned} energy points.${emotionMessage}`,
      });
      
      // Clear form
      setReflection('');
      
      // Notify parent component with emotional insights
      if (onReflectionComplete) {
        onReflectionComplete(pointsEarned, emotionalInsights);
      }
      
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

  return (
    <div className="glass-card p-5">
      <ReflectionInstructions />
      <ReflectionFormInput
        reflection={reflection}
        setReflection={setReflection}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EnergyReflectionForm;
