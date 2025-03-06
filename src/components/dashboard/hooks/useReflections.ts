
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useReflections() {
  const [latestReflection, setLatestReflection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLatestReflection = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('energy_reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data && !error) {
          setLatestReflection(data);
        }
      } catch (error) {
        console.error('Error fetching latest reflection:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestReflection();
  }, [user]);

  return {
    latestReflection,
    loading
  };
}
