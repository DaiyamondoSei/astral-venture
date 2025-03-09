
import { GuidedTourData, GuidedTourStep } from '../hooks/achievement/types';

/**
 * Guided Tours
 * Defines interactive tours that help users discover application features
 */
const guidedTours: GuidedTourData[] = [
  {
    id: 'welcome_tour',
    title: 'Welcome to Your Spiritual Journey',
    description: 'Let us guide you through the key features of your dashboard',
    steps: [
      {
        id: 'welcome_step_1',
        title: 'Your Dashboard',
        description: 'This is your personalized spiritual dashboard where you can track your progress.',
        elementId: 'dashboard-main',
        position: 'bottom',
        targetElement: 'dashboard-main',
        content: 'This is your personalized spiritual dashboard where you can track your progress.',
        target: 'dashboard-main'
      },
      {
        id: 'welcome_step_2',
        title: 'Energy Points',
        description: 'Earn energy points through various activities to track your spiritual growth.',
        elementId: 'energy-points',
        position: 'bottom',
        targetElement: 'energy-points',
        content: 'Earn energy points through various activities to track your spiritual growth.',
        target: 'energy-points'
      },
      {
        id: 'welcome_step_3',
        title: 'Chakra System',
        description: 'Activate and balance your chakras to enhance your spiritual wellbeing.',
        elementId: 'chakra-system',
        position: 'left',
        targetElement: 'chakra-system',
        content: 'Activate and balance your chakras to enhance your spiritual wellbeing.',
        target: 'chakra-system'
      }
    ],
    condition: 'isFirstLogin',
    requiredStep: 'welcome'
  },
  {
    id: 'meditation_tour',
    title: 'Meditation Practices',
    description: 'Discover the meditation features available to you',
    steps: [
      {
        id: 'meditation_step_1',
        title: 'Meditation Cards',
        description: 'Browse different meditation practices based on your needs.',
        elementId: 'meditation-cards',
        position: 'right',
        targetElement: 'meditation-cards',
        content: 'Browse different meditation practices based on your needs.',
        target: 'meditation-cards'
      },
      {
        id: 'meditation_step_2',
        title: 'Start a Practice',
        description: 'Click here to begin a guided meditation session.',
        elementId: 'start-meditation',
        position: 'bottom',
        targetElement: 'start-meditation',
        content: 'Click here to begin a guided meditation session.',
        target: 'start-meditation'
      },
      {
        id: 'meditation_step_3',
        title: 'Meditation Timer',
        description: 'Track your meditation progress with the timer.',
        elementId: 'meditation-timer',
        position: 'left',
        targetElement: 'meditation-timer',
        content: 'Track your meditation progress with the timer.',
        target: 'meditation-timer'
      }
    ],
    condition: 'hasCompletedOnboarding',
    requiredStep: 'meditation'
  },
  {
    id: 'reflection_tour',
    title: 'Daily Reflections',
    description: 'Learn how to use the reflection features for spiritual growth',
    steps: [
      {
        id: 'reflection_step_1',
        title: 'Reflection Journal',
        description: 'Record your thoughts and feelings to track your inner growth.',
        elementId: 'reflection-journal',
        position: 'right',
        targetElement: 'reflection-journal',
        content: 'Record your thoughts and feelings to track your inner growth.',
        target: 'reflection-journal'
      },
      {
        id: 'reflection_step_2',
        title: 'Insight Analysis',
        description: 'Our AI will analyze your reflections to provide spiritual insights.',
        elementId: 'reflection-insights',
        position: 'bottom',
        targetElement: 'reflection-insights',
        content: 'Our AI will analyze your reflections to provide spiritual insights.',
        target: 'reflection-insights'
      },
      {
        id: 'reflection_step_3',
        title: 'Reflection History',
        description: 'View your past reflections to see your spiritual journey unfold.',
        elementId: 'reflection-history',
        position: 'top',
        targetElement: 'reflection-history',
        content: 'View your past reflections to see your spiritual journey unfold.',
        target: 'reflection-history'
      }
    ],
    condition: 'hasCompletedMeditation',
    requiredStep: 'reflection'
  }
];

export default guidedTours;
