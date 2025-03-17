
/**
 * Types for meditation features
 */

/**
 * Meditation session data
 */
export interface MeditationSession {
  id: string;
  userId: string;
  date: string;
  duration: number; // in seconds
  completed: boolean;
  type: MeditationType;
  focusedChakras?: string[];
  guidanceType?: MeditationGuidanceType;
  reflection?: string;
  energyPoints?: number;
}

/**
 * Type of meditation
 */
export type MeditationType = 
  | 'mindfulness'
  | 'chakra-balancing'
  | 'transcendental'
  | 'guided'
  | 'breathwork'
  | 'body-scan'
  | 'energy-flow'
  | 'sound-healing'
  | 'custom';

/**
 * Type of meditation guidance
 */
export type MeditationGuidanceType =
  | 'audio'
  | 'text'
  | 'video'
  | 'none';

/**
 * Meditation preset
 */
export interface MeditationPreset {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  type: MeditationType;
  chakraFocus?: string[];
  guidanceId?: string;
  guidanceType?: MeditationGuidanceType;
  requirementLevel: number; // 1-10 difficulty/experience level
  benefits: string[];
  imageUrl?: string;
}

/**
 * Meditation guidance content
 */
export interface MeditationGuidance {
  id: string;
  title: string;
  type: MeditationGuidanceType;
  content: string; // URL for audio/video, text for text guidance
  duration: number; // in seconds
  creator?: string;
  chakraFocus?: string[];
  tags: string[];
}

/**
 * Meditation progress tracker
 */
export interface MeditationProgress {
  userId: string;
  totalMinutes: number;
  totalSessions: number;
  longestStreak: number;
  currentStreak: number;
  lastMeditationDate?: string;
  preferredTypes: MeditationType[];
  averageDuration: number; // in minutes
  levelProgress: number; // 0-100 percentage to next level
  level: number;
}
