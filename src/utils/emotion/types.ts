
// Emotion analysis types
export type SacredGeometryType = 
  | 'flowerOfLife' 
  | 'metatronsCube' 
  | 'sriYantra' 
  | 'seedOfLife' 
  | 'vesicaPiscis'
  | 'treeOfLife';

export type GeometryResourceType = {
  type: SacredGeometryType;
  path: string;
  description?: string;
  energyLevel?: number;
  svgContent?: string;
  loaded?: boolean;
  error?: string;
};

// Emotion analysis result interface
export interface EmotionAnalysisResult {
  dominantEmotion: string;
  emotionalDepth: number;
  chakrasActivated: number[];
  emotionBreakdown: Record<string, number>;
  recommendations?: string[];
  chakras?: number[]; // For backward compatibility
  dominantThemes?: string[]; // For backward compatibility
  emotions?: string[]; // Adding this for backward compatibility
  insights?: string[]; // Adding this for backward compatibility
}

// Chakra analysis result interface
export interface ChakraAnalysisResult {
  activatedChakras: number[];
  dominantChakra?: number;
  chakraBalance: Record<number, number>;
  recommendations?: string[];
  chakras?: number[]; // For backward compatibility
  dominantThemes?: string[]; // For backward compatibility
  emotions?: string[]; // For backward compatibility
  insights?: string[]; // For backward compatibility
  intensity?: number[]; // For backward compatibility with intensity
  balanceScore?: number; // For backward compatibility
}
