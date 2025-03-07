
/**
 * DOM Optimization Utilities
 * Tools to minimize reflows and repaints and improve scrolling performance
 */

// Track elements with optimizations applied
const optimizedElements = new WeakMap<Element, boolean>();

/**
 * Apply performance optimizations to DOM elements
 * @param element The DOM element to optimize
 * @param options Configuration options
 */
export function optimizeElement(
  element: HTMLElement,
  options: {
    containContents?: boolean; // Use CSS contain property
    accelerateLayer?: boolean; // Force GPU acceleration
    disableAnimations?: boolean; // Disable animations for reduced motion
    debounceResize?: boolean; // Apply resize debouncing
    optimizeImages?: boolean; // Optimize images inside the element
    optimizeScrolling?: boolean; // Optimize for scrolling performance
  } = {}
): void {
  if (!element || optimizedElements.has(element)) return;
  
  const {
    containContents = true,
    accelerateLayer = true,
    disableAnimations = false,
    debounceResize = true,
    optimizeImages = true,
    optimizeScrolling = true
  } = options;
  
  // Apply will-change judiciously
  if (accelerateLayer) {
    // Only apply GPU acceleration when needed for animations or transforms
    if (element.classList.contains('animate') || 
        getComputedStyle(element).transform !== 'none') {
      element.style.willChange = 'transform';
    }
  }
  
  // Apply CSS containment for performance
  if (containContents) {
    element.style.contain = 'content';
  }
  
  // Reduce motion if requested
  if (disableAnimations && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.style.animationDuration = '0.0001s';
    element.style.transitionDuration = '0.0001s';
  }
  
  // Apply resize debouncing to prevent layout thrashing
  if (debounceResize) {
    applyResizeDebouncing(element);
  }
  
  // Optimize images within the element
  if (optimizeImages) {
    optimizeChildImages(element);
  }
  
  // Scrolling optimizations
  if (optimizeScrolling && (
    element.scrollHeight > element.clientHeight || 
    element.scrollWidth > element.clientWidth
  )) {
    optimizeForScrolling(element);
  }
  
  // Mark as optimized
  optimizedElements.set(element, true);
}

/**
 * Apply resize debouncing to prevent layout thrashing during resize
 */
function applyResizeDebouncing(element: HTMLElement): void {
  let resizeTimeout: number;
  const originalDisplay = element.style.display;
  
  window.addEventListener('resize', () => {
    // Skip if element is no longer in DOM
    if (!document.body.contains(element)) return;
    
    if (!resizeTimeout) {
      // Apply content-visibility to skip rendering during rapid resizes
      element.style.contentVisibility = 'auto';
    }
    
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      element.style.contentVisibility = '';
      resizeTimeout = 0;
    }, 100);
  }, { passive: true });
}

/**
 * Optimize child images for performance
 */
function optimizeChildImages(parentElement: HTMLElement): void {
  const images = parentElement.querySelectorAll('img');
  
  images.forEach(img => {
    // Skip already processed images
    if (img.dataset.optimized === 'true') return;
    
    // Mark as optimized
    img.dataset.optimized = 'true';
    
    // Prevent reflow during image load
    if (!img.getAttribute('width') && !img.getAttribute('height')) {
      img.style.aspectRatio = '16/9'; // Default aspect ratio to prevent layout shift
    }
    
    // Add loading="lazy" for images not in viewport
    if (!img.hasAttribute('loading')) {
      const rect = img.getBoundingClientRect();
      const isInViewport = (
        rect.top <= window.innerHeight &&
        rect.bottom >= 0
      );
      
      if (!isInViewport) {
        img.loading = 'lazy';
      }
    }
    
    // Add decoding="async" for non-critical images
    if (!img.hasAttribute('decoding') && !img.classList.contains('critical')) {
      img.decoding = 'async';
    }
  });
}

/**
 * Apply optimization techniques for scrolling containers
 */
