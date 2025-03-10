
/**
 * Insight extractor for AI responses
 * Extracts structured insights from unstructured AI responses
 */

import { logEvent } from "../../shared/responseUtils.ts";

// Insight types
export type InsightCategory = 
  | "energy" 
  | "chakra" 
  | "meditation" 
  | "mindfulness" 
  | "emotional" 
  | "spiritual"
  | "practice";

export interface Insight {
  text: string;
  category: InsightCategory;
  relevance: number;
}

export interface SuggestedPractice {
  title: string;
  description: string;
  duration?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

/**
 * Extract key insights from AI response
 * 
 * @param content AI response content
 * @returns Array of extracted insights
 */
export function extractKeyInsights(content: string): Insight[] {
  if (!content) return [];
  
  try {
    const insights: Insight[] = [];
    const paragraphs = content.split("\n\n");
    
    // Pattern for insights with "key insight" / "important" / etc.
    const explicitInsightPattern = /(?:key insight|important|notable|significant|essential):\s*([^.!?]+[.!?])/gi;
    
    // Extract explicit insights first
    let match;
    while ((match = explicitInsightPattern.exec(content)) !== null) {
      const insightText = match[1].trim();
      
      // Determine category
      const category = categorizeInsight(insightText);
      
      insights.push({
        text: insightText,
        category,
        relevance: 0.9 // High relevance for explicit insights
      });
    }
    
    // Extract implicit insights from paragraphs
    for (const paragraph of paragraphs) {
      // Skip very short paragraphs
      if (paragraph.length < 40) continue;
      
      // Skip paragraphs that are already included as explicit insights
      if (insights.some(insight => paragraph.includes(insight.text))) continue;
      
      // Look for sentences with key terms indicating insights
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      for (const sentence of sentences) {
        // Skip short sentences
        if (sentence.length < 30) continue;
        
        // Check if sentence contains insight indicators
        const insightIndicators = [
          "important", "essential", "key", "significant", "remember",
          "fundamental", "crucial", "critical", "foundational", "practice",
          "technique", "benefit", "advantage", "impact", "effect"
        ];
        
        const containsIndicator = insightIndicators.some(indicator => 
          sentence.toLowerCase().includes(indicator)
        );
        
        if (containsIndicator) {
          const insightText = sentence.trim();
          const category = categorizeInsight(insightText);
          
          insights.push({
            text: insightText,
            category,
            relevance: 0.7 // Medium relevance for implicit insights
          });
          
          // Limit to 2 implicit insights per paragraph
          if (insights.filter(i => i.relevance < 0.8).length >= 2 * paragraphs.length) {
            break;
          }
        }
      }
    }
    
    // Deduplicate and sort by relevance
    const uniqueInsights = deduplicateInsights(insights);
    const sortedInsights = uniqueInsights.sort((a, b) => b.relevance - a.relevance);
    
    // Limit to top 5 insights
    return sortedInsights.slice(0, 5);
  } catch (error) {
    // Log error but don't throw
    logEvent("error", "Error extracting insights", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return [];
  }
}

/**
 * Extract suggested practices from AI response
 * 
 * @param content AI response content
 * @returns Array of suggested practices
 */
export function extractSuggestedPractices(content: string): SuggestedPractice[] {
  if (!content) return [];
  
  try {
    const practices: SuggestedPractice[] = [];
    
    // Look for practice sections
    const practiceHeaders = [
      "suggested practices", "recommended practices", 
      "practices you can try", "practices to try",
      "exercises", "techniques"
    ];
    
    // Split content into sections
    const sections = content.split(/\n\n+/);
    
    // Find practice sections
    let inPracticeSection = false;
    let currentPractice: Partial<SuggestedPractice> = {};
    
    for (const section of sections) {
      const lowerSection = section.toLowerCase();
      
      // Check if this is a practice header
      const isPracticeHeader = practiceHeaders.some(header => 
        lowerSection.includes(header)
      );
      
      if (isPracticeHeader) {
        inPracticeSection = true;
        continue;
      }
      
      // If we're in a practice section, look for numbered practices
      if (inPracticeSection) {
        // Check for numbered practice or bold practice title
        const practiceTitleMatch = section.match(/(\d+\.\s*|\*\*)([\w\s]+)([:.]\s*|:\s*\*\*)(.*)/i);
        
        if (practiceTitleMatch) {
          // If we have a current practice, save it before starting a new one
          if (currentPractice.title && currentPractice.description) {
            practices.push(currentPractice as SuggestedPractice);
          }
          
          // Start a new practice
          currentPractice = {
            title: practiceTitleMatch[2].trim(),
            description: practiceTitleMatch[4].trim()
          };
          
          // Look for duration in the description
          const durationMatch = currentPractice.description.match(/(\d+[\-\s]?minutes|(\d+[\-\s]?min))/i);
          if (durationMatch) {
            currentPractice.duration = durationMatch[0];
          }
          
          // Look for difficulty in the title or description
          const difficultyTerms = {
            beginner: ["beginner", "simple", "easy", "basic", "start"],
            intermediate: ["intermediate", "moderate", "medium"],
            advanced: ["advanced", "expert", "complex", "challenging"]
          };
          
          const combinedText = `${currentPractice.title} ${currentPractice.description}`.toLowerCase();
          
          for (const [level, terms] of Object.entries(difficultyTerms)) {
            if (terms.some(term => combinedText.includes(term))) {
              currentPractice.difficulty = level as "beginner" | "intermediate" | "advanced";
              break;
            }
          }
        } else if (currentPractice.title) {
          // Append to current practice description
          currentPractice.description += " " + section.trim();
        }
      }
    }
    
    // Add the last practice if it exists
    if (currentPractice.title && currentPractice.description) {
      practices.push(currentPractice as SuggestedPractice);
    }
    
    // If no structured practices were found, try to extract from bullet points
    if (practices.length === 0) {
      const bulletMatches = content.match(/[•\-\*]\s*([\w\s]+):\s*([^•\-\*]+)/g);
      
      if (bulletMatches) {
        for (const match of bulletMatches) {
          const parts = match.split(/:\s*/);
          if (parts.length >= 2) {
            const title = parts[0].replace(/[•\-\*]\s*/, '').trim();
            const description = parts.slice(1).join(': ').trim();
            
            practices.push({
              title,
              description
            });
          }
        }
      }
    }
    
    return practices;
  } catch (error) {
    // Log error but don't throw
    logEvent("error", "Error extracting suggested practices", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return [];
  }
}

/**
 * Categorize an insight based on its content
 * 
 * @param text Insight text
 * @returns Category for the insight
 */
function categorizeInsight(text: string): InsightCategory {
  const lowerText = text.toLowerCase();
  
  // Category matching terms
  const categoryTerms: Record<InsightCategory, string[]> = {
    energy: ["energy", "energetic", "vibration", "frequency", "vitality", "life force", "prana", "chi"],
    chakra: ["chakra", "root", "sacral", "solar plexus", "heart", "throat", "third eye", "crown"],
    meditation: ["meditation", "meditative", "mindful", "breath", "breathing", "focus", "concentration"],
    mindfulness: ["mindful", "awareness", "present", "presence", "conscious", "attention", "observe"],
    emotional: ["emotion", "feeling", "mood", "anxiety", "stress", "depression", "joy", "peace"],
    spiritual: ["spirit", "spiritual", "soul", "divine", "sacred", "higher self", "consciousness"],
    practice: ["practice", "technique", "exercise", "method", "approach", "routine", "habit"]
  };
  
  // Match categories
  for (const [category, terms] of Object.entries(categoryTerms)) {
    if (terms.some(term => lowerText.includes(term))) {
      return category as InsightCategory;
    }
  }
  
  // Default to spiritual if no match
  return "spiritual";
}

/**
 * Deduplicate insights based on similarity
 * 
 * @param insights Array of insights
 * @returns Array of deduplicated insights
 */
function deduplicateInsights(insights: Insight[]): Insight[] {
  const uniqueInsights: Insight[] = [];
  
  for (const insight of insights) {
    // Check if we already have a similar insight
    const existingSimilar = uniqueInsights.find(existing => 
      calculateSimilarity(existing.text, insight.text) > 0.7
    );
    
    if (!existingSimilar) {
      uniqueInsights.push(insight);
    } else if (insight.relevance > existingSimilar.relevance) {
      // Replace with higher relevance insight
      const index = uniqueInsights.indexOf(existingSimilar);
      uniqueInsights[index] = insight;
    }
  }
  
  return uniqueInsights;
}

/**
 * Calculate text similarity between two strings
 * Uses a simple Jaccard similarity on word sets
 * 
 * @param a First string
 * @param b Second string
 * @returns Similarity score (0-1)
 */
function calculateSimilarity(a: string, b: string): number {
  // Convert to lowercase and split into words
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  
  // Find intersection and union
  const intersection = new Set([...wordsA].filter(word => wordsB.has(word)));
  const union = new Set([...wordsA, ...wordsB]);
  
  // Calculate Jaccard similarity
  return intersection.size / union.size;
}
