
/**
 * Enhanced service for extracting insights and practices from AI responses
 */

/**
 * Extracts key insights from an AI response with improved categorization and ranking
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
    
    // Skip empty responses
    if (!response || response.length < 100) {
      return [];
    }
    
    // Split response into paragraphs for analysis
    const paragraphs = response.split(/\n\n+/);
    
    // Categories to look for with enhanced keywords
    const categories = [
      { 
        name: "meditation", 
        keywords: [
          "meditat", "breath", "focus", "mindful", "present", "awareness", 
          "conscious", "stillness", "silence", "observe", "attention", 
          "inward", "center", "calm", "tranquil"
        ],
        priority: 10
      },
      { 
        name: "chakra", 
        keywords: [
          "chakra", "energy center", "aura", "energy flow", "root", "sacral", 
          "solar plexus", "heart", "throat", "third eye", "crown", "kundalini", 
          "energy body", "energy field", "subtle body", "nadis"
        ],
        priority: 8
      },
      { 
        name: "emotional", 
        keywords: [
          "emotion", "feel", "process", "grief", "joy", "sadness", "anxiety", 
          "peace", "harmony", "balance", "inner", "healing", "release", 
          "trauma", "pattern", "response", "trigger"
        ],
        priority: 9
      },
      { 
        name: "practice", 
        keywords: [
          "practice", "exercise", "technique", "ritual", "routine", "habit", 
          "daily", "morning", "evening", "regular", "consistent", "commitment", 
          "discipline", "method", "approach", "strategy"
        ],
        priority: 7
      },
      { 
        name: "spiritual", 
        keywords: [
          "spirit", "conscious", "soul", "divine", "higher", "universe", 
          "cosmic", "transcend", "enlighten", "awaken", "sacred", "holy", 
          "connection", "oneness", "unity", "wholeness"
        ],
        priority: 6
      },
      {
        name: "wellness",
        keywords: [
          "health", "well-being", "wellness", "holistic", "balance", "harmony", 
          "body", "mind", "connection", "integrate", "lifestyle", "vitality", 
          "flourish", "thrive", "nourish", "restore"
        ],
        priority: 5
      }
    ];
    
    // Collect sentences that might contain insights
    const insightSentences: { text: string; index: number }[] = [];
    
    // Split into sentences and preserve their original paragraph index
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.length < 30) return;
      
      // Split paragraph into sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      
      sentences.forEach(sentence => {
        if (sentence.length > 30 && sentence.length < 250) {
          insightSentences.push({ text: sentence.trim(), index });
        }
      });
    });
    
    // Process each sentence for insights
    insightSentences.forEach(({ text, index }) => {
      const lowerText = text.toLowerCase();
      
      // Skip sentences that are likely not insights
      if (text.startsWith("For example") || text.startsWith("Such as") || text.startsWith("Note:")) {
        return;
      }
      
      // Look for insight markers
      const insightMarkers = [
        "important", "key", "essential", "critical", "significant", "vital", 
        "recognize", "understand", "remember", "notice", "aware", "mindful"
      ];
      
      let isLikelyInsight = false;
      let bestCategory = null;
      let highestScore = 0;
      
      // Check for markers that indicate this is an insight
      for (const marker of insightMarkers) {
        if (lowerText.includes(marker)) {
          isLikelyInsight = true;
          break;
        }
      }
      
      // Determine the most relevant category with weighted matching
      categories.forEach(category => {
        let categoryScore = 0;
        let uniqueMatches = new Set();
        
        category.keywords.forEach(keyword => {
          const regex = new RegExp(keyword, "gi");
          const matches = lowerText.match(regex);
          
          if (matches) {
            // Weight matches by keyword position (earlier = more important)
            const position = lowerText.indexOf(keyword.toLowerCase());
            const positionWeight = 1 - (position / lowerText.length) * 0.5; // Earlier matches get up to 50% bonus
            
            uniqueMatches.add(keyword);
            categoryScore += matches.length * positionWeight;
          }
        });
        
        // Apply category priority and unique matches bonus
        const priorityFactor = category.priority / 10; // Normalize to 0-1
        const uniqueMatchesFactor = 1 + (uniqueMatches.size / category.keywords.length);
        
        const finalScore = categoryScore * priorityFactor * uniqueMatchesFactor;
        
        if (finalScore > highestScore) {
          highestScore = finalScore;
          bestCategory = category.name;
        }
      });
      
      // Add to insights if it's likely an insight or has a strong category match
      if (isLikelyInsight || highestScore > 1.5) {
        // Check for duplicates or similar insights
        const isDuplicate = insights.some(existing => 
          existing.category === bestCategory && 
          isSimilarText(existing.insight, text)
        );
        
        if (!isDuplicate) {
          // Calculate relevance score (0-1)
          const relevance = Math.min((isLikelyInsight ? 0.5 : 0) + (highestScore / 5), 1);
          
          insights.push({
            insight: text,
            category: bestCategory || "general",
            relevance: relevance
          });
        }
      }
    });
    
    // Return top insights, sorted by relevance
    return insights
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 4);
  } catch (error) {
    console.error("Error extracting insights:", error);
    return [];
  }
}

/**
 * Check if two text snippets are similar
 */
