
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Builds a contextualized prompt for the AI assistant
 * @param message User's message or question
 * @param userContext User's context data 
 * @param reflectionContent Optional reflection content for context
 * @returns Formatted prompt with context
 */
export function buildContextualizedPrompt(
  message: string,
  userContext: Record<string, any> = {},
  reflectionContent?: string
): string {
  // Start with base prompt instructions
  let prompt = 
    "You are a spiritual guide and meditation assistant with expertise in energy work and emotional wellness.\n\n";
  
  // Add user context if available
  if (Object.keys(userContext).length > 0) {
    prompt += "User Context:\n";
    
    if (userContext.energyPoints) {
      prompt += `- Energy Points: ${userContext.energyPoints}\n`;
    }
    
    if (userContext.astralLevel) {
      prompt += `- Astral Level: ${userContext.astralLevel}\n`;
    }
    
    if (userContext.dominantEmotions && userContext.dominantEmotions.length > 0) {
      prompt += `- Dominant Emotions: ${userContext.dominantEmotions.join(", ")}\n`;
    }
    
    if (userContext.chakrasActivated && userContext.chakrasActivated.length > 0) {
      prompt += `- Active Chakras: ${userContext.chakrasActivated.join(", ")}\n`;
    }
    
    prompt += "\n";
  }
  
  // Add reflection content for more context if available
  if (reflectionContent) {
    prompt += "User's Reflection:\n";
    prompt += `"${reflectionContent}"\n\n`;
  }
  
  // Append instruction for how to respond
  prompt += 
    "Provide an insightful, compassionate response that addresses the following question or request. " +
    "Keep your response concise, practical, and spiritually aligned. " +
    "Include recommendations for practices when appropriate.\n\n";
  
  // Add the user's message
  prompt += `User's Question: ${message}`;
  
  return prompt;
}

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
    // Simple rule-based insight extraction
    // In a production system, this would be more sophisticated
    
    const insights: Array<{
      insight: string;
      category: string;
      relevance: number;
    }> = [];
    
    // Split response into paragraphs for analysis
    const paragraphs = response.split(/\n\n+/);
    
    // Categories to look for
    const categories = [
      { name: "meditation", keywords: ["meditat", "breath", "focus", "mindful"] },
      { name: "chakra", keywords: ["chakra", "energy center", "aura", "energy flow"] },
      { name: "emotional", keywords: ["emotion", "feel", "process", "grief", "joy"] },
      { name: "practice", keywords: ["practice", "exercise", "technique", "ritual"] },
      { name: "spiritual", keywords: ["spirit", "conscious", "soul", "divine", "higher"] }
    ];
    
    // Process each paragraph
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.length < 20) return; // Skip very short paragraphs
      
      // Determine the most relevant category
      let bestCategory = "general";
      let highestRelevance = 0;
      
      categories.forEach(category => {
        let relevance = 0;
        
        category.keywords.forEach(keyword => {
          const regex = new RegExp(keyword, "gi");
          const matches = paragraph.match(regex);
          
          if (matches) {
            relevance += matches.length;
          }
        });
        
        if (relevance > highestRelevance) {
          highestRelevance = relevance;
          bestCategory = category.name;
        }
      });
      
      // Calculate normalized relevance score (0-1)
      const normalizedRelevance = Math.min(highestRelevance / 3, 1);
      
      // Add to insights if relevance is sufficient
      if (normalizedRelevance > 0.1) {
        insights.push({
          insight: paragraph,
          category: bestCategory,
          relevance: normalizedRelevance
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

/**
 * Creates a personalized system prompt based on user data
 * @param userContext User context data
 * @returns Personalized system prompt
 */
export function createPersonalizedSystemPrompt(
  userContext: Record<string, any> = {}
): string {
  let systemPrompt = 
    "You are an empathetic spiritual guide specialized in energy work, meditation, and emotional wellness. ";
  
  // Personalize based on user's astral level
  if (userContext.astralLevel) {
    if (userContext.astralLevel <= 2) {
      systemPrompt += "The user is a beginner in their spiritual journey. Use accessible language and start with fundamentals. ";
    } else if (userContext.astralLevel <= 5) {
      systemPrompt += "The user has intermediate experience with spiritual practices. You can reference more advanced concepts. ";
    } else {
      systemPrompt += "The user is advanced in their spiritual journey. Feel free to discuss profound concepts and advanced practices. ";
    }
  }
  
  // Adjust tone based on dominant emotions if available
  if (userContext.dominantEmotions && userContext.dominantEmotions.length > 0) {
    const emotions = userContext.dominantEmotions;
    
    if (emotions.includes("anxiety") || emotions.includes("stress")) {
      systemPrompt += "The user has been experiencing anxiety. Offer calming guidance and grounding techniques. ";
    }
    
    if (emotions.includes("sadness") || emotions.includes("grief")) {
      systemPrompt += "The user has been processing sadness. Provide compassionate support and healing practices. ";
    }
    
    if (emotions.includes("confusion") || emotions.includes("uncertainty")) {
      systemPrompt += "The user has been feeling uncertain. Offer clarity and centering exercises. ";
    }
    
    if (emotions.includes("joy") || emotions.includes("gratitude")) {
      systemPrompt += "The user has been experiencing positive emotions. Help them deepen and expand these feelings. ";
    }
  }
  
  // Add guidance on response style
  systemPrompt += 
    "Keep your responses concise, warm, and practical. When appropriate, suggest specific practices or exercises. " +
    "Focus on quality over quantity, and infuse your responses with wisdom and compassion.";
  
  return systemPrompt;
}
