import { supabase } from '@/integrations/supabase/client';

export type ChakraName = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

export interface ChakraData {
  id: ChakraName;
  name: string;
  color: string;
  position: number;
  description: string;
  activationLevel: number;
  associatedEmotions: string[];
  balancingPractices: ChakraPractice[];
}

export interface ChakraPractice {
  id: string;
  title: string;
  description: string;
  duration: number;
  energyPoints: number;
  difficulty: number;
}

export interface UserChakraSystem {
  userId: string;
  overallBalance: number;
  chakras: Record<ChakraName, ChakraStatus>;
  dominantChakra: ChakraName | null;
  lastUpdated: string;
}

export interface ChakraStatus {
  activationLevel: number;
  balance: number;
  blockages: string[];
  strengths: string[];
}

export interface ChakraVisualizationData {
  chakras: ChakraData[];
  userChakraSystem: UserChakraSystem | null;
  recommendations: ChakraPractice[];
}

// Base chakra data
export const CHAKRA_DATA: ChakraData[] = [
  {
    id: 'root',
    name: 'Root',
    color: '#FF5757',
    position: 85,
    description: 'Foundation of your energy system; governs security, stability, and basic needs',
    activationLevel: 50,
    associatedEmotions: ['security', 'stability', 'grounding', 'survival', 'trust'],
    balancingPractices: [
      {
        id: 'root-meditation',
        title: 'Grounding Meditation',
        description: 'Connect with earth energy to strengthen your foundation',
        duration: 10,
        energyPoints: 15,
        difficulty: 1
      },
      {
        id: 'root-affirmation',
        title: 'Safety Affirmations',
        description: 'Affirm your security and stability in the world',
        duration: 5,
        energyPoints: 8,
        difficulty: 1
      }
    ]
  },
  {
    id: 'sacral',
    name: 'Sacral',
    color: '#FF9E45',
    position: 70,
    description: 'Center of creativity, pleasure, and emotional wellbeing',
    activationLevel: 50,
    associatedEmotions: ['pleasure', 'joy', 'creativity', 'passion', 'sensuality'],
    balancingPractices: [
      {
        id: 'sacral-flow',
        title: 'Creative Flow State',
        description: 'Engage in free-form creative expression',
        duration: 15,
        energyPoints: 18,
        difficulty: 2
      },
      {
        id: 'sacral-dance',
        title: 'Intuitive Dance',
        description: 'Express emotions through movement',
        duration: 10,
        energyPoints: 12,
        difficulty: 1
      }
    ]
  },
  {
    id: 'solar',
    name: 'Solar Plexus',
    color: '#FFDE59',
    position: 55,
    description: 'Seat of personal power, willpower, and self-confidence',
    activationLevel: 50,
    associatedEmotions: ['confidence', 'power', 'will', 'purpose', 'ambition'],
    balancingPractices: [
      {
        id: 'solar-power',
        title: 'Power Center Activation',
        description: 'Awaken your inner strength and confidence',
        duration: 12,
        energyPoints: 16,
        difficulty: 2
      },
      {
        id: 'solar-boundaries',
        title: 'Boundary Setting',
        description: 'Practice establishing healthy personal boundaries',
        duration: 8,
        energyPoints: 10,
        difficulty: 2
      }
    ]
  },
  {
    id: 'heart',
    name: 'Heart',
    color: '#7ED957',
    position: 40,
    description: 'Center of love, compassion, and connection with others',
    activationLevel: 50,
    associatedEmotions: ['love', 'compassion', 'empathy', 'forgiveness', 'connection'],
    balancingPractices: [
      {
        id: 'heart-compassion',
        title: 'Compassion Meditation',
        description: 'Expand your heart's capacity for love and empathy',
        duration: 15,
        energyPoints: 20,
        difficulty: 2
      },
      {
        id: 'heart-forgiveness',
        title: 'Forgiveness Practice',
        description: 'Release past hurts and open your heart',
        duration: 10,
        energyPoints: 15,
        difficulty: 3
      }
    ]
  },
  {
    id: 'throat',
    name: 'Throat',
    color: '#5271FF',
    position: 25,
    description: 'Center of communication, self-expression, and truth',
    activationLevel: 50,
    associatedEmotions: ['expression', 'truth', 'communication', 'authenticity', 'voice'],
    balancingPractices: [
      {
        id: 'throat-expression',
        title: 'Authentic Expression',
        description: 'Practice speaking your truth with clarity',
        duration: 10,
        energyPoints: 14,
        difficulty: 2
      },
      {
        id: 'throat-sound',
        title: 'Sound Healing',
        description: 'Use your voice to clear throat chakra blockages',
        duration: 8,
        energyPoints: 12,
        difficulty: 1
      }
    ]
  },
  {
    id: 'third-eye',
    name: 'Third Eye',
    color: '#A85CFF',
    position: 10,
    description: 'Center of intuition, insight, and inner vision',
    activationLevel: 50,
    associatedEmotions: ['intuition', 'clarity', 'vision', 'imagination', 'perception'],
    balancingPractices: [
      {
        id: 'third-eye-vision',
        title: 'Inner Vision Meditation',
        description: 'Develop your intuition and psychic abilities',
        duration: 18,
        energyPoints: 25,
        difficulty: 3
      },
      {
        id: 'third-eye-dreams',
        title: 'Dream Journaling',
        description: 'Record and interpret your dreams for insight',
        duration: 10,
        energyPoints: 15,
        difficulty: 2
      }
    ]
  },
  {
    id: 'crown',
    name: 'Crown',
    color: '#D59FFF',
    position: -5,
    description: 'Connection to higher consciousness and spiritual awareness',
    activationLevel: 50,
    associatedEmotions: ['connection', 'awareness', 'enlightenment', 'divine', 'unity'],
    balancingPractices: [
      {
        id: 'crown-meditation',
        title: 'Cosmic Connection',
        description: 'Connect with universal consciousness',
        duration: 20,
        energyPoints: 30,
        difficulty: 4
      },
      {
        id: 'crown-silence',
        title: 'Silent Awareness',
        description: 'Practice being in pure awareness beyond thought',
        duration: 15,
        energyPoints: 22,
        difficulty: 3
      }
    ]
  }
];

