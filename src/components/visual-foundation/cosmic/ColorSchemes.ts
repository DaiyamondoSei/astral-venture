
export interface ColorScheme {
  background: string;
  particlePrimary: string;
  particleSecondary: string;
  glowColor: string;
  nodeColor?: string;
  connectionColor?: string;
  accentColor?: string;
}

/**
 * Available color scheme types
 */
export type ColorSchemeType = 'default' | 'ethereal' | 'astral' | 'quantum' | 'cosmic';

/**
 * Get a color scheme by name
 * 
 * @param scheme - The color scheme to retrieve
 * @returns The color scheme configuration
 */
export const getColorScheme = (scheme: ColorSchemeType): ColorScheme => {
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
    case 'cosmic':
      return {
        background: 'from-[#070B14] via-[#0F182A] to-[#0A1022]',
        particlePrimary: '#7DD3FC',
        particleSecondary: '#0EA5E9',
        glowColor: 'rgba(125, 211, 252, 0.5)',
        nodeColor: '#BAE6FD',
        connectionColor: 'rgba(186, 230, 253, 0.3)',
        accentColor: '#38BDF8'
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

/**
 * Intensity levels for glow effects
 */
export type GlowIntensity = 'low' | 'medium' | 'high';

/**
 * Get a glow color with a specific intensity
 * 
 * @param baseColor - The base color to apply the glow to
 * @param intensity - The intensity level for the glow
 * @returns The glow color with applied intensity
 */
export const getGlowColorByIntensity = (baseColor: string, intensity: GlowIntensity): string => {
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

/**
 * Create a gradient string from two colors
 * 
 * @param color1 - The first color in the gradient
 * @param color2 - The second color in the gradient
 * @param direction - The direction of the gradient in degrees
 * @returns A CSS gradient string
 */
export const createGradientString = (color1: string, color2: string, direction = '135deg'): string => {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
};

/**
 * Create a radial gradient string
 * 
 * @param centerColor - The center color of the gradient
 * @param outerColor - The outer color of the gradient
 * @param shape - The shape of the gradient
 * @returns A CSS radial gradient string
 */
export const createRadialGradientString = (
  centerColor: string, 
  outerColor: string,
  shape: 'circle' | 'ellipse' = 'circle'
): string => {
  return `radial-gradient(${shape} at center, ${centerColor}, ${outerColor})`;
};

/**
 * Available animation patterns
 */
export type AnimationPattern = 'pulse' | 'wave' | 'sparkle' | 'glow' | 'shimmer';

/**
 * Get animation properties for a specified pattern
 * 
 * @param pattern - The animation pattern to use
 * @param duration - The duration of the animation in seconds
 * @returns Animation properties object
 */
export const getAnimationProperties = (
  pattern: AnimationPattern,
  duration: number = 3
): Record<string, unknown> => {
  switch (pattern) {
    case 'pulse':
      return {
        scale: [1, 1.05, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };
    case 'wave':
      return {
        y: [0, -5, 0, 5, 0],
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };
    case 'sparkle':
      return {
        filter: [
          'brightness(1)',
          'brightness(1.2) saturate(1.2)',
          'brightness(1)'
        ],
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };
    case 'glow':
      return {
        boxShadow: [
          '0 0 5px rgba(255,255,255,0.3)',
          '0 0 20px rgba(255,255,255,0.6)',
          '0 0 5px rgba(255,255,255,0.3)'
        ],
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };
    case 'shimmer':
      return {
        background: [
          'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%)',
          'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%)'
        ],
        backgroundPosition: ['200% 0', '-200% 0'],
        backgroundSize: '200% 100%',
        transition: {
          duration,
          repeat: Infinity,
          ease: "linear"
        }
      };
    default:
      return {
        opacity: [0.7, 1, 0.7],
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };
  }
};

export default {
  getColorScheme,
  getGlowColorByIntensity,
  createGradientString,
  createRadialGradientString,
  getAnimationProperties
};
