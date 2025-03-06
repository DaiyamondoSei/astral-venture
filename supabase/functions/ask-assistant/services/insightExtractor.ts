
// Extract suggested practices from AI response
export function extractSuggestedPractices(response: string): string[] {
  const practices: string[] = [];
  
  // Look for sections that might contain practices
  const practiceSections = [
    /suggested practices?:?\s*([\s\S]*?)(?=\n\n|$)/i,
    /recommended practices?:?\s*([\s\S]*?)(?=\n\n|$)/i,
    /try these practices?:?\s*([\s\S]*?)(?=\n\n|$)/i,
    /exercises? to try:?\s*([\s\S]*?)(?=\n\n|$)/i
  ];
  
  // Try to find practice sections
  for (const regex of practiceSections) {
    const match = response.match(regex);
    if (match && match[1]) {
      // Split by bullet points or numbers
      const items = match[1]
        .split(/\n[-•*]\s*|\n\d+\.\s*/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      practices.push(...items);
      
      // If we found practices, no need to check other patterns
      if (items.length > 0) {
        break;
      }
    }
  }
  
  // If no structured practices found, look for sentences with practice keywords
  if (practices.length === 0) {
    const practiceKeywords = [
      "try", "practice", "exercise", "technique", "meditation", 
      "breathe", "visualize", "journal", "reflect"
    ];
    
    const sentences = response.split(/[.!?]+/).map(s => s.trim());
    
    for (const sentence of sentences) {
      if (sentence.length > 15 && sentence.length < 120) {
        for (const keyword of practiceKeywords) {
          if (sentence.toLowerCase().includes(keyword)) {
            practices.push(sentence);
            break;
          }
        }
      }
      
      // Limit to 3 practices
      if (practices.length >= 3) break;
    }
  }
  
  return practices.slice(0, 3); // Limit to top 3 practices
}
