
import { supabase } from '@/integrations/supabase/client';
import { ChakraName } from './chakraVisualizationService';

export type ChakraActionType = 'practice' | 'meditation' | 'reflection';

interface ChakraActionParams {
  userId: string;
  chakraId: ChakraName;
  actionType: ChakraActionType;
  practiceId?: string;
  meditationDuration?: number;
  reflectionContent?: string;
}

interface ChakraActionResult {
  success: boolean;
  energyPointsAwarded: number;
  chakraSystem: any;
  error?: string;
}

/**
 * Updates the chakra system through the edge function for optimal performance
 */
export async function updateChakraSystem(params: ChakraActionParams): Promise<ChakraActionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('update-chakra-system', {
      body: params
    });
    
    if (error) {
      console.error('Error updating chakra system:', error);
      return {
        success: false,
        energyPointsAwarded: 0,
        chakraSystem: null,
        error: error.message
      };
    }
    
    return {
      success: true,
      energyPointsAwarded: data.energyPointsAwarded,
      chakraSystem: data.chakraSystem
    };
  } catch (error) {
    console.error('Error in chakra system service:', error);
    return {
      success: false,
      energyPointsAwarded: 0,
      chakraSystem: null,
      error: error.message
    };
  }
}

/**
 * Completes a chakra practice and processes the rewards
 */
export async function completeChakraPractice(
  userId: string,
  chakraId: ChakraName,
  practiceId: string
): Promise<ChakraActionResult> {
  return updateChakraSystem({
    userId,
    chakraId,
    actionType: 'practice',
    practiceId
  });
}

/**
 * Records a chakra meditation session and processes the rewards
 */
export async function recordChakraMeditation(
  userId: string,
  chakraId: ChakraName,
  durationMinutes: number
): Promise<ChakraActionResult> {
  return updateChakraSystem({
    userId,
    chakraId,
    actionType: 'meditation',
    meditationDuration: durationMinutes
  });
}

/**
 * Records a chakra reflection and processes the rewards
 */
export async function recordChakraReflection(
  userId: string,
  chakraId: ChakraName,
  content: string
): Promise<ChakraActionResult> {
  return updateChakraSystem({
    userId,
    chakraId,
    actionType: 'reflection',
    reflectionContent: content
  });
}
