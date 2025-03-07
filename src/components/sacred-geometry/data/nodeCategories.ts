
// Node categories and functionality definitions
export interface NodeFunctionality {
  name: string;
  description: string;
}

export interface NodeCategory {
  id: string;
  functionalities: NodeFunctionality[];
}

export const nodeCategories: Record<string, NodeCategory> = {
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

// Export additional categories
export const advancedNodeCategories: Record<string, NodeCategory> = {
  'astral': {
    id: 'astral',
    functionalities: [
      { 
        name: 'Astral projection techniques', 
        description: 'Methods for safely separating consciousness from the physical body'
      },
      { 
        name: 'OBE preparation exercises', 
        description: 'Practices to prepare your mind and energy body for out-of-body experiences'
      },
      { 
        name: 'Dimensional travel guides', 
        description: 'Tutorials for navigating non-physical planes of existence'
      },
      { 
        name: 'Experience journaling', 
        description: 'Tools for recording and integrating astral travel experiences'
      }
    ]
  },
  'sacred': {
    id: 'sacred',
    functionalities: [
      { 
        name: 'Geometric patterns library', 
        description: 'Collection of sacred geometric forms and their meanings'
      },
      { 
        name: 'Sacred geometry meditations', 
        description: 'Practices using geometric forms as focal points for consciousness expansion'
      },
      { 
        name: 'Geometric construction guides', 
        description: 'Learn to create perfect sacred geometric forms by hand'
      },
      { 
        name: 'Mathematical harmony exploration', 
        description: 'Study the mathematical principles underlying cosmic order'
      }
    ]
  }
};

// Export remaining categories
export const elementalNodeCategories: Record<string, NodeCategory> = {
  'elements': {
    id: 'elements',
    functionalities: [
      { 
        name: 'Elemental attunement', 
        description: 'Practices for connecting with the four classical elements'
      },
      { 
        name: 'Nature connection practices', 
        description: 'Methods for deeply aligning with the rhythms of the natural world'
      },
      { 
        name: 'Elemental meditation', 
        description: 'Meditations focused on embodying the qualities of each element'
      },
      { 
        name: 'Environmental harmony techniques', 
        description: 'Practices for honoring and preserving the natural environment'
      }
    ]
  },
  'consciousness': {
    id: 'consciousness',
    functionalities: [
      { 
        name: 'Consciousness expansion techniques', 
        description: 'Advanced methods for transcending ordinary awareness'
      },
      { 
        name: 'Awareness exercises', 
        description: 'Practices for cultivating present-moment awareness'
      },
      { 
        name: 'Non-dual practices', 
        description: 'Approaches for experiencing the unity of all existence'
      },
      { 
        name: 'States of consciousness exploration', 
        description: 'Safe methods for exploring different states of awareness'
      }
    ]
  }
};

// Export user and system related categories
export const userNodeCategories: Record<string, NodeCategory> = {
  'nature': {
    id: 'nature',
    functionalities: [
      { 
        name: 'Grounding techniques', 
        description: 'Methods for establishing energetic connection with the earth'
      },
      { 
        name: 'Earthing practices', 
        description: 'Activities that promote direct physical contact with the earth'
      },
      { 
        name: 'Plant communication', 
        description: 'Developing sensitivity to the consciousness of plants'
      },
      { 
        name: 'Natural cycles alignment', 
        description: 'Practices for harmonizing with seasonal and celestial rhythms'
      }
    ]
  },
  'guidance': {
    id: 'guidance',
    functionalities: [
      { 
        name: 'Intuition development', 
        description: 'Exercises for strengthening and trusting your intuitive abilities'
      },
      { 
        name: 'Higher self connection', 
        description: 'Practices for aligning with your higher wisdom and purpose'
      },
      { 
        name: 'Spirit guide communication', 
        description: 'Methods for connecting with non-physical guides and helpers'
      },
      { 
        name: 'Synchronicity awareness', 
        description: 'Tools for recognizing and interpreting meaningful coincidences'
      }
    ]
  },
  'sound': {
    id: 'sound',
    functionalities: [
      { 
        name: 'Frequency healing', 
        description: 'Using specific sound frequencies for physical and energetic healing'
      },
      { 
        name: 'Sound baths', 
        description: 'Immersive sound experiences for deep relaxation and healing'
      },
      { 
        name: 'Binaural beats', 
        description: 'Audio technology for entraining brainwaves to specific states'
      },
      { 
        name: 'Mantra and toning practice', 
        description: 'Vocal techniques for energy activation and meditation'
      }
    ]
  },
  'user': {
    id: 'user',
    functionalities: [
      { 
        name: 'Journey progress', 
        description: 'Visualize your spiritual development across different practices'
      },
      { 
        name: 'Preferences & settings', 
        description: 'Customize your experience based on personal needs and interests'
      },
      { 
        name: 'Achievements & milestones', 
        description: 'Track significant moments and accomplishments in your practice'
      },
      { 
        name: 'Personal insights dashboard', 
        description: 'Review personalized patterns and recommendations for growth'
      }
    ]
  }
};

export const allNodeCategories = {
  ...nodeCategories,
  ...advancedNodeCategories,
  ...elementalNodeCategories,
  ...userNodeCategories
};
