
import { ChakraSystemData, ChakraData } from '../types';
import { ApiError } from '@/utils/api/apiErrorHandler';

interface GetChakraSystemOptions {
  includeHistory?: boolean;
}

// Default chakra system for development
const DEFAULT_CHAKRAS: ChakraData[] = [
  { id: 'root', name: 'Root Chakra', color: '#FF0000', activationLevel: 70, position: 1 },
  { id: 'sacral', name: 'Sacral Chakra', color: '#FF7F00', activationLevel: 55, position: 2 },
  { id: 'solar-plexus', name: 'Solar Plexus Chakra', color: '#FFFF00', activationLevel: 65, position: 3 },
  { id: 'heart', name: 'Heart Chakra', color: '#00FF00', activationLevel: 80, position: 4 },
  { id: 'throat', name: 'Throat Chakra', color: '#0000FF', activationLevel: 60, position: 5 },
  { id: 'third-eye', name: 'Third Eye Chakra', color: '#4B0082', activationLevel: 75, position: 6 },
  { id: 'crown', name: 'Crown Chakra', color: '#8B00FF', activationLevel: 50, position: 7 }
];

/**
 * Service for interacting with chakra systems
 */
class ChakraSystemService {
  /**
   * Get a user's chakra system
   */
  async getChakraSystem(
    userId: string,
    options: GetChakraSystemOptions = {}
  ): Promise<ChakraSystemData> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Calculate the dominant chakra (highest activation level)
      const chakras = [...DEFAULT_CHAKRAS];
      const dominantChakra = chakras.reduce(
        (max, chakra) => (chakra.activationLevel > max.activationLevel ? chakra : max),
        chakras[0]
      );
      
      // Calculate overall balance (average of how close each chakra is to the ideal level)
      const idealLevel = 100;
      const overallBalance = Math.round(
        chakras.reduce((sum, chakra) => sum + chakra.activationLevel, 0) / chakras.length
      );
      
      // Return the chakra system data
      return {
        id: `chakra-system-${userId}`,
        userId,
        chakras,
        dominantChakra: dominantChakra.id,
        overallBalance,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('ChakraSystemService.getChakraSystem error:', error);
      throw new ApiError(
        'Failed to fetch chakra system',
        ApiError.ErrorCode.API_ERROR, 
        { originalError: error }
      );
    }
  }
  
  /**
   * Update a chakra's activation level
   */
  async updateChakraLevel(
    userId: string,
    chakraId: string,
    newLevel: number
  ): Promise<ChakraData> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return the updated chakra
      return {
        id: chakraId,
        name: DEFAULT_CHAKRAS.find(c => c.id === chakraId)?.name || 'Unknown Chakra',
        color: DEFAULT_CHAKRAS.find(c => c.id === chakraId)?.color || '#CCCCCC', 
        activationLevel: newLevel,
        position: DEFAULT_CHAKRAS.find(c => c.id === chakraId)?.position || 0
      };
    } catch (error) {
      console.error('ChakraSystemService.updateChakraLevel error:', error);
      throw new ApiError(
        'Failed to update chakra level',
        ApiError.ErrorCode.API_ERROR,
        { originalError: error }
      );
    }
  }
}

export const chakraSystemService = new ChakraSystemService();
