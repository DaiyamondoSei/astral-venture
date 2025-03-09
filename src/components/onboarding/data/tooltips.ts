
import { FeatureTooltipData } from '../hooks/achievement/types';

/**
 * Feature Tooltips
 * Defines tooltips that guide users to discover features
 */
const featureTooltips: FeatureTooltipData[] = [
  {
    id: 'welcome_tooltip',
    title: 'Welcome to Your Journey',
    description: 'This dashboard is your gateway to spiritual growth and self-discovery.',
    position: 'bottom',
    elementId: 'dashboard-main',
    condition: 'isFirstLogin',
    delay: 1000
  },
  {
    id: 'energy_tooltip',
    title: 'Energy Points',
    description: 'Track your progress with energy points. Earn them through activities and reflections.',
    position: 'bottom',
    elementId: 'energy-display',
    condition: 'hasCompletedWelcome', 
    delay: 2000
  },
  {
    id: 'chakra_tooltip',
    title: 'Chakra System',
    description: 'Activate and balance your chakras to enhance your spiritual journey.',
    position: 'left',
    elementId: 'chakra-display',
    condition: 'hasViewedEnergyTooltip',
    delay: 2000
  },
  {
    id: 'reflection_tooltip',
    title: 'Daily Reflection',
    description: 'Take time each day to reflect on your thoughts and feelings.',
    position: 'right',
    elementId: 'reflection-card',
    condition: 'hasViewedChakraTooltip',
    delay: 2000
  },
  {
    id: 'sacred_geometry_tooltip',
    title: 'Sacred Geometry',
    description: 'Explore the patterns that connect all things in the universe.',
    position: 'top',
    elementId: 'sacred-geometry-icon',
    condition: 'hasCompletedOnboarding',
    delay: 2000
  },
  {
    id: 'meditation_tooltip',
    title: 'Meditation Practices',
    description: 'Discover guided meditations to calm your mind and elevate your consciousness.',
    position: 'left',
    elementId: 'meditation-card',
    condition: 'hasCompletedOnboarding',
    delay: 2000
  },
  {
    id: 'achievement_tooltip',
    title: 'Achievements',
    description: 'Track your progress and unlock special achievements as you grow.',
    position: 'bottom',
    elementId: 'achievements-button',
    condition: 'hasUsedAppForOneDay',
    delay: 2000
  }
];

export default featureTooltips;
