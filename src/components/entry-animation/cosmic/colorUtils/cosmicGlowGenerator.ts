
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
