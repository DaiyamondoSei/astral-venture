
import { FeatureTooltipData } from './types';

// Feature discovery tooltips shown after onboarding
export const featureTooltips: FeatureTooltipData[] = [
  {
    id: 'metatrons-cube',
    targetSelector: '.metatrons-cube',
    title: 'Metatron\'s Cube',
    description: 'Explore the sacred geometry of consciousness through this interactive pattern',
    position: 'bottom',
    order: 1,
    requiredStep: 'sacred-geometry'
  },
  {
    id: 'energy-points',
    targetSelector: '.energy-points-display',
    title: 'Energy Points',
    description: 'Track your spiritual growth and unlock new content',
    position: 'left',
    order: 2,
    requiredStep: 'energy-points'
  },
  {
    id: 'chakra-activation',
    targetSelector: '.chakra-display',
    title: 'Chakra Activation',
    description: 'Monitor your active energy centers and their balance',
    position: 'right',
    order: 3,
    requiredStep: 'chakras'
  },
  {
    id: 'daily-practice',
    targetSelector: '.daily-practice-card',
    title: 'Daily Practice',
    description: 'Engage with suggested practices to deepen your journey',
    position: 'top',
    order: 4,
    requiredStep: 'meditation'
  }
];
