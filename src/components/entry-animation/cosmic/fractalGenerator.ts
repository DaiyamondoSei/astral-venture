
// Generate fractal patterns using a simplified algorithm
export const generateFractalPoints = (
  showFractal: boolean, 
  showTranscendence: boolean, 
  showInfinity: boolean, 
  fractalComplexity: number, 
  infiniteProgress: number
) => {
  if (!showFractal) return [];
  
  const points = [];
  const iterations = Math.min(Math.floor(fractalComplexity * 5), 40);
  const centerX = 50;
  const centerY = 50;
  const radius = 30 + (infiniteProgress * 10);
  
  // Create a simplified fractal pattern
  for (let i = 0; i < iterations; i++) {
    const angle = (i / iterations) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Add main points
    points.push({ 
      x, 
      y, 
      size: 1 + (Math.sin(i * 0.5) * 0.5), 
      rotation: angle 
    });
    
    // Add sub-points for more complex fractals
    if (showTranscendence) {
      const subRadius = radius * 0.7;
      const subAngle = angle + (Math.PI / iterations);
      const subX = centerX + Math.cos(subAngle) * subRadius;
      const subY = centerY + Math.sin(subAngle) * subRadius;
      
      points.push({ 
        x: subX, 
        y: subY, 
        size: 0.8, 
        rotation: subAngle 
      });
    }
    
    // Add even more complex structures at infinity level
    if (showInfinity && i % 2 === 0) {
      const microRadius = radius * 0.4;
      const microAngle = angle + (Math.PI / iterations) * 3;
      const microX = centerX + Math.cos(microAngle) * microRadius;
      const microY = centerY + Math.sin(microAngle) * microRadius;
      
      points.push({ 
        x: microX, 
        y: microY, 
        size: 0.6 + (Math.random() * 0.4), 
        rotation: microAngle * 2 
      });
    }
  }
  
  return points;
};
