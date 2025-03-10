
/**
 * Resource management utility to help prevent memory leaks
 * and ensure proper cleanup of resources
 */

export interface ManagedResource<T> {
  resource: T;
  release: () => void;
}

export interface ResourceManagerOptions {
  debugMode?: boolean;
  onResourceLeaked?: (resource: unknown) => void;
}

class ResourceManager {
  private resources: Map<symbol, { resource: unknown; metadata?: Record<string, unknown> }> = new Map();
  private debugMode: boolean;
  private onResourceLeaked?: (resource: unknown) => void;

  constructor(options: ResourceManagerOptions = {}) {
    const { debugMode = false, onResourceLeaked } = options;
    this.debugMode = debugMode;
    this.onResourceLeaked = onResourceLeaked;
  }
  
  /**
   * Register a resource to be managed
   * Returns a managed resource object with a release function
   */
  register<T>(resource: T, metadata?: Record<string, unknown>): ManagedResource<T> {
    const id = Symbol('resourceId');
    
    this.resources.set(id, { resource, metadata });
    
    if (this.debugMode) {
      console.log(`Resource registered: ${id.toString()}`, metadata);
    }
    
    return {
      resource,
      release: () => {
        this.release(id);
      }
    };
  }
  
  /**
   * Release a resource by its ID
   */
  private release(id: symbol): void {
    const resourceEntry = this.resources.get(id);
    
    if (resourceEntry) {
      const { resource } = resourceEntry;
      
      // Handle common resource types
      if (resource instanceof EventTarget && 'removeAllListeners' in resource) {
        // Node.js EventEmitter-like
        (resource as unknown as { removeAllListeners(): void }).removeAllListeners();
      } else if (resource instanceof AbortController) {
        // AbortController
        resource.abort();
      } else if (typeof resource === 'function') {
        // Callback function
        try {
          resource();
        } catch (error) {
          console.error('Error calling cleanup function:', error);
        }
      }
      
      this.resources.delete(id);
      
      if (this.debugMode) {
        console.log(`Resource released: ${id.toString()}`);
      }
    }
  }
  
  /**
   * Create a resource group that can be released together
   */
  createGroup(): ResourceGroup {
    return new ResourceGroup(this);
  }
  
  /**
   * Release all resources
   */
  releaseAll(): void {
    const resourceIds = Array.from(this.resources.keys());
    
    if (this.debugMode) {
      console.log(`Releasing all resources (${resourceIds.length})`);
    }
    
    resourceIds.forEach(id => this.release(id));
  }
  
  /**
   * Check for leaked resources and optionally handle them
   */
  checkForLeaks(): number {
    const leakedCount = this.resources.size;
    
    if (leakedCount > 0 && this.onResourceLeaked) {
      this.resources.forEach(({ resource }) => {
        this.onResourceLeaked?.(resource);
      });
    }
    
    return leakedCount;
  }
  
  /**
   * Set debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}

/**
 * A group of resources that can be released together
 */
class ResourceGroup {
  private manager: ResourceManager;
  private resources: symbol[] = [];
  
  constructor(manager: ResourceManager) {
    this.manager = manager;
  }
  
  /**
   * Add a resource to the group
   */
  add<T>(resource: T, metadata?: Record<string, unknown>): T {
    const managed = this.manager.register(resource, metadata);
    this.resources.push(Symbol('groupResourceId'));
    return managed.resource;
  }
  
  /**
   * Release all resources in the group
   */
  releaseAll(): void {
    this.resources.forEach(id => {
      this.manager.register({ id }).release();
    });
    this.resources = [];
  }
}

// Export singleton instance
export const resourceManager = new ResourceManager();

// Export the class for custom instances
export { ResourceManager, ResourceGroup };

// Export hooks for React integration
export function useResourceManager(options?: ResourceManagerOptions): ResourceManager {
  return new ResourceManager(options);
}

export function useResourceGroup(): ResourceGroup {
  return resourceManager.createGroup();
}
