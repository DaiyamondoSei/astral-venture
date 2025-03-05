
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserReflections, EnergyReflection } from '@/services/reflection';
import ReflectionList from './ReflectionList';
import ReflectionHistoryInsights from './ReflectionHistoryInsights';
import ReflectionHistoryChart from './ReflectionHistoryChart';
import { getReflectionInsights } from '@/services/reflection/insightsGenerator';
import { analyzeChakraActivation } from '@/utils/emotion';

const ReflectionHistory = () => {
  const [reflections, setReflections] = useState<EnergyReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadReflections = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const userReflections = await fetchUserReflections(user.id);
        setReflections(userReflections);
        
        // Generate insights from reflections
        const reflectionInsights = getReflectionInsights(userReflections);
        setInsights(reflectionInsights);
        
        // Get activated chakras from reflections
        const dominantTheme = typeof window !== 'undefined' ? localStorage.getItem('dominantDreamTheme') : null;
        const chakraAnalysis = analyzeChakraActivation(userReflections, dominantTheme);
        setActivatedChakras(chakraAnalysis.chakras);
      } catch (error) {
        console.error('Error loading reflections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReflections();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-white/5 rounded-lg"></div>
        <div className="h-20 bg-white/5 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-16 bg-white/5 rounded-lg"></div>
          <div className="h-16 bg-white/5 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="glass-card p-4">
        <h3 className="font-display text-lg mb-2">Reflection History</h3>
        <p className="text-white/70 text-sm">
          You haven't recorded any reflections yet. Start your journey by adding your first reflection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ReflectionHistoryChart reflections={reflections} />
      
      <ReflectionHistoryInsights 
        insights={insights} 
        activatedChakras={activatedChakras}
      />
      
      <ReflectionList reflections={reflections} />
    </div>
  );
};

export default ReflectionHistory;
