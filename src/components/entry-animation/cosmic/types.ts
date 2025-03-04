
export interface EnergyLevelProps {
  energyPoints: number;
  showTranscendence: boolean;
  showInfinity: boolean;
  showFractal: boolean;
  showIllumination: boolean;
  showAura: boolean;
  showConstellation: boolean;
  showDetails: boolean;
  showChakras: boolean;
  baseProgressPercentage: number;
  infiniteProgress: number;
  fractalComplexity: number;
}

export const ENERGY_THRESHOLDS = {
  BASE: 0,          // Basic silhouette
  CHAKRAS: 30,      // Chakra points activate
  AURA: 100,        // Aura field becomes visible
  CONSTELLATION: 200, // Constellation lines become more complex
  DETAILS: 350,     // Additional detailed elements
  ILLUMINATION: 500, // Full illumination of all body parts
  FRACTAL: 750,     // Fractal patterns emerge
  TRANSCENDENCE: 1000, // Transcendent state
  INFINITY: 2000    // Near-infinite complexity
};
