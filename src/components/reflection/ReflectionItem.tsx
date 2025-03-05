import React from 'react';
import { HistoricalReflection } from '@/components/reflection/types';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';
import { normalizeChakraData } from '@/utils/emotion/chakraTypes';

interface ReflectionItemProps {
  reflection: HistoricalReflection;
  showDetails?: boolean;
  onAskAI?: (reflectionId?: string | number, content?: string) => void;
}

const ReflectionItem: React.FC<ReflectionItemProps> = ({ 
  reflection, 
  showDetails: initialShowDetails = false,
  onAskAI
}) => {
  const [showDetails, setShowDetails] = React.useState(initialShowDetails);
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'unknown time ago';
    }
  };
  
  const getChakraNames = (chakraIndices?: number[]) => {
    if (!chakraIndices || chakraIndices.length === 0) return 'None';
    
    return chakraIndices
      .map(index => CHAKRA_NAMES[index])
      .join(', ');
  };

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-black/30 hover:bg-black/40 transition-colors">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs text-white/50">{formatDate(reflection.created_at)}</div>
            <div className="text-sm text-white/80 line-clamp-2">{reflection.content}</div>
          </div>
          
          <button 
            onClick={toggleDetails}
            className="text-white/60 hover:text-white/90 transition-colors"
          >
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-4 space-y-3 pt-3 border-t border-white/10">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Points Earned:</span>
              <span className="text-quantum-400">{reflection.points_earned || 0}</span>
            </div>
            
            {reflection.dominant_emotion && (
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Dominant Emotion:</span>
                <span className="text-white/80">{reflection.dominant_emotion}</span>
              </div>
            )}
            
            {reflection.chakras_activated && (
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Activated Chakras:</span>
                <span className="text-white/80">{getChakraNames(reflection.chakras_activated)}</span>
              </div>
            )}
            
            {reflection.insights && reflection.insights.length > 0 && (
              <div className="text-xs mt-2">
                <div className="text-white/60 mb-1">Insights:</div>
                <ul className="space-y-1">
                  {reflection.insights.map((insight, index) => (
                    <li key={index} className="text-white/80 pl-3 border-l border-quantum-400/30">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {onAskAI && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs border-white/10 bg-white/5 hover:bg-quantum-400/20 text-white/80 hover:text-white"
                onClick={() => onAskAI(reflection.id, reflection.content)}
              >
                <Sparkles size={12} className="mr-1 text-quantum-400" />
                Ask AI Guide about this reflection
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflectionItem;
