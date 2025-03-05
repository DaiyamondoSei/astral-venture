
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Star, Lightbulb } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import GlowEffect from '@/components/GlowEffect';

interface HistoricalReflection {
  id: string | number;
  content: string;
  points_earned?: number;
  created_at: string;
  insights?: string[];
  prompt?: string;
  timestamp?: string;
}

const ReflectionHistory: React.FC = () => {
  const [reflections, setReflections] = useState<HistoricalReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReflections = async () => {
      setLoading(true);
      
      try {
        // Combine reflections from different sources
        let allReflections: HistoricalReflection[] = [];
        
        // Get energy reflections from localStorage (until Supabase is implemented)
        try {
          const energyReflections = JSON.parse(localStorage.getItem('energyReflections') || '[]');
          allReflections = [...allReflections, ...energyReflections];
        } catch (error) {
          console.error('Error loading energy reflections:', error);
        }
        
        // Get philosophical reflections from localStorage
        try {
          const philosophicalReflections = JSON.parse(localStorage.getItem('philosophicalReflections') || '[]');
          allReflections = [...allReflections, ...philosophicalReflections];
        } catch (error) {
          console.error('Error loading philosophical reflections:', error);
        }
        
        // Sort all reflections by date (newest first)
        allReflections.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.created_at);
          const dateB = new Date(b.timestamp || b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
        
        setReflections(allReflections);
      } catch (error) {
        console.error('Error fetching reflections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReflections();
  }, [user]);

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-8 w-1/2 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-24 bg-white/5 rounded"></div>
          <div className="h-24 bg-white/5 rounded"></div>
          <div className="h-24 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-display text-lg mb-4">Your Reflection Journey</h3>
        <div className="p-6 border border-quantum-500/20 rounded-lg bg-black/20 text-center">
          <p className="text-white/60 mb-3">
            Your reflection history will appear here once you begin your journaling practice.
          </p>
          <p className="text-white/40 text-sm">
            Start with the "New Reflection" tab to begin your consciousness evolution.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-display text-lg mb-4">Your Reflection Journey</h3>
      <p className="text-white/70 text-sm mb-6">
        Review your past reflections to trace the evolution of your consciousness over time.
      </p>
      
      <div className="space-y-4">
        {reflections.map((reflection) => {
          // Determine if this is a philosophical or energy reflection
          const isPhilosophical = reflection.hasOwnProperty('prompt');
          const glowColor = isPhilosophical ? 'rgba(138, 43, 226, 0.3)' : 'rgba(64, 125, 247, 0.3)';
          const typeLabel = isPhilosophical ? 'Consciousness' : 'Energy';
          
          return (
            <GlowEffect 
              key={reflection.id} 
              className="p-4 border border-quantum-500/20 rounded-lg bg-black/20"
              color={glowColor}
              intensity="low"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-quantum-400 text-sm font-medium flex items-center">
                    {isPhilosophical ? <Lightbulb size={14} className="mr-1" /> : <Star size={14} className="mr-1" />}
                    {typeLabel} Reflection
                  </span>
                  <div className="flex items-center text-white/40 text-xs">
                    <Calendar size={12} className="mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(reflection.timestamp || reflection.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {reflection.prompt && (
                  <div className="mb-2 text-xs text-white/50 italic">
                    Prompt: "{reflection.prompt}"
                  </div>
                )}
              </div>
              
              <p className="text-white/80 mb-3 line-clamp-3">
                {reflection.content}
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <Star size={14} className="text-quantum-400 mr-1" />
                  <span className="text-white/60">
                    {reflection.points_earned || 0} points earned
                  </span>
                </div>
                
                {reflection.insights && reflection.insights.length > 0 && (
                  <div className="text-xs text-white/50">
                    {reflection.insights[0]}
                  </div>
                )}
              </div>
            </GlowEffect>
          );
        })}
      </div>
    </div>
  );
};

export default ReflectionHistory;
