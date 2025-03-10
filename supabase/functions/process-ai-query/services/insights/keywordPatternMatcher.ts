
/**
 * Keyword-based pattern matcher for insight extraction
 * Identifies insights based on semantic keywords and their context
 */

/**
 * Extract insights based on keyword patterns in the text
 * @param text AI response text to analyze for insights
 * @returns Array of possible insights with relevance scores
 */
export function identifyInsightsByKeywords(text: string): { type: string; content: string; relevance: number }[] {
  // No need to extract if text is too short
  if (!text || text.length < 50) {
    return [];
  }

  const paragraphs = text.split(/\n\n+/);
  const insights: { type: string; content: string; relevance: number }[] = [];
  
  // Define keyword patterns for different insight types
  const keywordPatterns: Record<string, string[]> = {
    emotional: [
      'emotion', 'feel', 'feeling', 'emotional', 'mood', 'anxiety', 'joy', 'peace',
      'balance', 'stress', 'tension', 'release', 'calm', 'anger', 'frustration'
    ],
    chakra: [
      'chakra', 'energy center', 'root', 'sacral', 'solar plexus', 'heart', 'throat', 
      'third eye', 'crown', 'kundalini', 'energy flow', 'blockage', 'alignment'
    ],
    practice: [
      'practice', 'meditat', 'exercise', 'technique', 'routine', 'breathe', 'breathing', 
      'daily', 'habitual', 'posture', 'ritual', 'discipline', 'consistency'
    ],
    awareness: [
      'aware', 'conscious', 'mindful', 'awaken', 'perspective', 'attention', 'present', 
      'observe', 'witness', 'notice', 'vigilance', 'alertness', 'focus'
    ],
    general: [
      'insight', 'understand', 'realize', 'recognize', 'discover', 'learn', 'wisdom',
      'knowledge', 'awareness', 'comprehension', 'clarity', 'enlightenment'
    ]
  };
  
  // Process each paragraph to identify potential insights
  for (const paragraph of paragraphs) {
    if (paragraph.length < 40) continue; // Skip very short paragraphs
    
    const lowerParagraph = paragraph.toLowerCase();
    const typeMatches: Record<string, number> = {};
    
    // Calculate keyword matches for each insight type
    for (const [type, keywords] of Object.entries(keywordPatterns)) {
      let matchScore = 0;
      
      for (const keyword of keywords) {
        // Check for exact keyword matches
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerParagraph.match(regex);
        
        if (matches) {
          // Calculate relevance based on:
          // 1. Number of matches
          // 2. Position in paragraph (earlier = more important)
          // 3. Keyword density
          const matchCount = matches.length;
          const firstPosition = lowerParagraph.indexOf(keyword) / lowerParagraph.length;
          const density = matchCount / (paragraph.split(' ').length);
          
          // Combined relevance score
          matchScore += matchCount * (1 + (1 - firstPosition) * 0.5) * (1 + density * 10);
        }
      }
      
      if (matchScore > 0) {
        typeMatches[type] = matchScore;
      }
    }
    
    // Determine the best matching type for this paragraph
    if (Object.keys(typeMatches).length > 0) {
      // Find the type with the highest match score
      const bestType = Object.entries(typeMatches)
        .sort((a, b) => b[1] - a[1])[0];
      
      // Only include if the score is significant
      if (bestType[1] > 1.5) {
        insights.push({
          type: bestType[0],
          content: paragraph.trim(),
          relevance: Math.min(10, bestType[1]) // Cap relevance at 10
        });
      }
    }
  }
  
  // Sort by relevance and limit to most relevant insights
  return insights
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}
