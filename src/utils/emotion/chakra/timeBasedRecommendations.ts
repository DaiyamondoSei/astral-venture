
/**
 * Functions for generating time-specific chakra recommendations
 */

/**
 * Generate a time-sensitive recommendation that changes based on the time of day
 * This adds an element of uniqueness to each analysis
 * 
 * @param activatedChakras - Array of activated chakra indices
 * @returns A time-specific recommendation or null
 */
export const getTimeBasedRecommendation = (activatedChakras: number[]): string | null => {
  const hour = new Date().getHours();
  
  // Morning recommendations (5 AM - 11 AM)
  if (hour >= 5 && hour < 12) {
    if (activatedChakras.includes(0)) {
      return "Morning is an ideal time to ground your root chakra energy through standing poses or earth connection.";
    } else if (activatedChakras.includes(3)) {
      return "The morning hours are excellent for heart-opening practices to set a compassionate tone for your day.";
    }
  }
  // Afternoon recommendations (12 PM - 5 PM)
  else if (hour >= 12 && hour < 18) {
    if (activatedChakras.includes(2)) {
      return "Afternoon is the perfect time to channel your solar plexus energy into purposeful action and personal power.";
    } else if (activatedChakras.includes(4)) {
      return "Express your activated throat chakra energy through afternoon creative communication or singing practices.";
    }
  }
  // Evening recommendations (6 PM - 9 PM)
  else if (hour >= 18 && hour < 22) {
    if (activatedChakras.includes(6)) {
      return "Evening meditation practices can enhance your crown chakra connection to universal consciousness.";
    } else if (activatedChakras.includes(1)) {
      return "Channel your sacral creativity into evening artistic expression or conscious connection with others.";
    }
  }
  // Night recommendations (10 PM - 4 AM)
  else {
    if (activatedChakras.includes(5)) {
      return "Your third eye activation is naturally enhanced during nighttime. Dream journaling or pre-sleep visualization can deepen this connection.";
    } else if (activatedChakras.includes(3)) {
      return "Practice heart-centered breathing before sleep to integrate the day's experiences through your activated heart chakra.";
    }
  }
  
  return null;
};
