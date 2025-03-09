
import { supabase } from '@/integrations/supabase/client';

// Define chakra types
export type ChakraName = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

export type ChakraStatus = 'blocked' | 'awakening' | 'active' | 'balanced' | 'transcendent';

export type ChakraData = {
  name: ChakraName;
  color: string;
  status: ChakraStatus;
  activationLevel: number; // 0-100
  element: string;
  activatedAt?: string;
  position: { x: number; y: number };
};

export type ChakraPractice = {
  id: string;
  name: string;
  description: string;
  duration: number;
  chakras: ChakraName[];
  level: number;
  benefits: string[];
  imageUrl?: string;
};

export type ChakraVisualizationData = {
  chakras: Record<ChakraName, ChakraData>;
  dominantChakra: ChakraName | null;
  overallBalance: number; // 0-100
  chakraPractices: ChakraPractice[];
  lastUpdated: string;
};

const defaultChakraData: Record<ChakraName, Omit<ChakraData, 'status' | 'activationLevel'>> = {
  root: {
    name: 'root',
    color: '#FF0000',
    element: 'Earth',
    position: { x: 0, y: 300 }
  },
  sacral: {
    name: 'sacral',
    color: '#FF7F00',
    element: 'Water',
    position: { x: 0, y: 250 }
  },
  solar: {
    name: 'solar',
    color: '#FFFF00',
    element: 'Fire',
    position: { x: 0, y: 200 }
  },
  heart: {
    name: 'heart',
    color: '#00FF00',
    element: 'Air',
    position: { x: 0, y: 150 }
  },
  throat: {
    name: 'throat',
    color: '#0000FF',
    element: 'Sound',
    position: { x: 0, y: 100 }
  },
  'third-eye': {
    name: 'third-eye',
    color: '#4B0082',
    element: 'Light',
    position: { x: 0, y: 50 }
  },
  crown: {
    name: 'crown',
    color: '#8B00FF',
    element: 'Thought',
    position: { x: 0, y: 0 }
  }
};

/**
 * Fetch chakra visualization data for a user
 */
export async function getChakraVisualizationData(userId: string): Promise<ChakraVisualizationData> {
  try {
    // Fetch the user's chakra system data
    const { data: chakraSystem, error } = await supabase
      .from('chakra_systems')
      .select('chakras, dominant_chakra, overall_balance, last_updated')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching chakra system data:', error);
      throw error;
    }
    
    // Fetch recommended practices
    const { data: practices, error: practicesError } = await supabase
      .from('practices')
      .select('id, title, description, duration, chakra_association, level')
      .limit(5);
    
    if (practicesError) {
      console.error('Error fetching chakra practices:', practicesError);
    }
    
    // Map chakra data into the expected format
    const chakras = {} as Record<ChakraName, ChakraData>;
    const chakraData = chakraSystem?.chakras as Record<string, ChakraStatus>;
    
    // Process each chakra
    Object.keys(defaultChakraData).forEach((chakraKey) => {
      const chakraName = chakraKey as ChakraName;
      const status = (chakraData && chakraData[chakraName]) || 'blocked';
      
      // Calculate activation level based on status
      const activationLevel = status === 'blocked' ? 10 :
                             status === 'awakening' ? 30 :
                             status === 'active' ? 60 :
                             status === 'balanced' ? 80 : 100;
      
      chakras[chakraName] = {
        ...defaultChakraData[chakraName],
        status,
        activationLevel
      };
    });
    
    // Map practices into the expected format
    const chakraPractices: ChakraPractice[] = practices?.map((practice) => ({
      id: practice.id,
      name: practice.title,
      description: practice.description,
      duration: practice.duration,
      chakras: practice.chakra_association as ChakraName[] || [],
      level: practice.level,
      benefits: ['Balance', 'Harmony', 'Energy flow']
    })) || [];
    
    return {
      chakras,
      dominantChakra: (chakraSystem?.dominant_chakra as ChakraName) || null,
      overallBalance: chakraSystem?.overall_balance || 50,
      chakraPractices,
      lastUpdated: chakraSystem?.last_updated || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getChakraVisualizationData:', error);
    
    // Return default data in case of error
    const chakras = {} as Record<ChakraName, ChakraData>;
    
    Object.keys(defaultChakraData).forEach((chakraKey) => {
      const chakraName = chakraKey as ChakraName;
      chakras[chakraName] = {
        ...defaultChakraData[chakraName],
        status: 'blocked',
        activationLevel: 10
      };
    });
    
    return {
      chakras,
      dominantChakra: null,
      overallBalance: 30,
      chakraPractices: [],
      lastUpdated: new Date().toISOString()
    };
  }
}
