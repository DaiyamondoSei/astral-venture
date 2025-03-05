import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchEmotionalJourney, getReflectionInsights, EnergyReflection } from '@/services/reflectionService';
import { Sparkles, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';

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
            setInsights(getReflectionInsights(journey.recentReflections));
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
            {insights.map((insight, index) => (
              <li key={index} className="text-white/70 text-xs flex items-start">
                <span className="text-quantum-400 mr-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {journeyData && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-black/30 p-2 rounded">
            <div className="text-white/50 mb-1 flex items-center">
              <BarChart3 size={10} className="mr-1 text-quantum-400" />
              Reflections
            </div>
            <div className="text-white/90 font-medium">
              {journeyData.recentReflectionCount || 0}
            </div>
          </div>
          
          <div className="bg-black/30 p-2 rounded">
            <div className="text-white/50 mb-1 flex items-center">
              <TrendingUp size={10} className="mr-1 text-quantum-400" />
              Points Earned
            </div>
            <div className="text-white/90 font-medium">
              {journeyData.totalPointsEarned || 0}
            </div>
          </div>
          
          <div className="bg-black/30 p-2 rounded">
            <div className="text-white/50 mb-1">Emotional Depth</div>
            <div className="text-white/90 font-medium">
              {Math.round((journeyData.averageEmotionalDepth || 0) * 100)}%
            </div>
          </div>
          
          <div className="bg-black/30 p-2 rounded">
            <div className="text-white/50 mb-1">Activated Chakras</div>
            <div className="text-white/90 font-medium">
              {journeyData.activatedChakras?.length || 0}/7
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReflectionAnalytics;
