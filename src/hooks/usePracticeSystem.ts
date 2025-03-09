
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchPractices, 
  fetchPracticeById, 
  recordPracticeCompletion, 
  fetchPracticeProgress,
  fetchCompletedPractices,
  Practice,
  PracticeCompletion,
  PracticeProgress
} from '@/services/practice/practiceService';
import practiceDataPreloader from '@/utils/practiceDataPreloader';
import { usePerfConfig } from './usePerfConfig';

interface UsePracticeSystemProps {
  type?: string;
  category?: string;
  level?: number;
}

interface UsePracticeSystemResult {
  practices: Practice[];
  selectedPractice: Practice | null;
  progress: PracticeProgress | null;
  completedPractices: PracticeCompletion[];
  isLoading: boolean;
  error: string | null;
  selectPractice: (id: string) => Promise<void>;
  completePractice: (duration: number, reflection?: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function usePracticeSystem({
  type,
  category,
  level
}: UsePracticeSystemProps = {}): UsePracticeSystemResult {
  const { user } = useAuth();
  const { config } = usePerfConfig();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [progress, setProgress] = useState<PracticeProgress | null>(null);
  const [completedPractices, setCompletedPractices] = useState<PracticeCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use virtualization based on performance config
  const useOptimizedLoading = config.enableVirtualization;
  
  // Fetch practices based on level and filters
  const fetchPracticeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userLevel = level || 1;
      
      // Try to get from cache first if no filters are applied
      let practicesData: Practice[] = [];
      
      if (!type && !category && useOptimizedLoading) {
        // Use preloaded data if available
        if (userLevel === 1) {
          practicesData = await practiceDataPreloader.preloadBasicPractices();
        } else {
          practicesData = await practiceDataPreloader.preloadPracticesForLevel(userLevel);
        }
        
        // If cache is empty, fetch normally
        if (practicesData.length === 0) {
          practicesData = await fetchPractices(userLevel, type, category);
        }
      } else {
        // Standard fetch with filters
        practicesData = await fetchPractices(userLevel, type, category);
      }
      
      setPractices(practicesData);
      
      if (user?.id) {
        // Fetch user progress and completions
        const [userProgress, userCompletions] = await Promise.all([
          fetchPracticeProgress(user.id),
          fetchCompletedPractices(user.id)
        ]);
        
        setProgress(userProgress);
        setCompletedPractices(userCompletions);
      }
    } catch (err: any) {
      console.error('Error fetching practice data:', err);
      setError('Failed to load practices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, type, category, level, useOptimizedLoading]);
  
  // Load practices on initial render
  useEffect(() => {
    fetchPracticeData();
  }, [fetchPracticeData]);
  
  // Select a practice by ID
  const selectPractice = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      // Try to get from cache first if available
      let practice = null;
      
      if (useOptimizedLoading) {
        practice = await practiceDataPreloader.getPracticeById(id);
      }
      
      // If not in cache, fetch normally
      if (!practice) {
        practice = await fetchPracticeById(id);
      }
      
      setSelectedPractice(practice);
    } catch (err) {
      console.error('Error selecting practice:', err);
      setError('Failed to load practice details.');
    } finally {
      setIsLoading(false);
    }
  }, [useOptimizedLoading]);
  
  // Complete a practice
  const completePractice = useCallback(async (duration: number, reflection?: string) => {
    if (!user?.id || !selectedPractice) {
      setError('Unable to record practice. Please try again.');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const success = await recordPracticeCompletion(
        user.id,
        selectedPractice.id,
        duration,
        reflection
      );
      
      if (success) {
        // Refresh data after successful completion
        await fetchPracticeData();
      }
      
      return success;
    } catch (err) {
      console.error('Error completing practice:', err);
      setError('Failed to record practice completion.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedPractice, fetchPracticeData]);
  
  // Function to manually refresh all data
  const refreshData = useCallback(async () => {
    await fetchPracticeData();
  }, [fetchPracticeData]);
  
  return {
    practices,
    selectedPractice,
    progress,
    completedPractices,
    isLoading,
    error,
    selectPractice,
    completePractice,
    refreshData
  };
}