/**
 * Fetches the user's chakra system data from the database
 */
export async function getUserChakraSystem(userId: string): Promise<UserChakraSystem | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('chakra_systems')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching chakra system:', error);
      return null;
    }

    if (!data) return null;

    return {
      userId: data.user_id,
      overallBalance: data.overall_balance || 50,
      chakras: data.chakras as Record<ChakraName, ChakraStatus>,
      dominantChakra: data.dominant_chakra as ChakraName || null,
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error('Error in getUserChakraSystem:', error);
    return null;
  }
}

/**
 * Creates a default chakra system for new users
 */
export function createDefaultChakraSystem(userId: string): UserChakraSystem {
  const defaultStatus: ChakraStatus = {
    activationLevel: 20,
    balance: 50,
    blockages: [],
    strengths: []
  };

  // Create default chakra system with all chakras at baseline activation
  const chakras: Record<ChakraName, ChakraStatus> = {
    'root': { ...defaultStatus },
    'sacral': { ...defaultStatus },
    'solar': { ...defaultStatus },
    'heart': { ...defaultStatus },
    'throat': { ...defaultStatus },
    'third-eye': { ...defaultStatus },
    'crown': { ...defaultStatus }
  };

  return {
    userId,
    overallBalance: 50,
    chakras,
    dominantChakra: null,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Updates the user's chakra system in the database
 */
export async function updateUserChakraSystem(system: UserChakraSystem): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chakra_systems')
      .upsert({
        user_id: system.userId,
        overall_balance: system.overallBalance,
        chakras: system.chakras,
        dominant_chakra: system.dominantChakra,
        last_updated: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating chakra system:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserChakraSystem:', error);
    return false;
  }
}

/**
 * Calculates chakra activation based on user level and activities
 */
export function calculateChakraActivation(
  userLevel: number,
  chakraId: ChakraName,
  baseActivation: number = 20
): number {
  // Level-based activation (higher chakras need higher levels)
  const chakraIndex = CHAKRA_DATA.findIndex(c => c.id === chakraId);
  if (chakraIndex === -1) return baseActivation;

  // Formula: base activation + level bonus - chakra difficulty adjustment
  const levelBonus = Math.max(0, userLevel * 10 - (chakraIndex * 5));
  return Math.min(100, baseActivation + levelBonus);
}

/**
 * Generates personalized chakra practice recommendations
 */
export function getChakraPracticeRecommendations(
  userChakraSystem: UserChakraSystem | null,
  userLevel: number
): ChakraPractice[] {
  // If no user data, return beginner-friendly practices
  if (!userChakraSystem) {
    return CHAKRA_DATA
      .slice(0, 3) // Focus on first three chakras for beginners
      .flatMap(chakra => 
        chakra.balancingPractices.filter(practice => practice.difficulty <= 2)
      )
      .slice(0, 5);
  }
  
  // Find the least activated chakras
  const chakraEntries = Object.entries(userChakraSystem.chakras) as [ChakraName, ChakraStatus][];
  const sortedChakras = chakraEntries
    .sort((a, b) => a[1].activationLevel - b[1].activationLevel)
    .slice(0, 3); // Focus on the 3 least activated chakras
  
  // Get practices for these chakras appropriate for user level
  const recommendations = sortedChakras.flatMap(([chakraId]) => {
    const chakraData = CHAKRA_DATA.find(c => c.id === chakraId);
    if (!chakraData) return [];
    
    return chakraData.balancingPractices.filter(
      practice => practice.difficulty <= Math.max(1, Math.min(4, userLevel))
    );
  });
  
  // Return 5 most relevant practices
  return recommendations.slice(0, 5);
}

/**
 * Comprehensive function to get all data needed for chakra visualization
 */
export async function getChakraVisualizationData(
  userId: string | undefined,
  userLevel: number
): Promise<ChakraVisualizationData> {
  // Get user chakra system if logged in
  let userChakraSystem: UserChakraSystem | null = null;
  
  if (userId) {
    userChakraSystem = await getUserChakraSystem(userId);
    
    // If no system exists for user, create default
    if (!userChakraSystem) {
      userChakraSystem = createDefaultChakraSystem(userId);
      await updateUserChakraSystem(userChakraSystem);
    }
  }
  
  // Clone base chakra data and update with user-specific activation levels
  const chakras = JSON.parse(JSON.stringify(CHAKRA_DATA)) as ChakraData[];
  
  chakras.forEach(chakra => {
    if (userChakraSystem && userChakraSystem.chakras[chakra.id]) {
      // If we have user data, use it
      chakra.activationLevel = userChakraSystem.chakras[chakra.id].activationLevel;
    } else {
      // Otherwise calculate based on user level
      chakra.activationLevel = calculateChakraActivation(userLevel, chakra.id);
    }
  });
  
  // Get recommendations
  const recommendations = getChakraPracticeRecommendations(userChakraSystem, userLevel);
  
  return {
    chakras,
    userChakraSystem,
    recommendations
  };
}
