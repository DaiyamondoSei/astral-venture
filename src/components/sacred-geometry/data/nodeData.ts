
import React from 'react';
import { 
  Compass, Star, Flower, Sun, Moon, Sparkles, 
  Brain, Heart, Eye, Zap, Flame, Triangle, CircleDot,
  Book, Waves, Music, UserCircle, Map
} from 'lucide-react';
import { GeometryNode } from '../types/geometry';
import downloadableMaterials from './materialData';
import { allNodeCategories } from './nodeCategories';

// Define colors for node categories
const nodeColors = {
  meditation: 'from-purple-400 to-purple-600',
  chakras: 'from-orange-400 to-red-500',
  dreams: 'from-indigo-400 to-indigo-600',
  energy: 'from-cyan-400 to-blue-500',
  reflection: 'from-emerald-400 to-teal-600',
  healing: 'from-rose-400 to-pink-600',
  wisdom: 'from-amber-400 to-yellow-500',
  astral: 'from-violet-400 to-purple-600',
  sacred: 'from-emerald-400 to-green-600',
  elements: 'from-red-400 to-amber-500',
  consciousness: 'from-blue-400 to-indigo-600',
  nature: 'from-green-400 to-teal-500',
  guidance: 'from-violet-400 to-indigo-600',
  sound: 'from-sky-400 to-blue-500',
  user: 'from-fuchsia-400 to-pink-500',
};

// Define icons for node categories
const nodeIcons = {
  meditation: React.createElement(Brain, { size: 24 }),
  chakras: React.createElement(Sun, { size: 24 }),
  dreams: React.createElement(Moon, { size: 24 }),
  energy: React.createElement(Zap, { size: 24 }),
  reflection: React.createElement(Eye, { size: 24 }),
  healing: React.createElement(Heart, { size: 24 }),
  wisdom: React.createElement(Star, { size: 24 }),
  astral: React.createElement(Sparkles, { size: 24 }),
  sacred: React.createElement(Triangle, { size: 24 }),
  elements: React.createElement(Flame, { size: 24 }),
  consciousness: React.createElement(CircleDot, { size: 24 }),
  nature: React.createElement(Flower, { size: 24 }),
  guidance: React.createElement(Compass, { size: 24 }),
  sound: React.createElement(Music, { size: 24 }),
  user: React.createElement(UserCircle, { size: 24 }),
};

// Define descriptions for node categories
const nodeDescriptions = {
  meditation: 'Center your consciousness and access higher states of being',
  chakras: 'Balance your energy centers for optimal flow',
  dreams: 'Explore your subconscious through dream analysis',
  energy: 'Harness and direct your subtle energy field',
  reflection: 'Deepen awareness through conscious self-reflection',
  healing: 'Restore balance and wholeness through healing practices',
  wisdom: 'Access universal knowledge and higher guidance',
  astral: 'Journey beyond physical limitations',
  sacred: 'Explore the mathematical patterns of creation',
  elements: 'Work with the fundamental forces of nature',
  consciousness: 'Expand your awareness beyond ordinary limitations',
  nature: 'Harmonize with the natural world',
  guidance: 'Connect with your inner wisdom and spiritual guides',
  sound: 'Use sacred sound frequencies for healing and transformation',
  user: 'View and customize your spiritual journey profile',
};

// Define the sacred geometry nodes with complete functionality mapping
export const createGeometryNodes = (onSelectNode?: (nodeId: string, downloadables?: any[]) => void): GeometryNode[] => {
  const nodes: GeometryNode[] = [];
  
  // Create nodes from all categories
  Object.keys(allNodeCategories).forEach(categoryId => {
    const functionalities = allNodeCategories[categoryId].functionalities.map(f => f.name);
    
    nodes.push({
      id: categoryId,
      name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1), // Capitalize first letter
      icon: nodeIcons[categoryId as keyof typeof nodeIcons],
      description: nodeDescriptions[categoryId as keyof typeof nodeDescriptions],
      color: nodeColors[categoryId as keyof typeof nodeColors],
      position: '', // This will be filled by the precise positioning class in GeometryNode.tsx
      downloadables: downloadableMaterials[categoryId],
      action: () => onSelectNode?.(categoryId, downloadableMaterials[categoryId]),
      functionalities
    });
  });
  
  return nodes;
};

export default createGeometryNodes;
