
/**
 * Types for dream journal features
 */

/**
 * Dream entry data
 */
export interface DreamEntry {
  id: string;
  userId: string;
  date: string;
  content: string;
  lucidity: number; // 0-100 scale of lucidity
  emotionalTone: string[];
  symbols: string[];
  tags: string[];
  chakrasActivated: string[];
  consciousnessDepth: number; // 0-100 scale
  conscpiousnessInsights: string[];
  consciousnessArchetypes: string[];
  analysis: DreamAnalysis;
}

/**
 * Dream analysis data
 */
export interface DreamAnalysis {
  theme?: string;
  interpretation?: string;
  guidance?: string;
  symbols?: {
    name: string;
    meaning: string;
    frequency: number;
  }[];
  archetypes?: {
    name: string;
    description: string;
    significance: string;
  }[];
  chakraRelevance?: {
    chakraId: string;
    relevanceScore: number;
    notes: string;
  }[];
}

/**
 * Dream pattern analysis
 */
export interface DreamPatternAnalysis {
  userId: string;
  recurrentSymbols: {
    symbol: string;
    frequency: number;
    dreams: string[]; // dream IDs
  }[];
  emotionalTrends: {
    emotion: string;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  chakraActivationPattern: {
    chakraId: string;
    activationFrequency: number;
    relatedSymbols: string[];
  }[];
  consciousnessProgress: {
    overallTrend: 'ascending' | 'descending' | 'fluctuating' | 'stable';
    averageDepth: number;
    peakDepth: number;
    peakDate: string;
  };
}

/**
 * Dream statistics
 */
export interface DreamStatistics {
  userId: string;
  totalDreams: number;
  lucidDreams: number;
  lucidityRate: number; // percentage
  averageLucidity: number;
  averageConsciousnessDepth: number;
  mostCommonSymbols: string[];
  mostCommonEmotions: string[];
  mostActivatedChakras: string[];
  recordingStreak: {
    current: number;
    longest: number;
  };
}

/**
 * Dream tag type
 */
export interface DreamTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

/**
 * Dream symbol library entry
 */
export interface DreamSymbol {
  id: string;
  name: string;
  generalMeaning: string;
  personalMeaning?: string;
  chakraAssociations: string[];
  frequency: number;
  firstAppearance: string;
  lastAppearance: string;
}
