
import { NodeCategory } from '../nodeCategoryTypes';

// User and system related categories
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

export default userNodeCategories;
