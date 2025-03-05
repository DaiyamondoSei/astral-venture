
export interface EnergyProps {
  energyPoints?: number;
  streakDays?: number;
  activatedChakras?: number[];
  // Dev mode overrides
  showDetailsOverride?: boolean;
  showIlluminationOverride?: boolean;
  showFractalOverride?: boolean;
  showTranscendenceOverride?: boolean;
  showInfinityOverride?: boolean;
}

export interface VisualizationState {
  showChakras: boolean;
  showAura: boolean;
  showConstellation: boolean;
  showDetails: boolean;
  showIllumination: boolean;
  showFractal: boolean;
  showTranscendence: boolean;
  showInfinity: boolean;
  baseProgressPercentage: number;
  infiniteProgress: number;
  fractalComplexity: number;
}
