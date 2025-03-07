
import React from 'react';
import { 
  Compass, Star, Flower, Sun, Moon, Sparkles, 
  Brain, Heart, Eye, Zap, Flame, Triangle, CircleDot,
  Book, Waves, Music, UserCircle, Map
} from 'lucide-react';
import { GeometryNode } from '../types/geometry';
import downloadableMaterials from './materialData';

// Define the sacred geometry nodes with complete functionality mapping
export const createGeometryNodes = (onSelectNode?: (nodeId: string, downloadables?: any[]) => void): GeometryNode[] => [
  {
    id: 'meditation',
    name: 'Meditation',
    icon: React.createElement(Brain, { size: 24 }),
    description: 'Center your consciousness and access higher states of being',
    color: 'from-purple-400 to-purple-600',
    position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    downloadables: downloadableMaterials['meditation'],
    action: () => onSelectNode?.('meditation', downloadableMaterials['meditation']),
    functionalities: [
      'Guided meditation sessions',
      'Meditation timer',
      'Breathwork exercises',
      'Meditation progress tracking'
    ]
  },
  {
    id: 'chakras',
    name: 'Chakras',
    icon: React.createElement(Sun, { size: 24 }),
    description: 'Balance your energy centers for optimal flow',
    color: 'from-orange-400 to-red-500',
    position: 'top-0 left-1/2 -translate-x-1/2',
    downloadables: downloadableMaterials['chakras'],
    action: () => onSelectNode?.('chakras', downloadableMaterials['chakras']),
    functionalities: [
      'Chakra assessment',
      'Chakra balancing exercises',
      'Energy center visualization',
      'Chakra activation tracking'
    ]
  },
  {
    id: 'dreams',
    name: 'Dreams',
    icon: React.createElement(Moon, { size: 24 }),
    description: 'Explore your subconscious through dream analysis',
    color: 'from-indigo-400 to-indigo-600',
    position: 'top-1/4 right-0 translate-x-1/4',
    downloadables: downloadableMaterials['dreams'],
    action: () => onSelectNode?.('dreams', downloadableMaterials['dreams']),
    functionalities: [
      'Dream journal',
      'Dream analysis',
      'Lucid dreaming techniques',
      'Sleep cycle tracking'
    ]
  },
  {
    id: 'energy',
    name: 'Energy Work',
    icon: React.createElement(Zap, { size: 24 }),
    description: 'Harness and direct your subtle energy field',
    color: 'from-cyan-400 to-blue-500',
    position: 'bottom-1/4 right-0 translate-x-1/4',
    downloadables: downloadableMaterials['energy'],
    action: () => onSelectNode?.('energy', downloadableMaterials['energy']),
    functionalities: [
      'Energy exercises',
      'Aura scanning',
      'Energy healing techniques',
      'Biofield tuning guides'
    ]
  },
  {
    id: 'reflection',
    name: 'Reflection',
    icon: React.createElement(Eye, { size: 24 }),
    description: 'Deepen awareness through conscious self-reflection',
    color: 'from-emerald-400 to-teal-600',
    position: 'bottom-0 left-1/2 -translate-x-1/2',
    action: () => onSelectNode?.('reflection'),
    functionalities: [
      'Journaling prompts',
      'Self-inquiry exercises',
      'Reflection history',
      'Consciousness growth tracking'
    ]
  },
  {
    id: 'healing',
    name: 'Healing',
    icon: React.createElement(Heart, { size: 24 }),
    description: 'Restore balance and wholeness through healing practices',
    color: 'from-rose-400 to-pink-600',
    position: 'bottom-1/4 left-0 -translate-x-1/4',
    action: () => onSelectNode?.('healing'),
    functionalities: [
      'Self-healing techniques',
      'Emotional release practices',
      'Forgiveness exercises',
      'Trauma integration guides'
    ]
  },
  {
    id: 'wisdom',
    name: 'Cosmic Wisdom',
    icon: React.createElement(Star, { size: 24 }),
    description: 'Access universal knowledge and higher guidance',
    color: 'from-amber-400 to-yellow-500',
    position: 'top-1/4 left-0 -translate-x-1/4',
    downloadables: downloadableMaterials['wisdom'],
    action: () => onSelectNode?.('wisdom', downloadableMaterials['wisdom']),
    functionalities: [
      'Sacred texts library',
      'Philosophical teachings',
      'Ancient wisdom practices',
      'Spiritual traditions exploration'
    ]
  },
  {
    id: 'astral',
    name: 'Astral Travel',
    icon: React.createElement(Sparkles, { size: 24 }),
    description: 'Journey beyond physical limitations',
    color: 'from-violet-400 to-purple-600',
    position: 'top-[15%] left-[15%]',
    downloadables: downloadableMaterials['astral'],
    action: () => onSelectNode?.('astral', downloadableMaterials['astral']),
    functionalities: [
      'Astral projection techniques',
      'OBE preparation exercises',
      'Dimensional travel guides',
      'Experience journaling'
    ]
  },
  {
    id: 'sacred',
    name: 'Sacred Geometry',
    icon: React.createElement(Triangle, { size: 24 }),
    description: 'Explore the mathematical patterns of creation',
    color: 'from-emerald-400 to-green-600',
    position: 'top-[15%] right-[15%]',
    action: () => onSelectNode?.('sacred'),
    functionalities: [
      'Geometric patterns library',
      'Sacred geometry meditations',
      'Geometric construction guides',
      'Mathematical harmony exploration'
    ]
  },
  {
    id: 'elements',
    name: 'Elements',
    icon: React.createElement(Flame, { size: 24 }),
    description: 'Work with the fundamental forces of nature',
    color: 'from-red-400 to-amber-500',
    position: 'bottom-[15%] right-[15%]',
    action: () => onSelectNode?.('elements'),
    functionalities: [
      'Elemental attunement',
      'Nature connection practices',
      'Elemental meditation',
      'Environmental harmony techniques'
    ]
  },
  {
    id: 'consciousness',
    name: 'Consciousness',
    icon: React.createElement(CircleDot, { size: 24 }),
    description: 'Expand your awareness beyond ordinary limitations',
    color: 'from-blue-400 to-indigo-600',
    position: 'bottom-[15%] left-[15%]',
    action: () => onSelectNode?.('consciousness'),
    functionalities: [
      'Consciousness expansion techniques',
      'Awareness exercises',
      'Non-dual practices',
      'States of consciousness exploration'
    ]
  },
  {
    id: 'nature',
    name: 'Nature Connection',
    icon: React.createElement(Flower, { size: 24 }),
    description: 'Harmonize with the natural world',
    color: 'from-green-400 to-teal-500',
    position: 'right-1/2 top-1/4 translate-x-1/2',
    action: () => onSelectNode?.('nature'),
    functionalities: [
      'Grounding techniques',
      'Earthing practices',
      'Plant communication',
      'Natural cycles alignment'
    ]
  },
  {
    id: 'guidance',
    name: 'Higher Guidance',
    icon: React.createElement(Compass, { size: 24 }),
    description: 'Connect with your inner wisdom and spiritual guides',
    color: 'from-violet-400 to-indigo-600',
    position: 'left-1/2 bottom-1/4 -translate-x-1/2',
    action: () => onSelectNode?.('guidance'),
    functionalities: [
      'Intuition development',
      'Higher self connection',
      'Spirit guide communication',
      'Synchronicity awareness'
    ]
  },
  {
    id: 'sound',
    name: 'Sound Healing',
    icon: React.createElement(Music, { size: 24 }),
    description: 'Use sacred sound frequencies for healing and transformation',
    color: 'from-sky-400 to-blue-500',
    position: 'right-1/4 top-1/2 translate-y-[-50%]',
    action: () => onSelectNode?.('sound'),
    functionalities: [
      'Frequency healing',
      'Sound baths',
      'Binaural beats',
      'Mantra and toning practice'
    ]
  },
  {
    id: 'user',
    name: 'Personal Profile',
    icon: React.createElement(UserCircle, { size: 24 }),
    description: 'View and customize your spiritual journey profile',
    color: 'from-fuchsia-400 to-pink-500',
    position: 'left-1/4 bottom-1/2 translate-y-[50%]',
    action: () => onSelectNode?.('user'),
    functionalities: [
      'Journey progress',
      'Preferences & settings',
      'Achievements & milestones',
      'Personal insights dashboard'
    ]
  }
];

export default createGeometryNodes;
