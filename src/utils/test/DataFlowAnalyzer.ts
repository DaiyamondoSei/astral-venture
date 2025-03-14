
import { supabase } from '@/lib/supabase/client';
import { startFlow, trackPoint, endFlow, createFlowTracker } from '@/utils/dataFlowTracker';
import { toast } from '@/components/ui/use-toast';

// Types for data flow analysis
export interface DataFlowNode {
  id: string;
  name: string;
  type: 'component' | 'hook' | 'service' | 'database' | 'external';
  dependencies: string[];
  dataOut: string[];
  dataIn: string[];
}

export interface DataFlowConnection {
  source: string;
  target: string;
  data: string;
  type: 'sync' | 'async' | 'event';
}

export interface DataFlowAnalysis {
  nodes: DataFlowNode[];
  connections: DataFlowConnection[];
  criticalPath: string[];
  potentialIssues: {
    type: 'error' | 'warning' | 'info';
    description: string;
    location: string;
    suggestion: string;
  }[];
}

// Singleton class to track and analyze data flow
export class DataFlowAnalyzer {
  private static instance: DataFlowAnalyzer;
  private nodes: Map<string, DataFlowNode> = new Map();
  private connections: DataFlowConnection[] = [];
  private activeFlows: Map<string, string[]> = new Map();
  private flowTracker = createFlowTracker('data-flow-analyzer');
  
  private constructor() {}
  
  public static getInstance(): DataFlowAnalyzer {
    if (!DataFlowAnalyzer.instance) {
      DataFlowAnalyzer.instance = new DataFlowAnalyzer();
    }
    return DataFlowAnalyzer.instance;
  }
  
  /**
   * Register a component, hook, or service in the data flow
   */
  public registerNode(
    id: string, 
    name: string, 
    type: 'component' | 'hook' | 'service' | 'database' | 'external',
    dependencies: string[] = [],
    dataIn: string[] = [],
    dataOut: string[] = []
  ): void {
    if (this.nodes.has(id)) {
      // Update existing node
      const existing = this.nodes.get(id)!;
      this.nodes.set(id, {
        ...existing,
        name,
        type,
        dependencies: [...new Set([...existing.dependencies, ...dependencies])],
        dataIn: [...new Set([...existing.dataIn, ...dataIn])],
        dataOut: [...new Set([...existing.dataOut, ...dataOut])]
      });
    } else {
      // Create new node
      this.nodes.set(id, {
        id,
        name,
        type,
        dependencies,
        dataIn,
        dataOut
      });
    }
  }
  
  /**
   * Register a data connection between nodes
   */
  public registerConnection(
    sourceId: string, 
    targetId: string, 
    data: string, 
    type: 'sync' | 'async' | 'event' = 'sync'
  ): void {
    // Create nodes if they don't exist
    if (!this.nodes.has(sourceId)) {
      this.registerNode(sourceId, sourceId, 'component');
    }
    
    if (!this.nodes.has(targetId)) {
      this.registerNode(targetId, targetId, 'component');
    }
    
    // Add the connection
    const connection: DataFlowConnection = {
      source: sourceId,
      target: targetId,
      data,
      type
    };
    
    this.connections.push(connection);
    
    // Update node data properties
    const sourceNode = this.nodes.get(sourceId)!;
    const targetNode = this.nodes.get(targetId)!;
    
    // Update dataOut in source
    if (!sourceNode.dataOut.includes(data)) {
      sourceNode.dataOut.push(data);
      this.nodes.set(sourceId, sourceNode);
    }
    
    // Update dataIn in target
    if (!targetNode.dataIn.includes(data)) {
      targetNode.dataIn.push(data);
      this.nodes.set(targetId, targetNode);
    }
    
    // Add dependency
    if (!targetNode.dependencies.includes(sourceId)) {
      targetNode.dependencies.push(sourceId);
      this.nodes.set(targetId, targetNode);
    }
  }
  
