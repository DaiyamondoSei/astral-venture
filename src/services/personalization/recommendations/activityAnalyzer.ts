
import { UserActivity } from '../types';
import { ActivityAnalysisResult } from './types';

/**
 * Analyze user activities to extract relevant data for recommendations
 */
export function analyzeUserActivities(activities: UserActivity[]): ActivityAnalysisResult {
  // Initialize analysis result
  const result: ActivityAnalysisResult = {
    recentlyViewedContentIds: [],
    userEmotions: [],
    chakraActivationCount: {},
    completionRates: {}
  };
  
  // Extract recently viewed content IDs (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  activities.forEach(activity => {
    const activityDate = new Date(activity.timestamp);
    
    // Process content views
    if (activity.activityType === 'content_view' && activity.metadata?.contentId) {
      // Add to recently viewed if viewed in the last 7 days
      if (activityDate >= sevenDaysAgo) {
        result.recentlyViewedContentIds.push(activity.metadata.contentId as string);
      }
      
      // Track completion rates
      if (activity.completionRate && activity.metadata?.contentId) {
        result.completionRates[activity.metadata.contentId as string] = activity.completionRate;
      }
    }
    
    // Collect emotional responses from reflections
    if (activity.activityType === 'reflection' && activity.emotionalResponse) {
      result.userEmotions.push(...activity.emotionalResponse);
    }
    
    // Track chakra activations
    if (activity.chakrasActivated && activity.chakrasActivated.length > 0) {
      activity.chakrasActivated.forEach(chakra => {
        result.chakraActivationCount[chakra] = (result.chakraActivationCount[chakra] || 0) + 1;
      });
    }
  });
  
  return result;
}
