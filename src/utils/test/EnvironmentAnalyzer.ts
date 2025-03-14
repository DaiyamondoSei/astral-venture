
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Types for environment analysis
export interface EnvironmentInfo {
  type: 'frontend' | 'backend' | 'database' | 'external';
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  details: Record<string, any>;
}

export interface EnvironmentAnalysisResult {
  environments: EnvironmentInfo[];
  connections: {
    source: string;
    target: string;
    status: 'healthy' | 'degraded' | 'failed';
    latency?: number;
    errors?: string[];
  }[];
  issues: {
    severity: 'critical' | 'warning' | 'info';
    environment: string;
    description: string;
    impact: string;
    resolution?: string;
  }[];
}

/**
 * Utility class to analyze the various environments and their interactions
 */
export class EnvironmentAnalyzer {
  private static instance: EnvironmentAnalyzer;
  private environmentInfo: Map<string, EnvironmentInfo> = new Map();
  private connectionTests: Map<string, boolean> = new Map();
  
  private constructor() {}
  
  public static getInstance(): EnvironmentAnalyzer {
    if (!EnvironmentAnalyzer.instance) {
      EnvironmentAnalyzer.instance = new EnvironmentAnalyzer();
    }
    return EnvironmentAnalyzer.instance;
  }
  
  /**
   * Analyze the frontend environment
   */
  public async analyzeFrontend(): Promise<EnvironmentInfo> {
    const info: EnvironmentInfo = {
      type: 'frontend',
      name: 'React Application',
      status: 'online',
      details: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        devicePixelRatio: window.devicePixelRatio,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        memory: (navigator as any).deviceMemory || 'unknown',
        localStorage: this.testLocalStorage(),
        reactVersion: React.version,
        performanceNow: performance.now()
      }
    };
    
