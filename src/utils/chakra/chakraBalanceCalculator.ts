
/**
 * Calculate chakra balance based on user activities and reflections
 */

import { supabase } from '@/lib/supabase';

interface ChakraBalance {
  chakras: {
    id: number;
    name: string;
    balance: number; // 0-100
    activeFrequency: number; // 0-100
    resonance: number; // 0-100
    blockages: number; // 0-100
  }[];
  overallBalance: number; // 0-100
  dominantChakra: number; // chakra id
  weakestChakra: number; // chakra id
}

interface ChakraActivity {
  chakraId: number;
  count: number;
  frequency: number;
  intensity: number;
}

export const chakraNames = [
  'Root',
  'Sacral',
  'Solar Plexus',
  'Heart',
  'Throat',
  'Third Eye',
  'Crown'
];

export const chakraColors = [
  'from-red-500 to-red-600',
  'from-orange-500 to-orange-600',
  'from-yellow-500 to-yellow-600',
  'from-green-500 to-green-600',
  'from-blue-500 to-blue-600',
  'from-indigo-500 to-indigo-600',
  'from-violet-500 to-violet-600'
];

export const getChakraBalance = async (userId: string): Promise<ChakraBalance> => {
  try {
    // Get user's reflections with activated chakras
    const { data: reflections, error } = await supabase
      .from('energy_reflections')
      .select('chakras_activated, emotional_depth, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Get user's meditation activities
    const { data: activities } = await supabase
      .from('user_activities')
      .select('chakras_activated, duration, activity_type, timestamp')
      .eq('user_id', userId)
      .eq('activity_type', 'meditation')
      .order('timestamp', { ascending: false });
    
    // Calculate activity for each chakra
    const chakraActivity: ChakraActivity[] = Array.from({ length: 7 }, (_, i) => ({
      chakraId: i,
      count: 0,
      frequency: 0,
      intensity: 0
    }));
    
    // Process reflections
    reflections?.forEach(reflection => {
      const activatedChakras = reflection.chakras_activated as number[] || [];
      const emotionalDepth = reflection.emotional_depth || 0.5;
      
      activatedChakras.forEach(chakraId => {
        if (chakraId >= 0 && chakraId < 7) {
          chakraActivity[chakraId].count++;
          chakraActivity[chakraId].intensity += emotionalDepth;
        }
      });
    });
    
    // Process meditation activities
    activities?.forEach(activity => {
      const activatedChakras = activity.chakras_activated as number[] || [];
      const duration = activity.duration || 5;
      
      activatedChakras.forEach(chakraId => {
        if (chakraId >= 0 && chakraId < 7) {
          chakraActivity[chakraId].count++;
          chakraActivity[chakraId].intensity += Math.min(duration / 10, 1); // Cap at 1 for 10+ minute sessions
        }
      });
    });
    
    // Calculate total activities to normalize
    const totalActivities = Math.max(
      1,
      chakraActivity.reduce((sum, chakra) => sum + chakra.count, 0)
    );
    
    // Calculate frequency and normalize intensity
    chakraActivity.forEach(chakra => {
      chakra.frequency = Math.min((chakra.count / totalActivities) * 100, 100);
      chakra.intensity = chakra.count > 0 
        ? Math.min((chakra.intensity / chakra.count) * 100, 100) 
        : 0;
    });
    
    // Calculate balance for each chakra
    const chakras = chakraActivity.map((chakra, i) => {
      const balance = Math.round((chakra.frequency * 0.4) + (chakra.intensity * 0.6));
      
      return {
        id: i,
        name: chakraNames[i],
        balance,
        activeFrequency: Math.round(chakra.frequency),
        resonance: Math.round(chakra.intensity),
        blockages: Math.max(0, 100 - balance)
      };
    });
    
    // Calculate overall balance
    const overallBalance = Math.round(
      chakras.reduce((sum, chakra) => sum + chakra.balance, 0) / 7
    );
    
    // Find dominant and weakest chakras
    let dominantChakra = 0;
    let weakestChakra = 0;
    let maxBalance = chakras[0].balance;
    let minBalance = chakras[0].balance;
    
    chakras.forEach((chakra, i) => {
      if (chakra.balance > maxBalance) {
        maxBalance = chakra.balance;
        dominantChakra = i;
      }
      if (chakra.balance < minBalance) {
        minBalance = chakra.balance;
        weakestChakra = i;
      }
    });
    
    return {
      chakras,
      overallBalance,
      dominantChakra,
      weakestChakra
    };
    
  } catch (error) {
    console.error('Error calculating chakra balance:', error);
    
    // Return default balance if error
    return {
      chakras: Array.from({ length: 7 }, (_, i) => ({
        id: i,
        name: chakraNames[i],
        balance: 10,
        activeFrequency: 10,
        resonance: 10,
        blockages: 90
      })),
      overallBalance: 10,
      dominantChakra: 3, // Heart by default
      weakestChakra: 6  // Crown by default
    };
  }
};

export const getChakraRecommendations = (balance: ChakraBalance) => {
  const recommendations: { chakraId: number; practices: string[] }[] = [];
  
  // Get the 2 weakest chakras
  const weakChakras = [...balance.chakras]
    .sort((a, b) => a.balance - b.balance)
    .slice(0, 2);
  
  weakChakras.forEach(chakra => {
    const practices: string[] = [];
    
    switch (chakra.id) {
      case 0: // Root
        practices.push('Grounding meditation');
        practices.push('Walking in nature');
        practices.push('Body scan meditation');
        break;
      case 1: // Sacral
        practices.push('Creative visualization');
        practices.push('Dance meditation');
        practices.push('Emotional release journaling');
        break;
      case 2: // Solar Plexus
        practices.push('Confidence affirmations');
        practices.push('Core strength exercises');
        practices.push('Goal visualization');
        break;
      case 3: // Heart
        practices.push('Loving-kindness meditation');
        practices.push('Gratitude journaling');
        practices.push('Self-compassion practice');
        break;
      case 4: // Throat
        practices.push('Vocal toning');
        practices.push('Truth journaling');
        practices.push('Authentic communication practice');
        break;
      case 5: // Third Eye
        practices.push('Visualization meditation');
        practices.push('Intuition development');
        practices.push('Dream journaling');
        break;
      case 6: // Crown
        practices.push('Silent meditation');
        practices.push('Cosmic connection visualization');
        practices.push('Higher self contemplation');
        break;
    }
    
    recommendations.push({
      chakraId: chakra.id,
      practices
    });
  });
  
  return recommendations;
};
