
export * from './achievementService';
export * from './achievementAnalytics';

import { achievementService } from './achievementService';
import { achievementAnalytics } from './achievementAnalytics';

const achievementServices = {
  service: achievementService,
  analytics: achievementAnalytics
};

export default achievementServices;
