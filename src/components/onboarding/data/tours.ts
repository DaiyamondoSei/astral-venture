
import { GuidedTourData, TourStep } from '../hooks/achievement/types';

/**
 * Guided Tours
 * Defines interactive tours that walk users through features
 */
const guidedTours: GuidedTourData[] = [
  {
    id: 'welcome_tour',
    title: 'Welcome Tour',
    description: 'Get started with the basics of the application',
    steps: [
      {
        id: 'welcome_step_1',
        title: 'Welcome to Your Dashboard',
        content: 'This is your personal dashboard where you can track your progress and access all features.',
        elementId: 'dashboard-main',
        position: 'bottom',
        target: '#dashboard-main'
      },
      {
        id: 'welcome_step_2',
        title: 'Your Energy Points',
        content: 'Track your growth with energy points. You earn these through various activities.',
        elementId: 'energy-display',
        position: 'bottom',
        target: '#energy-display'
      },
      {
        id: 'welcome_step_3',
        title: 'Your Profile',
        content: 'View and update your profile settings here.',
        elementId: 'profile-section',
        position: 'left',
        target: '#profile-section'
      }
    ],
    condition: 'isFirstLogin'
  },
  {
    id: 'chakra_tour',
    title: 'Chakra System Tour',
    description: 'Learn about the chakra system and how to activate each energy center',
    steps: [
      {
        id: 'chakra_step_1',
        title: 'The Chakra System',
        content: 'Chakras are energy centers in your body that influence your physical and mental wellbeing.',
        elementId: 'chakra-display',
        position: 'right',
        target: '#chakra-display'
      },
      {
        id: 'chakra_step_2',
        title: 'Chakra Activation',
        content: 'Click on each chakra to learn more and begin the activation process.',
        elementId: 'chakra-interactive',
        position: 'bottom',
        target: '#chakra-interactive'
      },
      {
        id: 'chakra_step_3',
        title: 'Track Your Progress',
        content: 'Watch as your activated chakras enhance your overall energy and consciousness.',
        elementId: 'chakra-progress',
        position: 'left',
        target: '#chakra-progress'
      }
    ],
    condition: 'hasCompletedWelcomeTour'
  },
  {
    id: 'meditation_tour',
    title: 'Meditation Practices Tour',
    description: 'Discover the various meditation techniques available',
    steps: [
      {
        id: 'meditation_step_1',
        title: 'Meditation Practices',
        content: 'Explore different meditation techniques to calm your mind and raise your consciousness.',
        elementId: 'meditation-card',
        position: 'right',
        target: '#meditation-card'
      },
      {
        id: 'meditation_step_2',
        title: 'Guided Sessions',
        content: 'Follow along with guided meditations designed for different purposes and skill levels.',
        elementId: 'guided-meditation',
        position: 'bottom',
        target: '#guided-meditation'
      },
      {
        id: 'meditation_step_3',
        title: 'Track Your Progress',
        content: 'Monitor your meditation streak and see how regular practice affects your energy.',
        elementId: 'meditation-stats',
        position: 'top',
        target: '#meditation-stats'
      }
    ],
    condition: 'hasActivatedFirstChakra'
  }
];

export default guidedTours;
