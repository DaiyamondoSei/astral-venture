
/**
 * Functions for analyzing user reflections and extracting emotional insights
 */

import { EmotionAnalysisResult } from './types';
import { 
  emotionalKeywords, 
  emotionToChakraMap, 
  emotionToInsightMap 
} from './mappings';

/**
 * Analyze reflections to extract emotional insights
 */
export function analyzeReflectionContent(
  combinedReflections: string,
  existingChakras: number[],
  existingEmotions: string[],
  existingInsights: string[]
): EmotionAnalysisResult {
  const chakras = [...existingChakras];
  const emotions = [...existingEmotions];
  const insights = [...existingInsights];
  
  // Track emotional keywords frequency
  const emotionalAnalysis: {[key: string]: number} = {
    love: 0,
    joy: 0,
    peace: 0,
    power: 0,
    wisdom: 0,
    creativity: 0,
    fear: 0,
    anger: 0,
    sadness: 0
  };
  
  // Count keyword occurrences
  Object.entries(emotionalKeywords).forEach(([emotion, words]) => {
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = combinedReflections.match(regex);
      if (matches) {
        emotionalAnalysis[emotion] += matches.length;
      }
    });
  });
  
  // Get top emotions
  const topEmotions = Object.entries(emotionalAnalysis)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0)
    .slice(0, 3)
    .map(([emotion]) => emotion);
    
  // Add emotions and related insights/chakras
  topEmotions.forEach(emotion => {
    // Capitalize first letter
    const formattedEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    if (!emotions.includes(formattedEmotion)) {
      emotions.push(formattedEmotion);
    }
    
    // Add related chakras
    const relatedChakras = emotionToChakraMap[emotion] || [];
    relatedChakras.forEach(chakraIndex => {
      if (!chakras.includes(chakraIndex)) {
        chakras.push(chakraIndex);
      }
    });
    
    // Add related insights
    const insight = emotionToInsightMap[emotion];
    if (insight && !insights.includes(insight)) {
      insights.push(insight);
    }
  });
  
  return { chakras, emotions, insights };
}
