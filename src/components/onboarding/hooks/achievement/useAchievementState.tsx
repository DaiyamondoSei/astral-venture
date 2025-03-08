
import { useState, useEffect, useCallback } from 'react';
import { IAchievementData } from '../../data/validators';

export interface IAchievementState {
  achievements: IAchievementData[];
  completed: IAchievementData[];
  inProgress: IAchievementData[];
  locked: IAchievementData[];
  visible: IAchievementData[];
  currentlyDisplayed: IAchievementData | null;
  isAchievementVisible: boolean;
}

const initialState: IAchievementState = {
  achievements: [],
  completed: [],
  inProgress: [],
  locked: [],
  visible: [],
  currentlyDisplayed: null,
  isAchievementVisible: false
};

export interface IAchievementActions {
  completeAchievement: (id: string) => void;
  showAchievement: (achievement: IAchievementData) => void;
  hideAchievement: () => void;
  updateProgress: (id: string, progress: number) => void;
  unlockAchievement: (id: string) => void;
  loadAchievements: (achievements: IAchievementData[]) => void;
  resetState: () => void;
}

export function useAchievementState(
  defaultAchievements: IAchievementData[] = []
): [IAchievementState, IAchievementActions] {
  const [state, setState] = useState<IAchievementState>({
    ...initialState,
    achievements: defaultAchievements
  });

  // Initialize achievement data
  useEffect(() => {
    if (defaultAchievements.length > 0) {
      loadAchievements(defaultAchievements);
    }
  }, [defaultAchievements]);

  // Action to complete an achievement
  const completeAchievement = useCallback((id: string) => {
    setState(prev => {
      const achievement = prev.achievements.find(a => a.id === id);
      if (!achievement) return prev;

      const updatedAchievement = {
        ...achievement,
        completed: true,
        completedAt: new Date(),
        progress: 100
      };

      const updatedAchievements = prev.achievements.map(a =>
        a.id === id ? updatedAchievement : a
      );

      // Update the completed and inProgress lists
      const newCompleted = [...prev.completed, updatedAchievement];
      const newInProgress = prev.inProgress.filter(a => a.id !== id);

      return {
        ...prev,
        achievements: updatedAchievements,
        completed: newCompleted,
        inProgress: newInProgress,
        currentlyDisplayed: updatedAchievement,
        isAchievementVisible: true
      };
    });
  }, []);

  // Action to show an achievement
  const showAchievement = useCallback((achievement: IAchievementData) => {
    setState(prev => ({
      ...prev,
      currentlyDisplayed: achievement,
      isAchievementVisible: true
    }));
  }, []);

  // Action to hide the currently displayed achievement
  const hideAchievement = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAchievementVisible: false
    }));
  }, []);

  // Action to update achievement progress
  const updateProgress = useCallback((id: string, progress: number) => {
    setState(prev => {
      const achievement = prev.achievements.find(a => a.id === id);
      if (!achievement) return prev;

      const shouldComplete = progress >= 100;
      
      const updatedAchievement = {
        ...achievement,
        progress,
        completed: shouldComplete,
        completedAt: shouldComplete ? new Date() : undefined
      };

      const updatedAchievements = prev.achievements.map(a =>
        a.id === id ? updatedAchievement : a
      );

      // Update the lists
      let newCompleted = [...prev.completed];
      let newInProgress = [...prev.inProgress];

      if (shouldComplete) {
        newCompleted = [...newCompleted, updatedAchievement];
        newInProgress = newInProgress.filter(a => a.id !== id);
      } else if (!newInProgress.some(a => a.id === id)) {
        newInProgress = [...newInProgress, updatedAchievement];
      } else {
        newInProgress = newInProgress.map(a => 
          a.id === id ? updatedAchievement : a
        );
      }

      return {
        ...prev,
        achievements: updatedAchievements,
        completed: newCompleted,
        inProgress: newInProgress,
        currentlyDisplayed: shouldComplete ? updatedAchievement : prev.currentlyDisplayed,
        isAchievementVisible: shouldComplete ? true : prev.isAchievementVisible
      };
    });
  }, []);

  // Action to unlock an achievement
  const unlockAchievement = useCallback((id: string) => {
    setState(prev => {
      const achievement = prev.achievements.find(a => a.id === id);
      if (!achievement) return prev;

      const updatedAchievement = {
        ...achievement,
        visible: true
      };

      const updatedAchievements = prev.achievements.map(a =>
        a.id === id ? updatedAchievement : a
      );

      // Update the visible and locked lists
      const newVisible = [...prev.visible, updatedAchievement];
      const newLocked = prev.locked.filter(a => a.id !== id);

      return {
        ...prev,
        achievements: updatedAchievements,
        visible: newVisible,
        locked: newLocked,
      };
    });
  }, []);

  // Action to load achievements
  const loadAchievements = useCallback((achievements: IAchievementData[]) => {
    const completed: IAchievementData[] = [];
    const inProgress: IAchievementData[] = [];
    const locked: IAchievementData[] = [];
    const visible: IAchievementData[] = [];

    achievements.forEach(achievement => {
      if (achievement.completed) {
        completed.push(achievement);
      } else if (achievement.progress && achievement.progress > 0) {
        inProgress.push(achievement);
      }

      if (achievement.visible || !achievement.hideUntilUnlocked) {
        visible.push(achievement);
      } else {
        locked.push(achievement);
      }
    });

    setState({
      achievements,
      completed,
      inProgress,
      locked,
      visible,
      currentlyDisplayed: null,
      isAchievementVisible: false
    });
  }, []);

  // Action to reset the state
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const actions: IAchievementActions = {
    completeAchievement,
    showAchievement,
    hideAchievement,
    updateProgress,
    unlockAchievement,
    loadAchievements,
    resetState
  };

  return [state, actions];
}