  /**
   * Start tracking a data flow for a specific user action
   */
  public startUserFlow(flowId: string, description: string): void {
    this.flowTracker.start(flowId, description);
    this.activeFlows.set(flowId, []);
  }
  
  /**
   * Track a step in a user flow
   */
  public trackFlowStep(
    flowId: string,
    nodeId: string,
    action: string,
    data: any
  ): void {
    if (this.activeFlows.has(flowId)) {
      const steps = this.activeFlows.get(flowId)!;
      steps.push(nodeId);
      this.activeFlows.set(flowId, steps);
      
      this.flowTracker.track(flowId, action, data);
      
      // Create node if it doesn't exist
      if (!this.nodes.has(nodeId)) {
        this.registerNode(nodeId, nodeId, 'component');
      }
    }
  }
  
  /**
   * End tracking a user flow
   */
  public endUserFlow(flowId: string): void {
    if (this.activeFlows.has(flowId)) {
      this.flowTracker.end(flowId);
      this.activeFlows.delete(flowId);
    }
  }
  
  /**
   * Analyze the data flow to identify potential issues
   */
  public analyze(): DataFlowAnalysis {
    const nodes = Array.from(this.nodes.values());
    const potentialIssues = this.identifyIssues();
    const criticalPath = this.findCriticalPath();
    
    return {
      nodes,
      connections: this.connections,
      criticalPath,
      potentialIssues
    };
  }
  
  /**
   * Find the critical path in the data flow
   */
  private findCriticalPath(): string[] {
    // For now, a simplified algorithm that finds the longest path
    // between any UI component and the database
    const uiNodes = Array.from(this.nodes.values())
      .filter(node => node.type === 'component')
      .map(node => node.id);
    
    const dbNodes = Array.from(this.nodes.values())
      .filter(node => node.type === 'database')
      .map(node => node.id);
    
    if (uiNodes.length === 0 || dbNodes.length === 0) {
      return [];
    }
    
    // Find the longest path from any UI component to any DB node
    let longestPath: string[] = [];
    
    for (const uiNode of uiNodes) {
      for (const dbNode of dbNodes) {
        const path = this.findLongestPath(uiNode, dbNode);
        if (path.length > longestPath.length) {
          longestPath = path;
        }
      }
    }
    
    return longestPath;
  }
  
