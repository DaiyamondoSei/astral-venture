
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface EnergyReflection {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  points_earned: number;
  dominant_emotion?: string;
  emotional_depth?: number;
  chakras_activated?: any;
}

const ReflectionsPanel = () => {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<EnergyReflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReflections() {
      if (!user) return;
      
      try {
        setLoading(true);
        // Fetch the user's reflections
        const { data, error } = await supabase
          .from('energy_reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching reflections:', error);
          return;
        }
        
        // Transform data into EnergyReflection type
        const typedReflections: EnergyReflection[] = data ? data.map(item => ({
          id: item.id,
          created_at: item.created_at,
          user_id: item.user_id,
          content: item.content,
          points_earned: item.points_earned || 0,
          dominant_emotion: item.dominant_emotion,
          emotional_depth: item.emotional_depth,
          chakras_activated: item.chakras_activated
        })) : [];
        
        setReflections(typedReflections);
      } catch (err) {
        console.error('Error in fetchReflections:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReflections();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Reflections</h2>
        <Card className="p-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Reflections</h2>
        <Card className="p-4 text-center text-muted-foreground">
          No reflections yet. Start your journey by recording your first reflection.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Reflections</h2>
      {reflections.map((reflection) => (
        <Card key={reflection.id} className="p-4">
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(reflection.created_at).toLocaleDateString()}
            {reflection.dominant_emotion && ` • Feeling: ${reflection.dominant_emotion}`}
          </p>
          <p className="mb-2">{reflection.content}</p>
          {reflection.chakras_activated && Array.isArray(reflection.chakras_activated) && reflection.chakras_activated.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Chakras: {reflection.chakras_activated.join(', ')}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ReflectionsPanel;
