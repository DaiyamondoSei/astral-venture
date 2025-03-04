
/**
 * Mappings between emotions, chakras, and insights
 */

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
  power: 'You\'re learning to harness your personal power effectively.',
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
