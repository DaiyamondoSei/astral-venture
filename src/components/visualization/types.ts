
import { DeviceCapability } from '@/types/core/performance/constants';
import { ChakraType } from '@/types/consciousness';

export interface VisualizationProps {
  // Required props
  system?: any;
  energyPoints?: number;
  activatedChakras?: number[];
  
  // Optional props with defaults
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onVisualizationRendered?: () => void;
  deviceCapability?: DeviceCapability;
  theme?: 'light' | 'dark' | 'cosmic';
  animationLevel?: 'minimal' | 'standard' | 'enhanced';
  showDetails?: boolean;
  interactive?: boolean;
  glowIntensity?: number;
}

export interface IntegratedSystemProps {
  chakraActivations?: Record<ChakraType, number>;
  showQuantumEffects?: boolean;
  adaptToPerformance?: boolean;
}

export interface QuantumParticlesProps {
  count?: number;
  speed?: number;
  size?: number;
  opacity?: number;
  colors?: string[];
  interactive?: boolean;
}

export interface EnergyFieldProps {
  intensity?: number;
  colors?: string[];
  responsive?: boolean;
  interactive?: boolean;
  onInteraction?: (intensity: number, position: { x: number; y: number }) => void;
}

export interface InitialOrbProps {
  pulsating?: boolean;
}

export interface AstralBodyProps {
  activated?: boolean;
}

export interface WelcomeStepProps {
  onNext?: () => void;
}

export interface FocusStepProps {
  onNext?: () => void;
}

export interface BreathingExerciseProps {
  onNext?: () => void;
}

export interface FinalStepProps {
  onComplete?: () => void;
}

export interface IAchievementHeaderProps {
  achievementCount?: number;
}

export interface IAchievementFilterProps {
  categories?: any[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export interface IEmptyAchievementListProps {
  selectedCategory: string;
}
