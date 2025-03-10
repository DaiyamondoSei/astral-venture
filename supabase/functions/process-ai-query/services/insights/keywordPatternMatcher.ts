
/**
 * Identify insights in text based on keyword patterns
 * Enhanced with semantic grouping and contextual relevance
 * 
 * @param text The AI response text to analyze
 * @returns Array of identified insights with type and content
 */
export function identifyInsightsByKeywords(text: string): { type: string; content: string }[] {
  const insights: { type: string; content: string }[] = [];
  
  // Split text into semantic units (paragraphs, sentences)
  const paragraphs = text.split(/\n\n+/);
  const contentBlocks = [];
  
  // Process paragraphs into semantic content blocks
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    
    // Skip short paragraphs or likely headers
    if (paragraph.length < 30 || paragraph.endsWith(':') || paragraph.length > 500) {
      continue;
    }
    
    // Check if this paragraph should be merged with the next one for context
    if (i < paragraphs.length - 1) {
      const nextParagraph = paragraphs[i+1].trim();
      // If next paragraph is short and related to current, merge them
      if (nextParagraph.length < 50 && isRelatedContent(paragraph, nextParagraph)) {
        contentBlocks.push(`${paragraph}\n\n${nextParagraph}`);
        i++; // Skip the next paragraph since we merged it
        continue;
      }
    }
    
    contentBlocks.push(paragraph);
  }
  
  // Define insight patterns with improved categorization
  const insightPatterns = [
    { 
      type: 'emotional', 
      keywords: [
        'emotion', 'feel', 'feeling', 'emotional', 'mood', 'energy', 'attitude',
        'anxiety', 'joy', 'peace', 'balance', 'fear', 'love', 'happiness',
        'sadness', 'grief', 'anger', 'frustration', 'contentment'
      ],
      priority: 2,
      significanceThreshold: 0.6
    },
    { 
      type: 'chakra', 
      keywords: [
        'chakra', 'root', 'sacral', 'solar plexus', 'heart', 'throat', 'third eye',
        'crown', 'energy center', 'aura', 'kundalini', 'energy flow', 'blockage',
        'activation', 'alignment', 'balancing', 'energy body'
      ],
      priority: 3,
      significanceThreshold: 0.7
    },
    { 
      type: 'practice', 
      keywords: [
        'practice', 'meditation', 'exercise', 'technique', 'routine', 'habit',
        'discipline', 'ritual', 'breathing', 'breathwork', 'visualization',
        'mindfulness', 'daily practice', 'morning routine', 'evening routine',
        'mantra', 'affirmation', 'yoga', 'pranayama', 'cultivate'
      ],
      priority: 1,
      significanceThreshold: 0.5
    },
    { 
      type: 'awareness', 
      keywords: [
        'awareness', 'mindful', 'conscious', 'perspective', 'insight',
        'realization', 'understanding', 'reflection', 'witnessing', 'presence',
        'observation', 'attention', 'awakening', 'enlightenment', 'transformation',
        'transcendence', 'higher consciousness', 'higher self'
      ],
      priority: 0,
      significanceThreshold: 0.55
    }
  ];
  
  // Process each content block
  contentBlocks.forEach(content => {
    const normalizedContent = content.toLowerCase();
    
    // Find all matching patterns and calculate significance scores
    const matches = insightPatterns.map(pattern => {
      let matchCount = 0;
      let keywordMatches = 0;
      
      pattern.keywords.forEach(keyword => {
        // Count occurrences of each keyword
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = normalizedContent.match(regex);
        if (matches) {
          keywordMatches++;
          matchCount += matches.length;
        }
      });
      
      // Calculate significance score based on keyword diversity and frequency
      const diversityFactor = keywordMatches / pattern.keywords.length;
      const frequencyFactor = matchCount / (normalizedContent.length / 50); // Normalize by content length
      const significanceScore = (diversityFactor * 0.7) + (frequencyFactor * 0.3);
      
      return {
        pattern,
        significanceScore,
        keywordMatches
      };
    });
    
    // Get the most significant match that passes the threshold
    const bestMatch = matches
      .filter(m => m.significanceScore >= m.pattern.significanceThreshold && m.keywordMatches >= 2)
      .sort((a, b) => {
        // Sort by significance score first, then by pattern priority
        if (Math.abs(a.significanceScore - b.significanceScore) > 0.1) {
          return b.significanceScore - a.significanceScore;
        }
        return b.pattern.priority - a.pattern.priority;
      })[0];
    
    if (bestMatch) {
      insights.push({
        type: bestMatch.pattern.type,
        content: content
      });
    }
  });
  
  return insights;
}

/**
 * Determine if two content pieces are semantically related
 */
function isRelatedContent(content1: string, content2: string): boolean {
  const c1 = content1.toLowerCase();
  const c2 = content2.toLowerCase();
  
  // Check if content2 starts with connective phrases
  const connectivePhrases = [
    'this', 'these', 'those', 'it', 'they', 'therefore', 'thus', 'hence',
    'consequently', 'as a result', 'so', 'additionally', 'furthermore', 
    'moreover', 'for example', 'such as', 'like', 'including'
  ];
  
  for (const phrase of connectivePhrases) {
    if (c2.startsWith(phrase)) {
      return true;
    }
  }
  
  // Check if they share significant words (excluding common words)
  const commonWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'from']);
  const words1 = new Set(c1.split(/\W+/).filter(w => w.length > 3 && !commonWords.has(w)));
  const words2 = new Set(c2.split(/\W+/).filter(w => w.length > 3 && !commonWords.has(w)));
  
  let sharedWords = 0;
  for (const word of words1) {
    if (words2.has(word)) {
      sharedWords++;
    }
  }
  
  // If they share multiple significant words, they're likely related
  return sharedWords >= 3;
}
