
import { AIInsight, AIModel, AIQuestion } from '@/services/ai/types';
import { aiService } from '@/services/ai/aiService';

export interface ChakraBalanceData {
  chakra: string;
  id: number;
  value: number;
  active: boolean;
  name: string;
  color: string;
}

export interface ChakraInsight {
  chakra: string;
  message: string;
  value: number;
  suggestions: string[];
}

export class ChakraInsightsService {
  // Helper to determine which chakras are activated
  private determineActivatedChakras(chakraData: ChakraBalanceData[]): number[] {
    return chakraData
      .filter(chakra => chakra.active)
      .map(chakra => chakra.id);
  }

  // Normalize chakra data for AI processing
  private normalizeChakraData(chakraData: ChakraBalanceData[]): any {
    const chakraNames = this.getChakraNames(chakraData);
    return {
      activated: this.determineActivatedChakras(chakraData),
      values: chakraData.map(c => ({ id: c.id, name: c.name, value: c.value }))
    };
  }

  // Helper to get chakra names array
  private getChakraNames(chakraData: ChakraBalanceData[]): string[] {
    return chakraData.map(c => c.name);
  }

  // Get personalized recommendations for chakra balancing
  async getPersonalizedRecommendations(
    chakraData: ChakraBalanceData[],
    currentEmotion?: string
  ): Promise<string[]> {
    try {
      const normalizedChakras = this.normalizeChakraData(chakraData);
      const activatedChakras = this.determineActivatedChakras(chakraData);
      
      const prompt = `Based on my current chakra readings: ${JSON.stringify(normalizedChakras)}, 
      ${currentEmotion ? `and my current dominant emotion of ${currentEmotion},` : ''}
      provide 3 specific, actionable recommendations to help balance my energy centers.`;
      
      const response = await aiService.askQuestion({
        question: prompt,
        text: prompt
      });
      
      // Parse or extract recommendations from the response
      const recommendations: string[] = 
        response.suggestedPractices && response.suggestedPractices.length > 0 
          ? response.suggestedPractices 
          : this.extractRecommendationsFromText(response.answer);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting chakra recommendations:', error);
      return [
        'Practice deep breathing exercises focusing on your core energy centers',
        'Spend time in nature to rebalance your energy flow',
        'Consider meditation with visualization of balanced chakra colors'
      ];
    }
  }
  
  // Extract recommendations from text response
  private extractRecommendationsFromText(text: string): string[] {
    // Simple extraction logic - look for numbered items or bullet points
    const lines = text.split('\n');
    const recommendations: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match numbered items or bullet points
      if (/^(\d+\.|\*|-)\s+/.test(trimmed)) {
        const recommendation = trimmed.replace(/^(\d+\.|\*|-)\s+/, '');
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }
    
    // If no recommendations were found with the pattern, just return the first 3 sentences
    if (recommendations.length === 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return sentences.slice(0, 3).map(s => s.trim());
    }
    
    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }

  // Get insights for specific chakras
  async getChakraInsights(chakraData: ChakraBalanceData[]): Promise<ChakraInsight[]> {
    // Implementation for getting detailed chakra insights
    return chakraData.filter(c => c.active).map(chakra => ({
      chakra: chakra.name,
      message: `Your ${chakra.name} chakra is ${this.getChakraState(chakra.value)}`,
      value: chakra.value,
      suggestions: this.getDefaultSuggestionsForChakra(chakra.name)
    }));
  }
  
  private getChakraState(value: number): string {
    if (value < 0.3) return "underactive";
    if (value > 0.7) return "overactive";
    return "balanced";
  }
  
  private getDefaultSuggestionsForChakra(chakraName: string): string[] {
    // Default suggestions when AI is not available
    const defaultSuggestions: Record<string, string[]> = {
      "Root": [
        "Practice grounding exercises",
        "Walk barefoot in nature",
        "Use red crystals like garnet or ruby"
      ],
      "Sacral": [
        "Dance to express yourself",
        "Create art or engage in creative activities",
        "Use orange crystals like carnelian"
      ],
      "Solar Plexus": [
        "Practice yoga focusing on core strength",
        "Affirm your personal power daily",
        "Use yellow crystals like citrine"
      ],
      "Heart": [
        "Practice loving-kindness meditation",
        "Spend time with loved ones",
        "Use green or pink crystals like rose quartz"
      ],
      "Throat": [
        "Express yourself through writing or speaking",
        "Sing or hum to vibrate the throat area",
        "Use blue crystals like aquamarine"
      ],
      "Third Eye": [
        "Practice meditation focusing on the third eye area",
        "Keep a dream journal",
        "Use indigo or purple crystals like amethyst"
      ],
      "Crown": [
        "Practice silent meditation",
        "Spend time in prayer or spiritual connection",
        "Use violet or white crystals like clear quartz"
      ]
    };
    
    return defaultSuggestions[chakraName] || [
      "Meditate focusing on this chakra",
      "Research specific activities for this energy center",
      "Consider energy healing techniques"
    ];
  }
}

export const chakraInsightsService = new ChakraInsightsService();
