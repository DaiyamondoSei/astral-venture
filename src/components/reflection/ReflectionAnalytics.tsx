
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchEmotionalJourney, 
  EnergyReflection 
} from '@/services/reflection';
import { getReflectionInsights } from '@/services/reflection/insightsGenerator';
import { getChakraNames, calculateChakraBalance } from '@/utils/emotion/chakraUtils';
import { Sparkles, TrendingUp, BarChart3, RefreshCw, Target, Heart } from 'lucide-react';

interface ReflectionAnalyticsProps {
  reflections?: EnergyReflection[];
  onRefresh?: () => void;
}

const ReflectionAnalytics: React.FC<ReflectionAnalyticsProps> = ({ 
  reflections: passedReflections,
  onRefresh 
}) => {
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState<any>(null);
  const [reflections, setReflections] = useState<EnergyReflection[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // If reflections were passed as props, use those
    if (passedReflections) {
      setReflections(passedReflections);
      // Fix: Use directly getReflectionInsights as it returns string[] not Promise<string>
      setInsights(getReflectionInsights(passedReflections));
      setLoading(false);
      return;
    }

    const loadJourneyData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const journey = await fetchEmotionalJourney(user.id);
        if (journey) {
          setJourneyData(journey);
          if (journey.recentReflections) {
            setReflections(journey.recentReflections);
            // Fix: Convert emotion data to strings and combine with reflection insights
            const emotionInsights = journey.dominantEmotions.map(emotion => 
              `Your practice shows strong ${emotion} energy`
            );
            setInsights([...emotionInsights, ...getReflectionInsights(journey.recentReflections)]);
          } else {
            setInsights([]); // No reflections available
          }
        }
      } catch (error) {
        console.error('Error loading reflection analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJourneyData();
  }, [user, passedReflections]);

  if (loading) {
    return (
      <div className="p-4 border border-quantum-500/20 rounded-lg bg-black/20 animate-pulse">
        <div className="h-5 w-1/3 bg-white/10 rounded mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded"></div>
          <div className="h-4 w-5/6 bg-white/10 rounded"></div>
          <div className="h-4 w-4/6 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  // If no journey data and no reflections, show empty state
  if (!journeyData && reflections.length === 0) {
    return (
      <div className="p-4 border border-quantum-500/20 rounded-lg bg-black/20">
        <h3 className="text-white/80 text-sm mb-2">Reflection Analytics</h3>
        <p className="text-white/50 text-xs">
          Start adding reflections to see analytics and insights about your journey.
        </p>
      </div>
    );
  }

  // Get all activated chakras from reflections
  const allChakras = reflections.flatMap(r => r.chakras_activated || []);
  const uniqueChakras = [...new Set(allChakras)];
  const chakraBalance = calculateChakraBalance(uniqueChakras);
  const activatedChakraNames = getChakraNames(uniqueChakras);

  return (
    <div className="p-4 border border-quantum-500/20 rounded-lg bg-black/20">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white/80 text-sm font-medium">Reflection Analytics</h3>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-quantum-400 hover:text-quantum-300 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>
      
      {insights.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-xs text-quantum-300 mb-2">
            <Sparkles size={12} className="mr-1" />
            <span>Personalized Insights</span>
          </div>
          <ul className="space-y-1">
            {insights.slice(0, 3).map((insight, index) => (
              <li key={index} className="text-white/70 text-xs flex items-start">
                <span className="text-quantum-400 mr-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-black/30 p-2 rounded">
          <div className="text-white/50 mb-1 flex items-center">
            <BarChart3 size={10} className="mr-1 text-quantum-400" />
            Reflections
          </div>
          <div className="text-white/90 font-medium">
            {reflections.length}
          </div>
        </div>
        
        <div className="bg-black/30 p-2 rounded">
          <div className="text-white/50 mb-1 flex items-center">
            <TrendingUp size={10} className="mr-1 text-quantum-400" />
            Points Earned
          </div>
          <div className="text-white/90 font-medium">
            {reflections.reduce((sum, r) => sum + (r.points_earned || 0), 0)}
          </div>
        </div>
      </div>
      
      {uniqueChakras.length > 0 && (
        <div className="bg-black/30 p-2 rounded mb-3">
          <div className="flex justify-between">
            <div className="text-white/50 mb-1 text-xs flex items-center">
              <Target size={10} className="mr-1 text-quantum-400" />
              Chakra Balance
            </div>
            <div className="text-white/90 text-xs">{Math.round(chakraBalance * 100)}%</div>
          </div>
          
          <div className="w-full bg-black/30 rounded-full h-1.5 mb-2">
            <div 
              className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 h-1.5 rounded-full" 
              style={{ width: `${chakraBalance * 100}%` }}
            ></div>
          </div>
          
          <div className="text-white/60 text-xs">
            Activated: {activatedChakraNames.join(', ')}
          </div>
        </div>
      )}
      
      {reflections.length > 0 && reflections[0].emotional_depth !== undefined && (
        <div className="bg-black/30 p-2 rounded">
          <div className="flex justify-between">
            <div className="text-white/50 mb-1 text-xs flex items-center">
              <Heart size={10} className="mr-1 text-quantum-400" />
              Emotional Depth
            </div>
            <div className="text-white/90 text-xs">
              {Math.round((reflections[0].emotional_depth || 0) * 100)}%
            </div>
          </div>
          
          <div className="w-full bg-black/30 rounded-full h-1.5">
            <div 
              className="bg-quantum-500 h-1.5 rounded-full" 
              style={{ width: `${(reflections[0].emotional_depth || 0) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReflectionAnalytics;
