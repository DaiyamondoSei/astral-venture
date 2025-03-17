
import { useState, useEffect } from 'react';
import { ChakraData, ChakraSystemData } from '../types';
import { chakraSystemService } from '../services/chakraSystemService';
import { useAuth } from '@/hooks/useAuth';

export interface UseChakraSystemOptions {
  includeHistory?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useChakraSystem(
  userId?: string,
  options: UseChakraSystemOptions = {}
) {
  const { user } = useAuth();
  const { includeHistory = false, autoRefresh = false, refreshInterval = 60000 } = options;
  
  const [chakras, setChakras] = useState<ChakraData[]>([]);
  const [systemData, setSystemData] = useState<ChakraSystemData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use current user ID if no ID provided
  const targetUserId = userId || user?.id;
  
  // Fetch chakra system data
  const fetchChakraSystem = async () => {
    if (!targetUserId) {
      setChakras([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await chakraSystemService.getChakraSystem(targetUserId, { includeHistory });
      
      setChakras(result.chakras);
      setSystemData(result);
    } catch (err) {
      console.error('Error fetching chakra system:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch chakra system'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchChakraSystem();
  }, [targetUserId]);
  
  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || !targetUserId) return;
    
    const intervalId = setInterval(() => {
      fetchChakraSystem();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, targetUserId]);
  
  return {
    chakras,
    systemData,
    isLoading,
    error,
    refresh: fetchChakraSystem,
    dominantChakra: systemData?.dominantChakra,
    overallBalance: systemData?.overallBalance
  };
}
