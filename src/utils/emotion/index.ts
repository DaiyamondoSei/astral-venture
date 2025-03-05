
/**
 * Emotion analysis utilities - main export file
 */

// Export all utilities from the analysis directory
export * from './analysis/reflectionContentAnalyzer';
export * from './analysis/depthEvaluator';

/**
 * Analyzes dream theme to extract emotional insights
 */
export function analyzeDreamTheme(
  dominantTheme: string | null
): { chakras: number[], emotions: string[], insights: string[] } {
  // Default empty result
  const result = {
    chakras: [],
    emotions: [],
    insights: []
  };
  
  // If no theme is provided, return default result
  if (!dominantTheme) {
    return result;
  }
  
  // Process theme to extract chakras, emotions, and insights
  switch(dominantTheme.toLowerCase()) {
    case 'love':
      result.chakras.push(3); // Heart chakra
      result.emotions.push('Love');
      result.insights.push('Your heart chakra is activated through love and compassion');
      break;
    case 'peace':
      result.chakras.push(2, 6); // Throat and Crown chakras
      result.emotions.push('Peace');
      result.insights.push('Your practice is cultivating deep inner peace');
      break;
    case 'power':
      result.chakras.push(4, 0); // Solar plexus and Root chakras
      result.emotions.push('Power');
      result.insights.push('You are connecting with your inner strength and power');
      break;
    case 'wisdom':
      result.chakras.push(5, 6); // Third eye and Crown chakras
      result.emotions.push('Wisdom');
      result.insights.push('Your intuitive wisdom is expanding through practice');
      break;
    case 'creativity':
      result.chakras.push(1, 2); // Sacral and Throat chakras
      result.emotions.push('Creativity');
      result.insights.push('Your creative energy is flowing and seeking expression');
      break;
    case 'spirituality':
      result.chakras.push(6, 5); // Crown and Third eye chakras
      result.emotions.push('Connection');
      result.insights.push('You are deepening your spiritual connection');
      break;
    case 'healing':
      result.chakras.push(3, 0); // Heart and Root chakras
      result.emotions.push('Healing');
      result.insights.push('A healing process is unfolding in your energy centers');
      break;
    default:
      // For any other theme, add a default insight
      result.insights.push('Continue your reflection practice for deeper insights');
      break;
  }
  
  return result;
}

/**
 * Analyzes reflection content to extract more emotional insights
 */
export function analyzeReflectionContent(
  text: string,
  existingChakras: number[] = [],
  existingEmotions: string[] = [],
  existingInsights: string[] = []
): { chakras: number[], emotions: string[], insights: string[] } {
  // Default to existing values
  const chakras = [...existingChakras];
  const emotions = [...existingEmotions];
  const insights = [...existingInsights];
  
  // Simple keyword-based analysis for demo purposes
  // In a real app, this would use NLP or a more sophisticated approach
  
  // Check for heart-related content
  if (/love|compassion|heart|connect/i.test(text) && !chakras.includes(3)) {
    chakras.push(3); // Heart chakra
    if (!emotions.includes('Love')) emotions.push('Love');
    if (!insights.includes('Your heart chakra is activating through practice')) {
      insights.push('Your heart chakra is activating through practice');
    }
  }
  
  // Check for throat-related content
  if (/express|voice|speak|truth|communication/i.test(text) && !chakras.includes(2)) {
    chakras.push(2); // Throat chakra
    if (!emotions.includes('Expression')) emotions.push('Expression');
    if (!insights.includes('Your voice and self-expression are growing stronger')) {
      insights.push('Your voice and self-expression are growing stronger');
    }
  }
  
  // Check for third eye-related content
  if (/vision|see|insight|intuition|clarity/i.test(text) && !chakras.includes(5)) {
    chakras.push(5); // Third eye chakra
    if (!emotions.includes('Insight')) emotions.push('Insight');
    if (!insights.includes('Your intuitive perception is expanding')) {
      insights.push('Your intuitive perception is expanding');
    }
  }
  
  // Check for crown-related content
  if (/connection|spiritual|consciousness|divine|awareness/i.test(text) && !chakras.includes(6)) {
    chakras.push(6); // Crown chakra
    if (!emotions.includes('Awareness')) emotions.push('Awareness');
    if (!insights.includes('Your spiritual connection is deepening')) {
      insights.push('Your spiritual connection is deepening');
    }
  }
  
  // Check for solar plexus-related content
  if (/power|confidence|strength|will|discipline/i.test(text) && !chakras.includes(4)) {
    chakras.push(4); // Solar plexus chakra
    if (!emotions.includes('Power')) emotions.push('Power');
    if (!insights.includes('Your personal power is strengthening')) {
      insights.push('Your personal power is strengthening');
    }
  }
  
  // Check for sacral-related content
  if (/creativity|passion|emotion|feeling|sensation/i.test(text) && !chakras.includes(1)) {
    chakras.push(1); // Sacral chakra
    if (!emotions.includes('Creativity')) emotions.push('Creativity');
    if (!insights.includes('Your creative energy is flowing more freely')) {
      insights.push('Your creative energy is flowing more freely');
    }
  }
  
  // Check for root-related content
  if (/ground|safety|security|stability|home/i.test(text) && !chakras.includes(0)) {
    chakras.push(0); // Root chakra
    if (!emotions.includes('Stability')) emotions.push('Stability');
    if (!insights.includes('Your foundation is becoming more stable')) {
      insights.push('Your foundation is becoming more stable');
    }
  }
  
  return { chakras, emotions, insights };
}
