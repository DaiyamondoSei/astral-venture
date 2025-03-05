
import React, { useState } from 'react';
import { useUserReflections } from '@/hooks/useUserReflections';
import { getChakraNames } from '@/utils/emotion/chakraUtils';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Activity, Star, Calendar } from 'lucide-react';

const ReflectionHistoryInsights = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { reflections, loading } = useUserReflections();
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-6 w-1/3 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-white/5 rounded"></div>
          <div className="h-20 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (reflections.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-display text-lg mb-3">Reflection History</h3>
        <p className="text-white/70 text-sm">
          Your reflection history will appear here once you begin your practice.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-display text-lg mb-4">Your Reflection Journey</h3>
      
      <div className="space-y-3">
        {reflections.map((reflection) => (
          <div 
            key={reflection.id} 
            className="border border-quantum-500/20 rounded-lg bg-black/20 overflow-hidden"
          >
            <div 
              className="p-3 flex justify-between items-start cursor-pointer"
              onClick={() => toggleExpand(reflection.id)}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/90 line-clamp-1 flex-1">
                    {reflection.content.substring(0, 60)}
                    {reflection.content.length > 60 ? '...' : ''}
                  </span>
                </div>
                <div className="flex items-center mt-1 space-x-3 text-xs text-white/50">
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {format(new Date(reflection.created_at), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center text-primary/80">
                    <Star size={12} className="mr-1" />
                    {reflection.points_earned} pts
                  </span>
                  {reflection.emotional_depth !== undefined && (
                    <span className="flex items-center">
                      <Activity size={12} className="mr-1" />
                      Depth: {Math.round(reflection.emotional_depth * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="text-quantum-400">
                {expandedId === reflection.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            
            {expandedId === reflection.id && (
              <div className="border-t border-quantum-500/20 p-3 bg-black/30">
                <p className="text-sm text-white/80 mb-3">{reflection.content}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {reflection.dominant_emotion && (
                    <div className="bg-black/20 p-2 rounded">
                      <span className="text-white/60">Dominant Energy:</span>
                      <span className="text-primary ml-1">{reflection.dominant_emotion}</span>
                    </div>
                  )}
                  
                  {reflection.chakras_activated && reflection.chakras_activated.length > 0 && (
                    <div className="bg-black/20 p-2 rounded">
                      <span className="text-white/60">Activated Chakras:</span>
                      <span className="text-primary ml-1">
                        {getChakraNames(reflection.chakras_activated).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Emotional insights for the reflection */}
                {reflection.emotional_depth !== undefined && (
                  <div className="mt-3 p-2 bg-black/20 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/60 text-xs">Emotional Depth</span>
                      <span className="text-primary text-xs">{Math.round(reflection.emotional_depth * 100)}%</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-1.5">
                      <div 
                        className="bg-quantum-500 h-1.5 rounded-full" 
                        style={{ width: `${reflection.emotional_depth * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReflectionHistoryInsights;
