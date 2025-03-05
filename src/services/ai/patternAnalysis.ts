
import { HistoricalReflection } from '@/components/reflection/types';
import { EmotionAnalysisResult } from '@/utils/emotion/types';
import { analyzeReflectionContent } from '@/utils/emotion/reflectionAnalysis';

export interface PatternAnalysisResult {
  dominantChakras: number[];
  dominantEmotions: string[];
  chakraProgression: Array<{ chakra: number, frequency: number }>;
  emotionalProgression: Array<{ emotion: string, frequency: number }>;
  recentTrends: string[];
  recommendedFocus: string[];
}

/**
 * Analyzes reflection patterns over time to identify trends and progression
 * @param reflections Array of user reflections in chronological order
 * @returns Analysis of patterns with trends and recommendations
 */
export function analyzeReflectionPatterns(
  reflections: HistoricalReflection[]
): PatternAnalysisResult {
  // Default empty return
  if (!reflections || reflections.length === 0) {
    return {
      dominantChakras: [],
      dominantEmotions: [],
      chakraProgression: [],
      emotionalProgression: [],
      recentTrends: [],
      recommendedFocus: []
    };
  }

  // Sort reflections by date (most recent first)
  const sortedReflections = [...reflections].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Extract all content for analysis
  const allContent = sortedReflections.map(r => r.content).join(" ");
  
  // Extract all chakras and emotions from reflections
  const allChakras: number[] = [];
  const allEmotions: string[] = [];
  
  sortedReflections.forEach(reflection => {
    if (reflection.chakras_activated) {
      allChakras.push(...reflection.chakras_activated);
    }
    
    if (reflection.dominant_emotion) {
      allEmotions.push(reflection.dominant_emotion);
    }
  });
  
  // Count frequency of each chakra
  const chakraCounts: { [key: number]: number } = {};
  allChakras.forEach(chakra => {
    chakraCounts[chakra] = (chakraCounts[chakra] || 0) + 1;
  });
  
  // Count frequency of each emotion
  const emotionCounts: { [key: string]: number } = {};
  allEmotions.forEach(emotion => {
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  
  // Get dominant chakras (sort by frequency)
  const dominantChakras = Object.entries(chakraCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([chakra]) => parseInt(chakra));
  
  // Get dominant emotions (sort by frequency)
  const dominantEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion);
  
  // Format progression data for visualization
  const chakraProgression = Object.entries(chakraCounts)
    .map(([chakra, frequency]) => ({
      chakra: parseInt(chakra),
      frequency
    }))
    .sort((a, b) => b.frequency - a.frequency);
  
  const emotionalProgression = Object.entries(emotionCounts)
    .map(([emotion, frequency]) => ({
      emotion,
      frequency
    }))
    .sort((a, b) => b.frequency - a.frequency);
  
  // Analyze recent trends (using last 3 reflections)
  const recentReflections = sortedReflections.slice(0, 3);
  const recentContent = recentReflections.map(r => r.content).join(" ");
  const recentAnalysis = analyzeReflectionContent(recentContent);
  
  // Compare recent trends with overall patterns
  const recentTrends: string[] = [];
  
  // Check for new chakras
  recentAnalysis.chakras.forEach(chakra => {
    if (!dominantChakras.includes(chakra)) {
      const chakraNames = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
      recentTrends.push(`Your ${chakraNames[chakra]} chakra is becoming more active recently.`);
    }
  });
  
  // Check for new emotions
  recentAnalysis.emotions.forEach(emotion => {
    if (!dominantEmotions.includes(emotion)) {
      recentTrends.push(`${emotion} energy is emerging in your recent reflections.`);
    }
  });
  
  // Add depth trend if available
  if (recentReflections.length >= 2) {
    const avgRecentDepth = recentReflections
      .map(r => r.emotional_depth || 0)
      .reduce((a, b) => a + b, 0) / recentReflections.length;
    
    const avgAllDepth = sortedReflections
      .map(r => r.emotional_depth || 0)
      .reduce((a, b) => a + b, 0) / sortedReflections.length;
    
    if (avgRecentDepth > avgAllDepth + 0.1) {
      recentTrends.push('Your reflections are deepening in emotional intelligence.');
    } else if (avgRecentDepth < avgAllDepth - 0.1) {
      recentTrends.push('Your recent reflections have been more concise and direct.');
    } else {
      recentTrends.push('Your reflection depth remains consistent over time.');
    }
  }
  
  // Generate recommended focus areas
  const recommendedFocus: string[] = [];
  
  // Check for underrepresented chakras
  const allCenterIndices = [0, 1, 2, 3, 4, 5, 6];
  const missingChakras = allCenterIndices.filter(index => !allChakras.includes(index));
  
  if (missingChakras.length > 0) {
    const chakraNames = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
    const randomMissingIndex = Math.floor(Math.random() * missingChakras.length);
    recommendedFocus.push(`Focus on your ${chakraNames[missingChakras[randomMissingIndex]]} chakra to balance your energy system.`);
  }
  
  // Check chakra balance
  const lowerChakras = allChakras.filter(i => i < 3).length;
  const upperChakras = allChakras.filter(i => i >= 3).length;
  
  if (lowerChakras > upperChakras * 2) {
    recommendedFocus.push('Work on balancing material concerns with higher spiritual awareness.');
  } else if (upperChakras > lowerChakras * 2) {
    recommendedFocus.push('Ground your spiritual insights with practical application.');
  }
  
  // Add a practice recommendation
  if (dominantEmotions.includes('Peace') || dominantEmotions.includes('Tranquility')) {
    recommendedFocus.push('Deepen your meditation practice to enhance your natural state of peace.');
  } else if (dominantEmotions.includes('Power') || dominantEmotions.includes('Confidence')) {
    recommendedFocus.push('Channel your strong energy into purposeful creation and leadership.');
  } else if (dominantEmotions.includes('Love') || dominantEmotions.includes('Compassion')) {
    recommendedFocus.push('Share your heart-centered gifts through service to others.');
  } else if (dominantEmotions.includes('Wisdom') || dominantEmotions.includes('Insight')) {
    recommendedFocus.push('Document your insights to create a personal wisdom guidebook.');
  } else {
    recommendedFocus.push('Explore various energy practices to discover what resonates most deeply with you.');
  }
  
  // Ensure we return some trends and recommendations
  if (recentTrends.length === 0) {
    recentTrends.push('Continue your reflection practice to reveal emerging patterns.');
  }
  
  if (recommendedFocus.length === 0) {
    recommendedFocus.push('Maintain a consistent practice to deepen your energy awareness.');
  }
  
  return {
    dominantChakras,
    dominantEmotions,
    chakraProgression,
    emotionalProgression,
    recentTrends,
    recommendedFocus
  };
}
