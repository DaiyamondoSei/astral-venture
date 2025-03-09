
/**
 * Performance Utilities
 * 
 * This module provides utility functions for performance optimization 
 * and monitoring across the application.
 */

// Throttle function to limit how often a function can be called
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  let lastCall = 0;
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func(...args);
    }
    return undefined;
  };
};

// Debounce function to delay function execution until after a period of inactivity
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Performance categories for component classification
export enum PerformanceCategory {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Get performance category based on component name or metrics
export const getPerformanceCategory = (
  componentName: string,
  renderTime?: number
): PerformanceCategory => {
  // Critical components that affect user interaction
  const criticalComponents = [
    'button',
    'input',
    'form',
    'navbar',
    'sidebar',
    'menu',
    'dialog',
  ];
  
  // High priority visual components
  const highPriorityComponents = [
    'card',
    'header',
    'footer',
    'chart',
    'astral',
    'chakra',
    'energy',
  ];
  
  // Check if component name includes any critical terms
  if (criticalComponents.some(term => 
    componentName.toLowerCase().includes(term))) {
    return PerformanceCategory.CRITICAL;
  }
  
  // Check if component name includes any high priority terms
  if (highPriorityComponents.some(term => 
    componentName.toLowerCase().includes(term))) {
    return PerformanceCategory.HIGH;
  }
  
  // If render time is provided, categorize based on that
  if (renderTime !== undefined) {
    if (renderTime > 50) {
      return PerformanceCategory.HIGH;
    } else if (renderTime > 20) {
      return PerformanceCategory.MEDIUM;
    }
  }
  
  // Default to low priority
  return PerformanceCategory.LOW;
};

// Calculate performance score from 0-100 based on metrics
export const calculatePerformanceScore = (
  renderTime: number,
  renderCount: number,
  componentDepth: number = 1
): number => {
  // Base score: 100 is perfect
  let score = 100;
  
  // Deduct points for render time
  // 0-10ms: no deduction 
  // 10-20ms: -5 points
  // 20-50ms: -10 points
  // 50-100ms: -20 points
  // >100ms: -30 points
  if (renderTime > 100) {
    score -= 30;
  } else if (renderTime > 50) {
    score -= 20;
  } else if (renderTime > 20) {
    score -= 10;
  } else if (renderTime > 10) {
    score -= 5;
  }
  
  // Deduct points for render count (per session)
  // 1-5: no deduction
  // 6-10: -5 points
  // 11-20: -10 points
  // >20: -15 points
  if (renderCount > 20) {
    score -= 15;
  } else if (renderCount > 10) {
    score -= 10;
  } else if (renderCount > 5) {
    score -= 5;
  }
  
  // Deduct points for component depth
  // 1-3: no deduction
  // 4-6: -5 points
  // >6: -10 points
  if (componentDepth > 6) {
    score -= 10;
  } else if (componentDepth > 3) {
    score -= 5;
  }
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
};

// Determine if a component needs optimization based on metrics
export const needsOptimization = (
  renderTime: number,
  renderCount: number,
  componentDepth: number = 1
): boolean => {
  const score = calculatePerformanceScore(renderTime, renderCount, componentDepth);
  return score < 70; // Any score below 70 suggests optimization is needed
};
