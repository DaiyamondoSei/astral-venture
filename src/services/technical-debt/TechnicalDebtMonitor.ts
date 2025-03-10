
import { performanceMonitor, IComponentMetrics } from '@/utils/performance/performanceMonitor';

/**
 * Types of technical debt
 */
export enum TechnicalDebtType {
  PERFORMANCE = 'performance',
  TYPE_SAFETY = 'type_safety',
  ERROR_HANDLING = 'error_handling',
  CODE_ORGANIZATION = 'code_organization',
  COMPONENT_COMPLEXITY = 'component_complexity',
  DEPENDENCY_MANAGEMENT = 'dependency_management',
  NAMING_CONSISTENCY = 'naming_consistency'
}

/**
 * Severity of technical debt
 */
export enum TechnicalDebtSeverity {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Technical debt issue
 */
export interface TechnicalDebtIssue {
  type: TechnicalDebtType;
  severity: TechnicalDebtSeverity;
  component?: string;
  file?: string;
  description: string;
  suggestedFix?: string;
  detectedAt: Date;
}

/**
 * Technical debt report
 */
export interface TechnicalDebtReport {
  issues: TechnicalDebtIssue[];
  generatedAt: Date;
  totalIssuesCount: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  summary: string;
}

/**
 * Technical Debt Monitor class
 * Monitors and reports technical debt in the application
 */
export class TechnicalDebtMonitor {
  private issues: TechnicalDebtIssue[] = [];
  private performanceThresholds = {
    render: {
      high: 50, // ms
      medium: 20 // ms
    },
    size: {
      high: 300, // lines
      medium: 150 // lines
    }
  };

  /**
   * Add a technical debt issue
   * 
   * @param issue Technical debt issue to add
   */
  addIssue(issue: Omit<TechnicalDebtIssue, 'detectedAt'>): void {
    const newIssue: TechnicalDebtIssue = {
      ...issue,
      detectedAt: new Date()
    };
    
    this.issues.push(newIssue);
    
    // Log issue for debugging
    console.warn(`Technical debt detected: [${issue.severity.toUpperCase()}] ${issue.type} - ${issue.description}`);
    
    if (issue.severity === TechnicalDebtSeverity.HIGH) {
      // Alert for high severity issues
      console.error('⚠️ HIGH SEVERITY TECHNICAL DEBT DETECTED ⚠️');
    }
  }

  /**
   * Get all technical debt issues
   * 
   * @returns All technical debt issues
   */
  getIssues(): TechnicalDebtIssue[] {
    return [...this.issues];
  }

  /**
   * Get technical debt issues by type
   * 
   * @param type Type of technical debt
   * @returns Technical debt issues of the specified type
   */
  getIssuesByType(type: TechnicalDebtType): TechnicalDebtIssue[] {
    return this.issues.filter(issue => issue.type === type);
  }

  /**
   * Get technical debt issues by severity
   * 
   * @param severity Severity of technical debt
   * @returns Technical debt issues of the specified severity
   */
  getIssuesBySeverity(severity: TechnicalDebtSeverity): TechnicalDebtIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }

  /**
   * Generate a technical debt report
   * 
   * @returns Technical debt report
   */
  generateReport(): TechnicalDebtReport {
    const highSeverityIssues = this.getIssuesBySeverity(TechnicalDebtSeverity.HIGH);
    const mediumSeverityIssues = this.getIssuesBySeverity(TechnicalDebtSeverity.MEDIUM);
    const lowSeverityIssues = this.getIssuesBySeverity(TechnicalDebtSeverity.LOW);
    
    return {
      issues: [...this.issues],
      generatedAt: new Date(),
      totalIssuesCount: this.issues.length,
      highSeverityCount: highSeverityIssues.length,
      mediumSeverityCount: mediumSeverityIssues.length,
      lowSeverityCount: lowSeverityIssues.length,
      summary: this.generateSummary(highSeverityIssues, mediumSeverityIssues, lowSeverityIssues)
    };
  }

