
import { useState, useCallback, createContext, useContext } from 'react';
import { IAchievementData } from '../../data/types';

// Achievement state types
export interface IAchievementState {
  achievements: IAchievementData[];
  history: Record<string, any>;
  progressTracking: Record<string, number>;
}

// Achievement actions interface
export interface IAchievementActions {
  updateAchievement: (id: string, updates: Partial<IAchievementData>) => void;
  unlockAchievement: (id: string) => void;
  getAchievementProgress: (id: string) => number;
  trackProgress: (category: string, amount: number) => void;
  resetProgress: (category: string) => void;
}

// Create context
const AchievementContext = createContext<{
  state: IAchievementState;
  updateAchievement: IAchievementActions['updateAchievement'];
  unlockAchievement: IAchievementActions['unlockAchievement'];
  getAchievementProgress: IAchievementActions['getAchievementProgress'];
  trackProgress: IAchievementActions['trackProgress'];
  resetProgress: IAchievementActions['resetProgress'];
} | null>(null);

// Hook for using achievement state
export const useAchievementState = () => {
  const context = useContext(AchievementContext);
  
  if (!context) {
    throw new Error('useAchievementState must be used within an AchievementProvider');
  }
  
  return context;
};

// Provider component
export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<IAchievementState>({
    achievements: [],
    history: {},
    progressTracking: {}
  });
  
  // Update a specific achievement
  const updateAchievement = useCallback((id: string, updates: Partial<IAchievementData>) => {
    setState(prevState => ({
      ...prevState,
      achievements: prevState.achievements.map(achievement => 
        achievement.id === id 
          ? { ...achievement, ...updates } 
          : achievement
      )
    }));
  }, []);
  
  // Mark an achievement as unlocked
  const unlockAchievement = useCallback((id: string) => {
    setState(prevState => {
      // Update the achievement
      const updatedAchievements = prevState.achievements.map(achievement => 
        achievement.id === id 
          ? { ...achievement, unlocked: true } 
          : achievement
      );
      
      // Add to history
      const updatedHistory = {
        ...prevState.history,
        [id]: {
          unlockedAt: new Date().toISOString(),
          achievement: updatedAchievements.find(a => a.id === id)
        }
      };
      
      return {
        ...prevState,
        achievements: updatedAchievements,
        history: updatedHistory
      };
    });
  }, []);
  
  // Get progress for a specific achievement
  const getAchievementProgress = useCallback((id: string) => {
    const achievement = state.achievements.find(a => a.id === id);
    return achievement?.progress || 0;
  }, [state.achievements]);
  
  // Track progress for a category
  const trackProgress = useCallback((category: string, amount: number) => {
    setState(prevState => ({
      ...prevState,
      progressTracking: {
        ...prevState.progressTracking,
        [category]: (prevState.progressTracking[category] || 0) + amount
      }
    }));
  }, []);
  
  // Reset progress for a category
  const resetProgress = useCallback((category: string) => {
    setState(prevState => ({
      ...prevState,
      progressTracking: {
        ...prevState.progressTracking,
        [category]: 0
      }
    }));
  }, []);
  
  // Context value
  const value = {
    state,
    updateAchievement,
    unlockAchievement,
    getAchievementProgress,
    trackProgress,
    resetProgress
  };
  
  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

export default AchievementProvider;
