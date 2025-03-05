
export const calculateEmotionalGrowth = (reflections: any[]): number => {
  if (!reflections || reflections.length === 0) return 0;
  
  try {
    // Sort reflections by date
    const sortedReflections = [...reflections].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Calculate growth score based on emotional depth and time
    let growthScore = 0;
    
    for (let i = 1; i < sortedReflections.length; i++) {
      const currentReflection = sortedReflections[i];
      const previousReflection = sortedReflections[i - 1];
      
      const currentDepth = parseFloat(currentReflection.depth_score || '0') || 0;
      const previousDepth = parseFloat(previousReflection.depth_score || '0') || 0;
      
      // Calculate depth improvement
      const depthImprovement = currentDepth - previousDepth;
      
      // Weight more recent improvements higher
      const recencyFactor = i / sortedReflections.length;
      
      growthScore += depthImprovement * recencyFactor;
    }
    
    return growthScore;
  } catch (error) {
    console.error('Error calculating emotional growth:', error);
    return 0;
  }
};

// Fix any other instances of incorrect arithmetic operations
export const analyzeEmotionPatterns = (reflections: any[]): any => {
  if (!reflections || reflections.length === 0) {
    return {
      dominantEmotions: [],
      dominantChakras: [],
      emotionalGrowth: 0,
      consistentThemes: [],
      recommendedFocus: ['Start with regular reflection practice'],
      recentTrends: ['Building your practice'],
      chakraProgression: []
    };
  }
  
  try {
    // Extract emotions and calculate frequencies
    const emotionCounts: Record<string, number> = {};
    const chakraCounts: Record<string, number> = {};
    let totalDepthScore = 0;
    
    reflections.forEach(reflection => {
      // Process emotions
      const emotions = reflection.emotions || [];
      if (Array.isArray(emotions)) {
        emotions.forEach(emotion => {
          if (typeof emotion === 'string') {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          }
        });
      }
      
      // Process activated chakras
      const chakras = reflection.chakras_activated || [];
      if (Array.isArray(chakras)) {
        chakras.forEach(chakra => {
          if (typeof chakra === 'number') {
            chakraCounts[chakra] = (chakraCounts[chakra] || 0) + 1;
          }
        });
      }
      
      // Add depth score
      const depthScore = parseFloat(reflection.depth_score || '0') || 0;
      totalDepthScore += depthScore;
    });
    
    // Determine dominant emotions
    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([emotion]) => emotion);
      
    const dominantEmotions = sortedEmotions.slice(0, 5);
    
    // Determine dominant chakras
    const sortedChakras = Object.entries(chakraCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([chakra]) => parseInt(chakra));
      
    const dominantChakras = sortedChakras.slice(0, 3);
    
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
    
    // Generate recommendations based on patterns
    const recentTrends = [];
    const recommendedFocus = [];
    
    // Add recent trends based on emotional patterns
    if (dominantEmotions.length > 0) {
      recentTrends.push(`Exploring ${dominantEmotions[0]} experiences`);
    }
    
    if (dominantChakras.length > 0) {
      recentTrends.push(`Developing awareness of the ${getChakraName(dominantChakras[0])} energy center`);
    }
    
    // Add recommended focus areas
    if (dominantEmotions.length > 0) {
      recommendedFocus.push(`Deepen your understanding of ${dominantEmotions[0]} energy`);
    }
    
    if (dominantChakras.length > 0) {
      recommendedFocus.push(`Work with ${getChakraName(dominantChakras[0])} chakra practices`);
    }
    
    return {
      dominantEmotions,
      dominantChakras,
      emotionalGrowth,
      consistentThemes,
      recommendedFocus: recommendedFocus.length > 0 ? recommendedFocus : ['Establish a regular practice routine'],
      recentTrends: recentTrends.length > 0 ? recentTrends : ['Beginning your energy journey'],
      chakraProgression: Array.from(new Set(sortedChakras))
    };
  } catch (error) {
    console.error('Error analyzing emotion patterns:', error);
    return {
      dominantEmotions: [],
      dominantChakras: [],
      emotionalGrowth: 0,
      consistentThemes: [],
      recommendedFocus: ['Practice mindful reflection'],
      recentTrends: ['Building awareness'],
      chakraProgression: []
    };
  }
};

// Helper function to get chakra name
function getChakraName(index: number): string {
  const chakraNames = [
    "Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"
  ];
  return chakraNames[index] || "Unknown";
}
