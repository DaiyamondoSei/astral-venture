
/**
 * Calculate the user's astral level based on their energy points
 */
export const calculateAstralLevel = (energyPoints: number): number => {
  return Math.max(1, Math.floor(energyPoints / 100) + 1);
};

/**
 * Calculate the XP needed for the next level
 */
export const calculateNextLevelXP = (level: number): number => {
  return level * 100;
};

/**
 * Calculate progress percentage toward next level
 */
export const calculateLevelProgress = (energyPoints: number, level: number): number => {
  const levelThreshold = (level - 1) * 100;
  const nextLevelThreshold = level * 100;
  const pointsInCurrentLevel = energyPoints - levelThreshold;
  const pointsNeededForLevel = nextLevelThreshold - levelThreshold;
  
  return Math.min(Math.round((pointsInCurrentLevel / pointsNeededForLevel) * 100), 100);
};
