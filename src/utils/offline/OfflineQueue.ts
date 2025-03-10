
interface QueuedRequest {
  id: string;
  timestamp: number;
  request: () => Promise<unknown>;
  retryCount: number;
}

export class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  
  private constructor() {
    this.initializeNetworkListeners();
  }
  
  static getInstance(): OfflineQueue {
    if (!this.instance) {
      this.instance = new OfflineQueue();
    }
    return this.instance;
  }
  
  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }
  
  enqueue(request: () => Promise<unknown>): void {
    this.queue.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      request,
      retryCount: 0
    });
    
    if (navigator.onLine) {
      this.processQueue();
    }
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0];
      
      try {
        await item.request();
        this.queue.shift();
      } catch (error) {
        console.error('Failed to process queued request:', error);
        item.retryCount++;
        
        if (item.retryCount >= 3) {
          this.queue.shift();
        } else {
          // Move to end of queue for retry
          this.queue.push(this.queue.shift()!);
          break;
        }
      }
    }
    
    this.isProcessing = false;
  }
  
  clear(): void {
    this.queue = [];
  }
}

export const offlineQueue = OfflineQueue.getInstance();
