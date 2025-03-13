
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, PenLine, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useAuth from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * ReflectionsPanel displays a user's recent reflections and insights
 */
const ReflectionsPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reflections, setReflections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReflections = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('energy_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      setReflections(data || []);
    } catch (err) {
      console.error('Error fetching reflections:', err);
      toast({
        title: 'Failed to load reflections',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReflections();
    }
  }, [user]);

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-indigo-400" />
            Reflections
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchReflections}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Your journey of consciousness
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reflections.length > 0 ? (
          <div className="space-y-3">
            {reflections.map((reflection) => (
              <div 
                key={reflection.id} 
                className="p-3 border border-border/30 rounded-md bg-muted/30"
              >
                <p className="text-sm">
                  {reflection.content.length > 120
                    ? `${reflection.content.substring(0, 120)}...`
                    : reflection.content}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(reflection.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-medium text-indigo-400">
                    +{reflection.points_earned} points
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border border-border/30 rounded-md bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Your reflections provide insights into your spiritual journey and help track your progress.
              </p>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                New Reflection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReflectionsPanel;
