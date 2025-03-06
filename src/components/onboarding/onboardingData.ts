
// Types for onboarding data
export interface OnboardingTooltip {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  order?: number;
  imageUrl?: string;
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
    accentColor?: string;
    imageUrl?: string;
  }[];
}

// Feature introduction tooltips - enhanced with better descriptions and ordering
export const featureTooltips: OnboardingTooltip[] = [
  {
    id: 'metatrons-cube',
    targetSelector: '.metatrons-cube-container',
    title: 'Metatron\'s Cube',
    description: 'This sacred geometry pattern contains all Platonic solids and serves as your navigation hub. Click on any node to explore different aspects of your spiritual practice.',
    position: 'right',
    order: 1
  },
  {
    id: 'energy-points',
    targetSelector: '.energy-points-display',
    title: 'Energy Points',
    description: 'These points represent your spiritual progress. Gain points through meditation, reflection, and completing challenges to unlock higher levels of consciousness.',
    position: 'bottom',
    order: 2
  },
  {
    id: 'chakra-display',
    targetSelector: '.chakra-display',
    title: 'Chakra Activation',
    description: 'Your seven energy centers visualized. As you progress in your practice, you\'ll activate and balance these chakras, enhancing your spiritual connection.',
    position: 'left',
    order: 3
  },
  {
    id: 'ai-assistant',
    targetSelector: '.ai-assistant-button',
    title: 'Cosmic Guide',
    description: 'Your AI spiritual companion is here to answer questions, provide personalized guidance, and help interpret your experiences. Tap to connect with higher wisdom.',
    position: 'bottom',
    order: 4
  },
  {
    id: 'daily-challenge',
    targetSelector: '.daily-challenge-card',
    title: 'Daily Sacred Practice',
    description: 'Each day presents a new opportunity for growth. Complete daily challenges to maintain your practice streak and develop spiritual discipline.',
    position: 'top',
    order: 5
  },
  {
    id: 'reflection-journal',
    targetSelector: '.reflection-journal-button',
    title: 'Reflection Journal',
    description: 'Document your spiritual insights and track your inner growth. Regular reflection accelerates your spiritual evolution and chakra activation.',
    position: 'left',
    order: 6
  }
];

