
// This file defines the data for onboarding achievements and feature discovery

export interface AchievementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredStep?: string;
  requiredInteraction?: string;
  requiredSteps?: string[];
  points: number;
  type: 'discovery' | 'completion' | 'interaction';
}

export interface FeatureTooltipData {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  order: number;
  requiredStep?: string;
}

export interface GuidedTourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

export interface GuidedTourData {
  id: string;
  title: string;
  description: string;
  steps: GuidedTourStep[];
  requiredStep?: string;
}

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
  // New interaction-based achievements
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

// Guided tours available after onboarding
export const guidedTours: GuidedTourData[] = [
  {
    id: 'sacred-geometry-tour',
    title: 'Sacred Geometry Explorer',
    description: 'Discover the profound connections in geometric patterns',
    requiredStep: 'sacred-geometry',
    steps: [
      {
        id: 'step-1',
        target: '.metatrons-cube',
        title: 'Metatron\'s Cube',
        content: 'The foundational pattern connecting all geometric forms',
        position: 'bottom'
      },
      {
        id: 'step-2',
        target: '.geometry-node-flower-of-life',
        title: 'Flower of Life',
        content: 'The pattern of creation containing all geometric forms',
        position: 'right'
      },
      {
        id: 'step-3',
        target: '.geometry-node-merkaba',
        title: 'Merkaba',
        content: 'The light vehicle used for connecting with higher consciousness',
        position: 'left'
      }
    ]
  },
  {
    id: 'chakra-tour',
    title: 'Chakra System Guide',
    description: 'Explore your seven primary energy centers',
    requiredStep: 'chakras',
    steps: [
      {
        id: 'step-1',
        target: '.chakra-display',
        title: 'Your Chakra System',
        content: 'Overview of your active energy centers',
        position: 'right'
      },
      {
        id: 'step-2',
        target: '.chakra-display-crown',
        title: 'Crown Chakra',
        content: 'Connection to higher consciousness and spiritual awareness',
        position: 'top'
      },
      {
        id: 'step-3',
        target: '.chakra-display-root',
        title: 'Root Chakra',
        content: 'Foundation for stability and groundedness',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'meditation-practice-tour',
    title: 'Meditation Practices',
    description: 'Learn about various meditation techniques to enhance your practice',
    requiredStep: 'meditation',
    steps: [
      {
        id: 'step-1',
        target: '.meditation-timer',
        title: 'Meditation Timer',
        content: 'Set your meditation duration and track your sessions',
        position: 'bottom'
      },
      {
        id: 'step-2',
        target: '.meditation-techniques',
        title: 'Meditation Techniques',
        content: 'Explore different meditation approaches for various purposes',
        position: 'right'
      },
      {
        id: 'step-3',
        target: '.meditation-progress',
        title: 'Track Your Progress',
        content: 'Monitor your meditation journey and growth over time',
        position: 'top'
      }
    ]
  }
];
