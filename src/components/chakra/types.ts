
import { ChakraType } from '@/types/consciousness';

// Define ChakraActivationProps interface
export interface ChakraActivationProps {
  // Required props
  system?: any;
  energyPoints?: number;
  activatedChakras?: number[];
  onActivationChange?: (activatedChakras: number[]) => void;
  
  // Optional props with defaults
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  showLabels?: boolean;
  animationLevel?: 'basic' | 'enhanced' | 'maximum';
  theme?: 'light' | 'dark' | 'cosmic';
  initialActivation?: number[];
  autoActivate?: boolean;
  pulseEffect?: boolean;
  glowIntensity?: number;
  chakraColors?: Record<string, string>;
  backgroundEffect?: boolean;
  renderQuality?: 'low' | 'medium' | 'high';
  className?: string;
}

// Entanglement state interface for quantum effects
export interface EntanglementState {
  activePairs: [number, number][];
  entanglementStrength: number;
  quantumFluctuations: boolean;
  stabilityFactor: number;
}

// Define a chakra status interface
export interface ChakraStatus {
  activation: number;
  balance: number;
  blockages: string[];
  dominantEmotions: string[];
}

// Define chakra system interface
export interface ChakraSystem {
  chakras: Record<ChakraType, ChakraStatus>;
  overallBalance: number;
  dominantChakra: ChakraType | null;
  lastUpdated: string;
}

// Define VisualizationProps interface
export interface VisualizationProps {
  // Required props
  system?: any;
  energyPoints?: number;
  activatedChakras?: number[];
  
  // Optional props with defaults
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onVisualizationRendered?: () => void;
  deviceCapability?: 'low' | 'medium' | 'high';
  theme?: 'light' | 'dark' | 'cosmic';
  animationLevel?: 'minimal' | 'standard' | 'enhanced';
  showDetails?: boolean;
  interactive?: boolean;
  glowIntensity?: number;
}

export interface GlassmorphicContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'quantum' | 'ethereal' | 'elevated' | 'subtle' | 'medium' | 'cosmic' | 'purple';
  blur?: string; // New prop for blur level
  animate?: boolean;
  motionProps?: any;
  centerContent?: boolean;
  glowEffect?: boolean;
  shimmer?: boolean;
  transitionDuration?: number;
}
