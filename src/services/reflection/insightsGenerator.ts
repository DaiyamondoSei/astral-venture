
import { EnergyReflection } from './types';

// Function to get reflection insights
export const getReflectionInsights = (reflections: EnergyReflection[]): string[] => {
  // Skip if no reflections
  if (!reflections.length) return [];
  
  const insights: string[] = [];
  
  // Check frequency
  if (reflections.length >= 5) {
    const daysBetween = (date1: string, date2: string) => {
      return Math.abs(Math.floor(
        (new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 60 * 60 * 24)
      ));
    };
    
    // Sort by date
    const sortedReflections = [...reflections].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Get recent reflections (last 5)
    const recentReflections = sortedReflections.slice(-5);
    
    // Calculate average days between reflections
    let totalDays = 0;
    for (let i = 1; i < recentReflections.length; i++) {
      totalDays += daysBetween(recentReflections[i].created_at, recentReflections[i-1].created_at);
    }
    const avgDays = totalDays / (recentReflections.length - 1);
    
    if (avgDays <= 1) {
      insights.push("Your daily reflection practice is strengthening your emotional intelligence");
    } else if (avgDays <= 3) {
      insights.push("Your regular reflection practice is building emotional awareness");
    } else {
      insights.push("Consider more frequent reflections to accelerate your emotional growth");
    }
  }
  
  // Check emotional depth
  const depthValues = reflections
    .filter(r => r.emotional_depth !== undefined)
    .map(r => r.emotional_depth || 0);
  
  if (depthValues.length > 0) {
    const avgDepth = depthValues.reduce((a, b) => a + b, 0) / depthValues.length;
    
    if (avgDepth > 0.7) {
      insights.push("Your reflections show deep emotional intelligence and self-awareness");
    } else if (avgDepth > 0.4) {
      insights.push("Your emotional depth is developing well through your practice");
    } else {
      insights.push("Try exploring your feelings more deeply in your reflections");
    }
  }
  
  // Check chakra activation
  const allChakras = reflections.flatMap(r => r.chakras_activated || []);
  const uniqueChakras = [...new Set(allChakras)];
  
  if (uniqueChakras.length >= 5) {
    insights.push("You've activated most of your energy centers through your practice");
  } else if (uniqueChakras.length >= 3) {
    insights.push("Multiple energy centers are being activated in your practice");
  } else if (uniqueChakras.length > 0) {
    insights.push("Continue your practice to activate more energy centers");
  }
  
  return insights;
};
