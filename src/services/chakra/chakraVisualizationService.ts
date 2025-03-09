
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ChakraData {
  name: string;
  color: string;
  activationLevel: number;
  description: string;
  location: string;
  element: string;
  qualities: string[];
  practices: string[];
}

export interface ChakraSystem {
  chakras: Record<string, ChakraData>;
  dominantChakra: string | null;
  overallBalance: number;
  lastUpdated: string;
}

// Default chakra system with initial values
export const defaultChakraSystem: ChakraSystem = {
  chakras: {
    root: {
      name: 'Root Chakra',
      color: '#FF5757',
      activationLevel: 30,
      description: 'Foundation of energy body, connected to physical identity and grounding',
      location: 'Base of spine',
      element: 'Earth',
      qualities: ['stability', 'security', 'survival', 'grounding'],
      practices: ['grounding meditation', 'connecting with nature']
    },
    sacral: {
      name: 'Sacral Chakra',
      color: '#FF9E43',
      activationLevel: 25,
      description: 'Center of creativity, pleasure, and emotional wellbeing',
      location: 'Lower abdomen',
      element: 'Water',
      qualities: ['creativity', 'emotion', 'pleasure', 'flow'],
      practices: ['dance', 'creative visualization']
    },
    solar: {
      name: 'Solar Plexus Chakra',
      color: '#FFDE59',
      activationLevel: 20,
      description: 'Power center related to confidence and personal will',
      location: 'Upper abdomen',
      element: 'Fire',
      qualities: ['willpower', 'confidence', 'action', 'transformation'],
      practices: ['confidence affirmations', 'core strengthening']
    },
    heart: {
      name: 'Heart Chakra',
      color: '#7ED957',
      activationLevel: 35,
      description: 'Center of love, compassion, and connection',
      location: 'Center of chest',
      element: 'Air',
      qualities: ['love', 'compassion', 'forgiveness', 'balance'],
      practices: ['loving-kindness meditation', 'heart-opening yoga']
    },
    throat: {
      name: 'Throat Chakra',
      color: '#5CC9F5',
      activationLevel: 15,
      description: 'Communication center for expression of truth',
      location: 'Throat',
      element: 'Ether',
      qualities: ['expression', 'truth', 'communication', 'clarity'],
      practices: ['singing', 'journaling', 'speaking truth']
    },
    'third-eye': {
      name: 'Third Eye Chakra',
      color: '#A85CFF',
      activationLevel: 20,
      description: 'Seat of intuition, perception, and higher consciousness',
      location: 'Center of forehead',
      element: 'Light',
      qualities: ['intuition', 'perception', 'imagination', 'insight'],
      practices: ['visualization', 'intuition development']
    },
    crown: {
      name: 'Crown Chakra',
      color: '#C588FF',
      activationLevel: 15,
      description: 'Connection to universal consciousness and higher states of awareness',
      location: 'Top of head',
      element: 'Thought/Consciousness',
      qualities: ['awareness', 'consciousness', 'transcendence', 'connection'],
      practices: ['meditation', 'contemplation of universal truths']
    }
  },
  dominantChakra: 'heart',
  overallBalance: 50,
  lastUpdated: new Date().toISOString()
};

/**
 * Fetches the user's chakra system from the database
 */
export async function fetchUserChakraSystem(userId: string): Promise<ChakraSystem> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const { data, error } = await supabase
      .from('chakra_systems')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no record exists, return default
      if (error.code === 'PGRST116') {
        return defaultChakraSystem;
      }
      throw error;
    }
    
    if (!data) {
      return defaultChakraSystem;
    }
    
    // Transform the data to match ChakraSystem interface
    return {
      chakras: data.chakras as Record<string, ChakraData>,
      dominantChakra: data.dominant_chakra,
      overallBalance: data.overall_balance || 50,
      lastUpdated: data.last_updated || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching chakra system:', error);
    return defaultChakraSystem;
  }
}

/**
 * Updates the user's chakra system in the database
 */
export async function updateChakraSystem(
  userId: string,
  chakraSystem: ChakraSystem
): Promise<boolean> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const { error } = await supabase.functions.invoke('update-chakra-system', {
      body: {
        userId,
        chakraSystem: {
          chakras: chakraSystem.chakras,
          dominantChakra: chakraSystem.dominantChakra,
          overallBalance: chakraSystem.overallBalance
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating chakra system:', error);
    toast({
      title: 'Error updating chakra system',
      description: 'Please try again later.',
      variant: 'destructive'
    });
    return false;
  }
}

/**
 * Updates a specific chakra's activation level
 */
export async function updateChakraActivation(
  userId: string,
  chakraKey: string,
  newActivationLevel: number
): Promise<boolean> {
  try {
    // First get current system
    const currentSystem = await fetchUserChakraSystem(userId);
    
    // Update specific chakra
    if (currentSystem.chakras[chakraKey]) {
      currentSystem.chakras[chakraKey].activationLevel = Math.min(100, Math.max(0, newActivationLevel));
      
      // Recalculate dominant chakra and overall balance
      let maxActivation = 0;
      let dominantChakra: string | null = null;
      let totalActivation = 0;
      let chakraCount = 0;
      
      Object.entries(currentSystem.chakras).forEach(([key, chakra]) => {
        if (chakra.activationLevel > maxActivation) {
          maxActivation = chakra.activationLevel;
          dominantChakra = key;
        }
        totalActivation += chakra.activationLevel;
        chakraCount++;
      });
      
      currentSystem.dominantChakra = dominantChakra;
      currentSystem.overallBalance = Math.round(totalActivation / (chakraCount * 100) * 100);
      
      // Update the system
      return updateChakraSystem(userId, currentSystem);
    }
    
    return false;
  } catch (error) {
    console.error('Error updating chakra activation:', error);
    return false;
  }
}

/**
 * Gets recommended practices for a specific chakra
 */
export async function getChakraPracticeRecommendations(
  chakraKey: string
): Promise<string[]> {
  // In the future, this could fetch from the database
  // For now, return default practices from the chakra data
  return defaultChakraSystem.chakras[chakraKey]?.practices || [];
}
