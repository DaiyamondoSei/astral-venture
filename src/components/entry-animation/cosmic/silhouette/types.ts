
import { EnergyLevelProps } from '../types';

export interface SilhouetteProps extends Pick<EnergyLevelProps, 'showChakras' | 'showDetails' | 'showIllumination' | 'showFractal' | 'showTranscendence' | 'showInfinity' | 'baseProgressPercentage' | 'activatedChakras'> {
  getChakraIntensity: (baseChakraLevel: number) => number;
}

export interface SilhouettePartProps {
  showInfinity: boolean;
  showTranscendence: boolean;
  showIllumination: boolean;
  showFractal: boolean;
  showDetails: boolean;
  baseProgressPercentage: number;
}

export interface ChakraPointProps {
  cx: number;
  cy: number;
  chakraIndex: number;
  showChakras: boolean;
  showIllumination: boolean;
  showInfinity: boolean;
  showTranscendence: boolean;
  showFractal: boolean;
  baseProgressPercentage: number;
  intensity: number;
}
