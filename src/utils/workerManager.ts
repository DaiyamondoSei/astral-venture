
/**
 * A utility to manage web workers for offloading heavy calculations
 */

// Worker task types
export type WorkerTaskType = 
  | 'particles' 
  | 'fractalGeneration' 
  | 'geometryCalculation' 
  | 'dataProcessing';

// Worker task interface
export interface WorkerTask<T = any, R = any> {
  id: string;
  type: WorkerTaskType;
  data: T;
  transferables?: Transferable[];
}

// Worker result interface
export interface WorkerResult<T = any> {
  id: string;
  type: WorkerTaskType;
  data: T;
  error?: string;
  timing?: {
    queueTime: number;
    processingTime: number;
  };
}

class WorkerManager {
  private static instance: WorkerManager;
  private workers: Worker[] = [];
  private maxWorkers: number;
  private taskQueue: Map<string, {
    task: WorkerTask;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    queuedAt: number;
  }> = new Map();
  private workerStatus: Map<Worker, {
    busy: boolean;
    taskId?: string;
    taskType?: WorkerTaskType;
    startedAt?: number;
  }> = new Map();
  private initialized = false;

  private constructor() {
    // Determine optimal number of workers based on available cores
    this.maxWorkers = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
      ? Math.max(1, Math.min(navigator.hardwareConcurrency - 1, 4))
      : 2;
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  /**
   * Initialize the worker pool
   */
  public initialize(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    for (let i = 0; i < this.maxWorkers; i++) {
      try {
        const worker = new Worker(new URL('../workers/calculationWorker.ts', import.meta.url), { type: 'module' });
        
        worker.onmessage = this.handleWorkerMessage.bind(this);
        worker.onerror = this.handleWorkerError.bind(this);
        
        this.workers.push(worker);
        this.workerStatus.set(worker, { busy: false });
      } catch (error) {
        console.error('Failed to initialize worker:', error);
      }
    }
    
    this.initialized = true;
    console.log(`Worker pool initialized with ${this.workers.length} workers`);
  }

  /**
   * Submit a task to be processed by a worker
   */
  public submitTask<T, R>(task: WorkerTask<T, R>): Promise<R> {
    if (!this.initialized) {
      this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      // Add task to queue
      this.taskQueue.set(task.id, {
        task,
        resolve,
        reject,
        queuedAt: performance.now()
      });
      
      // Attempt to process next task
      this.processNextTask();
    });
  }

  /**
   * Process the next task in the queue if a worker is available
   */
  private processNextTask(): void {
    if (this.taskQueue.size === 0) return;
    
    // Find an available worker
    const availableWorker = this.workers.find(worker => 
      !this.workerStatus.get(worker)?.busy
    );
    
    if (!availableWorker) return; // No workers available
    
    // Get next task from queue (first in, first out)
    const [taskId, queueItem] = [...this.taskQueue.entries()][0];
    this.taskQueue.delete(taskId);
    
    const { task, queuedAt } = queueItem;
    
    // Mark worker as busy
    this.workerStatus.set(availableWorker, {
      busy: true,
      taskId: task.id,
      taskType: task.type,
      startedAt: performance.now()
    });
    
    // Send task to worker with transferables if available
    availableWorker.postMessage(task, task.transferables || []);
  }

  /**
   * Handle messages from workers
   */
  private handleWorkerMessage(event: MessageEvent): void {
    const result = event.data as WorkerResult;
    const worker = event.target as Worker;
    
    // Find task in queue
    const queueItem = this.taskQueue.get(result.id);
    
    // Mark worker as available
    const workerInfo = this.workerStatus.get(worker);
    if (workerInfo) {
      const processingTime = performance.now() - (workerInfo.startedAt || 0);
      console.debug(`Worker processed ${result.type} task in ${processingTime.toFixed(2)}ms`);
      
      this.workerStatus.set(worker, { busy: false });
    }
    
    // Resolve/reject promise
    if (queueItem) {
      if (result.error) {
        queueItem.reject(new Error(result.error));
      } else {
        queueItem.resolve(result.data);
      }
      
      // Remove task from queue
      this.taskQueue.delete(result.id);
    }
    
    // Process next task if any
    this.processNextTask();
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(error: ErrorEvent): void {
    const worker = error.target as Worker;
    const workerInfo = this.workerStatus.get(worker);
    
    console.error('Worker error:', error.message);
    
    // Mark worker as available
    if (workerInfo && workerInfo.taskId) {
      // Reject the current task
      const queueItem = this.taskQueue.get(workerInfo.taskId);
      if (queueItem) {
        queueItem.reject(new Error(error.message));
        this.taskQueue.delete(workerInfo.taskId);
      }
      
      this.workerStatus.set(worker, { busy: false });
    }
    
    // Process next task
    this.processNextTask();
  }

  /**
   * Terminate all workers
   */
  public terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.workerStatus.clear();
    this.taskQueue.clear();
    this.initialized = false;
  }
}

export const workerManager = WorkerManager.getInstance();

/**
 * Hook-friendly function to submit a task to the worker pool
 */
export async function submitWorkerTask<T, R>(
  type: WorkerTaskType,
  data: T,
  transferables?: Transferable[]
): Promise<R> {
  const task: WorkerTask<T, R> = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    transferables
  };
  
  return workerManager.submitTask(task);
}
