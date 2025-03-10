
/**
 * Extract insights from AI responses using pattern matching
 */

export interface Insight {
  type: 'practice' | 'reflection' | 'chakra' | 'emotional' | 'wisdom';
  content: string;
  category?: string;
  score?: number;
  relatedChakras?: number[];
}

/**
 * Extract insights from AI response text
 */
export function extractInsights(text: string): Insight[] {
  const insights: Insight[] = [];
  
  // Pattern 1: Bulleted lists with insights
  extractBulletedInsights(text, insights);
  
  // Pattern 2: Numbered lists with insights
  extractNumberedInsights(text, insights);
  
  // Pattern 3: Paragraph-based insights with strong indicators
  extractParagraphInsights(text, insights);
  
  // Pattern 4: Chakra-specific insights
  extractChakraInsights(text, insights);
  
  // Pattern 5: Emotional insights
  extractEmotionalInsights(text, insights);
  
  // Sort by relevance (longer insights are typically more detailed/relevant)
  return insights.sort((a, b) => b.content.length - a.content.length);
}

/**
 * Extract insights from bulleted lists
 */
function extractBulletedInsights(text: string, insights: Insight[]): void {
  // Match bulleted lists (*, -, •)
  const bulletPattern = /(?:^|\n)\s*[•\-*]\s+(.*?)(?=\n\s*[•\-*]|\n\n|$)/g;
  let match: RegExpExecArray | null;
  
  while ((match = bulletPattern.exec(text)) !== null) {
    const content = match[1].trim();
    if (content.length > 10) { // Filter out very short items
      const type = categorizeInsight(content);
      insights.push({
        type,
        content,
        category: determineCategory(content, type)
      });
    }
  }
}

/**
 * Extract insights from numbered lists
 */
function extractNumberedInsights(text: string, insights: Insight[]): void {
  // Match numbered lists (1., 2., etc.)
  const numberedPattern = /(?:^|\n)\s*\d+\.\s+(.*?)(?=\n\s*\d+\.|\n\n|$)/g;
  let match: RegExpExecArray | null;
  
  while ((match = numberedPattern.exec(text)) !== null) {
    const content = match[1].trim();
    if (content.length > 10) { // Filter out very short items
      const type = categorizeInsight(content);
      insights.push({
        type,
        content,
        category: determineCategory(content, type)
      });
    }
  }
}

/**
 * Extract insights from paragraphs with strong indicators
 */
function extractParagraphInsights(text: string, insights: Insight[]): void {
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  // Insight indicator patterns
  const insightPatterns = [
    /\b(?:consider|try|practice|recommended|suggestion|insight|advice|reflect on|focus on|remember)\b/i,
    /\b(?:important|key|essential|vital|critical|fundamental)\b.*\b(?:aspect|element|component|part|factor)\b/i,
    /\b(?:beneficial|helpful|useful|effective|valuable)\b.*\b(?:practice|technique|approach|method|strategy)\b/i
  ];
  
  for (const paragraph of paragraphs) {
    const content = paragraph.trim();
    
    // Skip short paragraphs
    if (content.length < 40 || content.length > 200) continue;
    
    // Check if paragraph matches any insight patterns
    const matchesPattern = insightPatterns.some(pattern => pattern.test(content));
    if (matchesPattern) {
      const type = categorizeInsight(content);
      insights.push({
        type,
        content,
        category: determineCategory(content, type)
      });
    }
  }
}

/**
 * Extract chakra-specific insights
 */
