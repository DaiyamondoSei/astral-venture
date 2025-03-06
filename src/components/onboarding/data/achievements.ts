
import { AchievementData } from './types';

// Basic onboarding achievements from before
export const onboardingAchievements: AchievementData[] = [
  {
    id: 'sacred-geometry-explorer',
    title: 'Sacred Geometry Explorer',
    description: 'Discovered the profound wisdom of sacred geometric patterns',
    icon: 'geometry',
    requiredStep: 'sacred-geometry',
    points: 15,
    type: 'discovery'
  },
  {
    id: 'chakra-awareness',
    title: 'Chakra Awareness',
    description: 'Gained understanding of the seven primary energy centers',
    icon: 'chakra',
    requiredStep: 'chakras',
    points: 20,
    type: 'discovery'
  },
  {
    id: 'energy-adept',
    title: 'Energy Adept',
    description: 'Learned how to recognize and accumulate energy points',
    icon: 'energy',
    requiredStep: 'energy-points',
    points: 25,
    type: 'completion'
  },
  {
    id: 'meditation-initiate',
    title: 'Meditation Initiate',
    description: 'Began your journey into mindful meditation practices',
    icon: 'meditation',
    requiredStep: 'meditation',
    points: 30,
    type: 'completion'
  },
  {
    id: 'reflective-seeker',
    title: 'Reflective Seeker',
    description: 'Embraced the practice of meaningful self-reflection',
    icon: 'reflection',
    requiredStep: 'reflection',
    points: 35,
    type: 'completion'
  },
  {
    id: 'quantum-voyager',
    title: 'Quantum Voyager',
    description: 'Completed your first step into expanded consciousness',
    icon: 'cosmic',
    requiredStep: 'complete',
    points: 50,
    type: 'completion'
  },
  // Interaction-based achievements
  {
    id: 'mindful-explorer',
    title: 'Mindful Explorer',
    description: 'Engaged deeply with meditation concepts and practices',
    icon: 'meditation',
    requiredInteraction: 'meditation_practice_started',
    points: 20,
    type: 'interaction'
  },
  {
    id: 'chakra-master',
    title: 'Chakra Master',
    description: 'Demonstrated comprehensive understanding of all chakras',
    icon: 'chakra',
    requiredSteps: ['chakras', 'meditation', 'reflection'],
    points: 45,
    type: 'completion'
  },
  {
    id: 'consistent-practitioner',
    title: 'Consistent Practitioner',
    description: 'Completed multiple steps in your sacred journey',
    icon: 'energy',
    requiredSteps: ['sacred-geometry', 'chakras', 'energy-points'],
    points: 40,
    type: 'completion'
  },
  
  // New streak-based achievements
  {
    id: 'three-day-streak',
    title: 'Three-Day Resonance',
    description: 'Maintained your practice for three consecutive days',
    icon: 'streak',
    points: 30,
    type: 'streak',
    streakDays: 3
  },
  {
    id: 'seven-day-streak',
    title: 'Seven-Day Harmony',
    description: 'Aligned your chakras for seven consecutive days',
    icon: 'streak',
    points: 75,
    type: 'streak',
    streakDays: 7
  },
  {
    id: 'fourteen-day-streak',
    title: 'Fortnight Flow',
    description: 'Maintained consistent energy flow for two weeks',
    icon: 'streak',
    points: 150,
    type: 'streak',
    streakDays: 14
  },
  {
    id: 'thirty-day-streak',
    title: 'Lunar Cycle Master',
    description: 'Completed a full lunar cycle of daily practice',
    icon: 'streak',
    points: 300,
    type: 'streak',
    streakDays: 30
  },
  
  // Progressive achievements with tiers
  {
    id: 'reflection-journey',
    title: 'Reflection Journey',
    description: 'Documented your spiritual growth through reflections',
    icon: 'journal',
    points: 0, // Base points (will be calculated from tiers)
    type: 'progressive',
    trackedValue: 'reflections',
    tieredLevels: [5, 15, 30, 50, 100],
    pointsPerTier: [25, 50, 75, 100, 200],
    basePoints: 10
  },
  {
    id: 'meditation-depth',
    title: 'Meditation Depth',
    description: 'Deepened your meditation practice over time',
    icon: 'meditation',
    points: 0, // Base points (will be calculated from tiers)
    type: 'progressive',
    trackedValue: 'meditation_minutes',
    tieredLevels: [60, 180, 360, 720, 1440], // In minutes (1hr, 3hrs, 6hrs, 12hrs, 24hrs)
    pointsPerTier: [30, 60, 120, 240, 500],
    basePoints: 15
  },
  
  // Milestone achievements (one-time significant accomplishments)
  {
    id: 'chakra-activation-complete',
    title: 'Full Spectrum Activation',
    description: 'Activated all seven chakras at least once',
    icon: 'cosmic',
    points: 100,
    type: 'milestone',
    progressThreshold: 7,
    trackedValue: 'unique_chakras_activated'
  },
  {
    id: 'energy-centurion',
    title: 'Energy Centurion',
    description: 'Accumulated 100 energy points through consistent practice',
    icon: 'energy',
    points: 50,
    type: 'milestone',
    progressThreshold: 100,
    trackedValue: 'total_energy_points'
  },
  {
    id: 'wisdom-seeker',
    title: 'Wisdom Seeker',
    description: 'Explored 10 different spiritual wisdom resources',
    icon: 'wisdom',
    points: 75,
    type: 'milestone',
    progressThreshold: 10,
    trackedValue: 'wisdom_resources_explored'
  }
];

// Export specialized achievement groups
export const streakAchievements = onboardingAchievements.filter(a => a.type === 'streak');
export const progressiveAchievements = onboardingAchievements.filter(a => a.type === 'progressive');
export const milestoneAchievements = onboardingAchievements.filter(a => a.type === 'milestone');
