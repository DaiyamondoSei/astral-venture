
import { FeatureTooltipData, GuidedTourData } from '../hooks/achievement/types';
import tooltips from './tooltips';
import tours from './tours';
import achievements from './achievements';

// Export all data
export { 
  tooltips as featureTooltips,
  tours as guidedTours,
  achievements as onboardingAchievements,
  achievements as progressiveAchievements,
  achievements as milestoneAchievements
};

// For backward compatibility
export const achievementsList = achievements;
