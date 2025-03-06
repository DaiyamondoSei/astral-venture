
import { EnergyReflection } from './types';

/**
 * Generate insights based on a collection of reflections
 * 
 * @param reflections Array of user reflections
 * @returns Array of insight strings
 */
export function getReflectionInsights(reflections: EnergyReflection[]): string[] {
  if (!reflections || reflections.length === 0) {
    return [];
  }

  const insights: string[] = [];
  
  // Check for consistent practice
  if (reflections.length > 3) {
    insights.push("Your consistent reflection practice is strengthening your energetic awareness");
  }
  
  // Look for emotional patterns
  const emotions = reflections
    .filter(r => r.dominant_emotion)
    .map(r => r.dominant_emotion as string);
  
  if (emotions.length > 0) {
    const emotionCounts: Record<string, number> = {};
    emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    // Find most frequent emotion
    const mostFrequent = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
    if (mostFrequent && mostFrequent[1] > 1) {
      insights.push(`You've been experiencing ${mostFrequent[0]} energy frequently in your practice`);
    }
  }
  
  // Analyze chakra activation patterns
  const chakraCounts: Record<number, number> = {};
  reflections.forEach(reflection => {
    if (reflection.chakras_activated && Array.isArray(reflection.chakras_activated)) {
      reflection.chakras_activated.forEach(chakra => {
        chakraCounts[chakra] = (chakraCounts[chakra] || 0) + 1;
      });
    }
  });
  
  // Map chakra numbers to names for insights
  const chakraNames: Record<number, string> = {
    1: "Root",
    2: "Sacral",
    3: "Solar Plexus",
    4: "Heart",
    5: "Throat",
    6: "Third Eye",
    7: "Crown"
  };
  
  // Find most activated chakra
  const mostActivatedChakra = Object.entries(chakraCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([chakraId, count]) => ({ 
      id: parseInt(chakraId, 10), 
      count,
      name: chakraNames[parseInt(chakraId, 10)] || `Chakra ${chakraId}`
    }))[0];
  
  if (mostActivatedChakra && mostActivatedChakra.count > 1) {
    insights.push(`Your ${mostActivatedChakra.name} chakra has been particularly active`);
  }
  
  // Check for emotional depth progression
  const depthValues = reflections
    .filter(r => r.emotional_depth !== undefined)
    .map(r => r.emotional_depth as number);
  
  if (depthValues.length > 1) {
    const initialDepth = depthValues[depthValues.length - 1]; // oldest
    const latestDepth = depthValues[0]; // newest
    
    if (latestDepth > initialDepth + 0.1) {
      insights.push("Your emotional awareness is deepening with each reflection");
    }
  }
  
  // Add general insights if we don't have enough specific ones
  if (insights.length < 2) {
    insights.push("Regular reflection helps integrate energy work into daily life");
    insights.push("Notice patterns in your reflections to deepen your practice");
  }
  
  return insights;
}
