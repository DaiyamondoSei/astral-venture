
/**
 * Meditation Utilities
 * 
 * This file contains utilities for meditation functionality.
 */

export interface MeditationSession {
  id: string;
  duration: number; // in minutes
  technique: string;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface MeditationTechnique {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  recommendedDuration: number; // in minutes
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'mindfulness' | 'concentration' | 'loving-kindness' | 'visualization' | 'body-scan' | 'transcendental';
}

// Predefined meditation techniques
export const meditationTechniques: Record<string, MeditationTechnique> = {
  'mindful-breathing': {
    id: 'mindful-breathing',
    name: 'Mindful Breathing',
    description: 'Focus your attention on the breath and observe it without trying to change it.',
    instructions: [
      'Find a comfortable seated position',
      'Close your eyes or maintain a soft gaze',
      'Bring your attention to your breath',
      'Notice the sensations of breathing in and out',
      'When your mind wanders, gently return to the breath',
      'Continue this practice for the duration of your session'
    ],
    recommendedDuration: 10,
    benefits: ['Reduces stress and anxiety', 'Improves focus and concentration', 'Calms the mind'],
    difficulty: 'beginner',
    category: 'mindfulness'
  },
  'body-scan': {
    id: 'body-scan',
    name: 'Body Scan Meditation',
    description: 'Systematically bring awareness to different parts of the body, noticing sensations without judgment.',
    instructions: [
      'Lie down or sit in a comfortable position',
      'Starting from the top of your head, bring awareness to each part of your body',
      'Notice any sensations, tension, or relaxation in each area',
      'Move your attention slowly down through your entire body',
      'If your mind wanders, gently bring it back to the body scan'
    ],
    recommendedDuration: 15,
    benefits: ['Releases physical tension', 'Increases body awareness', 'Promotes relaxation'],
    difficulty: 'beginner',
    category: 'body-scan'
  },
  'loving-kindness': {
    id: 'loving-kindness',
    name: 'Loving-Kindness Meditation',
    description: 'Cultivate feelings of goodwill, kindness, and warmth towards yourself and others.',
    instructions: [
      'Sit comfortably and close your eyes',
      'Begin by directing loving-kindness toward yourself',
      'Silently repeat phrases like "May I be happy, may I be healthy, may I be safe"',
      'Gradually extend these wishes to others: loved ones, neutral people, difficult people',
      'Finally, extend loving-kindness to all beings everywhere'
    ],
    recommendedDuration: 15,
    benefits: ['Increases compassion and empathy', 'Reduces negative emotions', 'Improves relationships'],
    difficulty: 'intermediate',
    category: 'loving-kindness'
  },
  'visualization': {
    id: 'visualization',
    name: 'Guided Visualization',
    description: 'Use mental imagery to promote relaxation, healing, or positive change.',
    instructions: [
      'Get comfortable and close your eyes',
      'Follow guided instructions to create specific mental images',
      'Engage all your senses in the visualization',
      'Stay present with the imagery throughout the practice',
      'Slowly return awareness to your surroundings when complete'
    ],
    recommendedDuration: 20,
    benefits: ['Reduces stress', 'Enhances creativity', 'Supports healing and positive change'],
    difficulty: 'intermediate',
    category: 'visualization'
  }
};

// Calculate the streak based on meditation sessions
export const calculateStreak = (sessions: MeditationSession[]): number => {
  if (!sessions.length) return 0;
  
  // Sort sessions by start time
  const sortedSessions = [...sessions].sort((a, b) => {
    const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
    const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
    return bTime - aTime; // Descending order (most recent first)
  });
  
  // Ensure completed sessions only
  const completedSessions = sortedSessions.filter(s => s.completed);
  if (!completedSessions.length) return 0;
  
  // Get the most recent session
  const mostRecent = completedSessions[0];
  if (!mostRecent.startTime) return 0;
  
  const mostRecentDate = new Date(mostRecent.startTime);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if most recent session was today or yesterday
  const isTodayOrYesterday = 
    mostRecentDate.toDateString() === today.toDateString() || 
    mostRecentDate.toDateString() === yesterday.toDateString();
  
  if (!isTodayOrYesterday) return 0;
  
  // Count consecutive days
  let currentStreak = 1; // Start with today/yesterday
  let currentDate = new Date(mostRecentDate);
  currentDate.setDate(currentDate.getDate() - 1); // Start checking from day before most recent
  
  for (let i = 1; i < completedSessions.length; i++) {
    const session = completedSessions[i];
    if (!session.startTime) continue;
    
    const sessionDate = new Date(session.startTime);
    
    // Check if this session is from the expected date
    if (sessionDate.toDateString() === currentDate.toDateString()) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
    } else if (sessionDate.getTime() < currentDate.getTime()) {
      // We found an older session, so skip ahead to it
      currentDate = new Date(sessionDate);
    } else {
      // Gap in streak
      break;
    }
  }
  
  return currentStreak;
};

// Calculate total meditation time in minutes
export const calculateTotalMeditationTime = (sessions: MeditationSession[]): number => {
  return sessions.reduce((total, session) => {
    if (session.completed) {
      return total + session.duration;
    }
    return total;
  }, 0);
};

// Get a technique by ID
export const getTechnique = (id: string): MeditationTechnique | undefined => {
  return meditationTechniques[id];
};
