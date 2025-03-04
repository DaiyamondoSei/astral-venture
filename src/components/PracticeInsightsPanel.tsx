
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDays, BookOpen, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnergyReflection {
  id: string;
  user_id: string;
  content: string;
  points_earned: number;
  created_at: string;
}

const PracticeInsightsPanel = () => {
  const [recentReflections, setRecentReflections] = useState<EnergyReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentReflections = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Using a more generic approach since TypeScript types aren't updated yet
        const { data, error } = await supabase
          .from('energy_reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5) as { data: EnergyReflection[] | null, error: any };
          
        if (error) throw error;
        setRecentReflections(data || []);
      } catch (error) {
        console.error('Error fetching reflections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentReflections();
  }, [user]);

  // Calculate total points earned from reflections
  const totalPointsEarned = recentReflections.reduce((sum, reflection) => 
    sum + (reflection.points_earned || 0), 0);

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-6 w-1/3 bg-white/10 rounded mb-4"></div>
        <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
        <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-white/10 rounded"></div>
      </div>
    );
  }

  if (recentReflections.length === 0) {
    return (
      <div className="glass-card p-4">
        <h3 className="font-display text-lg mb-2">Your Energy Journey</h3>
        <p className="text-white/70 text-sm">
          Start documenting your energy practices and insights to see your progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <h3 className="font-display text-lg mb-3">Your Energy Journey</h3>
      
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center">
          <BookOpen size={16} className="text-primary mr-2" />
          <span className="text-white/90">{recentReflections.length} reflections</span>
        </div>
        <div className="flex items-center">
          <Sparkles size={16} className="text-primary mr-2" />
          <span className="text-white/90">{totalPointsEarned} points earned</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {recentReflections.map(reflection => (
          <div key={reflection.id} className="border-l-2 border-primary/30 pl-3">
            <p className="text-sm text-white/80 line-clamp-2">
              {reflection.content}
            </p>
            <div className="flex items-center mt-1 text-xs text-white/50">
              <CalendarDays size={12} className="mr-1" />
              <span>{formatDistanceToNow(new Date(reflection.created_at), { addSuffix: true })}</span>
              <span className="ml-2 text-primary">+{reflection.points_earned} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeInsightsPanel;
