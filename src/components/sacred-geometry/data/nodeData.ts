
import React from 'react';
import { 
  Compass, Star, Flower, Sun, Moon, Sparkles, 
  Brain, Heart, Eye, Zap, Flame, Triangle, CircleDot
} from 'lucide-react';
import { GeometryNode } from '../types/geometry';
import downloadableMaterials from './materialData';

// Define the sacred geometry nodes
export const createGeometryNodes = (onSelectNode?: (nodeId: string, downloadables?: any[]) => void): GeometryNode[] => [
  {
    id: 'meditation',
    name: 'Meditation',
    icon: React.createElement(Brain, { size: 24 }),
    description: 'Center your consciousness and access higher states of being',
    color: 'from-purple-400 to-purple-600',
    position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    downloadables: downloadableMaterials['meditation'],
    action: () => onSelectNode?.('meditation', downloadableMaterials['meditation'])
  },
  {
    id: 'chakras',
    name: 'Chakras',
    icon: React.createElement(Sun, { size: 24 }),
    description: 'Balance your energy centers for optimal flow',
    color: 'from-orange-400 to-red-500',
    position: 'top-0 left-1/2 -translate-x-1/2',
    downloadables: downloadableMaterials['chakras'],
    action: () => onSelectNode?.('chakras', downloadableMaterials['chakras'])
  },
  {
    id: 'dreams',
    name: 'Dreams',
    icon: React.createElement(Moon, { size: 24 }),
    description: 'Explore your subconscious through dream analysis',
    color: 'from-indigo-400 to-indigo-600',
    position: 'top-1/4 right-0 translate-x-1/4',
    downloadables: downloadableMaterials['dreams'],
    action: () => onSelectNode?.('dreams', downloadableMaterials['dreams'])
  },
  {
    id: 'energy',
    name: 'Energy Work',
    icon: React.createElement(Zap, { size: 24 }),
    description: 'Harness and direct your subtle energy field',
    color: 'from-cyan-400 to-blue-500',
    position: 'bottom-1/4 right-0 translate-x-1/4',
    downloadables: downloadableMaterials['energy'],
    action: () => onSelectNode?.('energy', downloadableMaterials['energy'])
  },
  {
    id: 'reflection',
    name: 'Reflection',
    icon: React.createElement(Eye, { size: 24 }),
    description: 'Deepen awareness through conscious self-reflection',
    color: 'from-emerald-400 to-teal-600',
    position: 'bottom-0 left-1/2 -translate-x-1/2',
    action: () => onSelectNode?.('reflection')
  },
  {
    id: 'healing',
    name: 'Healing',
    icon: React.createElement(Heart, { size: 24 }),
    description: 'Restore balance and wholeness through healing practices',
    color: 'from-rose-400 to-pink-600',
    position: 'bottom-1/4 left-0 -translate-x-1/4',
    action: () => onSelectNode?.('healing')
  },
  {
    id: 'wisdom',
    name: 'Cosmic Wisdom',
    icon: React.createElement(Star, { size: 24 }),
    description: 'Access universal knowledge and higher guidance',
    color: 'from-amber-400 to-yellow-500',
    position: 'top-1/4 left-0 -translate-x-1/4',
    downloadables: downloadableMaterials['wisdom'],
    action: () => onSelectNode?.('wisdom', downloadableMaterials['wisdom'])
  },
  {
    id: 'astral',
    name: 'Astral Travel',
    icon: React.createElement(Sparkles, { size: 24 }),
    description: 'Journey beyond physical limitations',
    color: 'from-violet-400 to-purple-600',
    position: 'top-[15%] left-[15%]',
    downloadables: downloadableMaterials['astral'],
    action: () => onSelectNode?.('astral', downloadableMaterials['astral'])
  },
  {
    id: 'sacred',
    name: 'Sacred Geometry',
    icon: React.createElement(Triangle, { size: 24 }),
    description: 'Explore the mathematical patterns of creation',
    color: 'from-emerald-400 to-green-600',
    position: 'top-[15%] right-[15%]',
    action: () => onSelectNode?.('sacred')
  },
  {
    id: 'elements',
    name: 'Elements',
    icon: React.createElement(Flame, { size: 24 }),
    description: 'Work with the fundamental forces of nature',
    color: 'from-red-400 to-amber-500',
    position: 'bottom-[15%] right-[15%]',
    action: () => onSelectNode?.('elements')
  },
  {
    id: 'consciousness',
    name: 'Consciousness',
    icon: React.createElement(CircleDot, { size: 24 }),
    description: 'Expand your awareness beyond ordinary limitations',
    color: 'from-blue-400 to-indigo-600',
    position: 'bottom-[15%] left-[15%]',
    action: () => onSelectNode?.('consciousness')
  },
  {
    id: 'nature',
    name: 'Nature Connection',
    icon: React.createElement(Flower, { size: 24 }),
    description: 'Harmonize with the natural world',
    color: 'from-green-400 to-teal-500',
    position: 'right-1/2 top-1/4 translate-x-1/2',
    action: () => onSelectNode?.('nature')
  },
  {
    id: 'guidance',
    name: 'Higher Guidance',
    icon: React.createElement(Compass, { size: 24 }),
    description: 'Connect with your inner wisdom and spiritual guides',
    color: 'from-violet-400 to-indigo-600',
    position: 'left-1/2 bottom-1/4 -translate-x-1/2',
    action: () => onSelectNode?.('guidance')
  }
];

export default createGeometryNodes;
