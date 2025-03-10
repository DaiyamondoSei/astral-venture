
/**
 * Technical Debt Monitor Service
 * 
 * Provides utilities to monitor, track, and report on technical debt in the application.
 * This helps prevent the accumulation of technical debt by providing visibility.
 */

import type { ComponentMetrics } from '@/services/ai/types';

export interface ITechnicalDebtEntry {
  id: string;
  type: 'type-error' | 'performance' | 'complexity' | 'pattern';
  component: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created: string;
  status: 'identified' | 'investigating' | 'fixing' | 'resolved';
  assignee?: string;
  resolution?: string;
}

export interface ITechnicalDebtMetrics {
  totalIssues: number;
  criticalIssues: number;
  resolvedIssues: number;
  typeErrors: number;
  performanceIssues: number;
  complexityIssues: number;
  patternIssues: number;
  topComponents: string[];
  lastUpdated: string;
}

class TechnicalDebtMonitor {
  private technicalDebtEntries: ITechnicalDebtEntry[] = [];
  private listeners: Array<(metrics: ITechnicalDebtMetrics) => void> = [];
  private initialized: boolean = false;
  
  /**
   * Initialize the technical debt monitor
   */
  initialize(): void {
    if (this.initialized) return;
    
    this.initialized = true;
    
    // Add event listeners for build errors
    window.addEventListener('error', this.handleRuntimeError);
    
    console.log('Technical Debt Monitor initialized');
    
    // In development, log a reminder about technical debt monitoring
    if (process.env.NODE_ENV === 'development') {
      console.info(
        '%cTechnical Debt Monitor Active', 
        'background: #2563eb; color: white; padding: 2px 4px; border-radius: 4px; font-weight: bold;',
        '- Monitor and report issues to prevent technical debt accumulation'
      );
    }
    
    this.notifyListeners();
  }
  
  /**
   * Handle runtime errors
   */
  private handleRuntimeError = (event: ErrorEvent): void => {
    if (!event.error) return;
    
    // Create technical debt entry for runtime errors
    this.addTechnicalDebtEntry({
      id: `runtime-${Date.now()}`,
      type: 'type-error',
      component: this.extractComponentFromStack(event.error.stack || ''),
      description: `Runtime error: ${event.error.message}`,
      priority: 'critical',
      created: new Date().toISOString(),
      status: 'identified'
    });
  };
  
  /**
   * Extract component name from error stack
   */
  private extractComponentFromStack(stack: string): string {
    // Try to extract component name from stack trace
    const componentMatch = stack.match(/\/components\/([^/]+)/);
    if (componentMatch && componentMatch[1]) {
      return componentMatch[1];
    }
    
    return 'unknown';
  }
  
  /**
   * Register a performance issue
   */
  registerPerformanceIssue(componentName: string, metrics: ComponentMetrics): void {
    if (!this.initialized) this.initialize();
    
    const isSlowRender = metrics.average_render_time > 16;
    const hasManyRenders = metrics.total_renders > 100;
    
    if (isSlowRender || hasManyRenders) {
      this.addTechnicalDebtEntry({
        id: `perf-${componentName}-${Date.now()}`,
        type: 'performance',
        component: componentName,
        description: isSlowRender
          ? `Slow renders (${metrics.average_render_time.toFixed(2)}ms average)`
          : `High render count (${metrics.total_renders} renders)`,
        priority: isSlowRender ? 'high' : 'medium',
        created: new Date().toISOString(),
        status: 'identified'
      });
    }
  }
  
  /**
   * Register a code complexity issue
   */
  registerComplexityIssue(
    componentName: string, 
    complexity: number, 
    linesOfCode: number
  ): void {
    if (!this.initialized) this.initialize();
    
    const isHighComplexity = complexity > 15;
    const isLargeComponent = linesOfCode > 300;
    
    if (isHighComplexity || isLargeComponent) {
      this.addTechnicalDebtEntry({
        id: `complex-${componentName}-${Date.now()}`,
        type: 'complexity',
        component: componentName,
        description: isHighComplexity
          ? `High cyclomatic complexity (${complexity})`
          : `Large component (${linesOfCode} lines)`,
        priority: isHighComplexity ? 'high' : 'medium',
        created: new Date().toISOString(),
        status: 'identified'
      });
    }
  }
  
