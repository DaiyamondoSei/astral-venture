
/**
 * Divine Intelligence Core Service
 * 
 * This service implements the core intelligence engine for the quantum consciousness app.
 * It provides natural language processing, personalization, and context-aware responses.
 */

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for the Divine Intelligence system
export interface UserContext {
  userId: string;
  energyPoints?: number;
  astralLevel?: number;
  chakraBalance?: Record<string, number>;
  recentReflections?: string[];
  preferredPractices?: string[];
  emotionalState?: string[];
  lastInteraction?: Date;
}

export interface DivineCoreRequest {
  message: string;
  context: UserContext;
  intentType?: 'guidance' | 'reflection' | 'practice' | 'insight' | 'chakra' | 'general';
}

export interface DivineCoreResponse {
  message: string;
  insights: Array<{
    type: string;
    content: string;
  }>;
  suggestedPractices?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  chakraFocus?: string[];
  emotionalGuidance?: string;
  personalizedLevel: 'basic' | 'intermediate' | 'advanced';
}

/**
 * The Divine Core Intelligence Engine
 * Provides context-aware, personalized responses to user queries
 */
class DivineCoreService {
  private static instance: DivineCoreService;
  
  // Singleton pattern
  public static getInstance(): DivineCoreService {
    if (!DivineCoreService.instance) {
      DivineCoreService.instance = new DivineCoreService();
    }
    return DivineCoreService.instance;
  }
  
  /**
   * Processes user queries with natural language understanding and returns personalized responses
   */
  public async processQuery(request: DivineCoreRequest): Promise<DivineCoreResponse> {
    try {
      // Call the edge function for AI processing
      const { data, error } = await supabase.functions.invoke('process-ai-query', {
        body: {
          query: request.message,
          context: this.buildRichContext(request.context),
          userId: request.context.userId,
          options: {
            model: this.selectOptimalModel(request.message, request.context),
            useCache: true
          }
        }
      });
      
      if (error) throw new Error(error.message);
      
      // Transform the response to our internal format
      return this.transformResponse(data, request.context);
    } catch (error) {
      console.error('Error in divine core processing:', error);
      // Provide fallback response when AI processing fails
      return this.createFallbackResponse(request);
    }
  }
  
  /**
   * Builds a rich context object for the AI service based on user data
   */
  private buildRichContext(context: UserContext): string {
    const contextParts = [
      `User Level: ${context.astralLevel || 1}`,
      `Energy Points: ${context.energyPoints || 0}`
    ];
    
    if (context.chakraBalance) {
      contextParts.push(`Chakra Balance: ${JSON.stringify(context.chakraBalance)}`);
    }
    
    if (context.emotionalState && context.emotionalState.length > 0) {
      contextParts.push(`Emotional State: ${context.emotionalState.join(', ')}`);
    }
    
    if (context.preferredPractices && context.preferredPractices.length > 0) {
      contextParts.push(`Preferred Practices: ${context.preferredPractices.join(', ')}`);
    }
    
    return contextParts.join('\n');
  }
  
  /**
   * Selects the optimal AI model based on message complexity and user context
   */
  private selectOptimalModel(message: string, context: UserContext): string {
    // Choose more powerful models for users with higher astral levels
    // or for complex queries
    const isComplexQuery = message.length > 100 || 
                          message.includes('chakra') || 
                          message.includes('consciousness');
    
    if ((context.astralLevel && context.astralLevel > 5) || isComplexQuery) {
      return 'gpt-4o';
    }
    
    return 'gpt-4o-mini';
  }
  
  /**
   * Transforms the raw AI response into our structured format
   */
  private transformResponse(data: any, context: UserContext): DivineCoreResponse {
    // Extract insights and suggestions from AI response
    const insights = data.insights || [];
    
    // Determine personalization level based on user's astral level
    const personalizedLevel = this.getPersonalizationLevel(context);
    
    return {
      message: data.response || data.answer,
      insights: insights.map((insight: any) => ({
        type: insight.type || 'general',
        content: insight.content
      })),
      suggestedPractices: this.extractPractices(data),
      chakraFocus: this.extractChakraFocus(data, context),
      emotionalGuidance: this.extractEmotionalGuidance(data),
      personalizedLevel
    };
  }
  
  /**
   * Extracts suggested practices from AI response
   */
  private extractPractices(data: any): Array<{id: string; title: string; description: string}> {
    // Extract and format practice recommendations
    const suggestedPractices = [];
    
    if (data.suggestedPractices) {
      return data.suggestedPractices;
    }
    
    // Try to extract practices from the response text if not explicitly provided
    const responseText = data.response || data.answer || '';
    const practiceMatches = responseText.match(/practice:?\s*([^.]*\.)/gi);
    
    if (practiceMatches) {
      practiceMatches.forEach((match: string, index: number) => {
        const description = match.replace(/practice:?\s*/i, '').trim();
        suggestedPractices.push({
          id: `practice-${index}`,
          title: `Practice ${index + 1}`,
          description
        });
      });
    }
    
    return suggestedPractices;
  }
  
  /**
   * Extracts chakra focus from AI response
   */
  private extractChakraFocus(data: any, context: UserContext): string[] {
    if (data.chakraFocus) {
      return data.chakraFocus;
    }
    
    const responseText = data.response || data.answer || '';
    const chakras = ['root', 'sacral', 'solar plexus', 'heart', 'throat', 'third eye', 'crown'];
    return chakras.filter(chakra => responseText.toLowerCase().includes(chakra));
  }
  
  /**
   * Extracts emotional guidance from AI response
   */
  private extractEmotionalGuidance(data: any): string {
    if (data.emotionalGuidance) {
      return data.emotionalGuidance;
    }
    
    const responseText = data.response || data.answer || '';
    const emotionMatch = responseText.match(/emotional\s+guidance:?\s*([^.]*\.)/i);
    
    if (emotionMatch && emotionMatch[1]) {
      return emotionMatch[1].trim();
    }
    
    return '';
  }
  
  /**
   * Determines personalization level based on user context
   */
  private getPersonalizationLevel(context: UserContext): 'basic' | 'intermediate' | 'advanced' {
    if (!context.astralLevel || context.astralLevel < 3) {
      return 'basic';
    } else if (context.astralLevel < 7) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }
  
  /**
   * Creates a fallback response when AI processing fails
   */
  private createFallbackResponse(request: DivineCoreRequest): DivineCoreResponse {
    return {
      message: "I'm experiencing a moment of cosmic recalibration. Could you please ask your question again in a moment?",
      insights: [
        {
          type: 'system',
          content: 'The consciousness network is currently realigning. Please try again shortly.'
        }
      ],
      personalizedLevel: 'basic'
    };
  }
}

export const divineCoreService = DivineCoreService.getInstance();
