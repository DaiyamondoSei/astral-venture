
// Enhanced color utilities for energy visualizations

/**
 * Generates a color based on energy level - moves through a refined spectrum
 * with smooth transitions between energy states
 */
export const generateEnergyColor = (
  base: string, 
  intensity: number = 1, 
  showInfinity: boolean = false,
  showTranscendence: boolean = false, 
  showFractal: boolean = false,
  showIllumination: boolean = false
) => {
  // Create a pulsating factor for more dynamic effects
  const pulseFactor = Math.sin(Date.now() / 1000) * 0.1 + 0.9;
  
  if (showInfinity) {
    // Create a refined rainbow effect for infinity level with better color coherence
    const hue = (Date.now() / 50) % 360;
    // Use HSL for better color control - more saturated and luminous
    return `hsla(${hue}, ${85 * pulseFactor}%, ${65 * pulseFactor}%, ${intensity})`;
  }
  
  if (showTranscendence) {
    // White-gold with improved luminosity for transcendence level
    return `rgba(255, ${250 * pulseFactor}, ${220 + Math.sin(Date.now()/800) * 35}, ${intensity})`;
  }
  
  if (showFractal) {
    // Improved vibrant blue-purple for fractal level with dynamic shifts
    const blueShift = 100 + Math.sin(Date.now()/900) * 25;
    const purpleShift = 200 + Math.sin(Date.now()/700) * 55;
    return `rgba(${blueShift}, 120, ${purpleShift}, ${intensity})`;
  }
  
  if (showIllumination) {
    // Enhanced cyan-teal color for illumination level with subtle variations
    const greenValue = 191 + Math.sin(Date.now()/1200) * 20;
    return `rgba(72, ${greenValue}, 227, ${intensity})`;
  }
  
  // Enhanced default blue color with subtle pulsing
  const blueValue = 189 + Math.sin(Date.now()/1500) * 15;
  return `rgba(56, ${blueValue}, 248, ${intensity * pulseFactor})`;
};

/**
 * Generates gradient colors for chakra-specific elements
 * @param chakraIndex The index of the chakra
 * @param intensity The intensity factor
 */
export const generateChakraGradient = (chakraIndex: number, intensity: number = 1) => {
  // Enhanced chakra color mapping with better color harmony
  const chakraBaseColors = [
    { from: 'rgba(227, 27, 72, 0.8)', to: 'rgba(227, 27, 72, 0.4)' },   // Root - refined red
    { from: 'rgba(251, 146, 60, 0.8)', to: 'rgba(251, 146, 60, 0.4)' }, // Sacral - refined orange
    { from: 'rgba(250, 204, 21, 0.8)', to: 'rgba(250, 204, 21, 0.4)' }, // Solar Plexus - refined yellow
    { from: 'rgba(34, 197, 94, 0.8)', to: 'rgba(34, 197, 94, 0.4)' },   // Heart - refined green
    { from: 'rgba(14, 165, 233, 0.8)', to: 'rgba(14, 165, 233, 0.4)' }, // Throat - refined blue
    { from: 'rgba(99, 102, 241, 0.8)', to: 'rgba(99, 102, 241, 0.4)' }, // Third Eye - refined indigo
    { from: 'rgba(168, 85, 247, 0.8)', to: 'rgba(168, 85, 247, 0.4)' }  // Crown - refined purple
  ];
  
  // Get the base colors or default to the first one
  const colors = chakraBaseColors[chakraIndex] || chakraBaseColors[0];
  
  // Apply intensity factor to adjust transparency
  const fromColor = colors.from.replace(/[\d\.]+\)$/, `${intensity * 0.8})`);
  const toColor = colors.to.replace(/[\d\.]+\)$/, `${intensity * 0.4})`);
  
  return {
    from: fromColor,
    to: toColor
  };
};

/**
 * Generates a cosmic glow color based on energy state
 */
export const generateCosmicGlow = (
  energyPoints: number,
  baseColor: string = 'rgba(138, 92, 246, 0.5)'
) => {
  // Calculate intensity based on energy points
  const intensity = Math.min(0.3 + (energyPoints / 1500) * 0.7, 0.9);
  
  // For higher energy points, shift color toward more ethereal hues
  if (energyPoints > 1000) {
    return `rgba(180, 180, 255, ${intensity})`;
  }
  if (energyPoints > 500) {
    return `rgba(150, 150, 250, ${intensity})`;
  }
  
  // Default cosmic glow
  return baseColor.replace(/[\d\.]+\)$/, `${intensity})`);
};