function optimizeForScrolling(element: HTMLElement): void {
  // Enable pointer events only on hover to improve scroll performance
  element.addEventListener('mouseover', () => {
    element.style.pointerEvents = 'auto';
  });
  
  element.addEventListener('mouseleave', () => {
    if (element.dataset.scrolling === 'true') {
      element.style.pointerEvents = 'none';
    }
  });
  
  // Track scrolling state
  let scrollTimeout: number;
  
  element.addEventListener('scroll', () => {
    element.dataset.scrolling = 'true';
    
    // Disable pointer events during scroll for better performance
    element.style.pointerEvents = 'none';
    
    // Disable non-essential animations during scroll
    element.classList.add('optimize-scrolling');
    
    clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(() => {
      element.style.pointerEvents = 'auto';
      element.classList.remove('optimize-scrolling');
      element.dataset.scrolling = 'false';
    }, 100);
  }, { passive: true });
  
  // Add content-visibility for non-visible children in long scrolling containers
  if ('contentVisibility' in document.documentElement.style && 
      element.children.length > 20) {
      
    // Apply content-visibility: auto to children far from viewport
    Array.from(element.children).forEach((child, index) => {
      if (child instanceof HTMLElement) {
        if (index > 10) {
          child.style.contentVisibility = 'auto';
          child.style.containIntrinsicSize = '0 100px'; // Prevent layout shift
        }
      }
    });
  }
}

/**
 * Create and maintain a virtual scrolling system for large lists
 * Only renders items currently in or near the viewport
 */
export class VirtualScrollManager {
  private container: HTMLElement;
  private itemHeight: number;
  private totalItems: number;
  private renderBuffer: number;
  private scrollTop: number = 0;
  private visibleItems: Map<number, HTMLElement> = new Map();
  private renderCallback: (index: number) => HTMLElement;
  private observer: IntersectionObserver;
  
  constructor(
    container: HTMLElement,
    options: {
      itemHeight: number,
      totalItems: number,
      renderBuffer?: number,
      renderItem: (index: number) => HTMLElement
    }
  ) {
    this.container = container;
    this.itemHeight = options.itemHeight;
    this.totalItems = options.totalItems;
    this.renderBuffer = options.renderBuffer || 5;
    this.renderCallback = options.renderItem;
    
    // Create intersection observer to monitor viewport
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { root: container, rootMargin: '200px 0px' }
    );
    
    // Initialize virtual scroll
    this.initialize();
    
    // Listen for scroll events
    this.container.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
  }
  
  private initialize(): void {
    // Set container height to accommodate all items
    this.container.style.position = 'relative';
    this.container.style.height = `${this.totalItems * this.itemHeight}px`;
    
    // Initial render of visible items
    this.updateVisibleItems();
  }
  
  private handleScroll(): void {
    this.scrollTop = this.container.scrollTop;
    this.updateVisibleItems();
  }
  
  private updateVisibleItems(): void {
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.renderBuffer);
    const endIndex = Math.min(
      this.totalItems - 1, 
      Math.ceil((this.scrollTop + this.container.clientHeight) / this.itemHeight) + this.renderBuffer
    );
    
    // Remove items that are no longer visible
    this.visibleItems.forEach((element, index) => {
      if (index < startIndex || index > endIndex) {
        element.remove();
        this.visibleItems.delete(index);
      }
    });
    
    // Add new visible items
    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.visibleItems.has(i)) {
        const element = this.renderCallback(i);
        element.style.position = 'absolute';
        element.style.top = `${i * this.itemHeight}px`;
        element.style.height = `${this.itemHeight}px`;
        element.style.width = '100%';
        
        this.container.appendChild(element);
        this.visibleItems.set(i, element);
        this.observer.observe(element);
      }
    }
  }
  
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    // Handle visibility changes
    entries.forEach(entry => {
      const element = entry.target as HTMLElement;
      const index = Array.from(this.visibleItems.entries())
        .find(([_, el]) => el === element)?.[0];
      
      if (index !== undefined) {
        if (!entry.isIntersecting) {
          // Optional: reduce details for non-visible items
          element.classList.add('off-screen');
        } else {
          element.classList.remove('off-screen');
        }
      }
    });
  }
  
  // Public methods
  public refresh(): void {
    this.container.style.height = `${this.totalItems * this.itemHeight}px`;
    this.visibleItems.clear();
    this.container.innerHTML = '';
    this.updateVisibleItems();
  }
  
  public updateItemCount(count: number): void {
    this.totalItems = count;
    this.refresh();
  }
  
  public dispose(): void {
    this.observer.disconnect();
    this.container.removeEventListener('scroll', this.handleScroll.bind(this));
  }
}
