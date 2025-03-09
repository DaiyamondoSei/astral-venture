
/**
 * Mappers to convert between database and application models
 */

import { Practice, PracticeCompletion } from './practiceService';

// Map from database format to application format
export function mapDbPracticeToPractice(dbPractice: any): Practice {
  return {
    id: dbPractice.id,
    title: dbPractice.title,
    description: dbPractice.description,
    duration: dbPractice.duration,
    type: dbPractice.type as 'meditation' | 'quantum-task' | 'integration',
    category: dbPractice.category,
    energyPoints: dbPractice.energy_points,
    chakraAssociation: dbPractice.chakra_association,
    level: dbPractice.level,
    instructions: dbPractice.instructions
  };
}

// Map an array of database practices to application format
export function mapDbPracticesToPractices(dbPractices: any[]): Practice[] {
  return dbPractices.map(mapDbPracticeToPractice);
}

// Map from database format to application format for practice completions
export function mapDbCompletionToCompletion(dbCompletion: any): PracticeCompletion {
  return {
    id: dbCompletion.id,
    userId: dbCompletion.user_id,
    practiceId: dbCompletion.practice_id,
    completedAt: dbCompletion.completed_at,
    duration: dbCompletion.duration,
    energyPointsEarned: dbCompletion.energy_points_earned,
    reflection: dbCompletion.reflection,
    chakrasActivated: dbCompletion.chakras_activated
  };
}

// Map an array of database completions to application format
export function mapDbCompletionsToCompletions(dbCompletions: any[]): PracticeCompletion[] {
  return dbCompletions.map(mapDbCompletionToCompletion);
}
