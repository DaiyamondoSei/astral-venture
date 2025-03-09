
import { AIInsight, ChakraInsightsOptions } from '@/services/ai/types';
import { queryAI } from '@/services/ai/aiService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for generating and managing chakra-related insights
 */
class ChakraInsightsService {
  /**
   * Generate insights about chakra balance based on reflection content
   */
  async generateChakraInsights(reflectionContent: string, options: ChakraInsightsOptions = {}): Promise<AIInsight[]> {
    try {
      // Set default options
      const { 
        includeRecommendations = true,
        detailLevel = 'detailed',
        timeframe = 'recent'
      } = options;
      
      // Build prompt for AI
      const prompt = `
        Analyze this reflection and identify the chakra energies present: 
        "${reflectionContent}"
        
        ${includeRecommendations ? 'Include recommendations for balancing each chakra.' : ''}
        ${detailLevel === 'detailed' ? 'Provide detailed analysis of each chakra mentioned.' : 'Provide a brief summary.'}
        ${timeframe === 'recent' ? 'Focus on current energy patterns.' : 'Consider long-term patterns.'}
      `;
      
      // Query AI service
      const response = await queryAI(prompt);
      
      if (!response || !response.answer) {
        return [];
      }
      
      // Parse insights from response
      const insights = this.parseChakraInsights(response.answer);
      return insights;
    } catch (error) {
      console.error('Error generating chakra insights:', error);
      return [];
    }
  }
  
  /**
   * Parse chakra insights from AI response text
   */
  private parseChakraInsights(responseText: string): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Extract chakra-related paragraphs
    const paragraphs = responseText.split('\n\n').filter(p => p.trim().length > 0);
    
    // Map common chakra terms to formal chakra types
    const chakraMap: Record<string, string> = {
      'root': 'chakra',
      'sacral': 'chakra',
      'solar plexus': 'chakra',
      'heart': 'chakra',
      'throat': 'chakra',
      'third eye': 'chakra',
      'crown': 'chakra',
      'base': 'chakra',
      'muladhara': 'chakra',
      'svadhisthana': 'chakra',
      'manipura': 'chakra',
      'anahata': 'chakra',
      'vishuddha': 'chakra',
      'ajna': 'chakra',
      'sahasrara': 'chakra'
    };
    
    // Process each paragraph
    paragraphs.forEach(paragraph => {
      // Skip very short paragraphs
      if (paragraph.length < 20) return;
      
      // Determine if paragraph is about chakras
      const chakraMatch = Object.keys(chakraMap).find(term => 
        paragraph.toLowerCase().includes(term)
      );
      
      if (chakraMatch) {
        // Determine insight type
        let insightType: 'chakra' | 'emotion' | 'practice' | 'wisdom' = 'chakra';
        
        if (paragraph.toLowerCase().includes('practice') || 
            paragraph.toLowerCase().includes('exercise') ||
            paragraph.toLowerCase().includes('technique')) {
          insightType = 'practice';
        } else if (paragraph.toLowerCase().includes('feeling') || 
                  paragraph.toLowerCase().includes('emotion') ||
                  paragraph.toLowerCase().includes('mood')) {
          insightType = 'emotion';
        }
        
        // Extract a title from the first sentence or create one
        const sentences = paragraph.split(/[.!?]/).filter(s => s.trim().length > 0);
        const firstSentence = sentences[0] || '';
        const title = firstSentence.length > 50 
          ? firstSentence.substring(0, 50) + '...' 
          : firstSentence;
        
        // Add the insight
        insights.push({
          id: uuidv4(),
          type: insightType,
          text: paragraph,
          title: title || `${chakraMatch.charAt(0).toUpperCase() + chakraMatch.slice(1)} Insight`,
          confidence: 0.85,
          relevance: 0.9,
          content: paragraph // Include full content
        });
      }
    });
    
    return insights;
  }
  
  /**
   * Get chakra recommendations based on activated chakras
   */
  async getChakraRecommendations(activatedChakras: number[]): Promise<string[]> {
    try {
      const chakraNames = [
        'Root (Muladhara)',
        'Sacral (Svadhisthana)',
        'Solar Plexus (Manipura)',
        'Heart (Anahata)',
        'Throat (Vishuddha)',
        'Third Eye (Ajna)',
        'Crown (Sahasrara)'
      ];
      
      const activatedNames = activatedChakras.map(index => chakraNames[index]);
      const inactiveNames = chakraNames.filter((_, index) => !activatedChakras.includes(index));
      
      if (activatedNames.length === 0) {
        return [
          'Begin your chakra activation journey with grounding practices',
          'Try meditation focused on your base/root chakra',
          'Practice deep breathing to prepare your energy centers'
        ];
      }
      
      // Generate recommendations based on active and inactive chakras
      const recommendations = [
        `Continue working with your ${activatedNames.join(', ')} chakras`,
        `Consider practices to activate your ${inactiveNames.join(', ')} chakras`,
        'Maintain a regular energy balancing practice for holistic harmony'
      ];
      
      return recommendations;
    } catch (error) {
      console.error('Error getting chakra recommendations:', error);
      return [
        'Practice regular chakra meditation',
        'Balance your energy through mindful activities',
        'Consider energy healing modalities for chakra alignment'
      ];
    }
  }
}

// Export a singleton instance
export const chakraInsightsService = new ChakraInsightsService();
export default chakraInsightsService;
