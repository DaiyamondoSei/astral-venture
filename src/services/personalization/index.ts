
// Export all personalization services
export * from './types';
export * from './preferencesService';
export * from './recommendationEngine';
export * from './activityTracking';
export * from './personalizationMetrics';

// Export recommendation related types 
export * from './recommendations/types';

// Import all services for the combined export
import { preferencesService } from './preferencesService';
import { recommendationEngine } from './recommendationEngine';
import { activityTrackingService } from './activityTracking';
import { personalizationMetricsService } from './personalizationMetrics';

// Export a combined service object
export const personalizationService = {
  preferences: preferencesService,
  recommendations: recommendationEngine,
  activity: activityTrackingService,
  metrics: personalizationMetricsService
};
