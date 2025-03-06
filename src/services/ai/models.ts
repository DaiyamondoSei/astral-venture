
import { AIModel } from './types';

// Counters for model usage
let gpt4oUsageCount = 0;
let gpt4oMiniUsageCount = 0;

/**
 * Selects the optimal AI model based on message complexity
 * 
 * @param message User message to analyze
 * @returns Best model for the given message
 */
export function selectOptimalModel(message: string): AIModel {
  // Check if we're in offline mode
  if (!navigator.onLine) {
    return "gpt-4o-mini"; // Use smaller model when possible offline
  }
  
  // Advanced complexity detection
  const complexityFactors = {
    length: message.length > 100 ? 3 : 0,
    deepQuestions: containsDeepQuestions(message) ? 5 : 0,
    spiritualTerms: countSpiritualTerms(message) * 1.5,
    technicalRequest: isTechnicalRequest(message) ? 4 : 0
  };
  
  // Calculate total complexity score
  const complexityScore = 
    complexityFactors.length + 
    complexityFactors.deepQuestions + 
    complexityFactors.spiritualTerms +
    complexityFactors.technicalRequest;
  
  console.log("Message complexity analysis:", complexityFactors, "Score:", complexityScore);
  
  // Use more powerful model for complex questions
  const useAdvancedModel = complexityScore > 5;
  
  // Track usage stats for monitoring
  if (useAdvancedModel) {
    gpt4oUsageCount++;
  } else {
    gpt4oMiniUsageCount++;
  }
  
  // Log model usage distribution every 10 requests
  if ((gpt4oUsageCount + gpt4oMiniUsageCount) % 10 === 0) {
    const total = gpt4oUsageCount + gpt4oMiniUsageCount;
    console.log(`Model usage stats - GPT-4o: ${gpt4oUsageCount} (${Math.round(gpt4oUsageCount/total*100)}%), GPT-4o-mini: ${gpt4oMiniUsageCount} (${Math.round(gpt4oMiniUsageCount/total*100)}%)`);
  }
  
  return useAdvancedModel ? "gpt-4o" : "gpt-4o-mini";
}

/**
 * Check if message contains deep philosophical or spiritual questions
 */
function containsDeepQuestions(message: string): boolean {
  const deepQuestionIndicators = [
    "why", "how does", "meaning", "purpose", "consciousness", 
    "spiritual", "experience", "universe", "existence", "reality",
    "soul", "divine", "higher self", "enlightenment", "awakening"
  ];
  
  const normalizedMessage = message.toLowerCase();
  return deepQuestionIndicators.some(indicator => normalizedMessage.includes(indicator));
}

/**
 * Count mentions of spiritual or energetic terms
 */
function countSpiritualTerms(message: string): number {
  const spiritualTerms = [
    "chakra", "energy", "meditation", "kundalini", "awakening",
    "consciousness", "spiritual", "astral", "healing", "divine",
    "higher self", "soul", "spirit", "vibration", "frequency",
    "enlightenment", "transcendence", "practice", "visualization"
  ];
  
  const normalizedMessage = message.toLowerCase();
  return spiritualTerms.reduce((count, term) => {
    return count + (normalizedMessage.includes(term) ? 1 : 0);
  }, 0);
}

/**
 * Check if message is requesting technical information
 */
function isTechnicalRequest(message: string): boolean {
  const technicalIndicators = [
    "explain", "describe", "define", "what is", "how to", 
    "technique", "method", "practice", "steps", "guide",
    "instructions", "compare", "difference", "versus"
  ];
  
  const normalizedMessage = message.toLowerCase();
  return technicalIndicators.some(indicator => normalizedMessage.includes(indicator));
}

/**
 * Get a human-readable name for the model
 */
export function getModelDisplayName(model: string): string {
  switch (model) {
    case "gpt-4o":
      return "GPT-4o";
    case "gpt-4o-mini":
      return "GPT-4o Mini";
    case "cached":
      return "Cached Response";
    case "fallback":
      return "Fallback System";
    case "offline":
      return "Offline Mode";
    default:
      return model;
  }
}
