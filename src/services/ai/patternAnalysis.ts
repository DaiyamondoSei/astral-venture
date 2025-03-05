
import { HistoricalReflection } from '@/components/reflection/types';
import { normalizeChakraData } from '@/utils/emotion/chakraTypes';

export const analyzeReflectionPatterns = (reflections: HistoricalReflection[]) => {
  if (!reflections || reflections.length === 0) {
    return {
      dominantEmotions: [],
      dominantChakras: [],
      recentTrends: [],
      emotionalDepthChange: 0,
      chakraProgression: [],
      recommendedFocus: []
    };
  }

  // Get all unique emotions and count their occurrences
  const emotionCounts = {};
  reflections.forEach(reflection => {
    if (reflection.dominant_emotion) {
      emotionCounts[reflection.dominant_emotion] = 
        (emotionCounts[reflection.dominant_emotion] || 0) + 1;
    }
  });

  // Sort emotions by count in descending order
  const dominantEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  // Analyze chakra activation patterns
  const activatedChakras = new Set<number>();
  const chakraCounts = Array(7).fill(0);

  reflections.forEach(reflection => {
    const normalizedChakras = normalizeChakraData(reflection.chakras_activated);
    
    normalizedChakras.forEach(chakra => {
      activatedChakras.add(chakra);
      chakraCounts[chakra] = (chakraCounts[chakra] || 0) + 1;
    });
  });

  // Get the dominant chakras
  const dominantChakras = chakraCounts
    .map((count, index) => ({ index, count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => item.index);

  // Analyze recent trends based on last 3 reflections
  const recentReflections = reflections.slice(0, 3);
  const recentTrends = [];

  if (recentReflections.length >= 2) {
    const depthChange = recentReflections[0].emotional_depth - recentReflections[1].emotional_depth;
    if (depthChange > 0.2) {
      recentTrends.push("Increasing emotional depth");
    } else if (depthChange < -0.2) {
      recentTrends.push("Decreasing emotional depth");
    } else {
      recentTrends.push("Stable emotional depth");
    }
  }

  // Add more trend analysis based on emotions
  if (recentReflections.length >= 2) {
    const latestEmotion = recentReflections[0].dominant_emotion;
    const previousEmotion = recentReflections[1].dominant_emotion;
    
    if (latestEmotion !== previousEmotion) {
      recentTrends.push(`Shift from ${previousEmotion} to ${latestEmotion}`);
    } else {
      recentTrends.push(`Consistent ${latestEmotion} energy`);
    }
  }

  // Calculate emotional depth change over time
  const oldestReflection = reflections[reflections.length - 1];
  const newestReflection = reflections[0];
  const emotionalDepthChange = newestReflection.emotional_depth - oldestReflection.emotional_depth;

  // Determine chakra progression
  const chakraProgression = Array.from(activatedChakras).sort();

  // Generate recommended focus areas
  const recommendedFocus = [];
  
  // Check if there's a gap in chakra progression
  for (let i = 0; i < 7; i++) {
    if (!chakraProgression.includes(i)) {
      recommendedFocus.push(`Activate your ${getChakraName(i)} chakra`);
      break;
    }
  }

  // Add recommendation based on emotional patterns
  if (dominantEmotions.includes('anxiety') || dominantEmotions.includes('stress')) {
    recommendedFocus.push("Practice grounding and breathing exercises");
  }

  if (dominantEmotions.includes('confusion') || dominantEmotions.includes('uncertainty')) {
    recommendedFocus.push("Meditation for mental clarity");
  }

  if (emotionalDepthChange < 0) {
    recommendedFocus.push("Deepen your reflective practice");
  }

  return {
    dominantEmotions,
    dominantChakras,
    recentTrends,
    emotionalDepthChange,
    chakraProgression,
    recommendedFocus: recommendedFocus.slice(0, 2) // Limit to top 2 recommendations
  };
};

function getChakraName(index: number): string {
  const names = [
    "Root", "Sacral", "Solar Plexus", 
    "Heart", "Throat", "Third Eye", "Crown"
  ];
  return names[index] || "";
}
