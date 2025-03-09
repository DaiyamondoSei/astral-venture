
import { SacredGeometryIconType } from '@/components/navigation/SacredGeometryIcon';

export interface NavigationNodeData {
  id: string;
  label: string;
  description: string;
  iconType: SacredGeometryIconType;
  x: number;
  y: number;
  route: string;
}

export interface NavigationConnectionData {
  id: string;
  from: string;
  to: string;
}

// Define the initial navigation nodes
export const initialNodes: NavigationNodeData[] = [
  {
    id: '0',
    label: 'Core',
    description: 'Your spiritual journey center',
    iconType: 'seed-of-life',
    x: 50,
    y: 50,
    route: '/dashboard'
  },
  {
    id: '1',
    label: 'Practices',
    description: 'Daily meditation and exercises',
    iconType: 'flower-of-life',
    x: 30,
    y: 25,
    route: '/practices'
  },
  {
    id: '2',
    label: 'Wisdom',
    description: 'Unlock quantum consciousness insights',
    iconType: 'tree-of-life',
    x: 70,
    y: 25,
    route: '/wisdom'
  },
  {
    id: '3',
    label: 'Progress',
    description: 'Track your spiritual evolution',
    iconType: 'golden-ratio',
    x: 20,
    y: 50,
    route: '/progress'
  },
  {
    id: '4',
    label: 'Dreams',
    description: 'Capture and manifest your aspirations',
    iconType: 'merkaba',
    x: 80,
    y: 50,
    route: '/dreams'
  },
  {
    id: '5',
    label: 'Insights',
    description: 'Personalized guidance and reflections',
    iconType: 'fibonacci',
    x: 30,
    y: 75,
    route: '/insights'
  },
  {
    id: '6',
    label: 'Community',
    description: 'Connect with fellow seekers',
    iconType: 'torus',
    x: 70,
    y: 75,
    route: '/community'
  }
];

// Connect all nodes to the center
export const initialConnections: NavigationConnectionData[] = [
  { id: 'c0-1', from: '0', to: '1' },
  { id: 'c0-2', from: '0', to: '2' },
  { id: 'c0-3', from: '0', to: '3' },
  { id: 'c0-4', from: '0', to: '4' },
  { id: 'c0-5', from: '0', to: '5' },
  { id: 'c0-6', from: '0', to: '6' },
  // Additional connections to create a hexagon pattern
  { id: 'c1-2', from: '1', to: '2' },
  { id: 'c2-4', from: '2', to: '4' },
  { id: 'c4-6', from: '4', to: '6' },
  { id: 'c6-5', from: '6', to: '5' },
  { id: 'c5-3', from: '5', to: '3' },
  { id: 'c3-1', from: '3', to: '1' },
  // Cross connections
  { id: 'c1-5', from: '1', to: '5' },
  { id: 'c2-6', from: '2', to: '6' },
  { id: 'c3-4', from: '3', to: '4' }
];
