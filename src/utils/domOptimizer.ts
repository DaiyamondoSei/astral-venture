
/**
 * DOM Optimization Utilities
 * Prevents layout thrashing and optimizes DOM operations
 */

type ReadTask = () => any;
type WriteTask = () => void;

// Batching DOM reads and writes to prevent layout thrashing
class DOMBatchManager {
  private readTasks: Array<{ task: ReadTask; resolve: (value: any) => void }> = [];
  private writeTasks: Array<{ task: WriteTask; resolve: () => void }> = [];
  private scheduled = false;
  
  /**
   * Schedule a DOM read operation
   * All reads are batched together and executed before writes
   */
  public read<T>(readTask: () => T): Promise<T> {
    return new Promise(resolve => {
      this.readTasks.push({ task: readTask, resolve });
      this.scheduleFlush();
    });
  }
  
  /**
   * Schedule a DOM write operation
   * All writes are batched together and executed after reads
   */
  public write(writeTask: WriteTask): Promise<void> {
    return new Promise(resolve => {
      this.writeTasks.push({ task: writeTask, resolve });
      this.scheduleFlush();
    });
  }
  
  /**
   * Schedule flush of all tasks on next animation frame
   */
  private scheduleFlush(): void {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }
  
  /**
   * Execute all scheduled tasks
   */
  private flush(): void {
    // Execute all read tasks first
    const reads = this.readTasks;
    this.readTasks = [];
    
    // Get measurements from DOM
    const readResults = reads.map(({ task }) => task());
    
    // Resolve read promises
    reads.forEach(({ resolve }, i) => resolve(readResults[i]));
    
    // Then execute all write tasks
    const writes = this.writeTasks;
    this.writeTasks = [];
    
    // Perform DOM mutations
    writes.forEach(({ task }) => task());
    
    // Resolve write promises
    writes.forEach(({ resolve }) => resolve());
    
    // Reset scheduled flag
    this.scheduled = false;
    
    // If new tasks were added during execution, schedule another flush
    if (this.readTasks.length > 0 || this.writeTasks.length > 0) {
      this.scheduleFlush();
    }
  }
}

// Singleton instance
export const domBatchManager = new DOMBatchManager();

/**
 * Get element dimensions without causing layout thrashing
 */
export const getElementDimensions = (element: HTMLElement): Promise<DOMRect> => {
  return domBatchManager.read(() => element.getBoundingClientRect());
};

/**
 * Set element style properties efficiently
 */
export const setElementStyles = (
  element: HTMLElement, 
  styles: Partial<CSSStyleDeclaration>
): Promise<void> => {
  return domBatchManager.write(() => {
    Object.entries(styles).forEach(([prop, value]) => {
      (element.style as any)[prop] = value;
    });
  });
};

/**
 * Optimized class name toggling that batches DOM writes
 */
export const toggleClasses = (
  element: HTMLElement, 
  classesToAdd: string[] = [], 
  classesToRemove: string[] = []
): Promise<void> => {
  return domBatchManager.write(() => {
    if (classesToRemove.length > 0) {
      element.classList.remove(...classesToRemove);
    }
    if (classesToAdd.length > 0) {
      element.classList.add(...classesToAdd);
    }
  });
};

/**
 * Deferred content loading when element comes into view
 * @returns Function to set the target element ref
 */
export const createLazyLoader = (
  callback: () => void,
  options: IntersectionObserverInit = {}
): (element: HTMLElement | null) => void => {
  let observer: IntersectionObserver | null = null;
  
  // Default options with reasonable values
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '200px',
    threshold: 0,
    ...options,
  };
  
  return (element: HTMLElement | null) => {
    // Disconnect previous observer if any
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    // Exit if no element
    if (!element) return;
    
    // Create new observer
    observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        // Execute callback when element is visible
        callback();
        
        // Cleanup observer after triggering
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      }
    }, defaultOptions);
    
    // Start observing
    observer.observe(element);
  };
};

/**
 * Apply high-performance transitions to elements
 * Use transform and opacity for best performance
 */
export const applyPerformantTransition = (
  element: HTMLElement,
  from: { x?: number; y?: number; scale?: number; opacity?: number },
  to: { x?: number; y?: number; scale?: number; opacity?: number },
  options: { duration?: number; easing?: string; onComplete?: () => void } = {}
): Promise<void> => {
  const { 
    duration = 300, 
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    onComplete 
  } = options;
  
  return domBatchManager.write(() => {
    // Force a reflow before starting animation
    element.getBoundingClientRect();
    
    // Set initial styles
    element.style.transition = 'none';
    element.style.transform = `translate3d(${from.x || 0}px, ${from.y || 0}px, 0) scale(${from.scale || 1})`;
    if (from.opacity !== undefined) {
      element.style.opacity = from.opacity.toString();
    }
    
    // Force a reflow to apply initial styles
    element.getBoundingClientRect();
    
    // Set transition
    element.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
    
    // Set target styles
    element.style.transform = `translate3d(${to.x || 0}px, ${to.y || 0}px, 0) scale(${to.scale || 1})`;
    if (to.opacity !== undefined) {
      element.style.opacity = to.opacity.toString();
    }
    
    // Handle completion
    if (onComplete) {
      const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target === element) {
          element.removeEventListener('transitionend', handleTransitionEnd);
          onComplete();
        }
      };
      element.addEventListener('transitionend', handleTransitionEnd);
    }
  });
};
