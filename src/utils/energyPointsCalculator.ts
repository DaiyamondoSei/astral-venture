
export const calculateEnergyPoints = (text: string): number => {
  // Base points for any reflection
  let points = 5;
  
  // Additional points based on depth (word count as a basic metric)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  
  if (wordCount > 50) points += 5;
  if (wordCount > 100) points += 5;
  if (wordCount > 200) points += 5;
  
  // Additional points for energy-related keywords
  const keywords = [
    'meditation', 'energy', 'chakra', 'breath', 'awareness', 
    'consciousness', 'presence', 'mindfulness', 'intuition', 'vibration'
  ];
  
  let keywordMatches = 0;
  keywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  });
  
  // Add points based on keyword usage (capped)
  points += Math.min(keywordMatches * 2, 10);
  
  return Math.min(points, 30); // Cap at 30 points max
};
