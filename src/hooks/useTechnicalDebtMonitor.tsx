
import { useState, useEffect, useCallback } from 'react';
import { 
  technicalDebtMonitor, 
  TechnicalDebtIssue, 
  TechnicalDebtReport, 
  TechnicalDebtType, 
  TechnicalDebtSeverity 
} from '@/services/technical-debt/TechnicalDebtMonitor';

interface UseTechnicalDebtMonitorProps {
  autoScan?: boolean;
  scanInterval?: number;
}

interface UseTechnicalDebtMonitorReturn {
  issues: TechnicalDebtIssue[];
  report: TechnicalDebtReport | null;
  generateReport: () => TechnicalDebtReport;
  getIssuesByType: (type: TechnicalDebtType) => TechnicalDebtIssue[];
  getIssuesBySeverity: (severity: TechnicalDebtSeverity) => TechnicalDebtIssue[];
  addIssue: (issue: Omit<TechnicalDebtIssue, 'detectedAt'>) => void;
  clearIssues: () => void;
  scanForIssues: () => void;
}

/**
 * Hook for using the technical debt monitor
 * 
 * @param props Hook props
 * @returns Hook return object
 */
export function useTechnicalDebtMonitor({
  autoScan = false,
  scanInterval = 60000 // 1 minute
}: UseTechnicalDebtMonitorProps = {}): UseTechnicalDebtMonitorReturn {
  const [issues, setIssues] = useState<TechnicalDebtIssue[]>([]);
  const [report, setReport] = useState<TechnicalDebtReport | null>(null);

  // Update issues from the monitor
  const updateIssues = useCallback(() => {
    setIssues(technicalDebtMonitor.getIssues());
  }, []);

  // Generate a technical debt report
  const generateReport = useCallback(() => {
    const newReport = technicalDebtMonitor.generateReport();
    setReport(newReport);
    return newReport;
  }, []);

  // Get issues by type
  const getIssuesByType = useCallback((type: TechnicalDebtType) => {
    return technicalDebtMonitor.getIssuesByType(type);
  }, []);

  // Get issues by severity
  const getIssuesBySeverity = useCallback((severity: TechnicalDebtSeverity) => {
    return technicalDebtMonitor.getIssuesBySeverity(severity);
  }, []);

  // Add an issue
  const addIssue = useCallback((issue: Omit<TechnicalDebtIssue, 'detectedAt'>) => {
    technicalDebtMonitor.addIssue(issue);
    updateIssues();
  }, [updateIssues]);

  // Clear issues
  const clearIssues = useCallback(() => {
    technicalDebtMonitor.clearIssues();
    updateIssues();
  }, [updateIssues]);

  // Scan for issues in the application
  const scanForIssues = useCallback(() => {
    // Get performance metrics from the performance monitor
    // (This would be expanded in a real implementation)
    updateIssues();
  }, [updateIssues]);

  // Run auto-scan if enabled
  useEffect(() => {
    if (!autoScan) return;

    // Initial scan
    scanForIssues();

    // Set up interval for regular scanning
    const intervalId = setInterval(scanForIssues, scanInterval);

    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [autoScan, scanInterval, scanForIssues]);

  return {
    issues,
    report,
    generateReport,
    getIssuesByType,
    getIssuesBySeverity,
    addIssue,
    clearIssues,
    scanForIssues
  };
}

export default useTechnicalDebtMonitor;
