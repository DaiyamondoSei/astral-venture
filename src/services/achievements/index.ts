
// Re-export all achievement services for easier imports
export * from './achievementService';
export * from './achievementAnalytics';

// Export default service object that combines all achievement services
import { achievementService } from './achievementService';
import { achievementAnalytics } from './achievementAnalytics';

// Create combined service
const combinedAchievementService = {
  ...achievementService,
  analytics: achievementAnalytics
};

export default combinedAchievementService;
