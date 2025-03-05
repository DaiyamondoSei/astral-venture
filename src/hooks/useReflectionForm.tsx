import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { calculateEnergyPoints, getActivatedChakrasFromThemes } from '@/utils/energyPointsCalculator';
import { saveReflection, updateUserPoints } from '@/services/reflectionService';
import { evaluateEmotionalDepth, getDepthCategory, getDepthFeedback } from '@/utils/emotion/analysis/depthEvaluator';

export const useReflectionForm = (onReflectionComplete?: (pointsEarned: number, emotionalInsights?: any) => void) => {
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastReflection, setLastReflection] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const togglePromptVisibility = () => {
    setPromptVisible(!promptVisible);
  };

  const handlePromptSelect = (prompt: string) => {
    setReflection(reflection ? `${reflection}\n\n${prompt}` : prompt);
    setPromptVisible(false);
  };

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
      
      // Calculate emotional depth score using the enhanced analyzer
      const emotionalDepthScore = evaluateEmotionalDepth(reflection);
      const depthCategory = getDepthCategory(emotionalDepthScore);
      const depthFeedback = getDepthFeedback(emotionalDepthScore);
      
      // Create comprehensive emotional insights package with expanded metrics
      const emotionalInsights = {
        dominantEmotions: emotionalAnalysis.emotionalThemes,
        emotionalDepth: Math.max(emotionalAnalysis.emotionalDepth, emotionalDepthScore),
        selfAwareness: emotionalAnalysis.selfAwareness,
        chakrasActivated: activatedChakras,
        reflectionTimestamp: new Date().toISOString(),
        reflectionWordCount: reflection.split(/\s+/).filter(w => w.length > 0).length,
        emotionalKeywords: reflection.toLowerCase().match(/feel|emotion|heart|sense|connect|energy|aware|conscious/g) || [],
        reflectionType: 'energy',
        depthCategory,
        depthFeedback
      };
      
      // Store emotional insights and reflection in localStorage
      storeEmotionalInsights(emotionalInsights);
      storeReflectionHistory({
        id: Date.now(),
        content: reflection,
        points_earned: pointsEarned,
        created_at: new Date().toISOString(),
        type: 'energy',
        dominant_emotion: emotionalAnalysis.emotionalThemes[0] || 'Growth',
        emotional_depth: emotionalDepthScore,
        insights: [
          depthFeedback,
          ...emotionalAnalysis.emotionalThemes.map(theme => `Strong ${theme} energy detected`)
        ],
        chakras_activated: activatedChakras
      });
      
      // Save reflection to database with enhanced metadata
      await saveReflection(user.id, reflection, pointsEarned, {
        dominant_emotion: emotionalAnalysis.emotionalThemes[0] || 'Growth',
        emotional_depth: emotionalDepthScore,
        chakras_activated: JSON.stringify(activatedChakras)
      });
      
      // Update user's energy points
      await updateUserPoints(user.id, pointsEarned);
      
      // Show success message with emotional feedback
      toast({
        title: `${depthCategory} Reflection Submitted`,
        description: `${depthFeedback} You earned ${pointsEarned} energy points.`,
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

  // Helper function to store emotional insights in localStorage
  const storeEmotionalInsights = (insights: any) => {
    try {
      // Get existing insights array or create new one
      const existingInsightsString = localStorage.getItem('emotionalInsights');
      const existingInsights = existingInsightsString ? JSON.parse(existingInsightsString) : [];
      
      // Add new insights (keep only last 10)
      existingInsights.unshift(insights);
      if (existingInsights.length > 10) {
        existingInsights.pop();
      }
      
      // Store updated insights
      localStorage.setItem('emotionalInsights', JSON.stringify(existingInsights));
    } catch (error) {
      console.error('Error storing emotional insights:', error);
    }
  };

  // Helper function to store reflection history in localStorage
  const storeReflectionHistory = (newReflection: any) => {
    try {
      const existingReflectionsString = localStorage.getItem('energyReflections');
      const existingReflections = existingReflectionsString ? JSON.parse(existingReflectionsString) : [];
      
      // Add new reflection to the array
      existingReflections.unshift(newReflection);
      
      // Keep only most recent 50 reflections
      if (existingReflections.length > 50) {
        existingReflections.length = 50;
      }
      
      localStorage.setItem('energyReflections', JSON.stringify(existingReflections));
      
      // Save the last reflection for immediate analytics
      setLastReflection(newReflection);
      setShowAnalytics(true);
    } catch (error) {
      console.error('Error storing energy reflection in history:', error);
    }
  };

  return {
    reflection,
    setReflection,
    isSubmitting,
    promptVisible,
    togglePromptVisibility,
    handlePromptSelect,
    handleSubmit,
    showAnalytics,
    lastReflection,
    setShowAnalytics
  };
};