function isSimilarText(text1: string, text2: string): boolean {
  // Normalize and tokenize texts
  const tokens1 = text1.toLowerCase().split(/\W+/).filter(t => t.length > 3);
  const tokens2 = text2.toLowerCase().split(/\W+/).filter(t => t.length > 3);
  
  // Count shared tokens
  const sharedTokens = tokens1.filter(t => tokens2.includes(t));
  
  // Calculate Jaccard similarity
  const similarity = sharedTokens.length / (tokens1.length + tokens2.length - sharedTokens.length);
  
  return similarity > 0.4; // Threshold for similarity
}

/**
 * Extract suggested practices from AI response with improved pattern matching
 * @param response The full AI response text
 * @returns Array of extracted practice suggestions
 */
export function extractSuggestedPractices(response: string): string[] {
  const practices: string[] = [];
  
  // Skip processing if response is empty or too short
  if (!response || response.length < 100) {
    return [];
  }
  
  // Look for practice sections with enhanced patterns
  const practiceHeaderPatterns = [
    /(?:suggested|recommended)\s+practices?:?\s*([\s\S]*?)(?=\n\n|$)/i,
    /(?:try these|here are some|consider these)\s+(?:practices|exercises|techniques):?\s*([\s\S]*?)(?=\n\n|$)/i,
    /(?:exercises?|techniques?|practices?)\s+to\s+(?:try|consider|practice):?\s*([\s\S]*?)(?=\n\n|$)/i,
    /(?:daily|regular|morning|evening)\s+(?:practice|routine|ritual):?\s*([\s\S]*?)(?=\n\n|$)/i
  ];
  
  // Try to find practice sections using headers
  for (const pattern of practiceHeaderPatterns) {
    const match = response.match(pattern);
    if (match && match[1]) {
      // Extract individual practices from the section
      const practiceItems = extractPracticeItems(match[1]);
      if (practiceItems.length > 0) {
        practices.push(...practiceItems);
        // If we found practices, no need to check other patterns
        break;
      }
    }
  }
  
  // If no structured practices found, look for standalone practice suggestions
  if (practices.length === 0) {
    // Look for numbered or bulleted items that contain practice keywords
    const listItemPatterns = [
      /\d+\.\s+((?:Try|Practice|Do|Implement|Use|Take|Start)[ \w\s,.:\-;'"()]+[.!?])/gi,
      /[•\-\*]\s+((?:Try|Practice|Do|Implement|Use|Take|Start)[ \w\s,.:\-;'"()]+[.!?])/gi
    ];
    
    for (const pattern of listItemPatterns) {
      const matches = [...response.matchAll(pattern)];
      for (const match of matches) {
        if (match[1] && isPracticeSuggestion(match[1])) {
          practices.push(match[1].trim());
        }
      }
    }
    
    // If still no practices, look for sentences with practice keywords
    if (practices.length === 0) {
      const sentences = response.split(/[.!?]+/).map(s => s.trim());
      
      for (const sentence of sentences) {
        if (sentence.length > 15 && sentence.length < 150 && isPracticeSuggestion(sentence)) {
          practices.push(sentence + '.');
        }
        
        // Limit to 3 practices
        if (practices.length >= 3) break;
      }
    }
  }
  
  // Remove duplicates and limit to 3 practices
  return [...new Set(practices)].slice(0, 3);
}

/**
 * Extract individual practice items from a practice section
 */
function extractPracticeItems(text: string): string[] {
  const practices: string[] = [];
  
  // Split by common list item delimiters
  const listPatterns = [
    /\d+\.\s+([^\n]+)/g,  // Numbered items
    /[•\-\*]\s+([^\n]+)/g, // Bullet points
    /([A-Z][^.!?]+[.!?])/g // Sentences starting with capital letter
  ];
  
  // Try each pattern to extract items
  for (const pattern of listPatterns) {
    const matches = [...text.matchAll(pattern)];
    
    if (matches.length > 0) {
      for (const match of matches) {
        const practice = match[1].trim();
        if (practice.length > 10 && isPracticeSuggestion(practice)) {
          practices.push(practice);
        }
      }
      
      // If we found practices with this pattern, don't try other patterns
      if (practices.length > 0) {
        break;
      }
    }
  }
  
  // If no patterns matched, fall back to splitting by newlines
  if (practices.length === 0) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 10);
    for (const line of lines) {
      if (isPracticeSuggestion(line)) {
        practices.push(line);
      }
    }
  }
  
  return practices;
}

/**
 * Determine if a text snippet is likely a practice suggestion
 */
function isPracticeSuggestion(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for typical practice instruction words
  const practiceVerbs = [
    'try', 'practice', 'do', 'implement', 'apply', 'use', 'take', 'breathe',
    'meditate', 'visualize', 'focus', 'notice', 'observe', 'reflect', 'journal',
    'set aside', 'dedicate', 'create', 'develop', 'establish', 'begin', 'start'
  ];
  
  // Check for practice-related nouns
  const practiceNouns = [
    'meditation', 'practice', 'exercise', 'technique', 'ritual', 'routine',
    'breathing', 'visualization', 'affirmation', 'mantra', 'journal',
    'mindfulness', 'awareness', 'observation', 'yoga', 'pranayama'
  ];
  
  // Check if text contains practice verbs or nouns
  const hasVerb = practiceVerbs.some(verb => lowerText.includes(verb));
  const hasNoun = practiceNouns.some(noun => lowerText.includes(noun));
  
  // Text should be instructional (contain a verb) or mention a practice type
  return hasVerb || hasNoun;
}
