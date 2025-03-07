
import { renderHook, waitFor } from '@testing-library/react';
import { useChakraInsights } from '@/hooks/useChakraInsights';
import { ChakraInsightsService } from '@/services/chakra/ChakraInsightsService';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/chakra/ChakraInsightsService', () => ({
  ChakraInsightsService: {
    getPersonalizedInsights: jest.fn(),
  },
}));

describe('useChakraInsights Hook', () => {
  const mockUser = { id: 'test-user-id' };
  const mockChakraActivated = [0, 1, 2];
  const mockDominantEmotions = ['calm', 'joy'];
  
  const mockInsightsResponse = {
    personalizedInsights: ['Insight 1', 'Insight 2'],
    practiceRecommendations: ['Practice 1', 'Practice 2']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (ChakraInsightsService.getPersonalizedInsights as jest.Mock).mockResolvedValue(mockInsightsResponse);
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => 
      useChakraInsights(mockChakraActivated, mockDominantEmotions)
    );
    
    expect(result.current.loading).toBe(true);
    expect(result.current.personalizedInsights).toEqual([]);
    expect(result.current.practiceRecommendations).toEqual([]);
  });

  it('should fetch insights when component mounts', async () => {
    const { result } = renderHook(() => 
      useChakraInsights(mockChakraActivated, mockDominantEmotions)
    );
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(ChakraInsightsService.getPersonalizedInsights).toHaveBeenCalledWith(
      mockUser.id,
      mockChakraActivated,
      mockDominantEmotions
    );
    
    expect(result.current.personalizedInsights).toEqual(mockInsightsResponse.personalizedInsights);
    expect(result.current.practiceRecommendations).toEqual(mockInsightsResponse.practiceRecommendations);
  });

  it('should not fetch insights when user is not available', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => 
      useChakraInsights(mockChakraActivated, mockDominantEmotions)
    );
    
    expect(ChakraInsightsService.getPersonalizedInsights).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    console.error = jest.fn();
    (ChakraInsightsService.getPersonalizedInsights as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    const { result } = renderHook(() => 
      useChakraInsights(mockChakraActivated, mockDominantEmotions)
    );
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching personalized content:'), 
      expect.any(Error)
    );
    
    expect(result.current.personalizedInsights).toEqual(['Continue your reflection practice to deepen your insights.']);
  });

  it('should refetch when dependencies change', async () => {
    const { rerender } = renderHook(
      ({ chakras, emotions }) => useChakraInsights(chakras, emotions),
      { 
        initialProps: { 
          chakras: mockChakraActivated, 
          emotions: mockDominantEmotions 
        } 
      }
    );
    
    await waitFor(() => {
      expect(ChakraInsightsService.getPersonalizedInsights).toHaveBeenCalledTimes(1);
    });
    
    // Change the dependencies
    rerender({ 
      chakras: [...mockChakraActivated, 3], 
      emotions: [...mockDominantEmotions, 'gratitude'] 
    });
    
    await waitFor(() => {
      expect(ChakraInsightsService.getPersonalizedInsights).toHaveBeenCalledTimes(2);
    });
  });
});
