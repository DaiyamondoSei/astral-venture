
/**
 * Fallback responses for when the AI service is unavailable
 */

import { AIResponse } from './types';

// Fallback response templates
export const FALLBACK_RESPONSES = [
  {
    text: "I'm sorry, but I'm currently unable to connect to my knowledge base. This could be due to network issues. Please try again later or check your internet connection.",
    suggestedPractices: [
      "Take a deep breath and practice a moment of mindfulness",
      "Try a short meditation exercise while waiting",
      "Reflect on your energy balance during this pause"
    ]
  },
  {
    text: "It seems I'm having trouble accessing my full capabilities at the moment. This is often due to connectivity issues. Please try your question again in a few moments.",
    suggestedPractices: [
      "Practice patience as a mindfulness exercise",
      "Use this moment to check in with your energy centers",
      "Consider journaling your question for later reflection"
    ]
  },
  {
    text: "I'm currently experiencing a disconnection from my knowledge source. This is temporary and should resolve shortly. In the meantime, perhaps try a simple mindfulness exercise.",
    suggestedPractices: [
      "Focus on your breathing for a few moments",
      "Practice a quick body scan meditation",
      "Set an intention for when our connection resumes"
    ]
  }
];

/**
 * Create a fallback response when the AI service is unavailable
 * 
 * @param question The user's original question
 * @returns A formatted fallback response
 */
export function createFallbackResponse(question: string): AIResponse {
  // Select a random fallback response
  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  const fallback = FALLBACK_RESPONSES[randomIndex];
  
  return {
    answer: fallback.text,
    type: 'text',
    suggestedPractices: fallback.suggestedPractices,
    meta: {
      model: 'fallback',
      tokenUsage: 0,
      processingTime: 0
    }
  };
}

/**
 * Find a contextually appropriate fallback response
 * 
 * @param question The user's question
 * @returns The most contextually relevant fallback response
 */
export function findFallbackResponse(question: string): AIResponse {
  // For now, just use the basic createFallbackResponse
  // This could be enhanced to provide more contextual responses
  return createFallbackResponse(question);
}
