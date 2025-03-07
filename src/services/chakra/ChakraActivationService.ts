
/**
 * Service responsible for handling chakra activation and recalibration operations
 */
import { supabase, incrementEnergyPoints } from '@/integrations/supabase/client';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';
import { handleError } from '@/utils/errorHandling';

// Improved typings for better code quality and prevention of bugs
interface ChakraActivationResult {
  success: boolean;
  alreadyActivated?: boolean;
  chakraName?: string;
  pointsEarned?: number;
  newPoints?: number;
  newActivatedChakras: number[];
}

interface ChakraRecalibrationResult {
  success: boolean;
  noRecalibrationNeeded?: boolean;
  recalibratedDays?: number[];
  pointsEarned?: number;
  newPoints?: number;
  newActivatedChakras: number[];
  newStreak?: number;
}

export class ChakraActivationService {
  /**
   * Activates a specific chakra for a user
   */
  static async activateChakra(
    userId: string,
    chakraIndex: number,
    currentActivatedChakras: number[]
  ): Promise<ChakraActivationResult> {
    try {
      // Validate inputs to prevent errors
      if (!userId || chakraIndex < 0 || chakraIndex >= CHAKRA_NAMES.length) {
        return {
          success: false,
          newActivatedChakras: [...currentActivatedChakras]
        };
      }
      
      // Check if this chakra was already activated today
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const { data: existingActivations, error: checkError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', `chakra_${chakraIndex}`)
        .gte('completed_at', startOfDay)
        .lte('completed_at', endOfDay);
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingActivations && existingActivations.length > 0) {
        return {
          success: false,
          alreadyActivated: true,
          chakraName: CHAKRA_NAMES[chakraIndex],
          newActivatedChakras: [...currentActivatedChakras]
        };
      }
      
      // Insert new activation with error handling
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          category: 'chakra_activation',
          challenge_id: `chakra_${chakraIndex}`,
          completed_at: new Date().toISOString()
        });
        
      if (error) {
        throw error;
      }
      
      // Calculate points
      const pointsEarned = 10 + (chakraIndex * 5);
      const newPoints = await incrementEnergyPoints(userId, pointsEarned);
      
      // Update activated chakras list
      const newActivatedChakras = [...currentActivatedChakras];
      if (!newActivatedChakras.includes(chakraIndex)) {
        newActivatedChakras.push(chakraIndex);
      }
      
      return {
        success: true,
        chakraName: CHAKRA_NAMES[chakraIndex],
        pointsEarned,
        newPoints,
        newActivatedChakras
      };
    } catch (error) {
      handleError(error, 'ChakraActivationService.activateChakra', false);
      throw error;
    }
  }
  
  /**
   * Recalibrates missed chakra activations
   */
  static async recalibrateChakras(
    userId: string,
    activatedChakras: number[],
    reflection: string
  ): Promise<ChakraRecalibrationResult> {
    try {
      // Validate inputs to prevent errors
      if (!userId || !reflection || reflection.length < 5) {
        return {
          success: false,
          newActivatedChakras: [...activatedChakras]
        };
      }
      
      const today = new Date();
      const currentDay = today.getDay();
      const allDays = Array.from({ length: currentDay + 1 }, (_, i) => i);
      const missedDays = allDays.filter(day => !activatedChakras.includes(day));
      
      if (missedDays.length === 0) {
        return {
          success: false,
          noRecalibrationNeeded: true,
          newActivatedChakras: [...activatedChakras]
        };
      }
      
      // Process each missed day
      const recalibratedDays: number[] = [];
      
      for (const missedDay of missedDays) {
        // Check if already recalibrated
        const { data: existingRecalibrations, error: checkError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', `chakra_${missedDay}`)
          .eq('category', 'chakra_recalibration');
        
        if (checkError) throw checkError;
        
        // Skip if already recalibrated
        if (existingRecalibrations && existingRecalibrations.length > 0) {
          console.log('Chakra already recalibrated:', missedDay);
          continue;
        }
        
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            category: 'chakra_recalibration',
            challenge_id: `chakra_${missedDay}`,
            completed_at: new Date().toISOString(),
            reflection
          });
          
        if (error) throw error;
        
        recalibratedDays.push(missedDay);
      }
      
      // Update activated chakras
      const newActivatedChakras = [...activatedChakras];
      missedDays.forEach(day => {
        if (!newActivatedChakras.includes(day)) {
          newActivatedChakras.push(day);
        }
      });
      
      // Award points
      const pointsEarned = Math.max(5, missedDays.length * 2);
      const newPoints = await incrementEnergyPoints(userId, pointsEarned);
      
      // Calculate new streak
      const newStreak = Math.max(currentDay + 1, activatedChakras.length);
      
      return {
        success: true,
        recalibratedDays,
        pointsEarned,
        newPoints,
        newActivatedChakras,
        newStreak
      };
    } catch (error) {
      handleError(error, 'ChakraActivationService.recalibrateChakras', false);
      throw error;
    }
  }
}
