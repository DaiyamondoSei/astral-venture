
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EnergyReflection {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  points_earned: number;
  dominant_emotion?: string;
  emotional_depth?: number;
}

const ReflectionsPanel: React.FC = () => {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<EnergyReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReflections();
    }
  }, [user]);

  const fetchReflections = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('energy_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReflections(data || []);
    } catch (err: any) {
      console.error('Error fetching reflections:', err);
      setError(err.message || 'Failed to load reflections');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Reflections</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading reflections...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Reflections</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={fetchReflections} className="mt-2">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (reflections.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Reflections</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You haven't created any reflections yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Reflections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reflections.map((reflection) => (
            <div 
              key={reflection.id} 
              className="p-4 border rounded-lg bg-background/50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-muted-foreground">
                  {formatDate(reflection.created_at)}
                </div>
                <div className="text-sm font-medium">
                  +{reflection.points_earned} energy points
                </div>
              </div>
              <p className="text-sm">{reflection.content}</p>
              {reflection.dominant_emotion && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Primary emotion: {reflection.dominant_emotion}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReflectionsPanel;
