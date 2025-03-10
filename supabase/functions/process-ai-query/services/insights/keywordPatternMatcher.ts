
/**
 * Identify insights in text based on keyword patterns
 * @param text The AI response text to analyze
 * @returns Array of identified insights with type and content
 */
export function identifyInsightsByKeywords(text: string): { type: string; content: string }[] {
  const insights: { type: string; content: string }[] = [];
  const paragraphs = text.split(/\n\n+/);
  
  // Define insight keyword patterns
  const insightPatterns = [
    { 
      type: 'emotional', 
      keywords: ['emotion', 'feel', 'feeling', 'emotional', 'mood', 'energy', 'attitude', 'anxiety', 'joy', 'peace'],
      priority: 2
    },
    { 
      type: 'chakra', 
      keywords: ['chakra', 'root', 'sacral', 'solar plexus', 'heart', 'throat', 'third eye', 'crown', 'energy center'],
      priority: 3
    },
    { 
      type: 'practice', 
      keywords: ['practice', 'meditation', 'exercise', 'technique', 'routine', 'habit', 'discipline', 'ritual', 'breathing'],
      priority: 1
    },
    { 
      type: 'awareness', 
      keywords: ['awareness', 'mindful', 'conscious', 'perspective', 'insight', 'realization', 'understanding', 'reflection'],
      priority: 0
    }
  ];
  
  // Process each paragraph
  paragraphs.forEach(paragraph => {
    const normalizedParagraph = paragraph.toLowerCase();
    
    // Skip short paragraphs (likely not insights)
    if (normalizedParagraph.length < 30) return;
    
    // Find matching insight types based on keywords
    const matchingTypes = insightPatterns
      .filter(pattern => 
        pattern.keywords.some(keyword => 
          normalizedParagraph.includes(keyword)
        )
      )
      .sort((a, b) => b.priority - a.priority);
    
    // If we found matches, add the highest priority one
    if (matchingTypes.length > 0) {
      insights.push({
        type: matchingTypes[0].type,
        content: paragraph.trim()
      });
    }
  });
  
  return insights;
}
