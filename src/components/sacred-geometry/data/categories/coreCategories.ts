
import { NodeCategory } from '../nodeCategoryTypes';

// Core meditation and spiritual practice categories
export const coreNodeCategories: Record<string, NodeCategory> = {
  'meditation': {
    id: 'meditation',
    functionalities: [
      { 
        name: 'Guided meditation sessions',
        description: 'Follow along with expert-guided meditation sessions of various lengths and styles'
      },
      { 
        name: 'Meditation timer', 
        description: 'Set customizable timers with interval bells for personal meditation practice'
      },
      { 
        name: 'Breathwork exercises', 
        description: 'Learn and practice different breathing techniques to enhance meditation'
      },
      { 
        name: 'Meditation progress tracking', 
        description: 'Monitor your meditation frequency, duration, and quality over time'
      }
    ]
  },
  'chakras': {
    id: 'chakras',
    functionalities: [
      { 
        name: 'Chakra assessment', 
        description: 'Evaluate the balance and energy flow of your seven main chakras'
      },
      { 
        name: 'Chakra balancing exercises', 
        description: 'Specific practices for opening, clearing, and aligning each chakra'
      },
      { 
        name: 'Energy center visualization', 
        description: 'Guided visualizations for connecting with each chakra\'s energy'
      },
      { 
        name: 'Chakra activation tracking', 
        description: 'Monitor the progress of your chakra development over time'
      }
    ]
  },
  'dreams': {
    id: 'dreams',
    functionalities: [
      { 
        name: 'Dream journal', 
        description: 'Record and organize your dreams with tags, themes, and emotions'
      },
      { 
        name: 'Dream analysis', 
        description: 'Receive insights and potential interpretations of your dream symbols'
      },
      { 
        name: 'Lucid dreaming techniques', 
        description: 'Learn methods to recognize and control your dreams while dreaming'
      },
      { 
        name: 'Sleep cycle tracking', 
        description: 'Monitor your sleep phases to optimize dream recall and quality'
      }
    ]
  },
  'energy': {
    id: 'energy',
    functionalities: [
      { 
        name: 'Energy exercises', 
        description: 'Practices for sensing and cultivating your personal energy field'
      },
      { 
        name: 'Aura scanning', 
        description: 'Tools for visualizing and interpreting your subtle energy field'
      },
      { 
        name: 'Energy healing techniques', 
        description: 'Methods to channel and direct healing energy to yourself and others'
      },
      { 
        name: 'Biofield tuning guides', 
        description: 'Advanced practices for harmonizing your electromagnetic field'
      }
    ]
  },
  'reflection': {
    id: 'reflection',
    functionalities: [
      { 
        name: 'Journaling prompts', 
        description: 'Daily questions to deepen self-awareness and personal growth'
      },
      { 
        name: 'Self-inquiry exercises', 
        description: 'Structured methods for exploring your inner landscape'
      },
      { 
        name: 'Reflection history', 
        description: 'Review past reflections to identify patterns and growth areas'
      },
      { 
        name: 'Consciousness growth tracking', 
        description: 'Measure your evolving awareness and consciousness expansion'
      }
    ]
  },
  'healing': {
    id: 'healing',
    functionalities: [
      { 
        name: 'Self-healing techniques', 
        description: 'Methods for activating your body\'s natural healing abilities'
      },
      { 
        name: 'Emotional release practices', 
        description: 'Safe processes for processing and integrating difficult emotions'
      },
      { 
        name: 'Forgiveness exercises', 
        description: 'Guided practices for releasing resentment and cultivating forgiveness'
      },
      { 
        name: 'Trauma integration guides', 
        description: 'Gentle approaches for processing and healing past trauma'
      }
    ]
  },
  'wisdom': {
    id: 'wisdom',
    functionalities: [
      { 
        name: 'Sacred texts library', 
        description: 'Collection of spiritual teachings from diverse wisdom traditions'
      },
      { 
        name: 'Philosophical teachings', 
        description: 'Explorations of consciousness and reality from various perspectives'
      },
      { 
        name: 'Ancient wisdom practices', 
        description: 'Traditional methods for accessing higher knowledge and understanding'
      },
      { 
        name: 'Spiritual traditions exploration', 
        description: 'Comparative study of different paths to enlightenment and wisdom'
      }
    ]
  }
};

export default coreNodeCategories;
