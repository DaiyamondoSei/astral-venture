import { addReflectionBasedChakras, calculateEmotionalGrowth } from './chakraUtils';
import { analyzeDreamTheme, analyzeReflectionContent } from './';

/**
 * Analyzes chakra activation based on reflections and dream theme
 */
export function analyzeChakraActivation(
  reflections: any[],
  dominantTheme: string | null
) {
  // Start with empty arrays for our analysis results
  let chakras: number[] = [];
  let emotions: string[] = [];
  let insights: string[] = [];
  
  // Analyze dream theme first with improved analysis
  const dreamAnalysis = analyzeDreamTheme(dominantTheme);
  chakras = [...dreamAnalysis.chakras];
  emotions = [...dreamAnalysis.emotions];
  insights = [...dreamAnalysis.insights];
  
  // Analyze reflection content with more sophisticated emotional extraction
  if (reflections.length > 0) {
    const combinedReflections = reflections.map(r => r.content).join(' ');
    const reflectionAnalysis = analyzeReflectionContent(
      combinedReflections,
      chakras,
      emotions,
      insights
    );
    
    chakras = reflectionAnalysis.chakras;
    emotions = reflectionAnalysis.emotions;
    insights = reflectionAnalysis.insights;
  }
  
  // Add chakras based on reflection count as a fallback
  const reflectionCount = reflections.length;
  chakras = addReflectionBasedChakras(reflectionCount, chakras);
  
  return { chakras, emotions, insights, reflectionCount };
}

/**
 * Determines chakra intensity based on analysis
 */
export function getChakraIntensity(
  chakraIndex: number,
  activatedChakras: number[],
  emotionalGrowth: number
) {
  // Check if this chakra is activated
  if (activatedChakras.includes(chakraIndex)) {
    // If multiple chakras are active, distribute intensity based on position
    // (higher chakras generally indicate advanced practice)
    const activatedCount = activatedChakras.length;
    const position = activatedChakras.indexOf(chakraIndex);
    
    // Give slightly higher intensity to more recently activated chakras
    const baseIntensity = 0.7;
    const positionBonus = (position / activatedCount) * 0.3;
    
    return Math.min(baseIntensity + positionBonus, 1.0);
  }
  
  // Otherwise return partial intensity based on emotional growth
  return emotionalGrowth / 200; // Half intensity at most
}
