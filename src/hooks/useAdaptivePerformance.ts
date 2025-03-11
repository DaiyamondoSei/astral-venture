
import { useState, useEffect } from 'react';
import { adaptiveRenderer } from '../utils/performance/AdaptiveRenderer';
import { performanceMonitor } from '../utils/performance/performanceMonitor';
import { validationSystem } from '../utils/validation/ValidationSystem';
import { AdaptiveConfig } from '../utils/performance/core/systemTypes';

export const useAdaptivePerformance = () => {
  const [config, setConfig] = useState<AdaptiveConfig>(adaptiveRenderer.getCurrentConfig());

  useEffect(() => {
    const metricsSubscription = performanceMonitor.subscribe((metrics) => {
      const validationResult = validationSystem.validatePerformanceMetrics(metrics);
      
      if (validationResult.valid && validationResult.value) {
        adaptiveRenderer.updateConfiguration({
          fps: metrics.fps || 60,
          memoryUsage: metrics.memoryUsage || 0
        });
        setConfig(adaptiveRenderer.getCurrentConfig());
      }
    });

    return () => {
      metricsSubscription.unsubscribe();
    };
  }, []);

  return {
    config,
    isHighPerformance: config.qualityLevel >= 4,
    isMediumPerformance: config.qualityLevel >= 2 && config.qualityLevel < 4,
    isLowPerformance: config.qualityLevel < 2,
    effectsEnabled: config.effectsEnabled
  };
};
