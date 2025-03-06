
import { AIModel } from "./types.ts";

// Select the optimal model based on query complexity
export function selectOptimalModel(query: string): AIModel {
  // Advanced complexity detection
  const complexityIndicators = [
    query.length > 150,
    query.split(" ").length > 50,
    /philosophical|metaphysical|consciousness|quantum|transcendence/i.test(query),
    /explain in detail|analyze|compare and contrast/i.test(query)
  ];
  
  // Count number of complexity indicators present
  const complexityScore = complexityIndicators.filter(Boolean).length;
  
  // If query seems complex, use more capable model
  return complexityScore >= 2 ? "gpt-4o" : "gpt-4o-mini";
}
