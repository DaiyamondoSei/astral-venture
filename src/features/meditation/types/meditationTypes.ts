
/**
 * Types for meditation features
 */

export interface MeditationSession {
  id: string;
  userId: string;
  duration: number; // in seconds
  startTime: string;
  endTime: string;
  type: MeditationType;
  guided: boolean;
  completionRate: number; // percentage
  chakrasActivated?: string[];
  notes?: string;
}

export type MeditationType = 
  | 'mindfulness'
  | 'focused'
  | 'chakra-balancing'
  | 'energy-healing'
  | 'astral-preparation'
  | 'quantum-consciousness'
  | 'custom';

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhaleSeconds: number;
  holdInhaleSeconds: number;
  exhaleSeconds: number;
  holdExhaleSeconds: number;
  repetitions: number;
  chakraAssociation?: string[];
  benefits: string[];
}

export interface MeditationGuide {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  type: MeditationType;
  steps: MeditationStep[];
  chakraFocus?: string[];
  breathingPattern?: BreathingPattern;
  audioUrl?: string;
  createdAt: string;
}

export interface MeditationStep {
  id: string;
  order: number;
  durationSeconds: number;
  instruction: string;
  voiceInstruction?: string;
  visualInstruction?: string;
}

export interface MeditationPreference {
  userId: string;
  preferredDuration: number; // in seconds
  preferredTypes: MeditationType[];
  preferredTime: string;
  preferredChakras?: string[];
  reminders: boolean;
  reminderTime?: string;
  soundEnabled: boolean;
  backgroundSoundId?: string;
  guidanceLevel: 'minimal' | 'moderate' | 'detailed';
}

export interface MeditationStats {
  userId: string;
  totalSessions: number;
  totalDuration: number; // in seconds
  longestStreak: number;
  currentStreak: number;
  lastSessionDate: string;
  averageDuration: number;
  preferredType: MeditationType;
  mostActivatedChakras: string[];
  progressRate: number;
}
