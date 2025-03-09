
import { CubeNode, CubeLine } from './types';

/**
 * Calculates the node positions in the Metatron's Cube
 */
export const getCubeNodes = (size: number): CubeNode[] => {
  const center = size / 2;
  const radius = size * 0.4;
  
  // Central node
  const nodes = [{ id: 0, x: center, y: center }];
  
  // Inner hexagon (6 nodes)
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    nodes.push({
      id: i + 1,
      x: center + radius * 0.5 * Math.cos(angle),
      y: center + radius * 0.5 * Math.sin(angle)
    });
  }
  
  // Outer hexagon (6 nodes)
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    nodes.push({
      id: i + 7,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    });
  }
  
  return nodes;
};

/**
 * Generates the lines connecting the nodes in the Metatron's Cube
 */
export const generateCubeLines = (): CubeLine[] => {
  const lines = [];
  
  // Connect center to inner hexagon
  for (let i = 1; i <= 6; i++) {
    lines.push({ from: 0, to: i });
  }
  
  // Connect inner hexagon nodes to each other
  for (let i = 1; i <= 6; i++) {
    lines.push({ from: i, to: i === 6 ? 1 : i + 1 });
  }
  
  // Connect inner hexagon to outer hexagon
  for (let i = 1; i <= 6; i++) {
    lines.push({ from: i, to: i + 6 });
  }
  
  // Connect outer hexagon nodes to each other
  for (let i = 7; i <= 12; i++) {
    lines.push({ from: i, to: i === 12 ? 7 : i + 1 });
  }
  
  // Connect additional inner lines for the full Metatron's Cube
  lines.push({ from: 1, to: 9 });
  lines.push({ from: 1, to: 11 });
  lines.push({ from: 2, to: 10 });
  lines.push({ from: 2, to: 12 });
  lines.push({ from: 3, to: 11 });
  lines.push({ from: 3, to: 7 });
  lines.push({ from: 4, to: 12 });
  lines.push({ from: 4, to: 8 });
  lines.push({ from: 5, to: 7 });
  lines.push({ from: 5, to: 9 });
  lines.push({ from: 6, to: 8 });
  lines.push({ from: 6, to: 10 });
  
  return lines;
};

/**
 * Calculates the glow filter value based on intensity
 */
export const getGlowFilter = (glowIntensity: 'none' | 'low' | 'medium' | 'high', glowColor: string, enableGlow: boolean): string => {
  if (glowIntensity === 'none' || !enableGlow) return '';
  
  const intensityMap = {
    low: 3,
    medium: 6,
    high: 10
  };
  
  return `drop-shadow(0 0 ${intensityMap[glowIntensity]}px ${glowColor})`;
};
