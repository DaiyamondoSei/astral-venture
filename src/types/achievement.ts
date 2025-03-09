
export enum AchievementEventType {
  REFLECTION_COMPLETED = 'reflection_completed',
  MEDITATION_COMPLETED = 'meditation_completed',
  CHAKRA_ACTIVATED = 'chakra_activated',
  WISDOM_EXPLORED = 'wisdom_explored',
  LOGIN_STREAK = 'login_streak',
  ENERGY_MILESTONE = 'energy_milestone',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  PROFILE_COMPLETED = 'profile_completed',
  STREAK_MILESTONE = 'streak_milestone'
}

export interface StepInteraction {
  stepId: string;
  interactionType: string;
  timestamp: string;
}
