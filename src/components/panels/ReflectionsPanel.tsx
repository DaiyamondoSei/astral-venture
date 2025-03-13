
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';

interface Reflection {
  id: string;
  content: string;
  created_at: string;
  points_earned: number;
}

const ReflectionsPanel = () => {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReflections = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('energy_reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('Error fetching reflections:', error);
        } else {
          setReflections(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch reflections:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReflections();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="shadow-md bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Recent Reflections
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : reflections.length > 0 ? (
          <div className="space-y-2">
            {reflections.map((reflection) => (
              <div key={reflection.id} className="p-2 bg-card/50 rounded-md border border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(reflection.created_at)}
                  </span>
                  <span className="text-xs text-primary font-medium">
                    +{reflection.points_earned} points
                  </span>
                </div>
                <p className="text-sm mt-1 line-clamp-2">{reflection.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No reflections yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Share your thoughts to earn energy points
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReflectionsPanel;
