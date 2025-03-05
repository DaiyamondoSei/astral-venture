
/**
 * Generates insights based on reflection data
 */

import { EnergyReflection } from './types';
import { evaluateEmotionalDepth } from '@/utils/emotion/reflectionAnalysis';

/**
 * Generates insights from the user's reflection history
 */
export const getReflectionInsights = (reflections: EnergyReflection[]): string[] => {
  if (!reflections || reflections.length === 0) {
    return ["Start your reflection journey to receive insights"];
  }
  
  const insights: string[] = [];
  
  // Frequency-based insights
  if (reflections.length >= 5) {
    insights.push("Your consistent reflection practice is building emotional awareness");
  }
  
  if (reflections.length >= 10) {
    insights.push("Your dedication to reflection shows commitment to inner growth");
  }
  
  // Depth-based insights
  const depthValues = reflections
    .filter(r => r.emotional_depth !== undefined)
    .map(r => r.emotional_depth || 0);
  
  if (depthValues.length > 0) {
    const averageDepth = depthValues.reduce((sum, depth) => sum + depth, 0) / depthValues.length;
    
    if (averageDepth > 0.7) {
      insights.push("Your reflections show remarkable emotional depth and self-awareness");
    } else if (averageDepth > 0.4) {
      insights.push("Your emotional depth is developing well through regular practice");
    }
  }
  
  // Chakra-based insights
  const activatedChakras = Array.from(new Set(
    reflections.flatMap(r => r.chakras_activated || [])
  ));
  
  if (activatedChakras.length > 3) {
    insights.push("Multiple energy centers are active in your reflection practice");
  }
  
  if (activatedChakras.includes(3)) { // Heart chakra
    insights.push("Your heart center is becoming a focal point in your energy work");
  }
  
  if (activatedChakras.includes(6)) { // Crown chakra
    insights.push("Your connection to higher awareness is strengthening");
  }
  
  // Emotion-based insights
  const dominantEmotions = reflections
    .filter(r => r.dominant_emotion)
    .map(r => r.dominant_emotion || "");
  
  const uniqueEmotions = Array.from(new Set(dominantEmotions));
  
  if (uniqueEmotions.length > 3) {
    insights.push("Your emotional awareness spans a diverse range of energies");
  }
  
  if (uniqueEmotions.includes("Love") || uniqueEmotions.includes("love")) {
    insights.push("The energy of love is a recurring theme in your reflections");
  }
  
  if (uniqueEmotions.includes("Peace") || uniqueEmotions.includes("peace")) {
    insights.push("Your practice is cultivating inner peace and harmony");
  }
  
  // If we have few insights, add a generic one
  if (insights.length < 2) {
    insights.push("Continue your reflection practice to deepen your insights");
  }
  
  // Return at most 5 insights
  return insights.slice(0, 5);
};
