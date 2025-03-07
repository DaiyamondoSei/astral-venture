
/**
 * Data Flow Tracker
 * 
 * A utility for tracking and debugging data flows through the application
 * Only active in development mode
 */

type DataPoint = {
  timestamp: number;
  component: string;
  action: string;
  data: unknown;
};

type DataFlow = {
  id: string;
  description: string;
  dataPoints: DataPoint[];
  startTime: number;
  endTime?: number;
};

// Store flows by ID
const flows: Map<string, DataFlow> = new Map();

/**
 * Start tracking a data flow
 */
export function startFlow(id: string, description: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  if (flows.has(id)) {
    console.warn(`Data flow with ID "${id}" already exists. Using existing flow.`);
    return;
  }
  
  flows.set(id, {
    id,
    description,
    dataPoints: [],
    startTime: performance.now()
  });
  
  console.log(`%c📊 Started data flow: ${description} [${id}]`, 'color: #3b82f6; font-weight: bold;');
}

/**
 * Add a data point to the flow
 */
export function trackPoint(flowId: string, component: string, action: string, data: unknown): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const flow = flows.get(flowId);
  if (!flow) {
    console.warn(`Data flow with ID "${flowId}" not found. Start the flow first.`);
    return;
  }
  
  flow.dataPoints.push({
    timestamp: performance.now(),
    component,
    action,
    data
  });
  
  console.log(`%c📌 [${flowId}] ${component}: ${action}`, 'color: #6366f1;');
}

/**
 * End tracking a data flow and log a summary
 */
export function endFlow(flowId: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const flow = flows.get(flowId);
  if (!flow) {
    console.warn(`Data flow with ID "${flowId}" not found.`);
    return;
  }
  
  flow.endTime = performance.now();
  const duration = flow.endTime - flow.startTime;
  
  console.log(`%c📈 Completed data flow: ${flow.description} [${flowId}] in ${duration.toFixed(2)}ms`, 'color: #10b981; font-weight: bold;');
  console.groupCollapsed(`View ${flow.dataPoints.length} data points`);
  
  flow.dataPoints.forEach((point, index) => {
    const timeFromStart = (point.timestamp - flow.startTime).toFixed(2);
    console.log(`${index + 1}. [+${timeFromStart}ms] ${point.component}: ${point.action}`);
    console.log(point.data);
  });
  
  console.groupEnd();
}

/**
 * Create a labeled instance of the flow tracker for a specific feature
 * This makes it easier to track flows for specific features
 */
export function createFlowTracker(feature: string): {
  start: (id: string, description: string) => void;
  track: (flowId: string, action: string, data: unknown) => void;
  end: (flowId: string) => void;
} {
  return {
    start: (id: string, description: string): void => {
      startFlow(`${feature}:${id}`, description);
    },
    track: (flowId: string, action: string, data: unknown): void => {
      trackPoint(`${feature}:${flowId}`, feature, action, data);
    },
    end: (flowId: string): void => {
      endFlow(`${feature}:${flowId}`);
    }
  };
}

/**
 * Get a summary of all active flows
 */
export function getActiveFlows(): { id: string; description: string; points: number; duration: string }[] {
  if (process.env.NODE_ENV !== 'development') return [];
  
  const now = performance.now();
  const activeFlows: { id: string; description: string; points: number; duration: string }[] = [];
  
  flows.forEach(flow => {
    if (!flow.endTime) {
      const duration = now - flow.startTime;
      activeFlows.push({
        id: flow.id,
        description: flow.description,
        points: flow.dataPoints.length,
        duration: `${duration.toFixed(2)}ms`
      });
    }
  });
  
  return activeFlows;
}

/**
 * Reset and clear all flows
 */
export function resetFlows(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  flows.clear();
  console.log('%c🧹 All data flows have been reset', 'color: #ef4444; font-weight: bold;');
}
