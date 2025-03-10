
export interface AIQuestion {
  text: string;
  context?: string;
  reflectionIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  response: string;
  insights: any[]; // Will be typed properly in next iteration
  metadata?: Record<string, unknown>;
}

export interface AssistantSuggestion {
  id: string;
  type: 'performance' | 'quality' | 'security';
  component: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  autoFixAvailable: boolean;
  created: string;
  status: 'pending' | 'implemented' | 'rejected';
}

export interface AssistantIntent {
  id: string;
  type: string;
  created: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
}
