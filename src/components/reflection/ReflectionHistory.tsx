
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Star, Lightbulb, ChevronDown, ChevronUp, Heart, Droplets } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import GlowEffect from '@/components/GlowEffect';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chakraColors } from '@/utils/emotion/mappings';

interface HistoricalReflection {
  id: string | number;
  content: string;
  points_earned?: number;
  created_at: string;
  insights?: string[];
  prompt?: string;
  timestamp?: string;
  type?: string;
  dominant_emotion?: string;
  chakras_activated?: number[];
  emotional_depth?: number;
}

const ReflectionHistory: React.FC = () => {
  const [reflections, setReflections] = useState<HistoricalReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
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
        
        // Apply filter if selected
        if (filterType) {
          allReflections = allReflections.filter(r => r.type === filterType);
        }
        
        setReflections(allReflections);
      } catch (error) {
        console.error('Error fetching reflections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReflections();
  }, [user, filterType]);

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

  // Count reflections by type
  const energyCount = reflections.filter(r => r.type === 'energy' || !r.type).length;
  const philosophicalCount = reflections.filter(r => r.type === 'consciousness').length;

  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg">Your Reflection Journey</h3>
        
        <div className="flex space-x-2">
          <Badge 
            variant={filterType === null ? "default" : "outline"} 
            className="cursor-pointer hover:bg-primary/20"
            onClick={() => setFilterType(null)}
          >
            All ({reflections.length})
          </Badge>
          <Badge 
            variant={filterType === 'energy' ? "default" : "outline"} 
            className="cursor-pointer hover:bg-primary/20"
            onClick={() => setFilterType('energy')}
          >
            Energy ({energyCount})
          </Badge>
          <Badge 
            variant={filterType === 'consciousness' ? "default" : "outline"} 
            className="cursor-pointer hover:bg-primary/20"
            onClick={() => setFilterType('consciousness')}
          >
            Consciousness ({philosophicalCount})
          </Badge>
        </div>
      </div>
      
      <p className="text-white/70 text-sm mb-6">
        Review your past reflections to trace the evolution of your consciousness over time.
      </p>
      
      <div className="space-y-4">
        {reflections.map((reflection) => {
          // Determine if this is a philosophical or energy reflection
          const isPhilosophical = reflection.hasOwnProperty('prompt') || reflection.type === 'consciousness';
          const glowColor = isPhilosophical ? 'rgba(138, 43, 226, 0.3)' : 'rgba(64, 125, 247, 0.3)';
          const typeLabel = isPhilosophical ? 'Consciousness' : 'Energy';
          const isExpanded = expandedId === reflection.id;
          
          // Chakra indicators
          const chakrasActivated = reflection.chakras_activated || [];
          
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
                    
                    {reflection.dominant_emotion && (
                      <Badge variant="outline" className="ml-2 bg-white/5 text-xs">
                        {reflection.dominant_emotion}
                      </Badge>
                    )}
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
              
              <p className={`text-white/80 mb-3 ${isExpanded ? '' : 'line-clamp-3'}`}>
                {reflection.content}
              </p>
              
              {isExpanded && (
                <div className="mt-4 mb-3 space-y-3">
                  {/* Chakra visualization for this reflection */}
                  {chakrasActivated.length > 0 && (
                    <div className="bg-black/30 p-3 rounded-lg">
                      <h4 className="text-xs text-white/70 mb-2 flex items-center">
                        <Droplets size={12} className="mr-1 text-quantum-400" />
                        Activated Energy Centers
                      </h4>
                      <div className="flex justify-center space-x-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((chakraIndex) => {
                          const isActive = chakrasActivated.includes(chakraIndex);
                          return (
                            <Avatar key={chakraIndex} className={`h-5 w-5 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                              <AvatarFallback 
                                style={{ 
                                  backgroundColor: isActive ? chakraColors[chakraIndex] : '#333',
                                  fontSize: '8px',
                                  color: '#fff'
                                }}
                              >
                                {chakraIndex + 1}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Emotional insights */}
                  {reflection.insights && reflection.insights.length > 0 && (
                    <div className="bg-black/30 p-3 rounded-lg">
                      <h4 className="text-xs text-white/70 mb-2 flex items-center">
                        <Heart size={12} className="mr-1 text-quantum-400" />
                        Emotional Insights
                      </h4>
                      <ul className="text-xs text-white/60 space-y-1">
                        {reflection.insights.map((insight, i) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <Star size={14} className="text-quantum-400 mr-1" />
                  <span className="text-white/60">
                    {reflection.points_earned || 0} points earned
                  </span>
                  
                  {reflection.emotional_depth !== undefined && (
                    <span className="ml-3 text-xs text-white/40">
                      Depth: {Math.round(reflection.emotional_depth * 100)}%
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => toggleExpand(reflection.id)}
                  className="text-quantum-400 text-xs flex items-center hover:underline"
                >
                  {isExpanded ? (
                    <>
                      <span>Less Details</span>
                      <ChevronUp size={14} className="ml-1" />
                    </>
                  ) : (
                    <>
                      <span>More Details</span>
                      <ChevronDown size={14} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </GlowEffect>
          );
        })}
      </div>
    </div>
  );
};

export default ReflectionHistory;
