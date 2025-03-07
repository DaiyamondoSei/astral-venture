
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
