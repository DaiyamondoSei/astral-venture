
import { supabase } from '@/integrations/supabase/client';

// Types for chakra visualization
export type ChakraName = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

export interface ChakraPractice {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: number;
  energyPoints: number;
  chakraId: ChakraName;
}

export interface ChakraData {
  id: ChakraName;
  name: string;
  position: number;
  color: string;
  description: string;
  activationLevel: number;
  associatedEmotions: string[];
  balancingPractices: ChakraPractice[];
}

export interface ChakraVisualizationData {
  chakras: ChakraData[];
  overallBalance: number;
}

/**
 * Get chakra visualization data for a user
 */
export async function getChakraVisualizationData(options: { userLevel: number }): Promise<ChakraVisualizationData> {
  const { userLevel = 1 } = options;
  
  try {
    // In a production app, we would fetch this from the database
    // Here we're generating mock data based on user level
    
    // Check if we have data in the database
    const { data: chakraSystemData, error } = await supabase
      .from('chakra_systems')
      .select('*')
      .maybeSingle();
    
    if (chakraSystemData && !error) {
      // Convert stored data to our format
      return parseChakraSystemData(chakraSystemData);
    }
    
    // If no data, generate mock data
    return generateMockChakraData(userLevel);
  } catch (error) {
    console.error('Error fetching chakra visualization data:', error);
    return generateMockChakraData(userLevel);
  }
}

/**
 * Parse chakra system data from the database
 */
function parseChakraSystemData(data: any): ChakraVisualizationData {
  try {
    // In a real implementation, this would map database fields to our model
    return data.chakra_data as ChakraVisualizationData;
  } catch (e) {
    console.error('Error parsing chakra data:', e);
    return generateMockChakraData(1);
  }
}

/**
 * Generate mock chakra data for testing
 */
function generateMockChakraData(userLevel: number): ChakraVisualizationData {
  // Base activation level is influenced by user level
  const baseActivation = Math.min(35 + (userLevel * 8), 90);
  
  // Random variance to make it more realistic
  const getActivation = () => {
    const base = baseActivation + (Math.random() * 20 - 10);
    return Math.min(Math.max(base, 20), 95); // Keep between 20-95%
  };
  
  return {
    chakras: [
      {
        id: 'root',
        name: 'Root Chakra',
        position: 85, // Position in % from top
        color: '#FF0000',
        description: 'Foundation, stability, and security',
        activationLevel: getActivation(),
        associatedEmotions: ['Security', 'Stability', 'Survival', 'Grounding'],
        balancingPractices: [
          {
            id: 'root-meditation',
            title: 'Root Grounding Meditation',
            description: 'A meditation to strengthen your connection to earth and physical body',
            duration: 10,
            difficulty: 1,
            energyPoints: 15,
            chakraId: 'root'
          },
          {
            id: 'root-breathing',
            title: 'Root Breathing Technique',
            description: 'Breathing exercise to establish safety and stability',
            duration: 5,
            difficulty: 1,
            energyPoints: 10,
            chakraId: 'root'
          }
        ]
      },
      {
        id: 'sacral',
        name: 'Sacral Chakra',
        position: 75,
        color: '#FF7F00',
        description: 'Creativity, emotion, and pleasure',
        activationLevel: getActivation(),
        associatedEmotions: ['Passion', 'Joy', 'Creativity', 'Sensuality'],
        balancingPractices: [
          {
            id: 'sacral-creative',
            title: 'Creative Expression',
            description: 'Exercise to unlock creative energy and emotional flow',
            duration: 15,
            difficulty: 2,
            energyPoints: 20,
            chakraId: 'sacral'
          }
        ]
      },
      {
        id: 'solar',
        name: 'Solar Plexus Chakra',
        position: 65,
        color: '#FFFF00',
        description: 'Personal power, confidence, and self-esteem',
        activationLevel: getActivation(),
        associatedEmotions: ['Confidence', 'Willpower', 'Self-esteem', 'Purpose'],
        balancingPractices: [
          {
            id: 'solar-power',
            title: 'Power Activation',
            description: 'Practice to strengthen your inner power and confidence',
            duration: 8,
            difficulty: 2,
            energyPoints: 18,
            chakraId: 'solar'
          }
        ]
      },
      {
        id: 'heart',
        name: 'Heart Chakra',
        position: 55,
        color: '#00FF00',
        description: 'Love, compassion, and connection',
        activationLevel: getActivation(),
        associatedEmotions: ['Love', 'Compassion', 'Forgiveness', 'Empathy'],
        balancingPractices: [
          {
            id: 'heart-opening',
            title: 'Heart Opening Meditation',
            description: 'Meditation to open the heart center and develop compassion',
            duration: 12,
            difficulty: 3,
            energyPoints: 25,
            chakraId: 'heart'
          }
        ]
      },
      {
        id: 'throat',
        name: 'Throat Chakra',
        position: 45,
        color: '#0000FF',
        description: 'Communication, expression, and truth',
        activationLevel: getActivation(),
        associatedEmotions: ['Expression', 'Truth', 'Communication', 'Authenticity'],
        balancingPractices: [
          {
            id: 'throat-expression',
            title: 'Authentic Expression',
            description: 'Practice to develop clear and authentic communication',
            duration: 7,
            difficulty: 2,
            energyPoints: 15,
            chakraId: 'throat'
          }
        ]
      },
      {
        id: 'third-eye',
        name: 'Third Eye Chakra',
        position: 35,
        color: '#4B0082',
        description: 'Intuition, insight, and vision',
        activationLevel: getActivation(),
        associatedEmotions: ['Intuition', 'Clarity', 'Insight', 'Perception'],
        balancingPractices: [
          {
            id: 'third-eye-vision',
            title: 'Third Eye Activation',
            description: 'Practice to develop intuition and inner vision',
            duration: 15,
            difficulty: 4,
            energyPoints: 30,
            chakraId: 'third-eye'
          }
        ]
      },
      {
        id: 'crown',
        name: 'Crown Chakra',
        position: 25,
        color: '#8F00FF',
        description: 'Consciousness, spirituality, and enlightenment',
        activationLevel: getActivation(),
        associatedEmotions: ['Awareness', 'Unity', 'Transcendence', 'Bliss'],
        balancingPractices: [
          {
            id: 'crown-meditation',
            title: 'Higher Consciousness Meditation',
            description: 'Advanced meditation to connect with higher consciousness',
            duration: 20,
            difficulty: 5,
            energyPoints: 40,
            chakraId: 'crown'
          }
        ]
      }
    ],
    overallBalance: Math.min(Math.max(30 + (userLevel * 5), 30), 90)
  };
}
