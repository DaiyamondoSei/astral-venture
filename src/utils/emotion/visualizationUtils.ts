
import { ChakraType, ChakraTypes } from '@/types/chakra/ChakraSystemTypes';
import { CHAKRA_COLORS, CHAKRA_NAMES } from './constants';

/**
 * Generate chakra balance data for visualization
 */
export function generateChakraBalanceData(
  activatedChakras: number[],
  dominantEmotions: string[]
): any[] {
  const chakraTypes: ChakraType[] = [
    ChakraTypes.ROOT,
    ChakraTypes.SACRAL, 
    ChakraTypes.SOLAR,
    ChakraTypes.HEART,
    ChakraTypes.THROAT,
    ChakraTypes.THIRD_EYE,
    ChakraTypes.CROWN
  ];
  
  // Generate data for radar chart
  return chakraTypes.map((chakraType, index) => {
    const isActivated = activatedChakras.includes(index);
    const activationLevel = isActivated ? 
      Math.random() * 0.4 + 0.6 : // 0.6-1.0 for activated
      Math.random() * 0.4 + 0.1;  // 0.1-0.5 for non-activated
    
    return {
      chakra: CHAKRA_NAMES[chakraType],
      value: activationLevel,
      color: CHAKRA_COLORS[chakraType]
    };
  });
}

/**
 * Generate emotional history timeline data
 */
export function generateEmotionalHistoryData(
  reflections: any[],
  depthScores: number[]
): { timeline: any[], milestones: any[] } {
  // Default empty data
  if (!reflections || reflections.length === 0) {
    return { timeline: [], milestones: [] };
  }
  
  // Sort reflections by date
  const sortedReflections = [...reflections].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Generate timeline data points
  const timeline = sortedReflections.map((reflection, index) => {
    const date = new Date(reflection.created_at);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    
    return {
      date: formattedDate,
      depth: reflection.emotional_depth || 0,
      emotion: reflection.dominant_emotion || 'neutral',
      value: depthScores[index] || 0
    };
  });
  
  // Find milestone moments (significant emotional shifts)
  const milestones = [];
  let prevDepth = timeline[0]?.depth || 0;
  
  for (let i = 1; i < timeline.length; i++) {
    const depthChange = Math.abs(timeline[i].depth - prevDepth);
    
    // If significant depth change, mark as milestone
    if (depthChange >= 2) {
      milestones.push({
        date: timeline[i].date,
        type: timeline[i].depth > prevDepth ? 'growth' : 'challenge',
        message: timeline[i].depth > prevDepth ? 
          'Significant emotional growth' : 
          'Emotional challenge moment',
        index: i
      });
    }
    
    prevDepth = timeline[i].depth;
  }
  
  return { timeline, milestones };
}

/**
 * Generate personalized recommendations based on chakra analysis
 */
export function generateRecommendations(
  activatedChakras: number[],
  dominantEmotions: string[]
): string[] {
  // Basic recommendations if no data
  if (activatedChakras.length === 0) {
    return [
      "Start with basic grounding meditation to establish a foundation.",
      "Journal daily to track your emotional patterns.",
      "Practice mindful breathing for 5 minutes each day."
    ];
  }
  
  const recommendations: string[] = [];
  const chakraTypes: ChakraType[] = [
    ChakraTypes.ROOT,
    ChakraTypes.SACRAL, 
    ChakraTypes.SOLAR,
    ChakraTypes.HEART,
    ChakraTypes.THROAT,
    ChakraTypes.THIRD_EYE,
    ChakraTypes.CROWN
  ];
  
  // Recommendations for each activated chakra
  activatedChakras.forEach(index => {
    if (index < 0 || index >= chakraTypes.length) return;
    
    const chakraType = chakraTypes[index];
    const chakraName = CHAKRA_NAMES[chakraType];
    
    switch (chakraType) {
      case ChakraTypes.ROOT:
        recommendations.push(`Strengthen your ${chakraName} chakra with grounding practices like walking in nature.`);
        break;
      case ChakraTypes.SACRAL:
        recommendations.push(`Enhance your ${chakraName} chakra through creative expression and emotional release.`);
        break;
      case ChakraTypes.SOLAR:
        recommendations.push(`Develop your ${chakraName} chakra by setting boundaries and affirming your personal power.`);
        break;
      case ChakraTypes.HEART:
        recommendations.push(`Open your ${chakraName} chakra with compassion practices and forgiveness meditation.`);
        break;
      case ChakraTypes.THROAT:
        recommendations.push(`Express your ${chakraName} chakra by speaking your truth and practicing authentic communication.`);
        break;
      case ChakraTypes.THIRD_EYE:
        recommendations.push(`Cultivate your ${chakraName} chakra through visualization and intuition exercises.`);
        break;
      case ChakraTypes.CROWN:
        recommendations.push(`Connect with your ${chakraName} chakra via meditation and exploring your spiritual path.`);
        break;
    }
  });
  
  // Add recommendations based on emotions if any chakras are activated
  if (dominantEmotions.length > 0) {
    if (dominantEmotions.some(e => ['anxiety', 'fear', 'worry'].includes(e.toLowerCase()))) {
      recommendations.push("Practice calming breathwork to reduce anxiety and fear.");
    }
    
    if (dominantEmotions.some(e => ['sadness', 'grief', 'depression'].includes(e.toLowerCase()))) {
      recommendations.push("Engage in heart-opening practices like gratitude journaling to balance sadness.");
    }
    
    if (dominantEmotions.some(e => ['anger', 'frustration', 'irritation'].includes(e.toLowerCase()))) {
      recommendations.push("Channel emotional energy through physical movement like yoga or tai chi.");
    }
  }
  
  // General recommendation if we still have fewer than 3
  if (recommendations.length < 3) {
    recommendations.push("Establish a consistent meditation practice to strengthen your energy centers.");
  }
  
  return recommendations;
}
