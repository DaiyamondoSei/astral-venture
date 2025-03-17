import { ChakraType, ChakraTypes } from '@/types/chakra/ChakraSystemTypes';

export interface ChakraInsight {
  id: string;
  chakraType: ChakraType;
  title: string;
  description: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Service for providing insights and recommendations for chakra system
 */
class ChakraInsightsService {
  private chakraInsightsMap: Record<ChakraType, ChakraInsight[]> = {
    [ChakraTypes.ROOT]: [
      {
        id: 'root-1',
        chakraType: ChakraTypes.ROOT,
        title: 'Grounding Practice',
        description: 'Establish a stronger connection with your physical body and the earth.',
        actionItems: ['Daily walking meditation', 'Gardening', 'Barefoot connection with nature'],
        priority: 'medium'
      }
    ],
    [ChakraTypes.SACRAL]: [
      {
        id: 'sacral-1',
        chakraType: ChakraTypes.SACRAL,
        title: 'Creative Expression',
        description: 'Engage your creative energy through artistic expression.',
        actionItems: ['Dance freely', 'Journal your emotions', 'Create art without judgment'],
        priority: 'medium'
      }
    ],
    [ChakraTypes.SOLAR]: [
      {
        id: 'solar-1',
        chakraType: ChakraTypes.SOLAR,
        title: 'Personal Power',
        description: 'Strengthen your sense of self and personal boundaries.',
        actionItems: ['Practice saying no', 'Set clear intentions', 'Core-strengthening exercises'],
        priority: 'high'
      }
    ],
    [ChakraTypes.HEART]: [
      {
        id: 'heart-1',
        chakraType: ChakraTypes.HEART,
        title: 'Compassion Practice',
        description: 'Open your heart to yourself and others with compassion.',
        actionItems: ['Self-forgiveness meditation', 'Random acts of kindness', 'Gratitude journaling'],
        priority: 'high'
      }
    ],
    [ChakraTypes.THROAT]: [
      {
        id: 'throat-1',
        chakraType: ChakraTypes.THROAT,
        title: 'Authentic Expression',
        description: 'Speak your truth with clarity and confidence.',
        actionItems: ['Singing or chanting', 'Share an important truth', 'Practice active listening'],
        priority: 'medium'
      }
    ],
    [ChakraTypes.THIRD_EYE]: [
      {
        id: 'third-eye-1',
        chakraType: ChakraTypes.THIRD_EYE,
        title: 'Intuition Development',
        description: 'Strengthen your connection to your inner wisdom.',
        actionItems: ['Visualization meditation', 'Dream journaling', 'Trust your first impression'],
        priority: 'medium'
      }
    ],
    [ChakraTypes.CROWN]: [
      {
        id: 'crown-1',
        chakraType: ChakraTypes.CROWN,
        title: 'Spiritual Connection',
        description: 'Deepen your connection to higher consciousness.',
        actionItems: ['Silent meditation', 'Contemplation of life purpose', 'Study spiritual texts'],
        priority: 'low'
      }
    ]
  };

  /**
   * Get insights based on activated chakras
   */
  async getInsights(activatedChakras: number[] = []): Promise<ChakraInsight[]> {
    // Convert numeric chakra indices to ChakraType
    const chakraTypes = this.mapIndicesToChakraTypes(activatedChakras);
    let insights: ChakraInsight[] = [];
    
    // If no specific chakras are activated, provide insights for all chakras
    if (chakraTypes.length === 0) {
      Object.values(this.chakraInsightsMap).forEach(chakraInsights => {
        insights = [...insights, ...chakraInsights];
      });
    } else {
      // Otherwise, provide insights for the activated chakras
      chakraTypes.forEach(chakraType => {
        if (this.chakraInsightsMap[chakraType]) {
          insights = [...insights, ...this.chakraInsightsMap[chakraType]];
        }
      });
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return insights;
  }

  /**
   * Map numeric chakra indices to ChakraType values
   */
  private mapIndicesToChakraTypes(indices: number[]): ChakraType[] {
    const chakraTypes: ChakraType[] = [];
    const chakraTypesArray: ChakraType[] = [
      ChakraTypes.ROOT,
      ChakraTypes.SACRAL,
      ChakraTypes.SOLAR,
      ChakraTypes.HEART,
      ChakraTypes.THROAT,
      ChakraTypes.THIRD_EYE,
      ChakraTypes.CROWN
    ];
    
    indices.forEach(index => {
      if (index >= 0 && index < chakraTypesArray.length) {
        chakraTypes.push(chakraTypesArray[index]);
      }
    });
    
    return chakraTypes;
  }
}

// Export singleton instance
export const chakraInsightsService = new ChakraInsightsService();
