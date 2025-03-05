
import React, { useState, useEffect } from 'react';
import { HistoricalReflection } from '@/components/reflection/types';
import ReflectionItem from './ReflectionItem';
import ReflectionFilter from './ReflectionFilter';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserReflections } from '@/services/reflectionService';

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
      if (newFilter === 'heart' && reflection.chakras_activated?.includes(3)) {
        return true;
      }
      if (newFilter === 'third-eye' && reflection.chakras_activated?.includes(5)) {
        return true;
      }
      return false;
    });
    
    setFilteredReflections(filtered);
  };

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
      <ReflectionFilter activeFilter={filter} onFilterChange={handleFilterChange} />
      
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
