
import { useState, useEffect } from 'react';
import { technicalDebtMonitor, ITechnicalDebtMetrics, ITechnicalDebtEntry } from '@/services/technical-debt/TechnicalDebtMonitor';

interface UseTechnicalDebtMonitorProps {
  enableAutoReporting?: boolean;
}

interface UseTechnicalDebtMonitorResult {
  metrics: ITechnicalDebtMetrics;
  entries: ITechnicalDebtEntry[];
  updateEntryStatus: (
    id: string, 
    status: 'identified' | 'investigating' | 'fixing' | 'resolved',
    resolution?: string
  ) => void;
  initialize: () => void;
}

/**
 * Hook to interact with the technical debt monitor
 * 
 * @param props Configuration props
 * @returns Technical debt monitor state and methods
 */
export function useTechnicalDebtMonitor(
  props: UseTechnicalDebtMonitorProps = {}
): UseTechnicalDebtMonitorResult {
  const { enableAutoReporting = true } = props;
  
  const [metrics, setMetrics] = useState<ITechnicalDebtMetrics>(technicalDebtMonitor.getMetrics());
  const [entries, setEntries] = useState<ITechnicalDebtEntry[]>(technicalDebtMonitor.getAllEntries());
  
  useEffect(() => {
    if (enableAutoReporting) {
      technicalDebtMonitor.initialize();
    }
    
    // Subscribe to metrics updates
    const unsubscribe = technicalDebtMonitor.subscribe((updatedMetrics) => {
      setMetrics(updatedMetrics);
      setEntries(technicalDebtMonitor.getAllEntries());
    });
    
    return unsubscribe;
  }, [enableAutoReporting]);
  
  const updateEntryStatus = (
    id: string, 
    status: 'identified' | 'investigating' | 'fixing' | 'resolved',
    resolution?: string
  ): void => {
    technicalDebtMonitor.updateEntryStatus(id, status, resolution);
  };
  
  const initialize = (): void => {
    technicalDebtMonitor.initialize();
  };
  
  return {
    metrics,
    entries,
    updateEntryStatus,
    initialize
  };
}

export default useTechnicalDebtMonitor;
