
import { useState, useEffect } from 'react';
import { getUserReflections } from '@/services/reflection/reflectionOperations';
import { EnergyReflection } from '@/services/reflection/types';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for accessing user reflections data
 */
export const useUserReflections = () => {
  const [reflections, setReflections] = useState<EnergyReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Extract depth scores and count from reflections
  const depthScores = reflections.map(r => r.emotional_depth || 0);
  const reflectionCount = reflections.length;

  const refreshReflections = async () => {
    if (!user) {
      setReflections([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const data = await getUserReflections(user.id);
      setReflections(data);
    } catch (err) {
      console.error('Error fetching reflections:', err);
      setError('Failed to load reflections. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshReflections();
  }, [user?.id]);

  return {
    reflections,
    isLoading,
    error,
    refreshReflections,
    depthScores,
    reflectionCount
  };
};

export default useUserReflections;
