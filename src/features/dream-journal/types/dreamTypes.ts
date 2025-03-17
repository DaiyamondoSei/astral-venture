
/**
 * Dream Journal Types
 * 
 * Type definitions for the dream journal feature module
 */

export interface DreamRecord {
  id: string;
  userId: string;
  date: Date | string;
  content: string;
  tags?: string[];
  emotionalTone?: string[];
  symbols?: string[];
  lucidity?: number;
  consciousnessDepth?: number;
  chakrasActivated?: string[];
  consciousnessInsights?: string[];
  consciousnessArchetypes?: string[];
  analysis?: {
    theme?: string;
    interpretation?: string;
    guidance?: string;
  };
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface DreamFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  tags?: string[];
  chakras?: string[];
  lucidityMin?: number;
  searchText?: string;
}

export interface DreamAnalysis {
  theme: string;
  symbols: Array<{
    symbol: string;
    meaning: string;
    strength: number;
  }>;
  emotions: Array<{
    emotion: string;
    intensity: number;
  }>;
  insights: string[];
  guidance: string;
}

export interface DreamStats {
  totalDreams: number;
  lucidDreams: number;
  averageLucidity: number;
  commonEmotions: Array<{
    emotion: string;
    count: number;
  }>;
  commonSymbols: Array<{
    symbol: string;
    count: number;
  }>;
  chakraActivations: Record<string, number>;
  dailyStreakCount: number;
  longestStreak: number;
}
