
/**
 * Identify insights by keywords in AI responses
 */
import type { Insight } from './patternMatcher.ts';

/**
 * Keyword category mapping
 */
interface KeywordCategory {
  category: string;
  type: Insight['type'];
  keywords: string[];
}

/**
 * Keyword-based categories for insight identification
 */
const KEYWORD_CATEGORIES: KeywordCategory[] = [
  {
    category: 'meditation',
    type: 'practice',
    keywords: ['meditation', 'meditate', 'mindfulness', 'presence', 'awareness', 'breath', 'breathing', 'observe']
  },
  {
    category: 'yoga',
    type: 'practice',
    keywords: ['yoga', 'pose', 'asana', 'stretch', 'flexibility', 'balance', 'alignment']
  },
  {
    category: 'energy_work',
    type: 'practice',
    keywords: ['energy', 'prana', 'chi', 'life force', 'vitality', 'resonance', 'vibration', 'frequency']
  },
  {
    category: 'grounding',
    type: 'practice',
    keywords: ['ground', 'grounding', 'earthing', 'stability', 'foundation', 'rooted', 'centered']
  },
  {
    category: 'visualization',
    type: 'practice',
    keywords: ['visualize', 'visualization', 'imagine', 'imagery', 'mental picture', 'envision']
  },
  {
    category: 'self_reflection',
    type: 'reflection',
    keywords: ['reflect', 'contemplate', 'introspection', 'self-inquiry', 'examine', 'journal', 'insight']
  },
  {
    category: 'root_chakra',
    type: 'chakra',
    keywords: ['root chakra', 'muladhara', 'base chakra', 'first chakra', 'security', 'safety', 'grounding']
  },
  {
    category: 'sacral_chakra',
    type: 'chakra',
    keywords: ['sacral chakra', 'svadhisthana', 'second chakra', 'creativity', 'passion', 'emotions']
  },
  {
    category: 'solar_plexus_chakra',
    type: 'chakra',
    keywords: ['solar plexus', 'manipura', 'third chakra', 'power', 'confidence', 'self-esteem']
  },
  {
    category: 'heart_chakra',
    type: 'chakra',
    keywords: ['heart chakra', 'anahata', 'fourth chakra', 'love', 'compassion', 'connection']
  },
  {
    category: 'throat_chakra',
    type: 'chakra',
    keywords: ['throat chakra', 'vishuddha', 'fifth chakra', 'expression', 'communication', 'truth']
  },
  {
    category: 'third_eye_chakra',
    type: 'chakra',
    keywords: ['third eye', 'ajna', 'sixth chakra', 'intuition', 'insight', 'vision', 'perception']
  },
  {
    category: 'crown_chakra',
    type: 'chakra',
    keywords: ['crown chakra', 'sahasrara', 'seventh chakra', 'consciousness', 'awareness', 'connection']
  },
  {
    category: 'anxiety',
    type: 'emotional',
    keywords: ['anxiety', 'anxious', 'worry', 'stress', 'fear', 'tension']
  },
  {
    category: 'peace',
    type: 'emotional',
    keywords: ['peace', 'calm', 'tranquility', 'serenity', 'harmony', 'relaxation']
  },
  {
    category: 'happiness',
    type: 'emotional',
    keywords: ['happiness', 'joy', 'delight', 'pleasure', 'contentment', 'satisfaction']
  }
];

/**
 * Identify potential insights by scanning for keywords
 */
export function identifyInsightsByKeywords(text: string): Insight[] {
  const insights: Insight[] = [];
  const sentences = extractSentences(text);
  
  for (const sentence of sentences) {
    // Skip very short sentences
    if (sentence.length < 20) continue;
    
    for (const category of KEYWORD_CATEGORIES) {
      // Check if sentence contains any keywords from the category
      const matchedKeyword = category.keywords.find(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchedKeyword) {
        // Add as insight if it contains a keyword
        insights.push({
          type: category.type,
          content: sentence,
          category: category.category
        });
        
        // Only match one category per sentence to avoid duplicates
        break;
      }
    }
  }
  
  return insights;
}

/**
 * Extract sentences from text
 */
function extractSentences(text: string): string[] {
  // Split text into sentences using regex that handles various punctuation
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const matches = text.match(sentenceRegex) || [];
  
  // Clean up sentences
  return matches.map(sentence => sentence.trim());
}

/**
 * Check if content relates to a specific chakra
 */
export function identifyChakraNumber(content: string): number[] {
  const chakraMatches: number[] = [];
  
  // Chakra mapping
  const chakraKeywords = [
    { number: 1, keywords: ['root chakra', 'muladhara', 'first chakra', 'base chakra'] },
    { number: 2, keywords: ['sacral chakra', 'svadhisthana', 'second chakra'] },
    { number: 3, keywords: ['solar plexus', 'manipura', 'third chakra'] },
    { number: 4, keywords: ['heart chakra', 'anahata', 'fourth chakra'] },
    { number: 5, keywords: ['throat chakra', 'vishuddha', 'fifth chakra'] },
    { number: 6, keywords: ['third eye', 'ajna', 'sixth chakra'] },
    { number: 7, keywords: ['crown chakra', 'sahasrara', 'seventh chakra'] }
  ];
  
  // Check content against all chakra keywords
  const lowerContent = content.toLowerCase();
  
  for (const chakra of chakraKeywords) {
    for (const keyword of chakra.keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        chakraMatches.push(chakra.number);
        break;
      }
    }
  }
  
  return chakraMatches;
}
