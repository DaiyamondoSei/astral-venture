
import { useEffect, useState } from 'react';
import { useConsciousness } from '@/contexts/ConsciousnessContext';
import type { DreamRecord, ChakraType } from '@/types/consciousness';

export function useConsciousnessData() {
  const context = useConsciousness();
  const [recentDreams, setRecentDreams] = useState<DreamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!context.loading) {
      setRecentDreams(context.dreams.slice(0, 5));
      setIsLoading(false);
    }
  }, [context.loading, context.dreams]);

  const getActivationLevel = (chakraType: ChakraType): number => {
    if (!context.chakraSystem) return 0;
    return context.chakraSystem.chakras[chakraType]?.activation || 0;
  };

  const getMostActivatedChakra = (): ChakraType | null => {
    return context.chakraSystem?.dominantChakra || null;
  };

  const getConsciousnessLevel = (): string => {
    if (!context.metrics) return 'awakening';
    return context.metrics.level;
  };

  const getAwarenessScore = (): number => {
    if (!context.metrics) return 0;
    return context.metrics.awarenessScore;
  };

  return {
    ...context,
    recentDreams,
    isLoading,
    getActivationLevel,
    getMostActivatedChakra,
    getConsciousnessLevel,
    getAwarenessScore
  };
}
