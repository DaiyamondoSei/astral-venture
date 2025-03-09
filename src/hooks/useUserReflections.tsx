
import { useState, useEffect } from 'react';
import { getUserReflections, EnergyReflection } from '@/services/reflection/reflectionOperations';
import { useUser } from './useUser';

export function useUserReflections() {
  const [reflections, setReflections] = useState<EnergyReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();

  useEffect(() => {
    async function loadReflections() {
      if (!user) {
        setReflections([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userReflections = await getUserReflections(user.id);
        setReflections(userReflections);
        setError(null);
      } catch (err) {
        console.error('Error loading reflections:', err);
        setError('Failed to load reflections');
      } finally {
        setIsLoading(false);
      }
    }

    loadReflections();
  }, [user]);

  const refreshReflections = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userReflections = await getUserReflections(user.id);
      setReflections(userReflections);
      setError(null);
    } catch (err) {
      console.error('Error refreshing reflections:', err);
      setError('Failed to refresh reflections');
    } finally {
      setIsLoading(false);
    }
  };

  return { reflections, isLoading, error, refreshReflections };
}
