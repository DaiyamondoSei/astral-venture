
export interface ColorScheme {
  background: string;
  particlePrimary: string;
  particleSecondary: string;
  glowColor: string;
  nodeColor?: string;
  connectionColor?: string;
  accentColor?: string;
}

export const getColorScheme = (scheme: 'default' | 'ethereal' | 'astral' | 'quantum'): ColorScheme => {
  switch (scheme) {
    case 'ethereal':
      return {
        background: 'from-[#030014] via-[#0F0527] to-[#10031c]',
        particlePrimary: '#8B5CF6',
        particleSecondary: '#6D28D9',
        glowColor: 'rgba(139, 92, 246, 0.5)',
        nodeColor: '#C4B5FD',
        connectionColor: 'rgba(196, 181, 253, 0.3)',
        accentColor: '#A78BFA'
      };
    case 'astral':
      return {
        background: 'from-[#040720] via-[#0F1A40] to-[#0A0F33]',
        particlePrimary: '#3B82F6',
        particleSecondary: '#1D4ED8',
        glowColor: 'rgba(59, 130, 246, 0.5)',
        nodeColor: '#93C5FD',
        connectionColor: 'rgba(147, 197, 253, 0.3)',
        accentColor: '#60A5FA'
      };
    case 'quantum':
      return {
        background: 'from-[#0C0A20] via-[#231748] to-[#190A38]',
        particlePrimary: '#EC4899',
        particleSecondary: '#BE185D',
        glowColor: 'rgba(236, 72, 153, 0.5)',
        nodeColor: '#F9A8D4',
        connectionColor: 'rgba(249, 168, 212, 0.3)',
        accentColor: '#F472B6'
      };
    default:
      return {
        background: 'from-[#221F26] via-[#2C2B33] to-[#191A23]',
        particlePrimary: '#A78BFA',
        particleSecondary: '#7C3AED',
        glowColor: 'rgba(167, 139, 250, 0.5)',
        nodeColor: '#A78BFA',
        connectionColor: 'rgba(167, 139, 250, 0.3)',
        accentColor: '#8B5CF6'
      };
  }
};

// Export additional color utilities
export const getGlowColorByIntensity = (baseColor: string, intensity: 'low' | 'medium' | 'high'): string => {
  const alphaMap = {
    low: 0.3,
    medium: 0.5,
    high: 0.7
  };
  
  // Extract RGB components
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alphaMap[intensity]})`;
};

// Utility to create gradient string from colors
export const createGradientString = (color1: string, color2: string, direction = '135deg'): string => {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
};
