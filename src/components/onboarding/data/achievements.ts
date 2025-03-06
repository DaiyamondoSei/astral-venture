
import { AchievementData } from './types';

// Achievements that can be earned during onboarding
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
  }
];
