
export interface ChakraStatus {
  active: boolean;
  level: number;
  blockages: string[];
  resonance: number;
}

export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

export interface ChakraSystem {
  chakras: Record<ChakraType, ChakraStatus>;
  overall_balance: number;
  dominant_chakra?: ChakraType;
}

export interface ChakraInsight {
  chakraType: ChakraType;
  status: ChakraStatus;
  recommendations: string[];
  blockagePatterns: string[];
}

export interface ChakraInsightsOptions {
  includeHistory?: boolean;
  timeRange?: 'day' | 'week' | 'month';
  chakraTypes?: ChakraType[];
}
