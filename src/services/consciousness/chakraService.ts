
import { supabase } from '@/integrations/supabase/client';
import { ChakraSystem, ChakraType, ChakraStatus } from '@/types/consciousness';

/**
 * Service for managing chakra activation and balance
 */
export const chakraService = {
  /**
   * Get user's chakra system
   */
  async getUserChakraSystem(userId: string): Promise<ChakraSystem | null> {
    try {
      const { data, error } = await supabase
        .from('chakra_systems')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        chakras: data.chakras || this.createDefaultChakraSystem().chakras,
        overallBalance: data.overall_balance || 0,
        dominantChakra: data.dominant_chakra as ChakraType || null,
        lastUpdated: data.last_updated || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching chakra system:', error);
      return null;
    }
  },
  
  /**
   * Update user's chakra system
   */
  async updateChakraSystem(userId: string, chakraSystem: Partial<ChakraSystem>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chakra_systems')
        .upsert({
          user_id: userId,
          chakras: chakraSystem.chakras,
          overall_balance: chakraSystem.overallBalance,
          dominant_chakra: chakraSystem.dominantChakra,
          last_updated: new Date().toISOString()
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating chakra system:', error);
      return false;
    }
  },
  
  /**
   * Update a specific chakra activation level
   */
  async updateChakraActivation(
    userId: string, 
    chakraType: ChakraType, 
    activation: number
  ): Promise<boolean> {
    try {
      // Get current system first
      const currentSystem = await this.getUserChakraSystem(userId);
      if (!currentSystem) {
        // Create default system if none exists
        const defaultSystem = this.createDefaultChakraSystem();
        defaultSystem.chakras[chakraType].activation = activation;
        return this.updateChakraSystem(userId, defaultSystem);
      }
      
      // Update the specific chakra
      const updatedChakras = {
        ...currentSystem.chakras,
        [chakraType]: {
          ...currentSystem.chakras[chakraType],
          activation
        }
      };
      
      // Recalculate overall balance and dominant chakra
      const overallBalance = this.calculateOverallBalance(updatedChakras);
      const dominantChakra = this.calculateDominantChakra(updatedChakras);
      
      return this.updateChakraSystem(userId, {
        chakras: updatedChakras,
        overallBalance,
        dominantChakra
      });
    } catch (error) {
      console.error('Error updating chakra activation:', error);
      return false;
    }
  },
  
  /**
   * Record chakra activation from an activity
   */
  async recordChakraActivity(
    userId: string, 
    activatedChakras: ChakraType[], 
    activityType: string
  ): Promise<boolean> {
    try {
      // Get current system
      const currentSystem = await this.getUserChakraSystem(userId);
      const chakraSystem = currentSystem || this.createDefaultChakraSystem();
      
      // Update chakra activations (increase by 5 points for each activated chakra)
      const updatedChakras = { ...chakraSystem.chakras };
      
      activatedChakras.forEach(chakraType => {
        if (updatedChakras[chakraType]) {
          updatedChakras[chakraType].activation = Math.min(
            100, 
            updatedChakras[chakraType].activation + 5
          );
        }
      });
      
      // Recalculate overall balance and dominant chakra
      const overallBalance = this.calculateOverallBalance(updatedChakras);
      const dominantChakra = this.calculateDominantChakra(updatedChakras);
      
      // Record the activity
      const { error: activityError } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          chakras_activated: activatedChakras,
          timestamp: new Date().toISOString()
        });
      
      if (activityError) throw activityError;
      
      // Update the chakra system
      return this.updateChakraSystem(userId, {
        chakras: updatedChakras,
        overallBalance,
        dominantChakra
      });
    } catch (error) {
      console.error('Error recording chakra activity:', error);
      return false;
    }
  },
  
  /**
   * Create a default chakra system
   */
  createDefaultChakraSystem(): ChakraSystem {
    const defaultChakraStatus = (): ChakraStatus => ({
      type: 'root',
      activation: 20,
      balance: 0,
      blockages: [],
      dominantEmotions: []
    });
    
    return {
      chakras: {
        root: { ...defaultChakraStatus(), type: 'root' },
        sacral: { ...defaultChakraStatus(), type: 'sacral' },
        solar: { ...defaultChakraStatus(), type: 'solar' },
        heart: { ...defaultChakraStatus(), type: 'heart' },
        throat: { ...defaultChakraStatus(), type: 'throat' },
        third: { ...defaultChakraStatus(), type: 'third' },
        crown: { ...defaultChakraStatus(), type: 'crown' }
      },
      overallBalance: 50,
      dominantChakra: 'heart',
      lastUpdated: new Date().toISOString()
    };
  },
  
  /**
   * Calculate overall chakra balance
   */
  calculateOverallBalance(chakras: Record<ChakraType, ChakraStatus>): number {
    // Get all activation levels
    const activationLevels = Object.values(chakras).map(c => c.activation);
    
    // Variety of approaches could be used here, this is a simple one:
    // 1. Calculate average activation
    const avgActivation = activationLevels.reduce((sum, val) => sum + val, 0) / activationLevels.length;
    
    // 2. Calculate standard deviation to measure balance
    const variance = activationLevels.reduce((sum, val) => sum + Math.pow(val - avgActivation, 2), 0) / activationLevels.length;
    const stdDev = Math.sqrt(variance);
    
    // 3. Higher standard deviation means less balance
    // Convert to a 0-100 scale where 100 is perfect balance
    const maxPossibleStdDev = 50; // Theoretical max std dev
    const balance = 100 - (stdDev / maxPossibleStdDev * 100);
    
    return Math.max(0, Math.min(100, balance));
  },
  
  /**
   * Calculate dominant chakra
   */
  calculateDominantChakra(chakras: Record<ChakraType, ChakraStatus>): ChakraType | null {
    // Find the chakra with highest activation
    let maxActivation = 0;
    let dominantChakra: ChakraType | null = null;
    
    Object.entries(chakras).forEach(([type, status]) => {
      if (status.activation > maxActivation) {
        maxActivation = status.activation;
        dominantChakra = type as ChakraType;
      }
    });
    
    return dominantChakra;
  },
  
  /**
   * Get chakra recommendations based on current system
   */
  getChakraRecommendations(chakraSystem: ChakraSystem): {
    focusChakras: ChakraType[];
    recommendations: string[];
  } {
    // Identify imbalanced or blocked chakras
    const imbalancedChakras = Object.entries(chakraSystem.chakras)
      .filter(([_, status]) => status.activation < 30 || Math.abs(status.balance) > 50)
      .map(([type]) => type as ChakraType);
    
    // Generate general recommendations based on chakra status
    const recommendations: string[] = [];
    
    if (imbalancedChakras.includes('root')) {
      recommendations.push('Ground yourself with nature walks or meditation focusing on your connection to the earth.');
    }
    
    if (imbalancedChakras.includes('sacral')) {
      recommendations.push('Express your creativity through art, dance or journaling to activate your sacral chakra.');
    }
    
    if (imbalancedChakras.includes('solar')) {
      recommendations.push('Practice self-affirmations and confidence-building activities to strengthen your solar plexus.');
    }
    
    if (imbalancedChakras.includes('heart')) {
      recommendations.push('Open your heart through acts of compassion, forgiveness practices, or loving-kindness meditation.');
    }
    
    if (imbalancedChakras.includes('throat')) {
      recommendations.push('Express your authentic voice through speaking, singing, or writing to clear your throat chakra.');
    }
    
    if (imbalancedChakras.includes('third')) {
      recommendations.push('Enhance your intuition through visualization exercises and mindfulness practices.');
    }
    
    if (imbalancedChakras.includes('crown')) {
      recommendations.push('Connect to your higher purpose through meditation, spiritual study, or contemplation of life\'s deeper meaning.');
    }
    
    // Add general recommendation if overall balance is low
    if (chakraSystem.overallBalance < 50) {
      recommendations.push('Your chakra system shows significant imbalance. A full chakra alignment meditation is recommended.');
    }
    
    return {
      focusChakras: imbalancedChakras.length > 0 ? imbalancedChakras : ['heart'],
      recommendations: recommendations.length > 0 ? recommendations : ['Maintain your current chakra balance through regular meditation.']
    };
  }
};
