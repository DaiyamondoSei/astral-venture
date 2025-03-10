
/**
 * Options for batching requests
 */
export interface BatchOptions {
  maxBatchSize?: number;       // Maximum number of items in a batch
  delayMs?: number;            // Delay in ms to wait for more items before processing
  maxDelayMs?: number;         // Maximum delay to wait for more items
  processingRetries?: number;  // Number of retries for failed batch processing
}

/**
 * Default batch options
 */
const defaultBatchOptions: BatchOptions = {
  maxBatchSize: 50,
  delayMs: 10,
  maxDelayMs: 100,
  processingRetries: 3
};

/**
 * Generic batch processor for items requiring async processing
 */
export class BatchProcessor<T, R = any> {
  private queue: T[] = [];
  private timeoutId: number | null = null;
  private flushPromise: Promise<void> | null = null;
  private resolveFlush: (() => void) | null = null;
  private startTime: number | null = null;
  private options: BatchOptions;
  private processor: (items: T[]) => Promise<R[]>;
  private isProcessing = false;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    options: BatchOptions = {}
  ) {
    this.processor = processor;
    this.options = { ...defaultBatchOptions, ...options };
  }

  /**
   * Add an item to the processing queue
   */
  public add(item: T): Promise<R> {
    this.queue.push(item);
    return this.scheduleFlush().then(results => {
      const index = this.queue.indexOf(item);
      return results[index];
    });
  }

  /**
   * Add multiple items to the processing queue
   */
  public addMany(items: T[]): Promise<R[]> {
    const startIndex = this.queue.length;
    this.queue.push(...items);
    return this.scheduleFlush().then(results => 
      results.slice(startIndex, startIndex + items.length)
    );
  }

  /**
   * Schedule a flush of the queue
   */
  private scheduleFlush(): Promise<R[]> {
    if (!this.flushPromise) {
      this.flushPromise = new Promise<void>(resolve => {
        this.resolveFlush = resolve;
      });
      this.startTime = Date.now();
    }

    const { maxBatchSize, delayMs, maxDelayMs } = this.options;

    // Clear any existing timeout
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Determine if we should flush immediately
    const shouldFlushImmediately = 
      this.queue.length >= (maxBatchSize || 50) ||
      (this.startTime && Date.now() - this.startTime >= (maxDelayMs || 100));

    if (shouldFlushImmediately) {
      this.flush();
    } else {
      // Schedule flush with delay
      this.timeoutId = window.setTimeout(() => this.flush(), delayMs);
    }

    return this.flushPromise.then(() => this.processQueue());
  }

  /**
   * Flush the queue immediately
   */
  private flush(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.resolveFlush) {
      this.resolveFlush();
      this.resolveFlush = null;
    }

    this.flushPromise = null;
    this.startTime = null;
  }

  /**
   * Process all items in the queue
   */
  private async processQueue(): Promise<R[]> {
    if (this.isProcessing || this.queue.length === 0) {
      return [];
    }

    this.isProcessing = true;
    const itemsToProcess = [...this.queue];
    this.queue = [];

    try {
      return await this.processor(itemsToProcess);
    } catch (error) {
      console.error('Error processing batch:', error);
      // Re-add items to the queue
      this.queue.unshift(...itemsToProcess);
      return [];
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process all remaining items in the queue immediately
   */
  public async processRemaining(): Promise<R[]> {
    if (this.queue.length === 0) {
      return [];
    }

    this.flush();
    return this.processQueue();
  }
}

/**
 * Create a batched version of a function that processes individual items
 */
export function createBatchedFunction<T, R>(
  itemProcessor: (item: T) => Promise<R>,
  options?: BatchOptions
): (item: T) => Promise<R> {
  const batchProcessor = new BatchProcessor<T, R>(
    async (items) => {
      return Promise.all(items.map(itemProcessor));
    },
    options
  );

  return (item: T) => batchProcessor.add(item);
}
