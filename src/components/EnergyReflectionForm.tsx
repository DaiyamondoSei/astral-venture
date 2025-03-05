
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { calculateEnergyPoints, getActivatedChakrasFromThemes } from '@/utils/energyPointsCalculator';
import { saveReflection, updateUserPoints } from '@/services/reflectionService';
import { evaluateEmotionalDepth } from '@/utils/emotion/reflectionAnalysis';
import ReflectionInstructions from './reflection/ReflectionInstructions';
import ReflectionFormInput from './reflection/ReflectionFormInput';
import ReflectionPromptSuggestions from './reflection/ReflectionPromptSuggestions';

interface EnergyReflectionFormProps {
  onReflectionComplete?: (pointsEarned: number, emotionalInsights?: any) => void;
}

const EnergyReflectionForm = ({ onReflectionComplete }: EnergyReflectionFormProps) => {
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
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
      // Calculate points based on reflection content with enhanced emotional analysis
      const { points: pointsEarned, emotionalAnalysis } = calculateEnergyPoints(reflection);
      
      // Determine chakras that would be activated by this reflection
      const activatedChakras = getActivatedChakrasFromThemes(emotionalAnalysis.emotionalThemes);
      
      // Calculate emotional depth score using the new analyzer
      const emotionalDepthScore = evaluateEmotionalDepth(reflection);
      
      // Create comprehensive emotional insights package with expanded metrics
      const emotionalInsights = {
        dominantEmotions: emotionalAnalysis.emotionalThemes,
        emotionalDepth: Math.max(emotionalAnalysis.emotionalDepth, emotionalDepthScore),
        selfAwareness: emotionalAnalysis.selfAwareness,
        chakrasActivated: activatedChakras,
        reflectionTimestamp: new Date().toISOString(),
        reflectionWordCount: reflection.split(/\s+/).filter(w => w.length > 0).length,
        emotionalKeywords: reflection.toLowerCase().match(/feel|emotion|heart|sense|connect|energy|aware|conscious/g) || [],
        reflectionType: 'energy'
      };
      
      // Store emotional insights in localStorage for use across the app with enhanced structure
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
      
      // Also store the entire reflection in localStorage for history view with enhanced metadata
      try {
        const existingReflectionsString = localStorage.getItem('energyReflections');
        const existingReflections = existingReflectionsString ? JSON.parse(existingReflectionsString) : [];
        
        // Add new reflection to the array (with enhanced metadata)
        existingReflections.unshift({
          id: Date.now(),
          content: reflection,
          points_earned: pointsEarned,
          created_at: new Date().toISOString(),
          type: 'energy',
          dominant_emotion: emotionalAnalysis.emotionalThemes[0] || 'Growth',
          emotional_depth: emotionalDepthScore,
          insights: emotionalAnalysis.emotionalThemes.map(theme => `Strong ${theme} energy detected`),
          chakras_activated: activatedChakras
        });
        
        // Keep only most recent 50 reflections
        if (existingReflections.length > 50) {
          existingReflections.length = 50;
        }
        
        localStorage.setItem('energyReflections', JSON.stringify(existingReflections));
      } catch (error) {
        console.error('Error storing energy reflection in history:', error);
      }
      
      // Save reflection to database with enhanced metadata
      await saveReflection(user.id, reflection, pointsEarned, {
        dominant_emotion: emotionalAnalysis.emotionalThemes[0] || 'Growth',
        emotional_depth: emotionalDepthScore,
        chakras_activated: JSON.stringify(activatedChakras)
      });
      
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

  const handlePromptSelect = (prompt: string) => {
    setReflection(reflection ? `${reflection}\n\n${prompt}` : prompt);
    setPromptVisible(false);
  };

  return (
    <div className="glass-card p-5">
      <ReflectionInstructions />
      
      <div className="mb-4 flex justify-end">
        <button 
          type="button"
          onClick={() => setPromptVisible(!promptVisible)}
          className="text-xs text-quantum-400 hover:underline flex items-center"
        >
          {promptVisible ? "Hide Prompts" : "Need Inspiration?"}
        </button>
      </div>
      
      {promptVisible && (
        <ReflectionPromptSuggestions onSelectPrompt={handlePromptSelect} />
      )}
      
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
