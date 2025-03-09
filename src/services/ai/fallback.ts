
/**
 * AI Fallback Responses
 * Provides offline fallback responses when the AI service is unavailable
 */

import { AIResponse } from './types';

// Generic responses for when the AI service is unavailable
const GENERIC_RESPONSES = [
  "I understand what you're asking, but I need to be online to provide a detailed answer. Please check your connection and try again.",
  "That's an interesting question. When I'm back online, I can provide a more personalized response.",
  "I'd like to help with that. Could you try again when we have an internet connection?",
  "I need to connect to my knowledge base to answer that properly. Please check your connection and try again.",
];

// Common questions and canned responses for offline use
const COMMON_QUESTIONS: Record<string, string> = {
  "what is meditation": "Meditation is a practice of focused attention that helps calm the mind and relax the body. Regular meditation has been shown to reduce stress and anxiety.",
  "how do chakras work": "Chakras are energy centers in your body according to several spiritual traditions. They're thought to affect physical and mental well-being when balanced.",
  "what are energy points": "Energy points in our system represent your progress and growth. You earn them by completing reflections, meditations, and other activities.",
  "how do i improve my streak": "To improve your streak, log in daily and complete at least one activity such as a reflection or meditation. Consistency is key!",
};

/**
 * Creates a fallback response when the AI service is unavailable
 */
export function createFallbackResponse(question: string): AIResponse {
  // Check for common questions
  const lowerQuestion = question.toLowerCase();
  let answer = '';
  
  // Look for keyword matches in the question
  for (const [key, response] of Object.entries(COMMON_QUESTIONS)) {
    if (lowerQuestion.includes(key)) {
      answer = response;
      break;
    }
  }
  
  // Use a generic response if no match found
  if (!answer) {
    const randomIndex = Math.floor(Math.random() * GENERIC_RESPONSES.length);
    answer = GENERIC_RESPONSES[randomIndex];
  }
  
  // Return in the expected format
  return {
    answer,
    type: 'text',
    suggestedPractices: [],
    meta: {
      model: 'fallback',
      tokenUsage: 0,
      processingTime: 0
    }
  };
}
