/**
 * Extract list items from text as insights
 * @param text The AI response text to analyze
 * @returns Array of extracted list items as insights
 */
export function extractListItems(text: string): { type: string; content: string }[] {
  const insights: { type: string; content: string }[] = [];
  
  // Match different types of lists with improved regex
  const listPatterns = [
    // Markdown bullet lists (- or *)
    /(?:^|\n)(?:[*\-] .+(?:\n(?![*\-]).+)*)+/gm,
    
    // Numbered lists (1. 2. etc)
    /(?:^|\n)(?:\d+\.\s+.+(?:\n(?!\d+\.).+)*)+/gm,
    
    // Section-based lists with headers followed by text
    /(?:^|\n)(?:(?:Practice|Technique|Exercise|Meditation|Reflection|Step)\s+\d+:[ \t]*[\w\s]+(?:\n(?!(?:Practice|Technique|Exercise|Meditation|Reflection|Step)\s+\d+:).+)*)+/gim
  ];
  
  // Process each pattern type
  for (const pattern of listPatterns) {
    const matches = text.matchAll(pattern);
    
    for (const match of matches) {
      const listContent = match[0].trim();
      
      // Skip very short list items or ones that are likely headers
      if (listContent.length < 20 || listContent.split('\n').length < 2) continue;
      
      // Determine the insight type based on content
      const insightType = determineInsightType(listContent);
      
      insights.push({
        type: insightType,
        content: listContent
      });
    }
  }
  
  // If we have too many insights of the same type, keep only the most relevant ones
  const typeCount: Record<string, number> = {};
  const typeLimit = 2; // Max number of insights per type
  
  return insights
    .sort((a, b) => b.content.length - a.content.length) // Sort by content length as a proxy for richness
    .filter(insight => {
      // Initialize counter for this type if it doesn't exist
      if (!typeCount[insight.type]) {
        typeCount[insight.type] = 0;
      }
      
      // Increment counter and check if we should keep this insight
      typeCount[insight.type]++;
      return typeCount[insight.type] <= typeLimit;
    });
}

/**
 * Determine insight type based on content keywords with improved matching
 */
function determineInsightType(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // Create weighted pattern matches for better categorization
  const patternMatches = [
    {
      type: 'emotional',
      keywords: ['emotion', 'feel', 'feeling', 'emotional', 'mood', 'anxiety', 'joy', 'peace', 'balance'],
      matches: 0
    },
    {
      type: 'chakra',
      keywords: ['chakra', 'energy center', 'root', 'sacral', 'solar plexus', 'heart', 'throat', 'third eye', 'crown', 'kundalini'],
      matches: 0
    },
    {
      type: 'practice',
      keywords: ['practice', 'meditat', 'exercise', 'technique', 'routine', 'breathe', 'breathing', 'daily', 'habitual'],
      matches: 0
    },
    {
      type: 'awareness',
      keywords: ['aware', 'conscious', 'mindful', 'awaken', 'perspective', 'attention', 'present', 'observe'],
      matches: 0
    }
  ];
  
  // Count matches for each pattern
  patternMatches.forEach(pattern => {
    pattern.keywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        // Give more weight to keywords that appear earlier in the content
        const position = lowerContent.indexOf(keyword);
        const positionFactor = 1 - (position / Math.min(100, lowerContent.length));
        
        // Count repeated occurrences
        const regex = new RegExp(keyword, 'gi');
        const occurrences = (lowerContent.match(regex) || []).length;
        
        pattern.matches += occurrences * (1 + positionFactor);
      }
    });
  });
  
  // Find the pattern with the most matches
  const bestMatch = patternMatches.reduce((best, current) => 
    current.matches > best.matches ? current : best, 
    { type: 'general', keywords: [], matches: 0 }
  );
  
  // Return general if no strong matches found
  return bestMatch.matches > 1 ? bestMatch.type : 'general';
}
