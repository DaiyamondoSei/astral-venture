
import { NodeCategory } from '../nodeCategoryTypes';

// Elemental and consciousness categories
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

export default elementalNodeCategories;
