
import { UserPreferences, ContentRecommendation } from '../types';
import { ScoredContent, ActivityAnalysisResult } from './types';

/**
 * Score content based on user preferences and activity
 */
export function scoreContent(
  content: any, 
  preferences: UserPreferences,
  activityAnalysis: ActivityAnalysisResult
): ScoredContent {
  // Calculate base relevance score from category preferences
  let relevanceScore = preferences.contentCategories.includes(content.category) ? 0.8 : 0.3;
  
  // Adjust score based on practice type preferences
  if (content.type === 'practice' || content.type === 'meditation') {
    relevanceScore *= preferences.practiceTypes.includes(content.practice_type) ? 1.2 : 0.8;
  }
  
  // Adjust score based on content level
  if (content.level === preferences.contentLevel) {
    relevanceScore *= 1.3;
  } else if (
    (content.level === 'beginner' && preferences.contentLevel === 'intermediate') ||
    (content.level === 'intermediate' && preferences.contentLevel === 'advanced')
  ) {
    relevanceScore *= 0.7;
  } else {
    relevanceScore *= 0.4; // Less relevant level
  }
  
  // Adjust score based on chakra alignment
  if (content.chakra_alignment && preferences.chakraFocus) {
    const hasMatchingChakra = content.chakra_alignment.some((chakra: number) => 
      preferences.chakraFocus.includes(chakra)
    );
    relevanceScore *= hasMatchingChakra ? 1.5 : 0.8;
  }
  
  // Lower score if already viewed recently
  if (activityAnalysis.recentlyViewedContentIds.includes(content.id)) {
    relevanceScore *= 0.5;
  }
  
  // Increase score for content with similar emotional resonance to user's reflections
  if (activityAnalysis.userEmotions.length > 0 && content.emotional_resonance) {
    const matchingEmotions = content.emotional_resonance.filter((emotion: string) => 
      activityAnalysis.userEmotions.includes(emotion)
    );
    
    relevanceScore *= (1 + (matchingEmotions.length * 0.2));
  }
  
  // Generate recommendation reason
  let recommendationReason = '';
  
  if (preferences.contentCategories.includes(content.category)) {
    recommendationReason = `Based on your interest in ${content.category}`;
  } else if (content.chakra_alignment && preferences.chakraFocus.some(c => content.chakra_alignment.includes(c))) {
    const matchingChakras = preferences.chakraFocus
      .filter(c => content.chakra_alignment.includes(c))
      .map(getChakraName);
    recommendationReason = `Aligned with your ${matchingChakras.join(' and ')} chakra focus`;
  } else {
    recommendationReason = 'Suggested to expand your practice';
  }
  
  // Create the scored content object
  return {
    id: content.id,
    title: content.title,
    type: content.type,
    category: content.category,
    relevanceScore: relevanceScore,
    chakraAlignment: content.chakra_alignment,
    emotionalResonance: content.emotional_resonance,
    recommendationReason,
    rawScore: relevanceScore // Keep the raw score for debugging
  };
}

/**
 * Get chakra name from index
 */
function getChakraName(index: number): string {
  const chakraNames = [
    'Root', 'Sacral', 'Solar Plexus', 'Heart', 
    'Throat', 'Third Eye', 'Crown'
  ];
  return chakraNames[index] || 'Unknown';
}
