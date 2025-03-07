
import { ChakraActivated, normalizeChakraData } from '@/utils/emotion/chakraTypes';
import { getChakraNames } from '@/utils/emotion/chakraUtils';
import { aiService } from '@/services/ai/aiService';

/**
 * Service for generating chakra-related insights and practice recommendations
 */
export class ChakraInsightsService {
  /**
   * Get personalized insights based on activated chakras and dominant emotions
   * 
   * @param userId User ID for personalized content
   * @param activatedChakras User's activated chakras
   * @param dominantEmotions User's dominant emotions
   * @returns Object containing insights and recommendations
   */
  static async getPersonalizedInsights(
    userId: string, 
    activatedChakras?: ChakraActivated, 
    dominantEmotions: string[] = []
  ) {
    try {
      // Get chakra names from normalized data
      const normalizedChakras = normalizeChakraData(activatedChakras);
      const chakraNames = getChakraNames(normalizedChakras);
      
      // Generate personalized practice recommendations
      const recommendations = await aiService.getPersonalizedRecommendations(userId);
      const practiceRecommendations = recommendations.slice(0, 3);
      
      // Generate personalized insights based on chakra data
      const personalizedInsights: string[] = [];
      
      if (chakraNames.length > 0) {
        const dominantChakra = chakraNames[0];
        personalizedInsights.push(
          `Your ${dominantChakra} chakra is currently the most active, suggesting a focus on ${this.getChakraFocus(dominantChakra)}.`
        );
      }
      
      if (dominantEmotions.length > 0) {
        const topEmotion = dominantEmotions[0];
        personalizedInsights.push(
          `Your reflections show a strong ${topEmotion.toLowerCase()} energy signature.`
        );
      }
      
      if (chakraNames.length >= 2) {
        personalizedInsights.push(
          `The connection between your ${chakraNames[0]} and ${chakraNames[1]} chakras indicates ${this.getChakraConnectionInsight(chakraNames[0], chakraNames[1])}.`
        );
      }
      
      return {
        personalizedInsights,
        practiceRecommendations
      };
    } catch (error) {
      console.error('Error generating chakra insights:', error);
      return {
        personalizedInsights: ['Continue your reflection practice to deepen your insights.'],
        practiceRecommendations: []
      };
    }
  }
  
  /**
   * Get focus area description for a specific chakra
   */
  private static getChakraFocus(chakra: string): string {
    const focuses = {
      'Root': 'stability and security',
      'Sacral': 'creativity and emotions',
      'Solar Plexus': 'personal power and confidence',
      'Heart': 'love and compassion',
      'Throat': 'communication and expression',
      'Third Eye': 'intuition and wisdom',
      'Crown': 'spiritual connection and higher consciousness'
    };
    
    return focuses[chakra as keyof typeof focuses] || 'energy balance';
  }
  
  /**
   * Get insight for a connection between two chakras
   */
  private static getChakraConnectionInsight(chakra1: string, chakra2: string): string {
    if ((chakra1 === 'Heart' && chakra2 === 'Throat') || 
        (chakra1 === 'Throat' && chakra2 === 'Heart')) {
      return 'a deepening connection between love and authentic expression';
    }
    
    if ((chakra1 === 'Third Eye' && chakra2 === 'Crown') || 
        (chakra1 === 'Crown' && chakra2 === 'Third Eye')) {
      return 'an awakening of higher spiritual awareness and intuition';
    }
    
    if ((chakra1 === 'Root' && chakra2 === 'Solar Plexus') || 
        (chakra1 === 'Solar Plexus' && chakra2 === 'Root')) {
      return 'a grounding of your personal power';
    }
    
    return 'a meaningful pattern in your energy system';
  }
}
