
import { supabase } from '@/integrations/supabase/client';

export type ChakraName = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

export interface ChakraData {
  name: ChakraName;
  color: string;
  description: string;
  element: string;
  position: string;
  mantra: string;
  activated: boolean;
  progress: number;
  practices: ChakraPractice[];
}

export interface ChakraPractice {
  id: string;
  name: string;
  type: 'meditation' | 'reflection' | 'exercise';
  description: string;
  duration: number;
  difficulty: number;
  effects: string[];
  chakras: ChakraName[];
  energyPoints: number;
  title: string;
}

export interface ChakraVisualizationData {
  chakras: Record<ChakraName, ChakraData>;
  recommendedPractices: ChakraPractice[];
  userChakraSystem: {
    activatedChakras: ChakraName[];
    overallBalance: number;
  };
}

const CHAKRA_COLORS = {
  root: '#FF5757',
  sacral: '#FF9E43',
  solar: '#FFDE59',
  heart: '#7ED957',
  throat: '#5CC9F5',
  'third-eye': '#A85CFF',
  crown: '#C588FF'
};

const DEFAULT_CHAKRA_DATA: Record<ChakraName, Omit<ChakraData, 'activated' | 'progress' | 'practices'>> = {
  root: {
    name: 'root',
    color: CHAKRA_COLORS.root,
    description: 'Foundation, stability, security, and basic needs',
    element: 'Earth',
    position: 'Base of spine',
    mantra: 'I am safe and secure'
  },
  sacral: {
    name: 'sacral',
    color: CHAKRA_COLORS.sacral,
    description: 'Creativity, pleasure, emotions, and relationships',
    element: 'Water',
    position: 'Lower abdomen',
    mantra: 'I feel and experience life fully'
  },
  solar: {
    name: 'solar',
    color: CHAKRA_COLORS.solar,
    description: 'Personal power, confidence, and self-esteem',
    element: 'Fire',
    position: 'Upper abdomen',
    mantra: 'I am powerful and confident'
  },
  heart: {
    name: 'heart',
    color: CHAKRA_COLORS.heart,
    description: 'Love, compassion, and harmony',
    element: 'Air',
    position: 'Center of chest',
    mantra: 'I give and receive love freely'
  },
  throat: {
    name: 'throat',
    color: CHAKRA_COLORS.throat,
    description: 'Communication, expression, and truth',
    element: 'Ether',
    position: 'Throat',
    mantra: 'I express my truth with clarity'
  },
  'third-eye': {
    name: 'third-eye',
    color: CHAKRA_COLORS['third-eye'],
    description: 'Intuition, perception, and insight',
    element: 'Light',
    position: 'Between eyebrows',
    mantra: 'I see beyond illusion'
  },
  crown: {
    name: 'crown',
    color: CHAKRA_COLORS.crown,
    description: 'Spiritual connection, consciousness, and enlightenment',
    element: 'Thought',
    position: 'Top of head',
    mantra: 'I am connected to all that is'
  }
};

/**
 * Get chakra visualization data for the current user
 */
export async function getChakraVisualizationData(userId?: string): Promise<ChakraVisualizationData> {
  try {
    // If no user ID, return default data
    if (!userId) {
      return getDefaultVisualizationData();
    }

    // Fetch user's activated chakras
    const { data: chakraSystem, error: chakraError } = await supabase
      .from('chakra_systems')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (chakraError) {
      console.error('Error fetching chakra data:', chakraError);
      return getDefaultVisualizationData();
    }

    // Fetch available practices for chakras
    const { data: practices, error: practicesError } = await supabase
      .from('practices')
      .select('*')
      .in('type', ['meditation', 'reflection', 'exercise']);

    if (practicesError) {
      console.error('Error fetching practices:', practicesError);
    }

    // Create the full chakra data
    const activatedChakras: ChakraName[] = chakraSystem?.activated_chakras || [];
    const chakras: Record<ChakraName, ChakraData> = {};

    // Build chakra data for each chakra
    Object.keys(DEFAULT_CHAKRA_DATA).forEach((chakraName) => {
      const name = chakraName as ChakraName;
      const isActivated = activatedChakras.includes(name);
      
      // Find practices for this chakra
      const chakraPractices = (practices || [])
        .filter(p => (p.chakra_association || []).includes(name))
        .map(p => ({
          id: p.id,
          name: p.title,
          title: p.title,
          type: p.type,
          description: p.description,
          duration: p.duration,
          difficulty: p.difficulty || 1,
          effects: p.effects || [],
          chakras: p.chakra_association || [],
          energyPoints: p.energy_points || 5
        }));

      chakras[name] = {
        ...DEFAULT_CHAKRA_DATA[name],
        activated: isActivated,
        progress: chakraSystem?.[`${name}_progress`] || 0,
        practices: chakraPractices
      };
    });

    // Determine recommended practices
    const recommendedPractices = Object.values(chakras)
      .flatMap(chakra => chakra.practices)
      .filter((practice, index, self) => 
        index === self.findIndex(p => p.id === practice.id)
      )
      .sort((a, b) => {
        // Prioritize practices for activated chakras
        const aActivated = a.chakras.some(c => activatedChakras.includes(c));
        const bActivated = b.chakras.some(c => activatedChakras.includes(c));
        if (aActivated && !bActivated) return -1;
        if (!aActivated && bActivated) return 1;
        return 0;
      })
      .slice(0, 5);

    return {
      chakras,
      recommendedPractices,
      userChakraSystem: {
        activatedChakras,
        overallBalance: calculateOverallBalance(chakras)
      }
    };
  } catch (error) {
    console.error('Error in getChakraVisualizationData:', error);
    return getDefaultVisualizationData();
  }
}

/**
 * Calculate overall chakra balance
 */
function calculateOverallBalance(chakras: Record<ChakraName, ChakraData>): number {
  const activatedChakras = Object.values(chakras).filter(c => c.activated);
  if (activatedChakras.length === 0) return 0;
  
  const totalProgress = activatedChakras.reduce((sum, chakra) => sum + chakra.progress, 0);
  return totalProgress / activatedChakras.length;
}

/**
 * Get default visualization data
 */
function getDefaultVisualizationData(): ChakraVisualizationData {
  const chakras: Record<ChakraName, ChakraData> = {};
  
  Object.keys(DEFAULT_CHAKRA_DATA).forEach((chakraName) => {
    const name = chakraName as ChakraName;
    chakras[name] = {
      ...DEFAULT_CHAKRA_DATA[name],
      activated: false,
      progress: 0,
      practices: []
    };
  });
  
  return {
    chakras,
    recommendedPractices: [],
    userChakraSystem: {
      activatedChakras: [],
      overallBalance: 0
    }
  };
}
