
/**
 * useAIContentAnalysis Hook
 * 
 * A React hook for AI-powered content analysis capabilities.
 * Part of Phase 3 implementation.
 */

import { useState, useEffect, useCallback } from 'react';
import { aiEdgeClient, ContentAnalysisResult } from '@/utils/ai/AIEdgeFunctionClient';
import { AI_CONFIG } from '@/config/aiConfig';

export interface UseAIContentAnalysisProps {
  text?: string;
  contentType?: 'reflection' | 'dream' | 'journal' | 'general';
  autoAnalyze?: boolean;
  userContext?: any;
}

export interface UseAIContentAnalysisResult {
  insights: string[];
  themes: string[];
  emotionalTone: string;
  chakraConnections: Array<{
    chakraId: number;
    relevance: number;
    insight: string;
  }>;
  recommendedPractices: string[];
  isLoading: boolean;
  error: string | null;
  confidence: number;
  analyzeContent: (text: string) => Promise<void>;
  isAnalyzed: boolean;
}

/**
 * React hook for AI-powered content analysis
 */
export function useAIContentAnalysis({
  text = '',
  contentType = 'general',
  autoAnalyze = false,
  userContext
}: UseAIContentAnalysisProps = {}): UseAIContentAnalysisResult {
  const [analysisResult, setAnalysisResult] = useState<ContentAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  
  // Function to analyze content
  const analyzeContent = useCallback(async (contentText: string) => {
    if (!contentText.trim()) {
      setError('Text is required for analysis');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await aiEdgeClient.analyzeContent({
        text: contentText,
        contentType,
        userContext
      }, {
        model: AI_CONFIG.models.ENHANCED,
        temperature: AI_CONFIG.analysisDefaults.content.temperature,
        maxTokens: AI_CONFIG.analysisDefaults.content.maxTokens,
        cacheResults: AI_CONFIG.features.enableCaching
      });
      
      setAnalysisResult(result.result);
      setIsAnalyzed(true);
    } catch (err) {
      console.error('Error analyzing content:', err);
      setError('Failed to analyze content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [contentType, userContext]);
  
  // Auto-analyze on initial text if provided
  useEffect(() => {
    if (autoAnalyze && text && !isAnalyzed && !isLoading) {
      analyzeContent(text);
    }
  }, [autoAnalyze, text, isAnalyzed, isLoading, analyzeContent]);
  
  return {
    insights: analysisResult?.insights || [],
    themes: analysisResult?.themes || [],
    emotionalTone: analysisResult?.emotionalTone || '',
    chakraConnections: analysisResult?.chakraConnections || [],
    recommendedPractices: analysisResult?.recommendedPractices || [],
    isLoading,
    error,
    confidence: analysisResult?.confidence || 0,
    analyzeContent,
    isAnalyzed
  };
}

export default useAIContentAnalysis;
