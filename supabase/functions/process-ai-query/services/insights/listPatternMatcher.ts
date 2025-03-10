
/**
 * Extract list items from AI responses
 */
import type { Insight } from './patternMatcher.ts';

/**
 * List item with metadata
 */
interface ListItem {
  text: string;
  type: 'bullet' | 'numbered';
  index?: number; // For numbered lists
  depth: number; // Nesting level
}

/**
 * Extract list items from text
 */
export function extractListItems(text: string): ListItem[] {
  const items: ListItem[] = [];
  
  // Extract bulleted list items
  const bulletedItems = extractBulletedItems(text);
  items.push(...bulletedItems);
  
  // Extract numbered list items
  const numberedItems = extractNumberedItems(text);
  items.push(...numberedItems);
  
  // Sort by position in text
  return items.sort((a, b) => {
    const aIndex = text.indexOf(a.text);
    const bIndex = text.indexOf(b.text);
    return aIndex - bIndex;
  });
}

/**
 * Extract bulleted list items from text
 */
function extractBulletedItems(text: string): ListItem[] {
  const items: ListItem[] = [];
  
  // Match bulleted lists (* , - , •)
  // Also handle various levels of indentation
  const bulletPattern = /^(\s*)([*\-•])\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  
  while ((match = bulletPattern.exec(text)) !== null) {
    const indentation = match[1].length;
    const depth = Math.floor(indentation / 2); // Every 2 spaces increases nesting level
    const content = match[3].trim();
    
    items.push({
      text: content,
      type: 'bullet',
      depth
    });
  }
  
  return items;
}

/**
 * Extract numbered list items from text
 */
function extractNumberedItems(text: string): ListItem[] {
  const items: ListItem[] = [];
  
  // Match numbered lists (1., 2., etc.) with possible indentation
  const numberedPattern = /^(\s*)(\d+)\.?\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  
  while ((match = numberedPattern.exec(text)) !== null) {
    const indentation = match[1].length;
    const depth = Math.floor(indentation / 2); // Every 2 spaces increases nesting level
    const index = parseInt(match[2], 10);
    const content = match[3].trim();
    
    items.push({
      text: content,
      type: 'numbered',
      index,
      depth
    });
  }
  
  return items;
}

/**
 * Convert list items to insights
 */
export function convertListItemsToInsights(
  items: ListItem[], 
  parentType?: string
): Insight[] {
  return items.map(item => {
    // Determine insight type based on content
    const type = determineInsightType(item.text, parentType);
    
    return {
      type,
      content: item.text,
      category: determineCategoryFromContent(item.text, type)
    };
  });
}

/**
 * Determine insight type from content
 */
function determineInsightType(
  content: string, 
  parentType?: string
): Insight['type'] {
  // Use parent type if available as a hint
  if (parentType) {
    switch (parentType.toLowerCase()) {
      case 'practice':
      case 'practices':
      case 'exercises':
      case 'techniques':
        return 'practice';
      case 'reflection':
      case 'reflections':
      case 'questions':
      case 'prompts':
        return 'reflection';
      case 'chakra':
      case 'chakras':
      case 'energy centers':
        return 'chakra';
      case 'emotion':
      case 'emotions':
      case 'feelings':
        return 'emotional';
    }
  }
  
  // Look for type indicators in content
  if (/\b(?:try|practice|do|perform|exercise)\b/i.test(content)) {
    return 'practice';
  }
  
  if (/\b(?:reflect|consider|contemplate|journal)\b/i.test(content)) {
    return 'reflection';
  }
  
  if (/\b(?:chakra|energy|center|muladhara|svadhisthana|manipura|anahata|vishuddha|ajna|sahasrara)\b/i.test(content)) {
    return 'chakra';
  }
  
  if (/\b(?:feel|emotion|mood|anxiety|joy|sadness|anger|peace)\b/i.test(content)) {
    return 'emotional';
  }
  
  // Default
  return 'wisdom';
}

/**
 * Determine category from content
 */
function determineCategoryFromContent(
  content: string, 
  type: Insight['type']
): string {
  // Content-based categories
  if (/\b(?:meditat|breath|mindful)\b/i.test(content)) {
    return 'meditation';
  }
  
  if (/\b(?:yoga|pose|asana|stretch)\b/i.test(content)) {
    return 'yoga';
  }
  
  if (/\b(?:journal|write|record)\b/i.test(content)) {
    return 'journaling';
  }
  
  if (/\b(?:affirm|mantra|repeat)\b/i.test(content)) {
    return 'affirmation';
  }
  
  // Type-based default categories
  const defaultCategories: Record<Insight['type'], string> = {
    practice: 'general practice',
    reflection: 'self-reflection',
    chakra: 'energy work',
    emotional: 'emotional wellness',
    wisdom: 'insight'
  };
  
  return defaultCategories[type];
}
