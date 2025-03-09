
import { FeatureTooltipData, GuidedTourData } from '../hooks/achievement/types';
import tooltips from './tooltips';
import tours from './tours';
import achievements from './achievements';

// Export all data with correctly typed exports
export const featureTooltips: FeatureTooltipData[] = tooltips;
export const guidedTours: GuidedTourData[] = tours;
export const onboardingAchievements = achievements;
export const progressiveAchievements = achievements;
export const milestoneAchievements = achievements;

// For backward compatibility
export const achievementsList = achievements;
