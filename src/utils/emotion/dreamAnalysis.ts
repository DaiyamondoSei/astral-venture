
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
  
  if (!dominantTheme) return { chakras, emotions, insights };
  
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
  
  return { chakras, emotions, insights };
}