  /**
   * Find the longest path between two nodes
   */
  private findLongestPath(startId: string, endId: string): string[] {
    const visited = new Set<string>();
    const paths: Map<string, string[]> = new Map();
    
    paths.set(startId, [startId]);
    
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current)) {
        continue;
      }
      
      visited.add(current);
      
      // Find all nodes that depend on the current node
      const outgoingConnections = this.connections.filter(
        conn => conn.source === current
      );
      
      for (const connection of outgoingConnections) {
        const target = connection.target;
        const currentPath = paths.get(current) || [];
        const targetPath = paths.get(target) || [];
        
        if (targetPath.length < currentPath.length + 1) {
          const newPath = [...currentPath, target];
          paths.set(target, newPath);
        }
        
        if (!visited.has(target)) {
          queue.push(target);
        }
      }
    }
    
    return paths.get(endId) || [];
  }
  
  /**
   * Identify potential issues in the data flow
   */
  private identifyIssues() {
    const issues: DataFlowAnalysis['potentialIssues'] = [];
    
    // Check for orphaned nodes
    const orphanedNodes = Array.from(this.nodes.values())
      .filter(node => node.dependencies.length === 0 && node.dataIn.length === 0 && node.type !== 'external');
    
    for (const node of orphanedNodes) {
      issues.push({
        type: 'warning',
        description: `Orphaned node: ${node.name} (${node.id}) is not receiving any data`,
        location: node.id,
        suggestion: 'Connect this node to the data flow or remove it if unused'
      });
    }
    
    // Check for nodes that don't output data
    const sinkNodes = Array.from(this.nodes.values())
      .filter(node => node.dataOut.length === 0 && node.type !== 'database');
    
    for (const node of sinkNodes) {
      issues.push({
        type: 'info',
        description: `Sink node: ${node.name} (${node.id}) doesn't output any data`,
        location: node.id,
        suggestion: 'Verify this is intentional behavior'
      });
    }
    
    // Check for circular dependencies
    for (const node of this.nodes.values()) {
      const cycles = this.findCycles(node.id);
      if (cycles.length > 0) {
        issues.push({
          type: 'error',
          description: `Circular dependency involving ${node.name} (${node.id}): ${cycles.join(' -> ')}`,
          location: node.id,
          suggestion: 'Refactor to eliminate circular dependencies'
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Find cycles in the dependency graph
   */
  private findCycles(startId: string): string[] {
    const visited = new Set<string>();
    const path: string[] = [];
    const cycles: string[] = [];
    
    const dfs = (nodeId: string) => {
      if (cycles.length > 0) {
        return; // Already found a cycle
      }
      
      if (path.includes(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        cycles.push(...path.slice(cycleStart));
        cycles.push(nodeId);
        return;
      }
      
      if (visited.has(nodeId)) {
        return; // Already visited
      }
      
      visited.add(nodeId);
      path.push(nodeId);
      
      const node = this.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          dfs(depId);
        }
      }
      
      path.pop();
    };
    
    dfs(startId);
    return cycles;
  }
  
  /**
   * Test the connection to Supabase
   */
  public async testSupabaseConnection(): Promise<boolean> {
    try {
      const connected = await supabase.testConnection();
      return connected;
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }
  }
  
  /**
   * Reset the analyzer
   */
  public reset(): void {
    this.nodes.clear();
    this.connections = [];
    this.activeFlows.clear();
  }
  
  /**
   * Get a visual representation of the data flow
   */
  public getVisualRepresentation(): string {
    let result = '';
    
    // Add nodes
    result += '## Data Flow Nodes\n\n';
    for (const node of this.nodes.values()) {
      result += `### ${node.name} (${node.id})\n`;
      result += `- Type: ${node.type}\n`;
      result += `- Dependencies: ${node.dependencies.join(', ') || 'None'}\n`;
      result += `- Data In: ${node.dataIn.join(', ') || 'None'}\n`;
      result += `- Data Out: ${node.dataOut.join(', ') || 'None'}\n\n`;
    }
    
    // Add connections
    result += '## Data Flow Connections\n\n';
    for (const conn of this.connections) {
      result += `- ${conn.source} → ${conn.target}: ${conn.data} (${conn.type})\n`;
    }
    
    return result;
  }
}

// Export singleton instance
export const dataFlowAnalyzer = DataFlowAnalyzer.getInstance();

// Utility functions
export const registerComponent = (
  id: string,
  name: string,
  dependencies: string[] = [],
  dataIn: string[] = [],
  dataOut: string[] = []
) => {
  dataFlowAnalyzer.registerNode(id, name, 'component', dependencies, dataIn, dataOut);
};

export const registerHook = (
  id: string,
  name: string,
  dependencies: string[] = [],
  dataIn: string[] = [],
  dataOut: string[] = []
) => {
  dataFlowAnalyzer.registerNode(id, name, 'hook', dependencies, dataIn, dataOut);
};

export const registerService = (
  id: string,
  name: string,
  dependencies: string[] = [],
  dataIn: string[] = [],
  dataOut: string[] = []
) => {
  dataFlowAnalyzer.registerNode(id, name, 'service', dependencies, dataIn, dataOut);
};

export const trackDataFlow = (
  sourceId: string,
  targetId: string,
  data: string,
  type: 'sync' | 'async' | 'event' = 'sync'
) => {
  dataFlowAnalyzer.registerConnection(sourceId, targetId, data, type);
};
