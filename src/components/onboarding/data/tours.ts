
import { GuidedTourData } from './types';

export const guidedTours: GuidedTourData[] = [
  {
    id: 'welcome-tour',
    title: 'Welcome to the Sacred Geometry Explorer',
    description: 'Let us guide you through the main features of this application',
    condition: 'firstVisit',
    steps: [
      {
        id: 'step-1',
        title: 'Welcome to Sacred Geometry',
        description: 'This application helps you explore the sacred connections between geometry, energy, and consciousness.',
        elementId: 'welcome-header',
        position: 'bottom',
        targetElement: '#welcome-header',
        targetSelector: '#welcome-header',
        content: 'Begin your journey by exploring the sacred geometry concepts.',
        target: '#welcome-header'
      },
      {
        id: 'step-2',
        title: 'Energy Visualizations',
        description: 'Visualize your energy field and see how it responds to your interactions.',
        elementId: 'energy-visualization',
        position: 'bottom',
        targetElement: '#energy-visualization',
        targetSelector: '#energy-visualization',
        content: 'Click on different parts of the visualization to see how energy flows.',
        target: '#energy-visualization'
      },
      {
        id: 'step-3',
        title: 'Sacred Nodes',
        description: 'Explore various sacred geometry nodes and their connections to your energy.',
        elementId: 'sacred-nodes',
        position: 'left',
        targetElement: '#sacred-nodes',
        targetSelector: '#sacred-nodes',
        content: 'Click on nodes to learn about their meanings and energy signatures.',
        target: '#sacred-nodes'
      }
    ]
  },
  {
    id: 'reflection-tour',
    title: 'Reflection and Insight Features',
    description: 'Discover how to use the reflection tools for deeper self-awareness',
    condition: 'completedMeditation',
    steps: [
      {
        id: 'step-1',
        title: 'Reflection Journal',
        description: 'Record your insights and experiences in your personal journal.',
        elementId: 'reflection-journal',
        position: 'right',
        targetElement: '#reflection-journal',
        targetSelector: '#reflection-journal',
        content: 'Click here to open your reflection journal and start documenting your journey.',
        target: '#reflection-journal'
      },
      {
        id: 'step-2',
        title: 'Energy Insights',
        description: 'View personalized insights about your energy patterns.',
        elementId: 'energy-insights',
        position: 'bottom',
        targetElement: '#energy-insights',
        targetSelector: '#energy-insights',
        content: 'Explore your energy insights to understand patterns in your consciousness.',
        target: '#energy-insights'
      },
      {
        id: 'step-3',
        title: 'Chakra Analyzer',
        description: 'See which of your chakras are most active based on your reflections.',
        elementId: 'chakra-analyzer',
        position: 'left',
        targetElement: '#chakra-analyzer',
        targetSelector: '#chakra-analyzer',
        content: 'The chakra analyzer helps you understand which energy centers are most active.',
        target: '#chakra-analyzer'
      }
    ]
  },
  {
    id: 'ai-features-tour',
    title: 'AI Assistant Features',
    description: 'Learn how the AI assistant can help you on your spiritual journey',
    condition: 'completedReflection',
    steps: [
      {
        id: 'step-1',
        title: 'AI Wisdom Guide',
        description: 'Ask questions and receive guidance from the AI wisdom assistant.',
        elementId: 'ai-wisdom-button',
        position: 'right',
        targetElement: '#ai-wisdom-button',
        targetSelector: '#ai-wisdom-button',
        content: 'Click this button to start a conversation with the AI wisdom guide.',
        target: '#ai-wisdom-button'
      },
      {
        id: 'step-2',
        title: 'Personalized Practices',
        description: 'Receive personalized practice recommendations based on your energy.',
        elementId: 'personalized-practices',
        position: 'bottom',
        targetElement: '#personalized-practices',
        targetSelector: '#personalized-practices',
        content: 'View practices that are specifically recommended for your energy signature.',
        target: '#personalized-practices'
      },
      {
        id: 'step-3',
        title: 'Meditation Assistant',
        description: 'Get AI-guided meditation sessions tailored to your needs.',
        elementId: 'meditation-assistant',
        position: 'top',
        targetElement: '#meditation-assistant',
        targetSelector: '#meditation-assistant',
        content: 'Start an AI-guided meditation session that adapts to your energy state.',
        target: '#meditation-assistant'
      }
    ]
  }
];
