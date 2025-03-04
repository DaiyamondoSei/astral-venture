
// Generate color based on energy level - moves through a spectrum
export const generateEnergyColor = (
  base: string, 
  intensity: number = 1, 
  showInfinity: boolean = false,
  showTranscendence: boolean = false, 
  showFractal: boolean = false,
  showIllumination: boolean = false
) => {
  if (showInfinity) {
    // Create a rainbow effect for infinity level
    const hue = (Date.now() / 50) % 360; // Constantly changing hue
    return `hsla(${hue}, 80%, 60%, ${intensity})`;
  }
  
  if (showTranscendence) {
    // White-gold for transcendence level
    return `rgba(255, 250, ${220 + Math.sin(Date.now()/1000) * 35}, ${intensity})`;
  }
  
  if (showFractal) {
    // Vibrant blue-purple for fractal level
    return `rgba(${100 + Math.sin(Date.now()/1000) * 20}, 100, ${200 + Math.sin(Date.now()/800) * 55}, ${intensity})`;
  }
  
  if (showIllumination) {
    // Cyan color for illumination level
    return `rgba(72, 191, 227, ${intensity})`;
  }
  
  // Default blue color
  return `rgba(56, 189, 248, ${intensity})`;
};
