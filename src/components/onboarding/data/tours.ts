
import { GuidedTourData } from './types';

// Export an array as the default export
export const guidedTours: GuidedTourData[] = [
  {
    id: 'dashboard-intro',
    title: 'Welcome to Your Dashboard',
    description: 'Let\'s explore the key features of your personal dashboard',
    steps: [
      {
        id: 'dashboard-welcome',
        title: 'Your Personal Dashboard',
        description: 'This is your central hub for tracking progress and accessing features',
        elementId: 'dashboard-main',
        position: 'bottom',
        targetElement: 'dashboard-container',
        content: 'Welcome to your personal growth dashboard',
        target: 'dashboard-container',
        targetSelector: '#dashboard-container'
      },
      {
        id: 'dashboard-stats',
        title: 'Your Stats',
        description: 'View your activity stats and progress metrics here',
        elementId: 'stats-panel',
        position: 'bottom',
        targetElement: 'stats-container',
        content: 'Track your meditation and reflection progress',
        target: 'stats-container',
        targetSelector: '#stats-container'
      },
      {
        id: 'dashboard-challenges',
        title: 'Daily Challenges',
        description: 'Check your daily challenges and growth activities',
        elementId: 'challenges-panel',
        position: 'left',
        targetElement: 'challenges-container',
        content: 'Complete daily challenges to boost your progress',
        target: 'challenges-container',
        targetSelector: '#challenges-container'
      }
    ],
    requiredStep: 'login'
  },
  {
    id: 'meditation-intro',
    title: 'Meditation Features',
    description: 'Explore the meditation tools and features',
    steps: [
      {
        id: 'meditation-welcome',
        title: 'Meditation Center',
        description: 'This is your space for mindfulness and meditation practices',
        elementId: 'meditation-main',
        position: 'right',
        targetElement: 'meditation-container',
        content: 'Welcome to your meditation center',
        target: 'meditation-container',
        targetSelector: '#meditation-container'
      },
      {
        id: 'meditation-timer',
        title: 'Meditation Timer',
        description: 'Use this timer to track your meditation sessions',
        elementId: 'timer-panel',
        position: 'bottom',
        targetElement: 'timer-container',
        content: 'Set and track your meditation time',
        target: 'timer-container',
        targetSelector: '#timer-container'
      },
      {
        id: 'meditation-history',
        title: 'Meditation History',
        description: 'View your past meditation sessions and progress',
        elementId: 'history-panel',
        position: 'top',
        targetElement: 'history-container',
        content: 'Review your meditation journey',
        target: 'history-container',
        targetSelector: '#history-container'
      }
    ],
    requiredStep: 'dashboard-intro'
  }
];

// Add default export
export default guidedTours;
