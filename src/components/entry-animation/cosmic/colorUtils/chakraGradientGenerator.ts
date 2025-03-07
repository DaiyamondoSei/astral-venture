
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
