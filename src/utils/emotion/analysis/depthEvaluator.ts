
/**
 * Functions for evaluating emotional depth in reflection content
 */

/**
 * Advanced technique to evaluate the reflection's emotional depth
 */
export function evaluateEmotionalDepth(text: string): number {
  // Base metrics
  let depth = 0;
  
  // Word count contribution (longer reflections often have more depth)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  depth += Math.min(wordCount / 200, 0.3); // Cap at 0.3 (30% of score)
  
  // Self-reference frequency (indicates personal reflection)
  const selfReferenceCount = (text.match(/\bi\b|\bmy\b|\bme\b|\bmyself\b/gi) || []).length;
  depth += Math.min(selfReferenceCount / 15, 0.2); // Cap at 0.2 (20% of score)
  
  // Emotional language indicators
  const emotionalTerms = [
    'feel', 'felt', 'emotion', 'heart', 'deeply', 'profound',
    'moved', 'touching', 'powerful', 'experience', 'sense',
    'understand', 'realized', 'discovered', 'awareness'
  ];
  
  let emotionalTermCount = 0;
  emotionalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) emotionalTermCount += matches.length;
  });
  
  depth += Math.min(emotionalTermCount / 12, 0.25); // Cap at 0.25 (25% of score)
  
  // Complex sentence structure (indicates sophisticated thinking)
  const complexSentenceIndicators = [
    'because', 'however', 'although', 'therefore', 
    'consequently', 'despite', 'nevertheless', 'furthermore'
  ];
  
  let complexityScore = 0;
  complexSentenceIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) complexityScore += matches.length;
  });
  
  depth += Math.min(complexityScore / 5, 0.1); // Cap at 0.1 (10% of score)
  
  // Contrast and comparison (indicates nuanced thinking)
  const contrastIndicators = [
    'but', 'yet', 'while', 'whereas', 'unlike', 'instead',
    'contrast', 'difference', 'similarity', 'compared'
  ];
  
  let contrastScore = 0;
  contrastIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) contrastScore += matches.length;
  });
  
  depth += Math.min(contrastScore / 5, 0.1); // Cap at 0.1 (10% of score)
  
  // Insight and growth language
  const insightTerms = [
    'insight', 'growth', 'evolve', 'transform', 'journey',
    'practice', 'progress', 'develop', 'change', 'shift'
  ];
  
  let insightScore = 0;
  insightTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) insightScore += matches.length;
  });
  
  depth += Math.min(insightScore / 5, 0.1); // Cap at 0.1 (10% of score)
  
  return Math.min(depth, 1.0); // Ensure the score is between 0 and 1
}
