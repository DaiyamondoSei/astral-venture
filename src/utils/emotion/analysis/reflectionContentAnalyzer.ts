
/**
 * Functions for analyzing reflection content and extracting emotional insights
 */

import { EmotionAnalysisResult } from '../types';
import { 
  emotionalKeywords, 
  emotionToChakraMap, 
  emotionToInsightMap
} from '../mappings';

/**
 * Analyze reflections to extract emotional insights with improved depth
 */
export function analyzeReflectionContent(
  combinedReflections: string,
  existingChakras: number[] = [],
  existingEmotions: string[] = [],
  existingInsights: string[] = []
): EmotionAnalysisResult {
  const chakras = [...existingChakras];
  const emotions = [...existingEmotions];
  const insights = [...existingInsights];
  
  // Track emotional keywords frequency with expanded vocabulary
  const emotionalAnalysis: {[key: string]: number} = {
    love: 0,
    joy: 0,
    peace: 0,
    power: 0,
    wisdom: 0,
    creativity: 0,
    gratitude: 0,
    healing: 0,
    spiritual: 0,
    fear: 0,
    anger: 0,
    sadness: 0
  };
  
  // Count keyword occurrences with better context awareness
  Object.entries(emotionalKeywords).forEach(([emotion, words]) => {
    words.forEach(word => {
      // Use word boundaries for more accurate matches
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = combinedReflections.match(regex);
      if (matches) {
        // Weight longer or more specific phrases higher
        const weight = word.includes(' ') ? 1.5 : 1.0;
        emotionalAnalysis[emotion] += matches.length * weight;
      }
    });
  });
  
  // Analyze sentence structure for deeper emotional assessment
  const sentences = combinedReflections.split(/[.!?]+/).filter(s => s.trim().length > 0);
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    
    // Detect reflective language
    if (lowerSentence.includes('i feel') || lowerSentence.includes('i felt')) {
      emotionalAnalysis.love += 0.5;
    }
    
    // Detect spiritual awareness
    if (lowerSentence.includes('connection') || lowerSentence.includes('universe') || 
        lowerSentence.includes('divine') || lowerSentence.includes('consciousness')) {
      emotionalAnalysis.spiritual += 0.7;
    }
    
    // Detect healing processes
    if (lowerSentence.includes('healing') || lowerSentence.includes('release') || 
        lowerSentence.includes('letting go') || lowerSentence.includes('transform')) {
      emotionalAnalysis.healing += 0.7;
    }
    
    // Detect gratitude expressions
    if (lowerSentence.includes('grateful') || lowerSentence.includes('thankful') || 
        lowerSentence.includes('appreciate') || lowerSentence.includes('blessing')) {
      emotionalAnalysis.gratitude += 1.0;
    }
  });
  
  // Get top emotions with improved weighting
  const topEmotions = Object.entries(emotionalAnalysis)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0.5) // Higher threshold for more meaningful results
    .slice(0, 4) // Get more emotions for richer analysis
    .map(([emotion]) => emotion);
    
  // Add emotions and related insights/chakras with more nuanced connections
  topEmotions.forEach(emotion => {
    // Format emotion for display (capitalize first letter)
    const formattedEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    if (!emotions.includes(formattedEmotion)) {
      emotions.push(formattedEmotion);
    }
    
    // Add related chakras with improved mapping
    const relatedChakras = emotionToChakraMap[emotion] || [];
    relatedChakras.forEach(chakraIndex => {
      if (!chakras.includes(chakraIndex)) {
        chakras.push(chakraIndex);
      }
    });
    
    // Add related insights with more depth
    const insight = emotionToInsightMap[emotion];
    if (insight && !insights.includes(insight)) {
      insights.push(insight);
    }
  });
  
  // Add secondary insights based on emotional combinations
  if (topEmotions.includes('love') && topEmotions.includes('peace')) {
    insights.push("Your heart-centered practice is creating deep inner harmony");
  }
  
  if (topEmotions.includes('wisdom') && topEmotions.includes('power')) {
    insights.push("You're developing balanced mastery by combining wisdom with strength");
  }
  
  if (topEmotions.includes('creativity') && topEmotions.includes('spiritual')) {
    insights.push("Your creative expression is becoming a channel for spiritual growth");
  }
  
  if (topEmotions.includes('healing') && topEmotions.includes('gratitude')) {
    insights.push("Gratitude is accelerating your healing journey");
  }
  
  // Ensure we always return at least one insight
  if (insights.length === 0) {
    insights.push("Continue your reflection practice to deepen your emotional awareness");
  }
  
  return { chakras, emotions, insights };
}
