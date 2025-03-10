
/**
 * List-based pattern matching for insight extraction
 */
import { Insight } from './patternMatcher.ts';

/**
 * Extract list items from text
 * 
 * @param text The AI-generated text to extract from
 * @returns Array of insights from list items
 */
export function extractListItems(text: string): Insight[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const insights: Insight[] = [];
  
  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  
  // Process each paragraph for list detection
  for (const paragraph of paragraphs) {
    // Check if paragraph contains a list
    if (isListParagraph(paragraph)) {
      const extractedItems = extractItemsFromList(paragraph);
      insights.push(...extractedItems);
    }
  }
  
  return insights;
}

/**
 * Check if a paragraph contains a list structure
 */
function isListParagraph(paragraph: string): boolean {
  // Check for common list markers
  const listMarkerPattern = /(?:^|\n)(?:\s*(?:\d+\.|[•\-\*]|\([a-z\d]+\))\s+)/;
  return listMarkerPattern.test(paragraph);
}

/**
 * Extract individual items from a list paragraph
 */
function extractItemsFromList(paragraph: string): Insight[] {
  const insights: Insight[] = [];
  
  // Different list formats
  const patterns = [
    // Numbered lists: "1. Item text"
    /(?:^|\n)\s*(\d+)\.\s+(.+?)(?=(?:\n\s*\d+\.\s+|\n\n|$))/gs,
    
    // Bullet lists: "• Item text" or "- Item text" or "* Item text"
    /(?:^|\n)\s*[•\-\*]\s+(.+?)(?=(?:\n\s*[•\-\*]\s+|\n\n|$))/gs,
    
    // Lettered lists: "(a) Item text" or "(1) Item text"
    /(?:^|\n)\s*\(([a-z\d]+)\)\s+(.+?)(?=(?:\n\s*\([a-z\d]+\)\s+|\n\n|$))/gs
  ];
  
  for (const pattern of patterns) {
    const matches = [...paragraph.matchAll(pattern)];
    
    if (matches.length > 0) {
      // For each match, create an insight
      matches.forEach((match, index) => {
        // Handle different capturing group patterns
        let text = '';
        if (match.length === 3) {
          // For numbered and lettered lists, the text is in the second capturing group
          text = match[2].trim();
        } else if (match.length === 2) {
          // For bullet lists, the text is in the first capturing group
          text = match[1].trim();
        }
        
        if (text) {
          insights.push({
            text,
            type: 'list_item',
            confidence: 0.75 + (0.05 * Math.min(index, 5)), // Higher confidence for earlier items
            metadata: {
              position: index,
              listType: pattern.source.includes('\\d+') ? 'numbered' : 
                       pattern.source.includes('[•\\-\\*]') ? 'bullet' : 'lettered',
              originalMatch: match[0]
            }
          });
        }
      });
      
      // If we found matches with this pattern, don't try other patterns
      break;
    }
  }
  
  return insights;
}
