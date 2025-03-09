
import { FeatureTooltipData, GuidedTourData } from '../hooks/achievement/types';
import tooltips from './tooltips';
import tours from './tours';
import achievements from './achievements';

// Export all data with correct types
export { 
  tooltips as featureTooltips,
  tours as guidedTours,
  achievements as onboardingAchievements,
  achievements as progressiveAchievements,
  achievements as milestoneAchievements
};

// Explicitly export typed data for proper imports
export const featureTooltips: FeatureTooltipData[] = tooltips;
export const guidedTours: GuidedTourData[] = tours;

// For backward compatibility
export const achievementsList = achievements;
