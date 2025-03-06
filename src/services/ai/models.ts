
import { AIModel } from './types';

/**
 * Selects the optimal AI model based on message complexity
 * 
 * @param message User message to analyze
 * @returns Best model for the given message
 */
export function selectOptimalModel(message: string): AIModel {
  // For complex or long messages, use the higher quality model
  const isComplex = (
    message.length > 100 || 
    message.includes("why") || 
    message.includes("how") || 
    message.includes("explain") ||
    message.includes("difference") ||
    message.includes("compare")
  );
  
  return isComplex ? "gpt-4o" : "gpt-4o-mini";
}
