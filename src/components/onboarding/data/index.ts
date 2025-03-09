
import achievements from './achievements';
import tooltips from './tooltips';
import { guidedTours } from './tours';

export { achievements, tooltips, guidedTours };

// Export as namespace for backwards compatibility
export const onboardingData = {
  achievements,
  tooltips,
  guidedTours
};

export default onboardingData;
