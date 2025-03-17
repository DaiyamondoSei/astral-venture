
/**
 * Utility functions for Metatron's Cube visualization
 */
import { CubeSize, CubeTheme, GlowIntensity } from '@/types/core/performance/types';
import { MetatronsNode, MetatronsConnection } from './types';

// Helper function to get theme color based on variant
export const getCubeThemeColors = (variant: CubeTheme = 'default') => {
  switch (variant) {
    case 'cosmic':
      return {
        primary: '#9f7aea',
        secondary: '#805ad5',
        glow: '#d6bcfa'
      };
    case 'ethereal':
      return {
        primary: '#4fd1c5',
        secondary: '#38b2ac',
        glow: '#b2f5ea'
      };
    case 'quantum':
      return {
        primary: '#f687b3',
        secondary: '#d53f8c',
        glow: '#fbb6ce'
      };
    default:
      return {
        primary: '#63b3ed',
        secondary: '#4299e1',
        glow: '#bee3f8'
      };
  }
};

// Helper function to get size dimensions
export const getCubeSizeDimensions = (size: CubeSize = 'md') => {
  switch (size) {
    case 'sm':
      return { width: 180, height: 180 };
    case 'md':
      return { width: 240, height: 240 };
    case 'lg':
      return { width: 320, height: 320 };
    case 'xl':
      return { width: 400, height: 400 };
    case 'full':
      return { width: '100%', height: '100%' };
    default:
      return { width: 240, height: 240 };
  }
};

// Helper function to get glow intensity
export const getGlowIntensity = (intensity?: number): GlowIntensity => {
  if (intensity === undefined) return 'medium';
  if (intensity <= 0.25) return 'none';
  if (intensity <= 0.5) return 'low';
  if (intensity <= 0.75) return 'medium';
  return 'high';
};

// Create default Metatron's Cube nodes
export const createDefaultNodes = (): MetatronsNode[] => {
  return [
    { id: 'center', x: 120, y: 120, radius: 10 },
    { id: 'node1', x: 60, y: 60, radius: 6 },
    { id: 'node2', x: 180, y: 60, radius: 6 },
    { id: 'node3', x: 180, y: 180, radius: 6 },
    { id: 'node4', x: 60, y: 180, radius: 6 },
    { id: 'node5', x: 120, y: 40, radius: 6 },
    { id: 'node6', x: 200, y: 120, radius: 6 },
    { id: 'node7', x: 120, y: 200, radius: 6 },
    { id: 'node8', x: 40, y: 120, radius: 6 },
    { id: 'node9', x: 60, y: 120, radius: 4 },
    { id: 'node10', x: 120, y: 60, radius: 4 },
    { id: 'node11', x: 180, y: 120, radius: 4 },
    { id: 'node12', x: 120, y: 180, radius: 4 },
  ];
};

// Create default connections between nodes
export const createDefaultConnections = (): MetatronsConnection[] => {
  return [
    { id: 'conn1', source: 'center', target: 'node1', from: 'center', to: 'node1' },
    { id: 'conn2', source: 'center', target: 'node2', from: 'center', to: 'node2' },
    { id: 'conn3', source: 'center', target: 'node3', from: 'center', to: 'node3' },
    { id: 'conn4', source: 'center', target: 'node4', from: 'center', to: 'node4' },
    { id: 'conn5', source: 'center', target: 'node5', from: 'center', to: 'node5' },
    { id: 'conn6', source: 'center', target: 'node6', from: 'center', to: 'node6' },
    { id: 'conn7', source: 'center', target: 'node7', from: 'center', to: 'node7' },
    { id: 'conn8', source: 'center', target: 'node8', from: 'center', to: 'node8' },
    { id: 'conn9', source: 'node1', target: 'node5', from: 'node1', to: 'node5' },
    { id: 'conn10', source: 'node5', target: 'node2', from: 'node5', to: 'node2' },
    { id: 'conn11', source: 'node2', target: 'node6', from: 'node2', to: 'node6' },
    { id: 'conn12', source: 'node6', target: 'node3', from: 'node6', to: 'node3' },
    { id: 'conn13', source: 'node3', target: 'node7', from: 'node3', to: 'node7' },
    { id: 'conn14', source: 'node7', target: 'node4', from: 'node7', to: 'node4' },
    { id: 'conn15', source: 'node4', target: 'node8', from: 'node4', to: 'node8' },
    { id: 'conn16', source: 'node8', target: 'node1', from: 'node8', to: 'node1' },
    { id: 'conn17', source: 'node9', target: 'node10', from: 'node9', to: 'node10' },
    { id: 'conn18', source: 'node10', target: 'node11', from: 'node10', to: 'node11' },
    { id: 'conn19', source: 'node11', target: 'node12', from: 'node11', to: 'node12' },
    { id: 'conn20', source: 'node12', target: 'node9', from: 'node12', to: 'node9' },
  ];
};