  /**
   * Generate a summary of technical debt issues
   * 
   * @param highSeverityIssues High severity issues
   * @param mediumSeverityIssues Medium severity issues
   * @param lowSeverityIssues Low severity issues
   * @returns Summary of technical debt issues
   * @private
   */
  private generateSummary(
    highSeverityIssues: TechnicalDebtIssue[],
    mediumSeverityIssues: TechnicalDebtIssue[],
    lowSeverityIssues: TechnicalDebtIssue[]
  ): string {
    const totalIssues = this.issues.length;
    
    if (totalIssues === 0) {
      return 'No technical debt issues detected.';
    }
    
    const summary = [
      `Total technical debt issues: ${totalIssues}`,
      `High severity: ${highSeverityIssues.length}`,
      `Medium severity: ${mediumSeverityIssues.length}`,
      `Low severity: ${lowSeverityIssues.length}`
    ];
    
    // Add type breakdown
    const typeBreakdown = Object.values(TechnicalDebtType)
      .map(type => {
        const count = this.getIssuesByType(type).length;
        return count > 0 ? `${type}: ${count}` : null;
      })
      .filter(Boolean)
      .join(', ');
    
    summary.push(`Type breakdown: ${typeBreakdown}`);
    
    // Add critical issues
    if (highSeverityIssues.length > 0) {
      summary.push('Critical issues that need immediate attention:');
      highSeverityIssues.slice(0, 5).forEach((issue, index) => {
        summary.push(`${index + 1}. ${issue.description} (${issue.type})`);
      });
      
      if (highSeverityIssues.length > 5) {
        summary.push(`...and ${highSeverityIssues.length - 5} more critical issues.`);
      }
    }
    
    return summary.join('\n');
  }

  /**
   * Analyze render performance
   * 
   * @param componentName Component to analyze
   * @param metrics Component metrics
   */
  analyzeRenderPerformance(componentName: string, metrics: IComponentMetrics): void {
    const averageRenderTime = metrics.average_render_time;
    
    // Check for slow renders
    if (averageRenderTime > this.performanceThresholds.render.high) {
      this.addIssue({
        type: TechnicalDebtType.PERFORMANCE,
        severity: TechnicalDebtSeverity.HIGH,
        component: componentName,
        description: `Component "${componentName}" has very slow average render time (${averageRenderTime.toFixed(2)}ms)`,
        suggestedFix: 'Consider optimizing with React.memo, useMemo, useCallback, or splitting into smaller components'
      });
    } else if (averageRenderTime > this.performanceThresholds.render.medium) {
      this.addIssue({
        type: TechnicalDebtType.PERFORMANCE,
        severity: TechnicalDebtSeverity.MEDIUM,
        component: componentName,
        description: `Component "${componentName}" has slow average render time (${averageRenderTime.toFixed(2)}ms)`,
        suggestedFix: 'Consider optimizing with React.memo, useMemo, or useCallback'
      });
    }
    
    // Check for excessive re-renders
    if (metrics.total_renders > 100) {
      this.addIssue({
        type: TechnicalDebtType.PERFORMANCE,
        severity: TechnicalDebtSeverity.MEDIUM,
        component: componentName,
        description: `Component "${componentName}" has excessive re-renders (${metrics.total_renders})`,
        suggestedFix: 'Check dependency arrays in useEffect or useMemo hooks, or implement shouldComponentUpdate'
      });
    }
  }

  /**
   * Clear all technical debt issues
   */
  clearIssues(): void {
    this.issues = [];
  }

  /**
   * Set performance thresholds
   * 
   * @param thresholds Performance thresholds
   */
  setPerformanceThresholds(thresholds: Partial<typeof this.performanceThresholds>): void {
    this.performanceThresholds = {
      ...this.performanceThresholds,
      ...thresholds
    };
  }
}

// Create and export singleton instance
export const technicalDebtMonitor = new TechnicalDebtMonitor();

export default technicalDebtMonitor;
