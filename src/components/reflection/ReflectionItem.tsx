
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Star, Lightbulb, ChevronDown, ChevronUp, Heart, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import GlowEffect from '@/components/GlowEffect';
import { chakraColors } from '@/utils/emotion/mappings';
import { HistoricalReflection } from './types';

interface ReflectionItemProps {
  reflection: HistoricalReflection;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ReflectionItem: React.FC<ReflectionItemProps> = ({ 
  reflection, 
  isExpanded, 
  onToggleExpand 
}) => {
  // Determine if this is a philosophical or energy reflection
  const isPhilosophical = reflection.hasOwnProperty('prompt') || reflection.type === 'consciousness';
  const glowColor = isPhilosophical ? 'rgba(138, 43, 226, 0.3)' : 'rgba(64, 125, 247, 0.3)';
  const typeLabel = isPhilosophical ? 'Consciousness' : 'Energy';
  
  // Chakra indicators
  const chakrasActivated = reflection.chakras_activated || [];
  
  return (
    <GlowEffect 
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
          onClick={onToggleExpand}
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
};

export default ReflectionItem;