    this.environmentInfo.set('frontend', info);
    return info;
  }
  
  /**
   * Analyze the backend environment (Supabase)
   */
  public async analyzeBackend(): Promise<EnvironmentInfo> {
    const connectionTest = await supabase.testConnection();
    
    // Store connection test result
    this.connectionTests.set('frontend-to-backend', connectionTest);
    
    const info: EnvironmentInfo = {
      type: 'backend',
      name: 'Supabase Backend',
      status: connectionTest ? 'online' : 'offline',
      details: {
        connectionStatus: connectionTest ? 'connected' : 'disconnected',
        url: import.meta.env.VITE_SUPABASE_URL || 'not-configured',
        urlConfigured: !!import.meta.env.VITE_SUPABASE_URL,
        anonKeyConfigured: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      }
    };
    
    this.environmentInfo.set('backend', info);
    return info;
  }
  
  /**
   * Analyze the database environment
   */
  public async analyzeDatabase(): Promise<EnvironmentInfo> {
    // Test connection to key tables
    const tablesStatus = await this.testDatabaseTables();
    
    // Store connection test result
    this.connectionTests.set('backend-to-database', 
      Object.values(tablesStatus).some(status => status));
    
    const info: EnvironmentInfo = {
      type: 'database',
      name: 'Supabase PostgreSQL Database',
      status: Object.values(tablesStatus).every(status => status) 
        ? 'online' 
        : Object.values(tablesStatus).some(status => status) 
          ? 'degraded' 
          : 'offline',
      details: {
        tablesStatus,
        connectionStatus: Object.values(tablesStatus).some(status => status) 
          ? 'connected' 
          : 'disconnected',
      }
    };
    
    this.environmentInfo.set('database', info);
    return info;
  }
  
  /**
   * Run a comprehensive environment analysis
   */
  public async analyzeAll(): Promise<EnvironmentAnalysisResult> {
    await this.analyzeFrontend();
    await this.analyzeBackend();
    await this.analyzeDatabase();
    
    const environments = Array.from(this.environmentInfo.values());
    const connections = this.analyzeConnections();
    const issues = this.identifyIssues();
    
    return {
      environments,
      connections,
      issues
    };
  }
  
  /**
   * Analyze connections between environments
   */
  private analyzeConnections() {
    const connections: EnvironmentAnalysisResult['connections'] = [];
    
    // Frontend to Backend connection
    const frontendToBackend = this.connectionTests.get('frontend-to-backend');
    connections.push({
      source: 'frontend',
      target: 'backend',
      status: frontendToBackend ? 'healthy' : 'failed',
      errors: frontendToBackend ? undefined : ['Connection failed']
    });
    
    // Backend to Database connection
    const backendToDatabase = this.connectionTests.get('backend-to-database');
    connections.push({
      source: 'backend',
      target: 'database',
      status: backendToDatabase ? 'healthy' : 'failed',
      errors: backendToDatabase ? undefined : ['Connection failed']
    });
    
    return connections;
  }
  
  /**
   * Identify issues with the environments
   */
  private identifyIssues() {
    const issues: EnvironmentAnalysisResult['issues'] = [];
    
    // Check frontend environment
    const frontend = this.environmentInfo.get('frontend');
    if (frontend) {
      if (!frontend.details.localStorage) {
        issues.push({
          severity: 'warning',
          environment: 'frontend',
          description: 'LocalStorage is not available',
          impact: 'User preferences and cached data cannot be stored'
        });
      }
      
      if (frontend.details.connectionType === 'slow-2g' || 
          frontend.details.connectionType === '2g') {
        issues.push({
          severity: 'warning',
          environment: 'frontend',
          description: 'Slow network connection detected',
          impact: 'Application performance may be degraded',
          resolution: 'Consider reducing data transfer and enabling aggressive caching'
        });
      }
    }
    
    // Check backend environment
    const backend = this.environmentInfo.get('backend');
    if (backend) {
      if (backend.status === 'offline') {
        issues.push({
          severity: 'critical',
          environment: 'backend',
          description: 'Backend services are unreachable',
          impact: 'Application functionality is severely limited',
          resolution: 'Check Supabase configuration and connectivity'
        });
      }
      
      if (!backend.details.urlConfigured || !backend.details.anonKeyConfigured) {
        issues.push({
          severity: 'critical',
          environment: 'backend',
          description: 'Backend configuration is incomplete',
          impact: 'Application cannot connect to backend services',
          resolution: 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables'
        });
      }
    }
    
    // Check database environment
    const database = this.environmentInfo.get('database');
    if (database) {
      if (database.status === 'offline') {
        issues.push({
          severity: 'critical',
          environment: 'database',
          description: 'Database is unreachable',
          impact: 'Data cannot be stored or retrieved',
          resolution: 'Check database connection and configuration'
        });
      } else if (database.status === 'degraded') {
        issues.push({
          severity: 'warning',
          environment: 'database',
          description: 'Some database tables are unavailable',
          impact: 'Some application features may not work correctly',
          resolution: 'Check database table access permissions and schema'
        });
      }
      
      const tablesStatus = database.details.tablesStatus;
      for (const [table, status] of Object.entries(tablesStatus)) {
        if (!status) {
          issues.push({
            severity: 'warning',
            environment: 'database',
            description: `Table "${table}" is unavailable`,
            impact: `Features depending on "${table}" will not work correctly`,
            resolution: 'Check table permissions and ensure it exists in the schema'
          });
        }
      }
    }
    
    return issues;
  }
  
  /**
   * Test localStorage availability
   */
  private testLocalStorage(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Test the connection to key database tables
   */
  private async testDatabaseTables(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // Key tables to test
    const tables = [
      'user_profiles',
      'energy_reflections',
      'user_streaks',
      'chakra_systems',
      'user_achievements',
      'practices',
      'challenges'
    ];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        results[table] = !error;
      } catch (e) {
        results[table] = false;
      }
    }
    
    return results;
  }
  
  /**
   * Generate a detailed report
   */
  public generateReport(): string {
    const analysisPromise = this.analyzeAll();
    
    return `
# Environment Analysis Report
**Generated At:** ${new Date().toISOString()}

## Environment Summary
${Array.from(this.environmentInfo.values()).map(env => 
  `- **${env.name}**: ${env.status}`
).join('\n')}

## Connection Status
${this.analyzeConnections().map(conn => 
  `- **${conn.source} → ${conn.target}**: ${conn.status}${conn.errors ? ` (${conn.errors.join(', ')})` : ''}`
).join('\n')}

## Issues Detected
${this.identifyIssues().map(issue => 
  `### ${issue.severity.toUpperCase()}: ${issue.description}\n` +
  `- **Environment**: ${issue.environment}\n` +
  `- **Impact**: ${issue.impact}\n` +
  (issue.resolution ? `- **Resolution**: ${issue.resolution}\n` : '')
).join('\n')}

## Environment Details
${Array.from(this.environmentInfo.values()).map(env => 
  `### ${env.name} (${env.type})\n` +
  `- **Status**: ${env.status}\n` +
  `- **Details**:\n` +
  Object.entries(env.details).map(([key, value]) => 
    `  - ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
  ).join('\n')
).join('\n\n')}
`;
  }
  
  /**
   * Reset the analyzer
   */
  public reset(): void {
    this.environmentInfo.clear();
    this.connectionTests.clear();
  }
}

// Export singleton instance
export const environmentAnalyzer = EnvironmentAnalyzer.getInstance();