function extractChakraInsights(text: string, insights: Insight[]): void {
  // Chakra keywords
  const chakraKeywords = [
    { name: 'root', number: 1, keywords: ['root chakra', 'muladhara', 'first chakra', 'base chakra', 'safety', 'security', 'grounding', 'survival'] },
    { name: 'sacral', number: 2, keywords: ['sacral chakra', 'svadhisthana', 'second chakra', 'creativity', 'passion', 'pleasure', 'emotions'] },
    { name: 'solar plexus', number: 3, keywords: ['solar plexus', 'manipura', 'third chakra', 'power', 'confidence', 'self-esteem', 'willpower'] },
    { name: 'heart', number: 4, keywords: ['heart chakra', 'anahata', 'fourth chakra', 'love', 'compassion', 'harmony', 'peace'] },
    { name: 'throat', number: 5, keywords: ['throat chakra', 'vishuddha', 'fifth chakra', 'communication', 'expression', 'truth', 'voice'] },
    { name: 'third eye', number: 6, keywords: ['third eye', 'ajna', 'sixth chakra', 'intuition', 'insight', 'vision', 'perception'] },
    { name: 'crown', number: 7, keywords: ['crown chakra', 'sahasrara', 'seventh chakra', 'consciousness', 'awareness', 'enlightenment', 'spirituality'] }
  ];
  
  // Extract sentences with chakra keywords
  for (const chakra of chakraKeywords) {
    const chakraPattern = new RegExp(`[^.!?]*(?:${chakra.keywords.join('|')})[^.!?]*[.!?]`, 'gi');
    let match: RegExpExecArray | null;
    
    while ((match = chakraPattern.exec(text)) !== null) {
      const content = match[0].trim();
      if (content.length > 20) { // Filter out very short sentences
        insights.push({
          type: 'chakra',
          content,
          category: chakra.name,
          relatedChakras: [chakra.number]
        });
      }
    }
  }
}

/**
 * Extract emotional insights
 */
function extractEmotionalInsights(text: string, insights: Insight[]): void {
  // Emotional keywords
  const emotionalKeywords = [
    { category: 'anxiety', keywords: ['anxiety', 'anxious', 'worry', 'stress', 'fear', 'panic', 'tension'] },
    { category: 'happiness', keywords: ['happiness', 'joy', 'delight', 'pleasure', 'contentment', 'bliss', 'satisfaction'] },
    { category: 'sadness', keywords: ['sadness', 'grief', 'sorrow', 'melancholy', 'depression', 'despair', 'unhappiness'] },
    { category: 'anger', keywords: ['anger', 'frustration', 'irritation', 'rage', 'resentment', 'hostility', 'annoyance'] },
    { category: 'peace', keywords: ['peace', 'calm', 'tranquility', 'serenity', 'harmony', 'stillness', 'relaxation'] }
  ];
  
  // Extract sentences with emotional keywords
  for (const emotion of emotionalKeywords) {
    const emotionPattern = new RegExp(`[^.!?]*(?:${emotion.keywords.join('|')})[^.!?]*[.!?]`, 'gi');
    let match: RegExpExecArray | null;
    
    while ((match = emotionPattern.exec(text)) !== null) {
      const content = match[0].trim();
      if (content.length > 20) { // Filter out very short sentences
        insights.push({
          type: 'emotional',
          content,
          category: emotion.category
        });
      }
    }
  }
}

/**
 * Categorize insight type based on content
 */
function categorizeInsight(content: string): Insight['type'] {
  // Practice indicators
  if (/\b(?:practice|exercise|technique|try|do|perform)\b/i.test(content)) {
    return 'practice';
  }
  
  // Reflection indicators
  if (/\b(?:reflect|consider|contemplate|think about|ponder|meditate on)\b/i.test(content)) {
    return 'reflection';
  }
  
  // Chakra indicators
  if (/\b(?:chakra|energy center|muladhara|svadhisthana|manipura|anahata|vishuddha|ajna|sahasrara)\b/i.test(content)) {
    return 'chakra';
  }
  
  // Emotional indicators
  if (/\b(?:emotion|feeling|mood|anxiety|depression|happiness|joy|sadness|anger|peace)\b/i.test(content)) {
    return 'emotional';
  }
  
  // Default to wisdom
  return 'wisdom';
}

/**
 * Determine category based on content and type
 */
function determineCategory(content: string, type: Insight['type']): string {
  // Meditation category
  if (/\b(?:meditat|breath|mindful)\b/i.test(content)) {
    return 'meditation';
  }
  
  // Yoga category
  if (/\b(?:yoga|pose|asana|stretch)\b/i.test(content)) {
    return 'yoga';
  }
  
  // Energy category
  if (/\b(?:energy|vibration|frequency|resonance)\b/i.test(content)) {
    return 'energy';
  }
  
  // Wisdom category
  if (/\b(?:wisdom|truth|insight|reality|awareness)\b/i.test(content)) {
    return 'wisdom';
  }
  
  // Default based on type
  const defaultCategories: Record<Insight['type'], string> = {
    practice: 'general practice',
    reflection: 'self-reflection',
    chakra: 'energy work',
    emotional: 'emotional wellness',
    wisdom: 'insight'
  };
  
  return defaultCategories[type];
}