  /**
   * Register a pattern issue
   */
  registerPatternIssue(
    componentName: string,
    patternType: string,
    description: string
  ): void {
    if (!this.initialized) this.initialize();
    
    this.addTechnicalDebtEntry({
      id: `pattern-${componentName}-${Date.now()}`,
      type: 'pattern',
      component: componentName,
      description: `Pattern issue: ${patternType} - ${description}`,
      priority: 'medium',
      created: new Date().toISOString(),
      status: 'identified'
    });
  }
  
  /**
   * Add a technical debt entry
   */
  private addTechnicalDebtEntry(entry: ITechnicalDebtEntry): void {
    // Check if a similar entry already exists
    const existingIndex = this.technicalDebtEntries.findIndex(
      e => e.component === entry.component && 
           e.type === entry.type && 
           e.description === entry.description &&
           e.status !== 'resolved'
    );
    
    if (existingIndex >= 0) {
      // Update existing entry
      this.technicalDebtEntries[existingIndex] = {
        ...this.technicalDebtEntries[existingIndex],
        priority: this.getHigherPriority(
          this.technicalDebtEntries[existingIndex].priority,
          entry.priority
        )
      };
    } else {
      // Add new entry
      this.technicalDebtEntries.push(entry);
    }
    
    this.notifyListeners();
  }
  
  /**
   * Get the higher priority between two priorities
   */
  private getHigherPriority(
    a: 'low' | 'medium' | 'high' | 'critical',
    b: 'low' | 'medium' | 'high' | 'critical'
  ): 'low' | 'medium' | 'high' | 'critical' {
    const priorities = { low: 1, medium: 2, high: 3, critical: 4 };
    return priorities[a] > priorities[b] ? a : b;
  }
  
  /**
   * Get technical debt metrics
   */
  getMetrics(): ITechnicalDebtMetrics {
    const totalIssues = this.technicalDebtEntries.length;
    const criticalIssues = this.technicalDebtEntries.filter(e => e.priority === 'critical').length;
    const resolvedIssues = this.technicalDebtEntries.filter(e => e.status === 'resolved').length;
    
    const typeErrors = this.technicalDebtEntries.filter(e => e.type === 'type-error').length;
    const performanceIssues = this.technicalDebtEntries.filter(e => e.type === 'performance').length;
    const complexityIssues = this.technicalDebtEntries.filter(e => e.type === 'complexity').length;
    const patternIssues = this.technicalDebtEntries.filter(e => e.type === 'pattern').length;
    
    // Get components with most issues
    const componentCounts = new Map<string, number>();
    this.technicalDebtEntries.forEach(entry => {
      const count = componentCounts.get(entry.component) || 0;
      componentCounts.set(entry.component, count + 1);
    });
    
    const topComponents = Array.from(componentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([component]) => component);
    
    return {
      totalIssues,
      criticalIssues,
      resolvedIssues,
      typeErrors,
      performanceIssues,
      complexityIssues,
      patternIssues,
      topComponents,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * Get all technical debt entries
   */
  getAllEntries(): ITechnicalDebtEntry[] {
    return [...this.technicalDebtEntries];
  }
  
  /**
   * Update the status of a technical debt entry
   */
  updateEntryStatus(
    id: string, 
    status: 'identified' | 'investigating' | 'fixing' | 'resolved',
    resolution?: string
  ): void {
    const entryIndex = this.technicalDebtEntries.findIndex(e => e.id === id);
    if (entryIndex >= 0) {
      this.technicalDebtEntries[entryIndex] = {
        ...this.technicalDebtEntries[entryIndex],
        status,
        resolution: status === 'resolved' ? (resolution || 'Issue resolved') : undefined
      };
      this.notifyListeners();
    }
  }
  
  /**
   * Subscribe to metrics updates
   */
  subscribe(listener: (metrics: ITechnicalDebtMetrics) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of metrics updates
   */
  private notifyListeners(): void {
    const metrics = this.getMetrics();
    this.listeners.forEach(listener => listener(metrics));
  }
}

// Create and export singleton instance
export const technicalDebtMonitor = new TechnicalDebtMonitor();

export default technicalDebtMonitor;
