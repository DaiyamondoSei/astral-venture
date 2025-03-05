
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReflectionFilter from './ReflectionFilter';
import ReflectionList from './ReflectionList';
import { HistoricalReflection } from './types';

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

  // Count reflections by type
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
      
      <ReflectionList
        reflections={reflections}
        expandedId={expandedId}
        onToggleExpand={toggleExpand}
      />
    </div>
  );
};

export default ReflectionHistory;
