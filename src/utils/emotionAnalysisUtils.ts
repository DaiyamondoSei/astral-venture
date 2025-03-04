
// Types for emotion analysis
export interface EmotionalFactors {
  emotionalDepth: number;
  selfAwareness: number;
  chakraResonance: number;
  emotionalThemes: string[];
}

export interface EmotionAnalysisResult {
  chakras: number[];
  emotions: string[];
  insights: string[];
}

// Map of theme names to chakra indices
export const themeToChakraMap: {[key: string]: number[]} = {
  love: [2], // Heart
  peace: [1, 0], // Throat, Crown
  power: [3, 5], // Solar plexus, Root
  wisdom: [0, 1], // Third eye, Crown
  creativity: [4, 1], // Sacral, Throat
  spirituality: [0, 2], // Crown, Heart
  healing: [2, 5], // Heart, Root
};

// Map of theme names to emotion names
export const themeToEmotionMap: {[key: string]: string} = {
  love: 'Love & Compassion',
  peace: 'Peace & Tranquility',
  power: 'Confidence & Strength',
  wisdom: 'Wisdom & Insight',
  creativity: 'Creativity & Expression',
  spirituality: 'Spiritual Connection',
  healing: 'Healing & Transformation',
};

// Map of theme names to insight messages
export const themeToInsightMap: {[key: string]: string} = {
  love: 'Your heart energy radiates strongly in your practice.',
  peace: 'You naturally attune to higher states of harmony.',
  power: 'Your inner power is awakening as you practice.',
  wisdom: 'Your intuitive abilities are expanding rapidly.',
  creativity: 'Your creative energy seeks greater channels of expression.',
  spirituality: 'Your consciousness is expanding into higher dimensions.',
  healing: 'You are in an important healing cycle right now.',
};

// Keywords for emotional analysis
export const emotionalKeywords = {
  love: ['love', 'compassion', 'heart', 'connect', 'relationship'],
  joy: ['joy', 'happy', 'delight', 'bliss', 'pleasure'],
  peace: ['peace', 'calm', 'tranquil', 'harmony', 'balance'],
  power: ['power', 'strength', 'confidence', 'achieve', 'success'],
  wisdom: ['wisdom', 'insight', 'knowledge', 'understand', 'awareness'],
  creativity: ['create', 'imagine', 'express', 'inspire', 'art'],
  fear: ['fear', 'worry', 'anxiety', 'stress', 'concern'],
  anger: ['anger', 'frustration', 'irritation', 'rage', 'upset'],
  sadness: ['sad', 'grief', 'depression', 'melancholy', 'down']
};

// Analysis insights based on emotions
export const emotionToInsightMap: {[key: string]: string} = {
  love: 'Your heart-centered approach strengthens your connections.',
  joy: 'Joy is becoming a more consistent state in your practice.',
  peace: 'Your ability to remain centered is growing stronger.',
  power: 'You're learning to harness your personal power effectively.',
  wisdom: 'Your capacity for deeper insights is expanding.',
  creativity: 'Creative energy is flowing more freely in your practice.',
  fear: 'Working through fear is part of your growth journey now.',
  anger: 'Transforming anger into constructive energy is a current lesson.',
  sadness: 'Processing emotions fully is creating space for new energy.',
};

// Chakra mapping for emotions
export const emotionToChakraMap: {[key: string]: number[]} = {
  love: [2], // Heart
  joy: [3], // Solar plexus
  peace: [1], // Throat
  power: [3], // Solar plexus
  wisdom: [0], // Third eye
  creativity: [4], // Sacral
  fear: [], // No specific chakra
  anger: [], // No specific chakra
  sadness: [], // No specific chakra
};

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

/**
 * Add chakras based on reflection count
 */
export function addReflectionBasedChakras(
  reflectionCount: number,
  existingChakras: number[]
): number[] {
  const chakras = [...existingChakras];
  
  // Add reflection-count based chakras as a fallback
  if (reflectionCount >= 1 && !chakras.includes(5)) chakras.push(5); // Root
  if (reflectionCount >= 3 && !chakras.includes(4)) chakras.push(4); // Sacral
  if (reflectionCount >= 5 && !chakras.includes(3)) chakras.push(3); // Solar
  if (reflectionCount >= 7 && !chakras.includes(2)) chakras.push(2); // Heart
  if (reflectionCount >= 9 && !chakras.includes(1)) chakras.push(1); // Throat
  if (reflectionCount >= 12 && !chakras.includes(0)) chakras.push(0); // Crown
  
  return chakras;
}

/**
 * Calculate emotional growth based on reflection count
 */
export function calculateEmotionalGrowth(reflectionCount: number): number {
  // Calculate emotional growth (0-100)
  return Math.min(reflectionCount * 10, 100);
}
