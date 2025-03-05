
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
  streakDays?: number;
  activatedChakras?: number[];
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

export const CHAKRA_COLORS = [
  "#FF0000", // Root - Red
  "#FF8000", // Sacral - Orange
  "#FFFF00", // Solar Plexus - Yellow
  "#00FF00", // Heart - Green
  "#00FFFF", // Throat - Light Blue
  "#0000FF", // Third Eye - Indigo
  "#8000FF"  // Crown - Violet
];

export const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown"
];

// Adding CHAKRA_POSITIONS needed by ChakraPoint
export const CHAKRA_POSITIONS = [
  { x: 150, y: 380 }, // Root
  { x: 150, y: 340 }, // Sacral
  { x: 150, y: 300 }, // Solar Plexus
  { x: 150, y: 260 }, // Heart
  { x: 150, y: 230 }, // Throat
  { x: 150, y: 205 }, // Third Eye
  { x: 150, y: 180 }  // Crown
];
