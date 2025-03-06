
// Helper functions for the get-recommendations edge function

/**
 * Get chakra-specific recommendations
 * @param chakraIndex Index of the chakra (0-6)
 * @returns A recommendation string for the specified chakra
 */
export function getChakraRecommendation(chakraIndex: number): string {
  const recommendations = [
    // Root (0)
    "Practice grounding meditation with visualization of roots extending into the earth",
    // Sacral (1)
    "Explore creative expression through art, dance, or music to stimulate sacral energy",
    // Solar Plexus (2)
    "Set and achieve small daily goals to build confidence and personal power",
    // Heart (3)
    "Practice loving-kindness meditation focusing on self-compassion and forgiveness",
    // Throat (4)
    "Journal your authentic thoughts and feelings daily, then read them aloud to yourself",
    // Third Eye (5)
    "Practice visualization meditation focusing on your inner vision and intuition",
    // Crown (7)
    "Try silent meditation focusing on connection to higher consciousness"
  ];
  
  return recommendations[chakraIndex] || getGeneralRecommendation();
}

/**
 * Get recommendations for activating specific chakras
 * @param chakraIndex Index of the chakra to activate (0-6)
 * @returns A recommendation string for activating the specified chakra
 */
export function getChakraActivationRecommendation(chakraIndex: number): string {
  const recommendations = [
    // Root (0)
    "Work with red crystals like jasper or garnet to activate your root chakra stability",
    // Sacral (1)
    "Practice hip-opening yoga poses to stimulate sacral chakra energy flow",
    // Solar Plexus (2)
    "Recite empowering affirmations daily to strengthen your solar plexus chakra",
    // Heart (3)
    "Practice chest-opening stretches and deep breathing to activate heart energy",
    // Throat (4)
    "Sing, chant, or hum daily to activate and balance throat chakra expression",
    // Third Eye (5)
    "Try a guided third eye meditation using indigo visualization",
    // Crown (7)
    "Practice sitting in silence for 10 minutes daily to open crown chakra awareness"
  ];
  
  return recommendations[chakraIndex] || getGeneralRecommendation();
}

/**
 * Get emotion-based recommendations
 * @param emotion The dominant emotion
 * @returns A recommendation string based on the emotion
 */
export function getEmotionRecommendation(emotion: string): string {
  const lowerEmotion = emotion.toLowerCase();
  
  if (lowerEmotion.includes("love") || lowerEmotion.includes("compassion")) {
    return "Expand your heart-centered practice with a daily gratitude ritual";
  }
  
  if (lowerEmotion.includes("peace") || lowerEmotion.includes("calm")) {
    return "Deepen your peaceful state with longer meditation sessions and mindful walking";
  }
  
  if (lowerEmotion.includes("joy") || lowerEmotion.includes("happiness")) {
    return "Channel your joyful energy into creative expression through art, music, or movement";
  }
  
  if (lowerEmotion.includes("power") || lowerEmotion.includes("strength")) {
    return "Harness your empowered state with intention-setting and manifestation practices";
  }
  
  if (lowerEmotion.includes("wisdom") || lowerEmotion.includes("insight")) {
    return "Deepen your wisdom through contemplative reading and philosophical journaling";
  }
  
  // Default recommendation
  return "Practice emotional awareness meditation to connect with the full spectrum of your feelings";
}

/**
 * Get general practice recommendations
 * @returns A random general recommendation
 */
export function getGeneralRecommendation(): string {
  const generalRecommendations = [
    "Establish a consistent meditation practice at the same time each day",
    "Try breathwork techniques like alternate nostril breathing for energy balance",
    "Spend time in nature to harmonize your energy with natural rhythms",
    "Practice energy scanning meditation to increase awareness of your subtle body",
    "Try a digital detox for 24 hours to reset your energetic sensitivity",
    "Explore sound healing through singing bowls or binaural beats",
    "Create a bedtime ritual to improve dream recall and astral experiences"
  ];
  
  return generalRecommendations[Math.floor(Math.random() * generalRecommendations.length)];
}

/**
 * Generate personalized recommendations based on user reflections
 * @param reflections Array of user reflection data
 * @returns Array of personalized recommendation strings
 */
export function generatePersonalizedRecommendations(reflections: any[]): string[] {
  // If no reflections, return generic recommendations
  if (!reflections || reflections.length === 0) {
    return [
      "Start a daily meditation practice with 5-10 minutes each morning",
      "Begin a reflection journal to track your energy experiences",
      "Try a basic chakra breathing exercise to connect with your energy centers",
      "Practice grounding by spending time in nature each day"
    ];
  }
  
  // Analyze reflection patterns
  const allChakras = reflections
    .flatMap(r => r.chakras_activated || [])
    .filter(Boolean);
  
  const dominantEmotions = reflections
    .map(r => r.dominant_emotion)
    .filter(Boolean);
  
  const recommendations = [];
  
  // Add chakra-specific recommendations
  if (allChakras.length > 0) {
    // Count frequency of each chakra
    const chakraCounts = allChakras.reduce((acc, chakra) => {
      acc[chakra] = (acc[chakra] || 0) + 1;
      return acc;
    }, {});
    
    // Find most and least active chakras
    const sortedChakras = Object.entries(chakraCounts)
      .sort((a, b) => b[1] - a[1]);
    
    const mostActiveChakra = parseInt(sortedChakras[0][0]);
    
    // Get recommendations for balancing
    recommendations.push(getChakraRecommendation(mostActiveChakra));
    
    // Check for missing chakras (ones not activated at all)
    const allChakraIndices = [0, 1, 2, 3, 4, 5, 6];
    const missingChakras = allChakraIndices.filter(
      index => !allChakras.includes(index)
    );
    
    if (missingChakras.length > 0) {
      // Recommend activating a missing chakra
      recommendations.push(getChakraActivationRecommendation(missingChakras[0]));
    }
  }
  
  // Add emotion-based recommendations
  if (dominantEmotions.length > 0) {
    const emotionCounts = dominantEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    
    const topEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    recommendations.push(getEmotionRecommendation(topEmotion));
  }
  
  // Add general progression recommendations
  if (reflections.length >= 5) {
    recommendations.push("Create a sacred space for your practices to deepen your energy work");
    recommendations.push("Try a 21-day energy cultivation challenge to establish consistency");
  }
  
  // Ensure we return at least 3 recommendations
  while (recommendations.length < 3) {
    recommendations.push(getGeneralRecommendation());
  }
  
  // Return maximum 5 recommendations
  return recommendations.slice(0, 5);
}
