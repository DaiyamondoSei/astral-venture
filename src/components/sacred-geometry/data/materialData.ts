
import React from 'react';
import { FileText, Package, Book, Archive } from 'lucide-react';
import { DownloadableMaterial } from '../types/geometry';

// Define downloadable materials for each node
export const downloadableMaterials: Record<string, DownloadableMaterial[]> = {
  'meditation': [
    { 
      id: 'med-guide-1', 
      name: 'Beginner Meditation', 
      description: 'A complete guide for beginners',
      type: 'pdf',
      icon: React.createElement(FileText, { size: 18 })
    },
    { 
      id: 'med-audio-1', 
      name: 'Guided Meditation', 
      description: '15-minute guided audio session',
      type: 'audio',
      icon: React.createElement(Package, { size: 18 })
    }
  ],
  'chakras': [
    { 
      id: 'chakra-map', 
      name: 'Chakra Map', 
      description: 'Complete guide to your energy centers',
      type: 'pdf',
      icon: React.createElement(FileText, { size: 18 })
    },
    { 
      id: 'chakra-balancing', 
      name: 'Balancing Practice', 
      description: 'Step-by-step chakra balancing technique',
      type: 'practice',
      icon: React.createElement(Book, { size: 18 })
    }
  ],
  'dreams': [
    { 
      id: 'dream-journal', 
      name: 'Dream Journal Template', 
      description: 'Track and analyze your dreams',
      type: 'pdf',
      icon: React.createElement(FileText, { size: 18 })
    }
  ],
  'energy': [
    { 
      id: 'energy-meditation', 
      name: 'Energy Meditation', 
      description: 'Focus your internal energy',
      type: 'audio',
      icon: React.createElement(Package, { size: 18 })
    },
    { 
      id: 'energy-exercises', 
      name: 'Daily Energy Exercises', 
      description: '5-minute practices for daily energy',
      type: 'guide',
      icon: React.createElement(Book, { size: 18 })
    }
  ],
  'wisdom': [
    { 
      id: 'ancient-texts', 
      name: 'Ancient Wisdom Texts', 
      description: 'Collection of wisdom teachings',
      type: 'pdf',
      icon: React.createElement(Archive, { size: 18 })
    }
  ],
  'astral': [
    { 
      id: 'astral-guide', 
      name: 'Astral Projection Guide', 
      description: 'Safe techniques for astral travel',
      type: 'pdf',
      icon: React.createElement(FileText, { size: 18 })
    },
    { 
      id: 'astral-meditation', 
      name: 'Astral Meditation', 
      description: 'Prepare for out-of-body experiences',
      type: 'audio',
      icon: React.createElement(Package, { size: 18 })
    }
  ]
};

export default downloadableMaterials;
