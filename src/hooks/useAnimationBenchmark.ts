
import { useCallback, useState } from 'react';
import { BenchmarkResult, benchmarkAnimation, logBenchmarkResults } from '@/utils/performance/animationBenchmark';

interface UseBenchmarkOptions {
  duration?: number;
  autoLog?: boolean;
  onComplete?: (results: BenchmarkResult) => void;
}

/**
 * Hook for benchmarking component animations
 * @param options Benchmark options
 * @returns Functions to start and stop benchmarking and the last results
 */
export function useAnimationBenchmark(options: UseBenchmarkOptions = {}) {
  const { 
    duration = 3000, 
    autoLog = true,
    onComplete 
  } = options;
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult | null>(null);
  const [benchmarkName, setBenchmarkName] = useState('Unnamed Benchmark');
  
  // Start benchmarking with a custom animation function
  const startBenchmark = useCallback((
    animationFn: (timestamp: number) => void | boolean,
    name: string = 'Animation Benchmark'
  ) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setBenchmarkName(name);
    
    benchmarkAnimation(animationFn, duration)
      .then(result => {
        setResults(result);
        setIsRunning(false);
        
        // Auto-log results if enabled
        if (autoLog) {
          logBenchmarkResults(name, result);
        }
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete(result);
        }
      })
      .catch(error => {
        console.error('Error during animation benchmark:', error);
        setIsRunning(false);
      });
  }, [isRunning, duration, autoLog, onComplete]);
  
  // Start benchmarking the render performance of a component
  // Uses a simple counter animation to measure render performance
  const startRenderBenchmark = useCallback((name: string = 'Render Benchmark') => {
    let counter = 0;
    
    startBenchmark(timestamp => {
      // This just increments a counter to force renders
      counter++;
      // Return false to continue benchmarking
      return false;
    }, name);
  }, [startBenchmark]);
  
  return {
    isRunning,
    results,
    startBenchmark,
    startRenderBenchmark,
    benchmarkName
  };
}
