export const calculateEmotionalGrowth = (reflections: any[]): number => {
  if (!reflections || reflections.length === 0) return 0;
  
  // Sort reflections by date
  const sortedReflections = [...reflections].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Calculate growth score based on emotional depth and time
  let growthScore = 0;
  
  for (let i = 1; i < sortedReflections.length; i++) {
    const currentReflection = sortedReflections[i];
    const previousReflection = sortedReflections[i - 1];
    
    const currentDepth = parseFloat(currentReflection.depth_score) || 0;
    const previousDepth = parseFloat(previousReflection.depth_score) || 0;
    
    // Calculate depth improvement
    const depthImprovement = currentDepth - previousDepth;
    
    // Weight more recent improvements higher
    const recencyFactor = i / sortedReflections.length;
    
    growthScore += depthImprovement * recencyFactor;
  }
  
  return growthScore;
};

// Fix any other instances of incorrect arithmetic operations
export const analyzeEmotionPatterns = (reflections: any[]): any => {
  if (!reflections || reflections.length === 0) {
    return {
      dominant_emotions: [],
      emotional_growth: 0,
      consistent_themes: [],
      recommended_focus: null
    };
  }
  
  // Extract emotions and calculate frequencies
  const emotionCounts: Record<string, number> = {};
  let totalDepthScore = 0;
  
  reflections.forEach(reflection => {
    const emotions = reflection.emotions || [];
    if (Array.isArray(emotions)) {
      emotions.forEach(emotion => {
        if (typeof emotion === 'string') {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
      });
    }
    
    // Add depth score
    const depthScore = parseFloat(reflection.depth_score) || 0;
    totalDepthScore += depthScore;
  });
  
  // Determine dominant emotions
  const sortedEmotions = Object.entries(emotionCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([emotion]) => emotion);
    
  const dominantEmotions = sortedEmotions.slice(0, 5);
  
  // Analyze consistent themes (simplified)
  const allThemes = reflections.map(reflection => reflection.themes || []).flat();
  const themeCounts: Record<string, number> = {};
  allThemes.forEach(theme => {
    if (typeof theme === 'string') {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  });
  
  const sortedThemes = Object.entries(themeCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([theme]) => theme);
    
  const consistentThemes = sortedThemes.slice(0, 3);
  
  // Calculate emotional growth
  const emotionalGrowth = calculateEmotionalGrowth(reflections);
  
  // Determine recommended focus (simplified)
  const recommendedFocus = dominantEmotions.length > 0 ? `Focus on understanding and processing ${dominantEmotions[0]}` : null;
  
  return {
    dominant_emotions: dominantEmotions,
    emotional_growth: emotionalGrowth,
    consistent_themes: consistentThemes,
    recommended_focus: recommendedFocus
  };
};
