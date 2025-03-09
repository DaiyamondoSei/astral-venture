
import { useState, useEffect } from 'react';
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
  const [practices, setPractices] = useState<Practice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [progress, setProgress] = useState<PracticeProgress | null>(null);
  const [completedPractices, setCompletedPractices] = useState<PracticeCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch practices based on level and filters
  const fetchPracticeData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userLevel = level || 1;
      const practicesData = await fetchPractices(userLevel, type, category);
      setPractices(practicesData);
      
      if (user?.id) {
        const userProgress = await fetchPracticeProgress(user.id);
        setProgress(userProgress);
        
        const userCompletions = await fetchCompletedPractices(user.id);
        setCompletedPractices(userCompletions);
      }
    } catch (err: any) {
      console.error('Error fetching practice data:', err);
      setError('Failed to load practices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load practices on initial render
  useEffect(() => {
    fetchPracticeData();
  }, [user?.id, type, category, level]);
  
  // Select a practice by ID
  const selectPractice = async (id: string) => {
    setIsLoading(true);
    
    try {
      const practice = await fetchPracticeById(id);
      setSelectedPractice(practice);
    } catch (err) {
      console.error('Error selecting practice:', err);
      setError('Failed to load practice details.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Complete a practice
  const completePractice = async (duration: number, reflection?: string) => {
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
  };
  
  // Function to manually refresh all data
  const refreshData = async () => {
    await fetchPracticeData();
  };
  
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
