
import { supabase } from '@/integrations/supabase/client';

// Types for chakra insights
export interface ChakraInsightsOptions {
  userId?: string;
  reflectionId?: string;
  chakraIds?: string[];
  depth?: 'basic' | 'detailed';
}

export interface ChakraInsight {
  chakraId: string;
  chakraName: string;
  status: 'balanced' | 'overactive' | 'underactive' | 'blocked';
  description: string;
  recommendedPractices: string[];
}

// Create a singleton service
class ChakraInsightsService {
  /**
   * Get insights about the state of user's chakras
   */
  async getChakraInsights(options: ChakraInsightsOptions = {}): Promise<ChakraInsight[]> {
    try {
      const { userId, reflectionId, chakraIds, depth = 'basic' } = options;
      
      // In a real app, we would analyze user data or reflection content
      // Here we're generating mock data
      
      if (reflectionId) {
        // If we have a reflection, we could analyze its content
        const { data: reflection } = await supabase
          .from('energy_reflections')
          .select('content, ai_insights')
          .eq('id', reflectionId)
          .maybeSingle();
          
        if (reflection?.ai_insights?.chakra) {
          // Use AI-generated insights if available
          return this.parseAIChakraInsights(reflection.ai_insights.chakra);
        }
      }
      
      // Generate mock insights
      return this.generateMockInsights(chakraIds);
    } catch (error) {
      console.error('Error getting chakra insights:', error);
      return [];
    }
  }
  
  /**
   * Parse AI-generated chakra insights
   */
  private parseAIChakraInsights(chakraInsight: string): ChakraInsight[] {
    // In a real implementation, this would parse structured data
    // Here we're just returning a mock insight based on the text
    
    // See if we can extract a chakra name from the text
    const chakraNames = [
      'root', 'sacral', 'solar plexus', 'heart', 'throat', 'third eye', 'crown'
    ];
    
    const foundChakra = chakraNames.find(name => 
      chakraInsight.toLowerCase().includes(name)
    );
    
    if (foundChakra) {
      return [{
        chakraId: foundChakra.replace(' ', '-'),
        chakraName: foundChakra.charAt(0).toUpperCase() + foundChakra.slice(1) + ' Chakra',
        status: chakraInsight.includes('block') ? 'blocked' : 
                chakraInsight.includes('under') ? 'underactive' : 
                chakraInsight.includes('over') ? 'overactive' : 'balanced',
        description: chakraInsight,
        recommendedPractices: [
          `${foundChakra.charAt(0).toUpperCase() + foundChakra.slice(1)} meditation`,
          `${foundChakra.charAt(0).toUpperCase() + foundChakra.slice(1)} balancing practice`
        ]
      }];
    }
    
    // Default insight if we couldn't extract specifics
    return [{
      chakraId: 'general',
      chakraName: 'General Chakra System',
      status: 'balanced',
      description: chakraInsight,
      recommendedPractices: ['Chakra balancing meditation', 'Energy alignment practice']
    }];
  }
  
  /**
   * Generate mock chakra insights for testing
   */
  private generateMockInsights(specificChakras?: string[]): ChakraInsight[] {
    const allChakras: ChakraInsight[] = [
      {
        chakraId: 'root',
        chakraName: 'Root Chakra',
        status: 'balanced',
        description: 'Your root chakra is well-balanced, providing a strong foundation for your practice.',
        recommendedPractices: ['Grounding meditation', 'Walking in nature']
      },
      {
        chakraId: 'sacral',
        chakraName: 'Sacral Chakra',
        status: 'underactive',
        description: 'Your sacral chakra could use some activation to enhance creativity and emotional flow.',
        recommendedPractices: ['Creative expression practice', 'Dance meditation']
      },
      {
        chakraId: 'solar',
        chakraName: 'Solar Plexus Chakra',
        status: 'overactive',
        description: 'Your solar plexus shows signs of overactivity. Focus on balancing your personal power.',
        recommendedPractices: ['Power balancing meditation', 'Self-compassion practice']
      },
      {
        chakraId: 'heart',
        chakraName: 'Heart Chakra',
        status: 'balanced',
        description: 'Your heart chakra is open and balanced, supporting compassion and connection.',
        recommendedPractices: ['Loving-kindness meditation', 'Gratitude practice']
      },
      {
        chakraId: 'throat',
        chakraName: 'Throat Chakra',
        status: 'blocked',
        description: 'Your throat chakra shows signs of blockage. Work on authentic self-expression.',
        recommendedPractices: ['Vocal toning', 'Journaling practice']
      },
      {
        chakraId: 'third-eye',
        chakraName: 'Third Eye Chakra',
        status: 'balanced',
        description: 'Your third eye chakra is clear and balanced, supporting intuition and insight.',
        recommendedPractices: ['Visualization meditation', 'Dream journaling']
      },
      {
        chakraId: 'crown',
        chakraName: 'Crown Chakra',
        status: 'underactive',
        description: 'Your crown chakra could benefit from more activation to enhance spiritual connection.',
        recommendedPractices: ['Silence meditation', 'Higher consciousness practice']
      }
    ];
    
    // If specific chakras are requested, filter the results
    if (specificChakras && specificChakras.length > 0) {
      return allChakras.filter(chakra => specificChakras.includes(chakra.chakraId));
    }
    
    return allChakras;
  }
}

// Export the singleton instance
export const chakraInsightsService = new ChakraInsightsService();
