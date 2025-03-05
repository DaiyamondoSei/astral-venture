
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReflectionFilter from './ReflectionFilter';
import ReflectionHistoryInsights from './ReflectionHistoryInsights';
import { fetchEmotionalJourney } from '@/services/reflection/emotionalJourney';
import { EnergyReflection } from '@/services/reflection/types';

const ReflectionHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [journeyData, setJourneyData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJourneyData = async () => {
      setLoading(true);
      
      try {
        if (user) {
          const journey = await fetchEmotionalJourney(user.id);
          if (journey) {
            setJourneyData(journey);
          }
        }
        
        // Fall back to localStorage data if needed
        if (!journeyData) {
          // Combine reflections from different sources
          let allReflections: any[] = [];
          
          // Get energy reflections from localStorage
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
          
          setJourneyData({
            recentReflections: allReflections,
            recentReflectionCount: allReflections.length
          });
        }
      } catch (error) {
        console.error('Error fetching reflections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJourneyData();
  }, [user, filterType]);

  // Count reflections by type
  const reflections = journeyData?.recentReflections || [];
  const energyCount = reflections.filter(r => r.type === 'energy' || !r.type).length;
  const philosophicalCount = reflections.filter(r => r.type === 'consciousness').length;

  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg">Your Reflection Journey</h3>
        
        <ReflectionFilter
          total={reflections.length}
          energyCount={energyCount}
          philosophicalCount={philosophicalCount}
          activeFilter={filterType}
          onFilterChange={setFilterType}
        />
      </div>
      
      <p className="text-white/70 text-sm mb-6">
        Review your past reflections to trace the evolution of your consciousness over time.
      </p>
      
      <ReflectionHistoryInsights data={journeyData} />
    </div>
  );
};

export default ReflectionHistory;
