
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { AchievementState } from './types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

// Initial state with sensible defaults
const initialState: AchievementState = {
  earnedAchievements: [],
  achievementHistory: {},
  currentAchievement: null,
  progressTracking: {
    reflections: 0,
    meditation_minutes: 0,
    chakras_activated: 0,
    wisdom_resources_explored: 0,
    streakDays: 0,
    total_energy_points: 0
  }
};

type Action = 
  | { type: 'EARN_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_ACHIEVEMENT_HISTORY'; payload: { id: string; data: any } }
  | { type: 'SET_CURRENT_ACHIEVEMENT'; payload: string | null }
  | { type: 'DISMISS_CURRENT_ACHIEVEMENT' }
  | { type: 'UPDATE_PROGRESS_TRACKING'; payload: Record<string, number> }
  | { type: 'SET_INITIAL_STATE'; payload: Partial<AchievementState> };

// Context to store achievement state
const AchievementStateContext = createContext<{
  state: AchievementState;
  earnAchievement: (id: string) => void;
  updateAchievementHistory: (id: string, data: any) => void;
  setCurrentAchievement: (id: string | null) => void;
  dismissCurrentAchievement: () => void;
  setProgressTracking: (value: Record<string, number>) => void;
  setInitialState: (initialData: Partial<AchievementState>) => void;
} | undefined>(undefined);

// Reducer to manage achievement state
function achievementReducer(state: AchievementState, action: Action): AchievementState {
  switch (action.type) {
    case 'EARN_ACHIEVEMENT':
      return {
        ...state,
        earnedAchievements: state.earnedAchievements.includes(action.payload)
          ? state.earnedAchievements
          : [...state.earnedAchievements, action.payload],
        currentAchievement: state.currentAchievement || action.payload
      };
    case 'UPDATE_ACHIEVEMENT_HISTORY':
      return {
        ...state,
        achievementHistory: {
          ...state.achievementHistory,
          [action.payload.id]: action.payload.data
        }
      };
    case 'SET_CURRENT_ACHIEVEMENT':
      return {
        ...state,
        currentAchievement: action.payload
      };
    case 'DISMISS_CURRENT_ACHIEVEMENT':
      return {
        ...state,
        currentAchievement: null
      };
    case 'UPDATE_PROGRESS_TRACKING':
      return {
        ...state,
        progressTracking: {
          ...state.progressTracking,
          ...action.payload
        }
      };
    case 'SET_INITIAL_STATE':
      return {
        ...state,
        ...action.payload,
        // Ensure progressTracking is properly merged
        progressTracking: {
          ...state.progressTracking,
          ...(action.payload.progressTracking || {})
        }
      };
    default:
      return state;
  }
}

// Provider component
export const AchievementProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(achievementReducer, initialState);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial state from backend
  useEffect(() => {
    if (user && !isInitialized) {
      const loadInitialState = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('sync-user-data', {
            body: { lastSyncTime: null }
          });
          
          if (error) {
            console.error('Error loading achievement data:', error);
            return;
          }
          
          if (data && data.achievements) {
            // Transform achievement data into state format
            const earnedAchievements = data.achievements
              .filter((a: any) => a.unlocked_at)
              .map((a: any) => a.achievement_id);
              
            const achievementHistory: Record<string, any> = {};
            data.achievements.forEach((a: any) => {
              achievementHistory[a.achievement_id] = {
                awarded: Boolean(a.unlocked_at),
                timestamp: a.unlocked_at || a.updated_at,
                progress: a.progress
              };
            });
            
            // Get progress tracking data
            const progressTracking = data.userStats?.progress_tracking || initialState.progressTracking;
            
            dispatch({
              type: 'SET_INITIAL_STATE',
              payload: {
                earnedAchievements,
                achievementHistory,
                progressTracking
              }
            });
          }
          
          setIsInitialized(true);
        } catch (err) {
          console.error('Failed to load achievement data:', err);
          setIsInitialized(true); // Mark as initialized anyway to prevent endless retries
        }
      };
      
      loadInitialState();
    }
  }, [user, isInitialized]);

  // Actions
  const earnAchievement = (id: string) => {
    dispatch({ type: 'EARN_ACHIEVEMENT', payload: id });
  };

  const updateAchievementHistory = (id: string, data: any) => {
    dispatch({ type: 'UPDATE_ACHIEVEMENT_HISTORY', payload: { id, data } });
  };

  const setCurrentAchievement = (id: string | null) => {
    dispatch({ type: 'SET_CURRENT_ACHIEVEMENT', payload: id });
  };

  const dismissCurrentAchievement = () => {
    dispatch({ type: 'DISMISS_CURRENT_ACHIEVEMENT' });
  };

  const setProgressTracking = (value: Record<string, number>) => {
    dispatch({ type: 'UPDATE_PROGRESS_TRACKING', payload: value });
  };

  const setInitialState = (initialData: Partial<AchievementState>) => {
    dispatch({ type: 'SET_INITIAL_STATE', payload: initialData });
  };

  const value = {
    state,
    earnAchievement,
    updateAchievementHistory,
    setCurrentAchievement,
    dismissCurrentAchievement,
    setProgressTracking,
    setInitialState
  };

  return (
    <AchievementStateContext.Provider value={value}>
      {children}
    </AchievementStateContext.Provider>
  );
};

// Hook to use achievement state
export function useAchievementState() {
  const context = useContext(AchievementStateContext);
  if (context === undefined) {
    throw new Error('useAchievementState must be used within an AchievementProvider');
  }
  return context;
}

// Helper function to get achievement progress
export function getAchievementProgress(
  state: AchievementState,
  achievementId: string,
  requiredAmount: number
): number {
  const history = state.achievementHistory[achievementId];
  if (history && typeof history.progress === 'number') {
    return history.progress;
  }
  
  return 0;
}
