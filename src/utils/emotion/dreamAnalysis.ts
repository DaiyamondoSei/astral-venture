
/**
 * Functions for analyzing dream themes and extracting emotional insights
 */

import { EmotionAnalysisResult } from './types';
import { 
  themeToChakraMap, 
  themeToEmotionMap, 
  themeToInsightMap 
} from './mappings';

/**
 * Analyze dream theme to extract emotional insights
 */
export function analyzeDreamTheme(dominantTheme: string | null): EmotionAnalysisResult {
  const chakras: number[] = [];
  const emotions: string[] = [];
  const insights: string[] = [];
  
  if (!dominantTheme) return { 
    chakras, 
    emotions, 
    insights, 
    chakrasActivated: [],
    dominantEmotion: '',
    emotionalDepth: 0,
    emotionBreakdown: {}
  };
  
  // Get chakras associated with theme
  const themeChakras = themeToChakraMap[dominantTheme];
  if (themeChakras) {
    chakras.push(...themeChakras);
  }
  
  // Get emotion associated with theme
  const themeEmotion = themeToEmotionMap[dominantTheme];
  if (themeEmotion) {
    emotions.push(themeEmotion);
  }
  
  // Get insight associated with theme
  const themeInsight = themeToInsightMap[dominantTheme];
  if (themeInsight) {
    insights.push(themeInsight);
  }
  
  return { 
    chakras, 
    emotions, 
    insights, 
    chakrasActivated: chakras,
    dominantEmotion: emotions.length > 0 ? emotions[0] : undefined,
    emotionalDepth: insights.length > 0 ? 0.5 : 0,
    emotionBreakdown: emotions.reduce((acc, emotion) => {
      acc[emotion.toLowerCase()] = 1;
      return acc;
    }, {} as Record<string, number>)
  };
}
