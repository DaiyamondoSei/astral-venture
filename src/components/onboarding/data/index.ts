
import achievements from './achievements';
import tooltips from './tooltips';
import { guidedTours } from './tours';

// Export directly for easy imports
export { achievements, tooltips, guidedTours };

// Also export as named exports for components that expect them
export const featureTooltips = tooltips;
export const onboardingAchievements = achievements;

// Export as namespace for backwards compatibility
export const onboardingData = {
  achievements,
  tooltips,
  guidedTours
};

export default onboardingData;
