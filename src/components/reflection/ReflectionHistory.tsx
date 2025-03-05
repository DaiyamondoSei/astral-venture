import React, { useState, useEffect } from 'react';
import { HistoricalReflection } from '@/components/reflection/types';
import ReflectionItem from './ReflectionItem';
import ReflectionFilter from './ReflectionFilter';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserReflections } from '@/services/reflectionService';
import { isChakraActivated } from '@/utils/emotion/chakraTypes';

interface ReflectionHistoryProps {
  onOpenAiAssistant?: (reflectionId?: string, reflectionContent?: string) => void;
}

const ReflectionHistory: React.FC<ReflectionHistoryProps> = ({ onOpenAiAssistant }) => {
  const [reflections, setReflections] = useState<HistoricalReflection[]>([]);
  const [filteredReflections, setFilteredReflections] = useState<HistoricalReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const loadReflections = async () => {
      if (!user) {
        setReflections([]);
        setLoading(false);
        return;
      }
      
      try {
        const userReflections = await fetchUserReflections(user.id);
        setReflections(userReflections);
        setFilteredReflections(userReflections);
      } catch (error) {
        console.error('Error loading reflections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReflections();
  }, [user]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    
    if (newFilter === 'all') {
      setFilteredReflections(reflections);
      return;
    }
    
    const filtered = reflections.filter(reflection => {
      if (newFilter === 'high-energy' && (reflection.emotional_depth || 0) > 0.7) {
        return true;
      }
      if (newFilter === 'heart' && isChakraActivated(reflection.chakras_activated, 3)) {
        return true;
      }
      if (newFilter === 'third-eye' && isChakraActivated(reflection.chakras_activated, 5)) {
        return true;
      }
      return false;
    });
    
    setFilteredReflections(filtered);
  };

  // Calculate counts for filter categories
  const totalCount = reflections.length;
  const highEnergyCount = reflections.filter(r => (r.emotional_depth || 0) > 0.7).length;
  const philosophicalCount = reflections.filter(r => 
    r.dominant_emotion === 'philosophical' || 
    r.type === 'consciousness'
  ).length;

  if (loading) {
    return <div className="animate-pulse p-4">Loading reflection history...</div>;
  }

  if (reflections.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>You haven't submitted any reflections yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ReflectionFilter 
        activeFilter={filter} 
        onFilterChange={handleFilterChange}
        total={totalCount}
        energyCount={highEnergyCount}
        philosophicalCount={philosophicalCount}
      />
      
      <div className="space-y-4">
        {filteredReflections.map(reflection => (
          <ReflectionItem 
            key={reflection.id} 
            reflection={reflection} 
            onAskAI={onOpenAiAssistant}
          />
        ))}
      </div>
    </div>
  );
};

export default ReflectionHistory;
