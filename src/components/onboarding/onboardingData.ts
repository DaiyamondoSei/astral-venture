
// Types for onboarding data
export interface OnboardingTooltip {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  order?: number;
}

export interface OnboardingTour {
  id: string;
  title: string;
  description: string;
  steps: {
    id: string;
    targetSelector: string;
    title: string;
    description: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
  }[];
}

// Feature introduction tooltips
export const featureTooltips: OnboardingTooltip[] = [
  {
    id: 'metatrons-cube',
    targetSelector: '.metatrons-cube-container',
    title: 'Metatron\'s Cube',
    description: 'Click on any node to explore different aspects of your spiritual practice.',
    position: 'right',
    order: 1
  },
  {
    id: 'energy-points',
    targetSelector: '.energy-points-display',
    title: 'Energy Points',
    description: 'Track your spiritual growth and progress toward higher levels of consciousness.',
    position: 'bottom',
    order: 2
  },
  {
    id: 'chakra-display',
    targetSelector: '.chakra-display',
    title: 'Chakra Activation',
    description: 'See which of your energy centers are active and balanced.',
    position: 'left',
    order: 3
  },
  {
    id: 'ai-assistant',
    targetSelector: '.ai-assistant-button',
    title: 'AI Guide',
    description: 'Ask questions about sacred geometry, energy practices, or get personalized guidance.',
    position: 'bottom',
    order: 4
  }
];

// Guided tours
export const guidedTours: OnboardingTour[] = [
  {
    id: 'sacred-geometry-intro',
    title: 'Sacred Geometry Introduction',
    description: 'Learn about the patterns and symbols of sacred geometry',
    steps: [
      {
        id: 'metatrons-cube-center',
        targetSelector: '.central-node',
        title: 'The Center Point',
        description: 'The center of Metatron\'s Cube represents your consciousness and serves as the starting point of creation.',
        position: 'bottom'
      },
      {
        id: 'sacred-geometry-nodes',
        targetSelector: '.geometry-node',
        title: 'Geometric Nodes',
        description: 'Each node represents a different aspect of spiritual practice and cosmic wisdom.',
        position: 'right'
      },
      {
        id: 'node-connections',
        targetSelector: '.node-connections',
        title: 'Sacred Connections',
        description: 'The lines connecting the nodes represent the flow of energy and the interconnectedness of all aspects of your practice.',
        position: 'top'
      }
    ]
  },
  {
    id: 'chakra-system-tour',
    title: 'Chakra System Tour',
    description: 'Understand your energy centers and how to activate them',
    steps: [
      {
        id: 'chakra-overview',
        targetSelector: '.chakra-display',
        title: 'Your Chakra System',
        description: 'This shows your seven main energy centers and their current activation status.',
        position: 'left'
      },
      {
        id: 'activated-chakras',
        targetSelector: '.activated-chakra',
        title: 'Activated Chakras',
        description: 'Glowing chakras indicate energy centers you have activated through your practice.',
        position: 'bottom'
      },
      {
        id: 'chakra-balance',
        targetSelector: '.chakra-balance-indicator',
        title: 'Chakra Balance',
        description: 'This indicator shows how balanced your energy system is across all chakras.',
        position: 'right'
      }
    ]
  }
];
