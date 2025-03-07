
import { useState, useEffect } from 'react';
import { OnboardingStep } from '@/contexts/OnboardingContext';

interface UsePersonalizedOnboardingProps {
  userId?: string;
  userInterests?: string[];
  completedSteps: Record<string, boolean>;
}

interface PersonalizedContent {
  title: string;
  description: string;
  imageSrc?: string;
  primaryAction?: string;
  secondaryAction?: string;
}

export const usePersonalizedOnboarding = ({
  userId,
  userInterests = [],
  completedSteps
}: UsePersonalizedOnboardingProps) => {
  const [personalizedContent, setPersonalizedContent] = useState<Record<OnboardingStep, PersonalizedContent>>({} as any);
  const [userStepPreference, setUserStepPreference] = useState<OnboardingStep[]>([]);
  
  // Generate personalized content based on user interests
  useEffect(() => {
    const baseContent: Record<OnboardingStep, PersonalizedContent> = {
      'welcome': {
        title: 'Welcome to Your Spiritual Journey',
        description: 'Begin your path to higher consciousness and discover your true potential.'
      },
      'sacred-geometry': {
        title: 'Sacred Geometry: Universal Patterns',
        description: 'Explore the mathematical patterns that form the foundation of all creation.'
      },
      'chakras': {
        title: 'Balance Your Energy Centers',
        description: 'Understand and activate the seven primary chakras that regulate your energetic body.'
      },
      'energy-points': {
        title: 'Energy Points & Meridians',
        description: 'Map the flowing rivers of energy that connect your entire being.'
      },
      'meditation': {
        title: 'Meditation Techniques',
        description: 'Discover practices to quiet the mind and connect with your higher self.'
      },
      'reflection': {
        title: 'Daily Reflection',
        description: 'Track your spiritual progress and insights through regular journaling.'
      },
      'complete': {
        title: 'Journey Initiated',
        description: 'You\'ve completed the introduction to your spiritual practice. Your path continues.'
      }
    };
    
    // Customize based on user interests
    const customized = { ...baseContent };
    
    if (userInterests.includes('meditation')) {
      customized.meditation.title = 'Advanced Meditation Techniques';
      customized.meditation.description = 'Elevate your practice with techniques tailored to your energy profile.';
    }
    
    if (userInterests.includes('healing')) {
      customized.chakras.title = 'Chakra Healing & Balancing';
      customized.chakras.description = 'Learn powerful techniques to restore harmony to your energy centers.';
    }
    
    if (userInterests.includes('manifestation')) {
      customized['sacred-geometry'].title = 'Sacred Geometry & Manifestation';
      customized['sacred-geometry'].description = 'Use geometric patterns as a tool to manifest your highest intentions.';
    }
    
    // Add personalized user dream or aspiration if available
    const userDream = localStorage.getItem('userDream');
    if (userDream) {
      const dreamKeywords = userDream.toLowerCase();
      
      if (dreamKeywords.includes('peace') || dreamKeywords.includes('calm')) {
        customized.meditation.title = 'Finding Inner Peace';
        customized.meditation.description = 'Discover the stillness within that brings lasting peace to your life.';
      } else if (dreamKeywords.includes('purpose') || dreamKeywords.includes('meaning')) {
        customized.reflection.title = 'Discovering Your Purpose';
        customized.reflection.description = 'Use reflective practices to uncover your unique contribution to the world.';
      }
    }
    
    setPersonalizedContent(customized);
    
    // Determine optimal step order based on user interests and completion
    const preferredOrder: OnboardingStep[] = ['welcome'];
    
    // Add incomplete steps first, ordered by interest relevance
    const remainingSteps: OnboardingStep[] = ['sacred-geometry', 'chakras', 'energy-points', 'meditation', 'reflection'];
    
    // Sort remaining steps based on user interests
    const sortedSteps = remainingSteps.sort((a, b) => {
      const aCompleted = completedSteps[a] ? 1 : 0;
      const bCompleted = completedSteps[b] ? 1 : 0;
      
      // Prioritize incomplete steps
      if (aCompleted !== bCompleted) {
        return aCompleted - bCompleted;
      }
      
      // Then prioritize by interest relevance
      const aRelevance = getUserInterestRelevance(a, userInterests);
      const bRelevance = getUserInterestRelevance(b, userInterests);
      
      return bRelevance - aRelevance;
    });
    
    preferredOrder.push(...sortedSteps, 'complete');
    setUserStepPreference(preferredOrder);
    
  }, [userInterests, completedSteps]);
  
  // Helper function to determine relevance score for a step based on user interests
  const getUserInterestRelevance = (step: OnboardingStep, interests: string[]): number => {
    const relevanceMap: Record<string, string[]> = {
      'sacred-geometry': ['geometry', 'manifestation', 'patterns', 'universe'],
      'chakras': ['energy', 'healing', 'balance', 'spiritual'],
      'energy-points': ['energy', 'healing', 'meridians', 'acupuncture'],
      'meditation': ['meditation', 'mindfulness', 'peace', 'calm'],
      'reflection': ['journaling', 'reflection', 'growth', 'awareness']
    };
    
    const stepKeywords = relevanceMap[step] || [];
    let relevance = 0;
    
    // Count matches between step keywords and user interests
    interests.forEach(interest => {
      if (stepKeywords.includes(interest.toLowerCase())) {
        relevance++;
      }
    });
    
    return relevance;
  };
  
  return {
    personalizedContent,
    userStepPreference,
    getStepContent: (step: OnboardingStep) => personalizedContent[step] || null
  };
};
