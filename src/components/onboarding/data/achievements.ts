
import { IAchievementData } from '../hooks/achievement/types';

/**
 * Achievement Data
 * Defines all available achievements in the system
 */
const achievements: IAchievementData[] = [
  {
    id: 'welcome_achievement',
    title: 'First Steps',
    description: 'Started your journey of self-discovery',
    icon: 'sunrise',
    requiredStep: 'welcome',
    points: 10,
    type: 'discovery',
    category: 'onboarding',
    tier: 1,
    requiredAmount: 1
  },
  {
    id: 'chakra_learning',
    title: 'Chakra Explorer',
    description: 'Learned about the chakra system',
    icon: 'lotus',
    requiredStep: 'chakras',
    points: 15,
    type: 'discovery',
    category: 'knowledge',
    tier: 1,
    requiredAmount: 1
  },
  {
    id: 'energy_understanding',
    title: 'Energy Adept',
    description: 'Understood the concept of energy points',
    icon: 'zap',
    requiredStep: 'energy',
    points: 15,
    type: 'discovery',
    category: 'knowledge',
    tier: 1,
    requiredAmount: 1
  },
  {
    id: 'meditation_basics',
    title: 'Meditation Initiate',
    description: 'Learned the basics of meditation practice',
    icon: 'moon',
    requiredStep: 'meditation',
    points: 20,
    type: 'discovery',
    category: 'practice',
    tier: 1,
    requiredAmount: 1
  },
  {
    id: 'reflection_discovery',
    title: 'Self-Reflection Pioneer',
    description: 'Discovered the power of reflection',
    icon: 'book-open',
    requiredStep: 'reflection',
    points: 20,
    type: 'discovery',
    category: 'practice',
    tier: 1,
    requiredAmount: 1
  },
  {
    id: 'sacred_geometry',
    title: 'Sacred Geometry Apprentice',
    description: 'Explored the meaning of sacred geometry',
    icon: 'hexagon',
    requiredStep: 'sacred-geometry',
    points: 25,
    type: 'discovery',
    category: 'knowledge',
    tier: 1,
    requiredAmount: 1
  },
  {
    id: 'first_interaction',
    title: 'First Interaction',
    description: 'Made your first interaction with the interface',
    icon: 'mouse-pointer',
    requiredInteraction: 'any',
    points: 5,
    type: 'interaction',
    category: 'engagement',
    tier: 1,
    requiredAmount: 1
  },
  {
    id: 'onboarding_halfway',
    title: 'Halfway There',
    description: 'Completed half of the onboarding process',
    icon: 'milestone',
    requiredSteps: ['welcome', 'chakras', 'energy'],
    points: 30,
    type: 'milestone',
    category: 'onboarding',
    tier: 1,
    requiredAmount: 3
  },
  {
    id: 'onboarding_complete',
    title: 'Journey Begins',
    description: 'Completed the entire onboarding process',
    icon: 'award',
    requiredSteps: ['welcome', 'chakras', 'energy', 'meditation', 'reflection', 'sacred-geometry'],
    points: 50,
    type: 'completion',
    category: 'onboarding',
    tier: 1,
    requiredAmount: 6
  },
  
  // Streak-based achievements
  {
    id: 'three_day_streak',
    title: 'Consistent Seeker',
    description: 'Maintained activity for 3 consecutive days',
    icon: 'calendar',
    points: 30,
    type: 'streak',
    streakDays: 3,
    category: 'consistency',
    tier: 1,
    requiredAmount: 3
  },
  {
    id: 'seven_day_streak',
    title: 'Weekly Devotion',
    description: 'Maintained activity for 7 consecutive days',
    icon: 'calendar-check',
    points: 70,
    type: 'streak',
    streakDays: 7,
    category: 'consistency',
    tier: 2,
    requiredAmount: 7
  },
  {
    id: 'fourteen_day_streak',
    title: 'Fortnight Focus',
    description: 'Maintained activity for 14 consecutive days',
    icon: 'calendar-plus',
    points: 140,
    type: 'streak',
    streakDays: 14,
    category: 'consistency',
    tier: 3,
    requiredAmount: 14
  },
  {
    id: 'thirty_day_streak',
    title: 'Monthly Mastery',
    description: 'Maintained activity for 30 consecutive days',
    icon: 'calendar-range',
    points: 300,
    type: 'streak',
    streakDays: 30,
    category: 'consistency',
    tier: 4,
    requiredAmount: 30
  },
  
  // Chakra-based achievements
  {
    id: 'root_chakra',
    title: 'Root Stability',
    description: 'Activated the Root Chakra',
    icon: 'anchor',
    points: 25,
    type: 'milestone',
    category: 'chakra',
    tier: 1,
    requiredAmount: 1,
    progressThreshold: 100,
    trackedValue: 'chakra_1_activation'
  },
  {
    id: 'sacral_chakra',
    title: 'Creative Flow',
    description: 'Activated the Sacral Chakra',
    icon: 'droplet',
    points: 25,
    type: 'milestone',
    category: 'chakra',
    tier: 1,
    requiredAmount: 1,
    progressThreshold: 100,
    trackedValue: 'chakra_2_activation'
  },
  {
    id: 'solar_plexus_chakra',
    title: 'Personal Power',
    description: 'Activated the Solar Plexus Chakra',
    icon: 'sun',
    points: 25,
    type: 'milestone',
    category: 'chakra',
    tier: 1,
    requiredAmount: 1,
    progressThreshold: 100,
    trackedValue: 'chakra_3_activation'
  },
  {
    id: 'heart_chakra',
    title: 'Compassionate Heart',
    description: 'Activated the Heart Chakra',
    icon: 'heart',
    points: 25,
    type: 'milestone',
    category: 'chakra',
    tier: 1,
    requiredAmount: 1,
    progressThreshold: 100,
    trackedValue: 'chakra_4_activation'
  },
  {
    id: 'throat_chakra',
    title: 'Authentic Voice',
    description: 'Activated the Throat Chakra',
    icon: 'message-circle',
    points: 25,
    type: 'milestone',
    category: 'chakra',
    tier: 1,
    requiredAmount: 1,
    progressThreshold: 100,
    trackedValue: 'chakra_5_activation'
  },
  {
    id: 'third_eye_chakra',
    title: 'Inner Vision',
    description: 'Activated the Third Eye Chakra',
    icon: 'eye',
    points: 25,
    type: 'milestone',
    category: 'chakra',
    tier: 1,
    requiredAmount: 1,
    progressThreshold: 100,
    trackedValue: 'chakra_6_activation'
  },
  {
    id: 'crown_chakra',
    title: 'Higher Consciousness',
    description: 'Activated the Crown Chakra',
    icon: 'star',
    points: 25,
    type: 'milestone',
    category: 'chakra',
    tier: 1,
    requiredAmount: 1,
    progressThreshold: 100,
    trackedValue: 'chakra_7_activation'
  },
  
  // Energy point milestones
  {
    id: 'energy_milestone_100',
    title: 'Energy Novice',
    description: 'Accumulated 100 energy points',
    icon: 'battery',
    points: 25,
    type: 'progressive',
    category: 'progress',
    tier: 1,
    requiredAmount: 100,
    progressThreshold: 100,
    trackedValue: 'total_energy_points'
  },
  {
    id: 'energy_milestone_500',
    title: 'Energy Adept',
    description: 'Accumulated 500 energy points',
    icon: 'battery-charging',
    points: 50,
    type: 'progressive',
    category: 'progress',
    tier: 2,
    requiredAmount: 500,
    progressThreshold: 500,
    trackedValue: 'total_energy_points'
  },
  {
    id: 'energy_milestone_1000',
    title: 'Energy Master',
    description: 'Accumulated 1000 energy points',
    icon: 'zap',
    points: 100,
    type: 'progressive',
    category: 'progress',
    tier: 3,
    requiredAmount: 1000,
    progressThreshold: 1000,
    trackedValue: 'total_energy_points'
  }
];

export default achievements;
