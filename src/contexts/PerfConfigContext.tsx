
import React, { createContext, useState, useEffect } from 'react';
import { markStart, markEnd } from '@/utils/webVitalsMonitor';

// Define the configuration options
export type PerformanceMonitoringLevel = 'high' | 'medium' | 'low' | 'debug';

export interface PerfConfigContextType {
  monitoringLevel: PerformanceMonitoringLevel;
  setMonitoringLevel: (level: PerformanceMonitoringLevel) => void;
  autoOptimize: boolean;
  setAutoOptimize: (enable: boolean) => void;
  trackInteractions: boolean;
  setTrackInteractions: (enable: boolean) => void;
  reportToServer: boolean;
  setReportToServer: (enable: boolean) => void;
  debugMode: boolean;
  setDebugMode: (enable: boolean) => void;
  lastReport: number;
  clearData: () => void;
}

// Create the context with a default value
const PerfConfigContext = createContext<PerfConfigContextType | null>(null);

// Provider component
export const PerfConfigProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [monitoringLevel, setMonitoringLevel] = useState<PerformanceMonitoringLevel>('medium');
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [trackInteractions, setTrackInteractions] = useState(true);
  const [reportToServer, setReportToServer] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [lastReport, setLastReport] = useState(0);
  
  // Load saved configuration from localStorage on component mount
  useEffect(() => {
    try {
      markStart('loadPerfConfig');
      const savedConfig = localStorage.getItem('perfConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setMonitoringLevel(config.monitoringLevel || 'medium');
        setAutoOptimize(config.autoOptimize || false);
        setTrackInteractions(config.trackInteractions !== undefined ? config.trackInteractions : true);
        setReportToServer(config.reportToServer || false);
        setDebugMode(config.debugMode || false);
      }
      markEnd('loadPerfConfig');
    } catch (error) {
      console.error('Error loading performance configuration:', error);
    }
  }, []);
  
  // Save configuration to localStorage when it changes
  useEffect(() => {
    try {
      const config = {
        monitoringLevel,
        autoOptimize,
        trackInteractions,
        reportToServer,
        debugMode
      };
      localStorage.setItem('perfConfig', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving performance configuration:', error);
    }
  }, [monitoringLevel, autoOptimize, trackInteractions, reportToServer, debugMode]);
  
  // Function to clear collected data
  const clearData = () => {
    setLastReport(Date.now());
    // Implement data clearing logic here
  };
  
  const value: PerfConfigContextType = {
    monitoringLevel,
    setMonitoringLevel,
    autoOptimize,
    setAutoOptimize,
    trackInteractions,
    setTrackInteractions,
    reportToServer,
    setReportToServer,
    debugMode,
    setDebugMode,
    lastReport,
    clearData
  };
  
  return (
    <PerfConfigContext.Provider value={value}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
