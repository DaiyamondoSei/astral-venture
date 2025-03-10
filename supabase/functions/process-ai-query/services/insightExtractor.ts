
/**
 * Utility for extracting insights from AI responses
 */

interface Insight {
  type: string;
  content: string;
}

/**
 * Extract insights from AI response text
 * 
 * @param text - AI response text
 * @returns Array of extracted insights
 */
export function extractInsights(text: string): Insight[] {
  const insights: Insight[] = [];
  
  // Look for practice suggestions (usually at the end of the response)
  const practiceRegex = /practice[s]?:?\s*([\s\S]*?)(?=\n\n|$)/i;
  const practiceMatch = text.match(practiceRegex);
  
  if (practiceMatch && practiceMatch[1]) {
    // Split multiple practices
    const practices = practiceMatch[1]
      .split(/\d+\.|\n-|\*/)
      .filter(practice => practice.trim().length > 0)
      .map(practice => practice.trim());
    
    for (const practice of practices) {
      if (practice.length > 10) { // Minimum length to be a valid practice
        insights.push({
          type: 'practice',
          content: practice
        });
      }
    }
  }
  
  // Look for chakra mentions
  const chakras = [
    'root', 'sacral', 'solar plexus', 
    'heart', 'throat', 'third eye', 'crown'
  ];
  
  for (const chakra of chakras) {
    const chakraRegex = new RegExp(`${chakra} chakra\\b[^.!?]*[.!?]`, 'gi');
    const chakraMatches = text.match(chakraRegex);
    
    if (chakraMatches) {
      for (const match of chakraMatches) {
        insights.push({
          type: 'chakra',
          content: match.trim()
        });
      }
    }
  }
  
  // Look for emotional insights
  const emotionRegex = /(?:emotion|feeling|sense|anxiety|fear|joy|peace)[^.!?]*[.!?]/gi;
  const emotionMatches = text.match(emotionRegex);
  
  if (emotionMatches) {
    for (const match of emotionMatches) {
      // Filter out common phrases that aren't really insights
      if (!match.includes('you may feel') && !match.includes('it is normal')) {
        insights.push({
          type: 'emotion',
          content: match.trim()
        });
      }
    }
  }
  
  // Look for spiritual insights - sentences with spiritual keywords
  const spiritualRegex = /(?:spirit|conscious|awareness|divine|universe|energy|vibration|meditation)[^.!?]*[.!?]/gi;
  const spiritualMatches = text.match(spiritualRegex);
  
  if (spiritualMatches) {
    for (const match of spiritualMatches) {
      // Only include substantial insights
      if (match.length > 30) {
        insights.push({
          type: 'spiritual',
          content: match.trim()
        });
      }
    }
  }
  
  // Remove duplicates and limit to most relevant insights
  const uniqueInsights = insights
    .filter((insight, index, self) => 
      index === self.findIndex(i => i.content === insight.content)
    )
    .slice(0, 5); // Limit to top 5 insights
  
  return uniqueInsights;
}
