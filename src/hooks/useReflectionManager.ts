
import { useState, useCallback, useEffect } from 'react';
import { addReflection, fetchUserReflections, getReflectionInsights } from '@/services/reflectionService';
import { useToast } from '@/components/ui/use-toast';
import { EnergyReflection } from '@/services/reflection/types';
import { normalizeChakraData } from '@/utils/emotion/chakraTypes';

interface UseReflectionManagerProps {
  userId: string;
  updateUserProfile: (data: any) => void;
  updateActivatedChakras?: (chakras: number[]) => void;
}

interface ReflectionManagerResult {
  reflections: EnergyReflection[];
  activeTab: string;
  isSubmitting: boolean;
  loadingReflections: boolean;
  loadingInsights: boolean;
  patternInsights: any;
  submissionError: string | null;
  setActiveTab: (tab: string) => void;
  handleReflectionSubmit: (content: string) => Promise<boolean>;
  handleGetAIInsight: (reflectionId?: string, reflectionContent?: string) => Promise<string | null>;
  refreshReflections: () => Promise<void>;
}

/**
 * A hook to manage reflection operations, caching, and state management
 */
export function useReflectionManager({
  userId,
  updateUserProfile,
  updateActivatedChakras
}: UseReflectionManagerProps): ReflectionManagerResult {
  const [activeTab, setActiveTab] = useState('new');
  const [reflections, setReflections] = useState<EnergyReflection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [patternInsights, setPatternInsights] = useState<any>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load reflections when component mounts
  useEffect(() => {
    if (userId) {
      refreshReflections();
    }
  }, [userId]);

  // Fetch user reflections and process insights
  const refreshReflections = useCallback(async () => {
    if (!userId) return;
    
    setLoadingReflections(true);
    try {
      const data = await fetchUserReflections(userId);
      setReflections(data);
      
      // Process insights from reflections
      processReflectionInsights(data);
    } catch (error) {
      console.error('Error fetching reflections:', error);
      toast({
        title: "Error loading reflections",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoadingReflections(false);
    }
  }, [userId, toast]);

  // Process insights from reflections to identify patterns
  const processReflectionInsights = useCallback((reflectionData: EnergyReflection[]) => {
    // Skip if no reflections
    if (!reflectionData.length) return;
    
    setLoadingInsights(true);
    
    try {
      // Collect data for insights
      const activatedChakras: number[] = [];
      const dominantEmotions: string[] = [];
      const emotionalAnalysis: Record<string, number> = {};
      
      reflectionData.forEach(reflection => {
        // Process chakras
        const chakras = normalizeChakraData(reflection.chakras_activated);
        chakras.forEach(chakra => {
          if (!activatedChakras.includes(chakra)) {
            activatedChakras.push(chakra);
          }
        });
        
        // Process emotions
        if (reflection.dominant_emotion) {
          dominantEmotions.push(reflection.dominant_emotion);
          
          // Update emotional analysis counts
          if (emotionalAnalysis[reflection.dominant_emotion]) {
            emotionalAnalysis[reflection.dominant_emotion]++;
          } else {
            emotionalAnalysis[reflection.dominant_emotion] = 1;
          }
        }
      });
      
      // Set insights
      setPatternInsights({
        activatedChakras,
        dominantEmotions: Array.from(new Set(dominantEmotions)), // Remove duplicates
        emotionalAnalysis,
        totalReflections: reflectionData.length
      });
    } catch (error) {
      console.error('Error processing reflection insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  // Handle reflection submission
  const handleReflectionSubmit = useCallback(async (content: string): Promise<boolean> => {
    if (!userId || !content.trim()) return false;
    
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      // Calculate points based on length and quality
      const basePoints = 5;
      const lengthPoints = Math.min(Math.floor(content.length / 100), 5);
      const totalPoints = basePoints + lengthPoints;
      
      // Save reflection
      const reflection = await addReflection(userId, content, totalPoints);
      
      if (reflection) {
        // Update user profile
        updateUserProfile({
          last_reflection_date: new Date().toISOString(),
          reflection_count: reflections.length + 1
        });
        
        // Update activated chakras if provided
        if (updateActivatedChakras && reflection.chakras_activated) {
          const normalizedChakras = normalizeChakraData(reflection.chakras_activated);
          updateActivatedChakras(normalizedChakras);
        }
        
        // Show success toast
        toast({
          title: "Reflection saved",
          description: `+${totalPoints} energy points earned`,
        });
        
        // Update reflections list
        setReflections(prev => [reflection, ...prev]);
        
        // Switch to insights tab
        setActiveTab('insights');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting reflection:', error);
      setSubmissionError('Failed to save your reflection. Please try again.');
      
      toast({
        title: "Error saving reflection",
        description: "Please try again later",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, reflections.length, updateUserProfile, updateActivatedChakras, toast]);

  // Get AI insights for a reflection
  const handleGetAIInsight = useCallback(async (
    reflectionId?: string, 
    reflectionContent?: string
  ): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      return await getReflectionInsights(reflectionId, reflectionContent);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        title: "Error getting insights",
        description: "Please try again later",
        variant: "destructive"
      });
      return null;
    }
  }, [userId, toast]);

  return {
    reflections,
    activeTab,
    isSubmitting,
    loadingReflections,
    loadingInsights,
    patternInsights,
    submissionError,
    setActiveTab,
    handleReflectionSubmit,
    handleGetAIInsight,
    refreshReflections
  };
}
