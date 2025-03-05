
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserReflections } from '@/services/reflectionService';
import { evaluateEmotionalDepth } from '@/utils/emotion';

export const useUserReflections = () => {
  const [loading, setLoading] = useState(true);
  const [reflections, setReflections] = useState<any[]>([]);
  const [depthScores, setDepthScores] = useState<number[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReflections = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user reflections
        const userReflections = await fetchUserReflections(user.id, 10);
        setReflections(userReflections);
        
        // Evaluate emotional depth of each reflection for progress tracking
        if (userReflections.length > 0) {
          const scores = userReflections.map(r => evaluateEmotionalDepth(r.content));
          setDepthScores(scores);
        }
      } catch (error) {
        console.error('Error fetching reflections:', error);
        setReflections([]);
        setDepthScores([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReflections();
  }, [user]);

  return {
    loading,
    reflections,
    depthScores,
    reflectionCount: reflections.length
  };
};
