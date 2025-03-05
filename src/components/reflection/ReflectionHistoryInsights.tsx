import React, { useEffect, useState } from 'react';
import { getChakraNames, getChakraColors, calculateChakraBalance } from '@/utils/emotion/chakraUtils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { aiService } from '@/services/ai/aiService';
import { Sparkles, TrendingUp } from 'lucide-react';

interface ReflectionHistoryInsightsProps {
  data?: {
    activatedChakras?: number[];
    dominantEmotions?: string[];
    emotionalAnalysis?: any;
  };
  onOpenAiAssistant?: (reflectionId?: string, reflectionContent?: string) => void;
}

const ReflectionHistoryInsights: React.FC<ReflectionHistoryInsightsProps> = ({ 
  data = {},
  onOpenAiAssistant
}) => {
  const { 
    activatedChakras = [], 
    dominantEmotions = [],
    emotionalAnalysis = {}
  } = data;
  
  const [personalizedInsights, setPersonalizedInsights] = useState<string[]>([]);
  const [practiceRecommendations, setPracticeRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Get chakra names from indices
  const chakraNames = getChakraNames(activatedChakras);
  const chakraColors = getChakraColors(activatedChakras);
  
  // Calculate chakra balance
  const balancePercentage = calculateChakraBalance(activatedChakras);
  const balanceText = 
    balancePercentage >= 0.8 ? "Excellent" :
    balancePercentage >= 0.6 ? "Good" :
    balancePercentage >= 0.4 ? "Moderate" :
    balancePercentage >= 0.2 ? "Developing" : "Beginning";
  
  // Fetch personalized recommendations and insights
  useEffect(() => {
    const fetchPersonalizedContent = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get practice recommendations for this user
        const recommendations = await aiService.getPersonalizedRecommendations(user.id);
        setPracticeRecommendations(recommendations.slice(0, 3));
        
        // Generate insights based on dominant emotions and chakras
        const aiInsights = [];
        
        // Add chakra-specific insight
        if (chakraNames.length > 0) {
          const dominantChakra = chakraNames[0];
          aiInsights.push(`Your ${dominantChakra} chakra is currently the most active, suggesting a focus on ${getChakraFocus(dominantChakra)}.`);
        }
        
        // Add emotion-specific insights
        if (dominantEmotions.length > 0) {
          const topEmotion = dominantEmotions[0];
          aiInsights.push(`Your reflections show a strong ${topEmotion.toLowerCase()} energy signature.`);
        }
        
        // Add pattern insight
        if (chakraNames.length >= 2) {
          aiInsights.push(`The connection between your ${chakraNames[0]} and ${chakraNames[1]} chakras indicates ${getChakraConnectionInsight(chakraNames[0], chakraNames[1])}.`);
        }
        
        setPersonalizedInsights(aiInsights);
      } catch (error) {
        console.error('Error fetching personalized content:', error);
        setPersonalizedInsights(['Continue your reflection practice to deepen your insights.']);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonalizedContent();
  }, [user, chakraNames, dominantEmotions]);
  
  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="text-white/70 text-sm mb-2">
        Your reflections have revealed these insights:
      </div>
      
      {chakraNames.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80">Activated Energy Centers</h4>
          <div className="flex flex-wrap gap-2">
            {chakraNames.map((name, i) => (
              <span 
                key={i} 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${chakraColors[i]}25`, 
                  color: chakraColors[i],
                  border: `1px solid ${chakraColors[i]}50`
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {dominantEmotions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80">Dominant Energies</h4>
          <div className="flex flex-wrap gap-2">
            {dominantEmotions.map((emotion, i) => (
              <span 
                key={i} 
                className="px-2 py-1 rounded-full text-xs font-medium bg-quantum-500/10 text-quantum-300 border border-quantum-500/20"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80">Chakra Balance</h4>
        <div className="w-full bg-black/30 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full"
            style={{ width: `${balancePercentage * 100}%` }}
          />
        </div>
        <div className="text-xs text-white/60 flex justify-between">
          <span>Balance: {balanceText}</span>
          <span>{Math.round(balancePercentage * 100)}%</span>
        </div>
      </div>
      
      {personalizedInsights.length > 0 && (
        <div className="pt-2">
          <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center">
            <Sparkles size={14} className="mr-1 text-quantum-400" />
            Personalized Insights
          </h4>
          <div className="space-y-2">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-white/10 rounded w-full"></div>
                <div className="h-3 bg-white/10 rounded w-5/6"></div>
              </div>
            ) : (
              personalizedInsights.map((insight, i) => (
                <div key={i} className="text-sm text-white/70">
                  {insight}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {practiceRecommendations.length > 0 && (
        <div className="pt-2">
          <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center">
            <TrendingUp size={14} className="mr-1 text-quantum-400" />
            Recommended Practices
          </h4>
          <div className="space-y-1">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-white/10 rounded w-full"></div>
                <div className="h-3 bg-white/10 rounded w-5/6"></div>
              </div>
            ) : (
              practiceRecommendations.map((practice, i) => (
                <div key={i} className="text-sm text-white/70 flex items-center">
                  <span className="text-quantum-400 mr-1">•</span>
                  {practice}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {onOpenAiAssistant && (
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center gap-1 border-quantum-400/30 text-quantum-400 hover:bg-quantum-500/10"
            onClick={() => onOpenAiAssistant()}
          >
            <Sparkles size={14} />
            Ask Quantum Guide for Deeper Insights
          </Button>
        </div>
      )}
      
      {Object.keys(emotionalAnalysis).length > 0 && (
        <div className="pt-2">
          <h4 className="text-sm font-medium text-white/80 mb-2">Emotional Intelligence</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(emotionalAnalysis).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-black/20 p-2 rounded">
                <div className="text-xs text-white/60 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm font-medium">
                  {typeof value === 'number' ? `${Math.round(value * 100)}%` : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function getChakraFocus(chakra: string): string {
  const focuses = {
    'Root': 'stability and security',
    'Sacral': 'creativity and emotions',
    'Solar Plexus': 'personal power and confidence',
    'Heart': 'love and compassion',
    'Throat': 'communication and expression',
    'Third Eye': 'intuition and wisdom',
    'Crown': 'spiritual connection and higher consciousness'
  };
  
  return focuses[chakra as keyof typeof focuses] || 'energy balance';
}

function getChakraConnectionInsight(chakra1: string, chakra2: string): string {
  // Specific combinations
  if ((chakra1 === 'Heart' && chakra2 === 'Throat') || 
      (chakra1 === 'Throat' && chakra2 === 'Heart')) {
    return 'a deepening connection between love and authentic expression';
  }
  
  if ((chakra1 === 'Third Eye' && chakra2 === 'Crown') || 
      (chakra1 === 'Crown' && chakra2 === 'Third Eye')) {
    return 'an awakening of higher spiritual awareness and intuition';
  }
  
  if ((chakra1 === 'Root' && chakra2 === 'Solar Plexus') || 
      (chakra1 === 'Solar Plexus' && chakra2 === 'Root')) {
    return 'a grounding of your personal power';
  }
  
  // Generic response
  return 'a meaningful pattern in your energy system';
}

export default ReflectionHistoryInsights;
