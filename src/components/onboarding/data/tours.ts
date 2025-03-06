
import { GuidedTourData } from './types';

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