// Guided tours - enhanced with more educational content and visuals
export const guidedTours: OnboardingTour[] = [
  {
    id: 'sacred-geometry-intro',
    title: 'Sacred Geometry Introduction',
    description: 'Discover how geometric patterns reveal the mathematical foundation of creation',
    steps: [
      {
        id: 'metatrons-cube-center',
        targetSelector: '.central-node',
        title: 'The Center Point',
        description: 'The center of Metatron\'s Cube represents your consciousness and serves as the starting point of creation. All sacred forms emanate from this central point of unity.',
        position: 'bottom',
        accentColor: '#8855ff'
      },
      {
        id: 'sacred-geometry-nodes',
        targetSelector: '.geometry-node',
        title: 'Geometric Nodes',
        description: 'Each node represents a different aspect of spiritual practice. The geometric arrangement follows the pattern of the Flower of Life, one of the oldest sacred symbols.',
        position: 'right',
        accentColor: '#5588ff'
      },
      {
        id: 'node-connections',
        targetSelector: '.node-connections',
        title: 'Sacred Connections',
        description: 'The lines connecting the nodes represent energy flow between different aspects of your practice. In sacred geometry, these connections reveal how all aspects of existence are interconnected.',
        position: 'top',
        accentColor: '#44aaff'
      },
      {
        id: 'platonic-solids',
        targetSelector: '.platonic-solids-visual',
        title: 'Platonic Solids',
        description: 'Hidden within Metatron\'s Cube are the five Platonic solids—the building blocks of all matter in the universe: tetrahedron (fire), hexahedron (earth), octahedron (air), dodecahedron (ether), and icosahedron (water).',
        position: 'left',
        accentColor: '#33ccff'
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
        description: 'The seven main chakras are energy centers aligned along your spine, from the base to the crown of your head. Each governs different aspects of your physical, emotional, and spiritual well-being.',
        position: 'left',
        accentColor: '#ff5588'
      },
      {
        id: 'root-chakra',
        targetSelector: '.root-chakra',
        title: 'Root Chakra (Muladhara)',
        description: 'Located at the base of your spine, this red chakra governs your sense of safety, stability, and basic needs. When balanced, you feel grounded and secure in your existence.',
        position: 'right',
        accentColor: '#ff3333'
      },
      {
        id: 'sacral-chakra',
        targetSelector: '.sacral-chakra',
        title: 'Sacral Chakra (Svadhisthana)',
        description: 'Located in your lower abdomen, this orange chakra governs creativity, pleasure, and emotional well-being. When balanced, you feel passionate and can express your emotions healthily.',
        position: 'right',
        accentColor: '#ff8833'
      },
      {
        id: 'solar-plexus-chakra',
        targetSelector: '.solar-plexus-chakra',
        title: 'Solar Plexus Chakra (Manipura)',
        description: 'Located in your upper abdomen, this yellow chakra governs personal power, confidence, and self-esteem. When balanced, you feel empowered to manifest your intentions.',
        position: 'right',
        accentColor: '#ffcc33'
      },
      {
        id: 'heart-chakra',
        targetSelector: '.heart-chakra',
        title: 'Heart Chakra (Anahata)',
        description: 'Located at your heart center, this green chakra governs love, compassion, and connection. When balanced, you can give and receive love freely and feel deeply connected to others.',
        position: 'right',
        accentColor: '#33cc66'
      },
      {
        id: 'throat-chakra',
        targetSelector: '.throat-chakra',
        title: 'Throat Chakra (Vishuddha)',
        description: 'Located in your throat, this blue chakra governs communication, self-expression, and truth. When balanced, you can express your authentic self clearly and listen deeply to others.',
        position: 'right',
        accentColor: '#3399ff'
      },
      {
        id: 'third-eye-chakra',
        targetSelector: '.third-eye-chakra',
        title: 'Third Eye Chakra (Ajna)',
        description: 'Located between your eyebrows, this indigo chakra governs intuition, imagination, and higher wisdom. When balanced, you have clear perception beyond the physical world.',
        position: 'right',
        accentColor: '#6633cc'
      },
      {
        id: 'crown-chakra',
        targetSelector: '.crown-chakra',
        title: 'Crown Chakra (Sahasrara)',
        description: 'Located at the top of your head, this violet/white chakra governs spiritual connection and enlightenment. When balanced, you experience unity with the divine and universal consciousness.',
        position: 'right',
        accentColor: '#cc33ff'
      }
    ]
  },
  {
    id: 'meditation-practices',
    title: 'Meditation Practices',
    description: 'Learn different meditation techniques to expand your consciousness',
    steps: [
      {
        id: 'meditation-overview',
        targetSelector: '.meditation-node',
        title: 'Meditation Portal',
        description: 'This sacred space offers various meditation practices designed to activate different aspects of your consciousness. Regular meditation is key to spiritual growth.',
        position: 'bottom',
        accentColor: '#9966ff'
      },
      {
        id: 'breath-meditation',
        targetSelector: '.breath-meditation',
        title: 'Breath Awareness',
        description: 'The foundation of meditation practice. By focusing on your breath, you anchor yourself in the present moment and calm the fluctuations of your mind.',
        position: 'right',
        accentColor: '#6699ff'
      },
      {
        id: 'visualization-meditation',
        targetSelector: '.visualization-meditation',
        title: 'Sacred Visualization',
        description: 'Using the mind's eye to visualize sacred symbols, these practices activate your imagination and strengthen your connection to higher dimensions.',
        position: 'left',
        accentColor: '#33ccff'
      },
      {
        id: 'mantra-meditation',
        targetSelector: '.mantra-meditation',
        title: 'Mantra Recitation',
        description: 'Sacred sounds that resonate with specific energy frequencies. Mantras create vibrations that align your energy centers and attune you to cosmic consciousness.',
        position: 'top',
        accentColor: '#ff9966'
      }
    ]
  }
];

// Achievements for gamification
export interface AchievementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredStep?: string;
  energyPointsReward: number;
}

export const onboardingAchievements: AchievementData[] = [
  {
    id: 'geometric-initiate',
    title: 'Geometric Initiate',
    description: 'Completed the sacred geometry introduction',
    icon: 'geometry',
    requiredStep: 'sacred-geometry',
    energyPointsReward: 10
  },
  {
    id: 'chakra-explorer',
    title: 'Chakra Explorer',
    description: 'Learned about the seven energy centers',
    icon: 'chakra',
    requiredStep: 'chakras',
    energyPointsReward: 15
  },
  {
    id: 'energy-adept',
    title: 'Energy Adept',
    description: 'Understood the energy points system',
    icon: 'energy',
    requiredStep: 'energy-points',
    energyPointsReward: 10
  },
  {
    id: 'meditation-neophyte',
    title: 'Meditation Neophyte',
    description: 'Discovered meditation practices',
    icon: 'meditation',
    requiredStep: 'meditation',
    energyPointsReward: 20
  },
  {
    id: 'reflection-sage',
    title: 'Reflection Sage',
    description: 'Embraced the practice of reflection',
    icon: 'reflection',
    requiredStep: 'reflection',
    energyPointsReward: 15
  },
  {
    id: 'cosmic-initiate',
    title: 'Cosmic Initiate',
    description: 'Completed the full onboarding journey',
    icon: 'cosmic',
    requiredStep: 'complete',
    energyPointsReward: 50
  }
];
