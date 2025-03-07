
import { useEffect, useState } from 'react';
import { ChakraActivated } from '@/utils/emotion/chakraTypes';

// Define the type for chakra insights
interface ChakraInsight {
  id: string;
  text: string;
  chakra?: number;
}

// Define the type for practice recommendations
interface PracticeRecommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  chakra?: number;
}

/**
 * Hook to generate personalized insights based on activated chakras
 * and dominant emotions
 */
export function useChakraInsights(
  activatedChakras: ChakraActivated = [],
  dominantEmotions: string[] = []
) {
  const [personalizedInsights, setPersonalizedInsights] = useState<ChakraInsight[]>([]);
  const [practiceRecommendations, setPracticeRecommendations] = useState<PracticeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      // Generate insights based on chakras
      const insights = generateChakraInsights(activatedChakras, dominantEmotions);
      setPersonalizedInsights(insights);
      
      // Generate practice recommendations
      const recommendations = generatePracticeRecommendations(activatedChakras, dominantEmotions);
      setPracticeRecommendations(recommendations);
      
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [activatedChakras, dominantEmotions]);
  
  return { personalizedInsights, practiceRecommendations, loading };
}

// Helper function to generate insights based on activated chakras and emotions
function generateChakraInsights(chakras: ChakraActivated, emotions: string[]): ChakraInsight[] {
  // Default insight if no chakras or emotions
  if (chakras.length === 0 && emotions.length === 0) {
    return [
      {
        id: 'default-insight',
        text: 'Your energy centers appear to be in a balanced state. Continue with your regular practices.'
      }
    ];
  }
  
  const insights: ChakraInsight[] = [];
  
  // Add insights based on chakras
  chakras.forEach(chakra => {
    switch(chakra) {
      case 0:
        insights.push({
          id: `root-chakra-${Date.now()}`,
          text: 'Your Root Chakra activation indicates a need for grounding and stability in your life.',
          chakra: 0
        });
        break;
      case 1:
        insights.push({
          id: `sacral-chakra-${Date.now()}`,
          text: 'Your Sacral Chakra activation suggests creative energy seeking expression.',
          chakra: 1
        });
        break;
      case 2:
        insights.push({
          id: `solar-plexus-chakra-${Date.now()}`,
          text: 'Your Solar Plexus Chakra activation indicates personal power and confidence is emerging.',
          chakra: 2
        });
        break;
      case 3:
        insights.push({
          id: `heart-chakra-${Date.now()}`,
          text: 'Your Heart Chakra activation suggests emotions of compassion and love are present.',
          chakra: 3
        });
        break;
      case 4:
        insights.push({
          id: `throat-chakra-${Date.now()}`,
          text: 'Your Throat Chakra activation indicates a need for authentic self-expression.',
          chakra: 4
        });
        break;
      case 5:
        insights.push({
          id: `third-eye-chakra-${Date.now()}`,
          text: 'Your Third Eye Chakra activation suggests heightened intuition and clarity.',
          chakra: 5
        });
        break;
      case 6:
        insights.push({
          id: `crown-chakra-${Date.now()}`,
          text: 'Your Crown Chakra activation indicates spiritual connection and higher consciousness.',
          chakra: 6
        });
        break;
    }
  });
  
  // Add insights based on emotions
  emotions.forEach(emotion => {
    if (emotion === 'joy') {
      insights.push({
        id: `emotion-joy-${Date.now()}`,
        text: 'Your expression of joy indicates alignment with your authentic self and purpose.'
      });
    } else if (emotion === 'sadness') {
      insights.push({
        id: `emotion-sadness-${Date.now()}`,
        text: 'Your sadness may indicate unprocessed emotions that seek acknowledgment and release.'
      });
    } else if (emotion === 'anger') {
      insights.push({
        id: `emotion-anger-${Date.now()}`,
        text: 'Your anger suggests boundaries that need to be established or honored.'
      });
    } else if (emotion === 'fear') {
      insights.push({
        id: `emotion-fear-${Date.now()}`,
        text: 'Your fear indicates areas where trust and surrender may benefit your growth.'
      });
    } else {
      insights.push({
        id: `emotion-general-${Date.now()}`,
        text: `Your emotional state of ${emotion} offers insights into your current life experience.`
      });
    }
  });
  
  return insights;
}

// Helper function to generate practice recommendations
function generatePracticeRecommendations(
  chakras: ChakraActivated, 
  emotions: string[]
): PracticeRecommendation[] {
  const recommendations: PracticeRecommendation[] = [];
  
  // Default recommendation if no chakras or emotions
  if (chakras.length === 0 && emotions.length === 0) {
    return [
      {
        id: 'default-practice',
        title: 'Basic Chakra Meditation',
        description: 'A gentle meditation to connect with all your energy centers.',
        duration: '10 minutes'
      }
    ];
  }
  
  // Add recommendations based on chakras
  chakras.forEach(chakra => {
    switch(chakra) {
      case 0:
        recommendations.push({
          id: `root-practice-${Date.now()}`,
          title: 'Grounding Meditation',
          description: 'Connect with the earth and stabilize your energy.',
          duration: '5-10 minutes',
          chakra: 0
        });
        break;
      case 1:
        recommendations.push({
          id: `sacral-practice-${Date.now()}`,
          title: 'Creative Flow Practice',
          description: 'Engage in free-form creative expression without judgment.',
          duration: '15-20 minutes',
          chakra: 1
        });
        break;
      case 2:
        recommendations.push({
          id: `solar-plexus-practice-${Date.now()}`,
          title: 'Confidence Building',
          description: 'Affirmations and postures to strengthen your personal power.',
          duration: '7-12 minutes',
          chakra: 2
        });
        break;
      case 3:
        recommendations.push({
          id: `heart-practice-${Date.now()}`,
          title: 'Heart-Opening Meditation',
          description: 'Gentle practice to open to compassion and forgiveness.',
          duration: '10-15 minutes',
          chakra: 3
        });
        break;
      case 4:
        recommendations.push({
          id: `throat-practice-${Date.now()}`,
          title: 'Authentic Expression',
          description: 'Vocalization and speaking your truth with clarity.',
          duration: '5-10 minutes',
          chakra: 4
        });
        break;
      case 5:
        recommendations.push({
          id: `third-eye-practice-${Date.now()}`,
          title: 'Intuition Development',
          description: 'Guided visualization to enhance inner vision.',
          duration: '10-15 minutes',
          chakra: 5
        });
        break;
      case 6:
        recommendations.push({
          id: `crown-practice-${Date.now()}`,
          title: 'Spiritual Connection',
          description: 'Meditation to connect with universal consciousness.',
          duration: '15-20 minutes',
          chakra: 6
        });
        break;
    }
  });
  
  // Add emotion-based practices
  if (emotions.includes('anxiety') || emotions.includes('fear')) {
    recommendations.push({
      id: `emotion-anxiety-${Date.now()}`,
      title: 'Calming Breath Work',
      description: 'Simple breathing pattern to reduce anxiety and create ease.',
      duration: '5 minutes'
    });
  }
  
  if (emotions.includes('sadness') || emotions.includes('grief')) {
    recommendations.push({
      id: `emotion-sadness-${Date.now()}`,
      title: 'Emotional Release Journal',
      description: 'Guided writing exercise to process and release emotions.',
      duration: '10-15 minutes'
    });
  }
  
  return recommendations;
}
