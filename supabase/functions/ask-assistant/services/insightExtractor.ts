
/**
 * Extracts key insights from an AI response
 * @param response The full AI response text
 * @returns Array of extracted key insights
 */
export function extractKeyInsights(response: string): Array<{
  insight: string;
  category: string;
  relevance: number;
}> {
  try {
    // Enhanced insight extraction with improved categorization
    const insights: Array<{
      insight: string;
      category: string;
      relevance: number;
    }> = [];
    
    // Split response into paragraphs for analysis
    const paragraphs = response.split(/\n\n+/);
    
    // Categories to look for with enhanced keywords
    const categories = [
      { 
        name: "meditation", 
        keywords: ["meditat", "breath", "focus", "mindful", "present", "awareness", "conscious", "stillness", "silence", "observe"]
      },
      { 
        name: "chakra", 
        keywords: ["chakra", "energy center", "aura", "energy flow", "root", "sacral", "solar plexus", "heart", "throat", "third eye", "crown", "kundalini"]
      },
      { 
        name: "emotional", 
        keywords: ["emotion", "feel", "process", "grief", "joy", "sadness", "anxiety", "peace", "harmony", "balance", "inner", "healing"]
      },
      { 
        name: "practice", 
        keywords: ["practice", "exercise", "technique", "ritual", "routine", "habit", "daily", "morning", "evening", "regular"]
      },
      { 
        name: "spiritual", 
        keywords: ["spirit", "conscious", "soul", "divine", "higher", "universe", "cosmic", "transcend", "enlighten", "awaken"]
      },
      {
        name: "wellness",
        keywords: ["health", "well-being", "wellness", "holistic", "balance", "harmony", "body", "mind", "connection", "integrate"]
      }
    ];
    
    // Process each paragraph with improved relevance calculation
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.length < 30 || paragraph.length > 300) return; // Skip very short or very long paragraphs
      
      // Determine the most relevant category with weighted matching
      let bestCategory = "general";
      let highestRelevance = 0;
      
      categories.forEach(category => {
        let relevance = 0;
        let matches = 0;
        
        category.keywords.forEach(keyword => {
          const regex = new RegExp(keyword, "gi");
          const keywordMatches = paragraph.match(regex);
          
          if (keywordMatches) {
            matches++;
            // Weight matches by keyword position (earlier = more important)
            const position = paragraph.toLowerCase().indexOf(keyword.toLowerCase());
            const positionWeight = 1 - (position / paragraph.length) * 0.5; // Earlier matches get up to 50% bonus
            
            relevance += keywordMatches.length * positionWeight;
          }
        });
        
        // Bonus for matching multiple distinct keywords
        if (matches > 1) {
          relevance *= 1 + (matches / category.keywords.length) * 0.5;
        }
        
        if (relevance > highestRelevance) {
          highestRelevance = relevance;
          bestCategory = category.name;
        }
      });
      
      // Calculate normalized relevance score (0-1) with improved scaling
      const normalizedRelevance = Math.min(highestRelevance / 4, 1);
      
      // Add to insights if relevance is sufficient
      if (normalizedRelevance > 0.2) { // Increased threshold for better quality
        // Check for sentiment to further improve relevance
        const positiveWords = ["beneficial", "helpful", "effective", "powerful", "important", "key", "essential"];
        const sentimentBonus = positiveWords.some(word => paragraph.toLowerCase().includes(word)) ? 0.2 : 0;
        
        insights.push({
          insight: paragraph,
          category: bestCategory,
          relevance: normalizedRelevance + sentimentBonus
        });
      }
    });
    
    // Return top insights, sorted by relevance
    return insights
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  } catch (error) {
    console.error("Error extracting insights:", error);
    return [];
  }
}

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
