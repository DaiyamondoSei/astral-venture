
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MessageSquareText, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { normalizeChakraData } from '@/utils/emotion/chakraTypes';

interface ReflectionItemProps {
  reflection: {
    id: string;
    content: string;
    created_at: string;
    dominant_emotion?: string;
    chakras_activated?: any;
    emotional_depth?: number;
  };
  onOpenAiAssistant: (reflectionId: string, content: string) => void;
}

const ReflectionItem: React.FC<ReflectionItemProps> = ({ reflection, onOpenAiAssistant }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const normalizedChakras = normalizeChakraData(reflection.chakras_activated);
  
  return (
    <Card className="glass-card p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center text-xs text-white/60">
          <CalendarDays size={12} className="mr-1" />
          {formatDistanceToNow(new Date(reflection.created_at), { addSuffix: true })}
        </div>
        
        {reflection.dominant_emotion && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-quantum-500/20 border border-quantum-500/30 text-quantum-300">
            {reflection.dominant_emotion}
          </span>
        )}
      </div>
      
      <div className="mb-3">
        <p className={`text-white/80 ${expanded ? '' : 'line-clamp-3'}`}>
          {reflection.content}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto text-xs text-white/60 hover:text-white hover:bg-transparent"
          onClick={toggleExpand}
        >
          <MessageSquareText size={14} className="mr-1" />
          {expanded ? 'Show Less' : 'Read More'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs border-quantum-400/30 text-quantum-400 hover:bg-quantum-500/10"
          onClick={() => onOpenAiAssistant(reflection.id, reflection.content)}
        >
          <Sparkles size={12} className="mr-1" />
          Get Insights
        </Button>
      </div>
      
      {normalizedChakras && normalizedChakras.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="text-xs text-white/60 mb-1">Activated Chakras:</div>
          <div className="flex space-x-1">
            {normalizedChakras.map((chakra, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: getChakraColor(chakra),
                  boxShadow: `0 0 4px ${getChakraColor(chakra)}`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// Helper function to get chakra colors
function getChakraColor(chakraIndex: number): string {
  const colors = [
    '#FF0000', // Root - Red
    '#FF7F00', // Sacral - Orange
    '#FFFF00', // Solar Plexus - Yellow
    '#00FF00', // Heart - Green
    '#00FFFF', // Throat - Blue
    '#0000FF', // Third Eye - Indigo
    '#8B00FF'  // Crown - Violet
  ];
  
  return colors[chakraIndex] || '#FFFFFF';
}

export default ReflectionItem;
