
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
    
    if (userContext.lastActive) {
      // Calculate days since last active
      const lastActiveDate = new Date(userContext.lastActive);
      const daysSinceActive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceActive > 7) {
        prompt += `- User is returning after ${daysSinceActive} days\n`;
      }
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
    "If appropriate, include 1-3 recommended practices as a separate section at the end of your response.\n\n";
  
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
  
  // Personalize based on user's astral level with more precise guidance
  if (userContext.astralLevel) {
    if (userContext.astralLevel <= 2) {
      systemPrompt += "The user is a beginner in their spiritual journey. Use accessible language, focus on fundamentals, and explain concepts clearly without jargon. Provide practical first steps and beginner-friendly practices. ";
    } else if (userContext.astralLevel <= 5) {
      systemPrompt += "The user has intermediate experience with spiritual practices. You can reference more advanced concepts while still providing context. Focus on deepening their existing practice and introducing intermediate techniques. ";
    } else {
      systemPrompt += "The user is advanced in their spiritual journey. Feel free to discuss profound concepts, advanced practices, and subtle energy work. You can use specialized terminology and refer to deeper spiritual philosophies. ";
    }
  }
  
  // Adjust tone based on dominant emotions if available
  if (userContext.dominantEmotions && userContext.dominantEmotions.length > 0) {
    const emotions = userContext.dominantEmotions;
    
    if (emotions.includes("anxiety") || emotions.includes("stress") || emotions.includes("overwhelm")) {
      systemPrompt += "The user has been experiencing anxiety or stress. Offer calming guidance, grounding techniques, and reassurance. Emphasize practices that promote stability and present-moment awareness. ";
    }
    
    if (emotions.includes("sadness") || emotions.includes("grief") || emotions.includes("depression")) {
      systemPrompt += "The user has been processing sadness or grief. Provide compassionate support, healing practices, and gentle encouragement. Acknowledge the importance of feeling emotions while offering hope. ";
    }
    
    if (emotions.includes("confusion") || emotions.includes("uncertainty") || emotions.includes("doubt")) {
      systemPrompt += "The user has been feeling uncertain or confused. Offer clarity, centering exercises, and structured guidance. Help them find their inner compass and trust their intuition. ";
    }
    
    if (emotions.includes("joy") || emotions.includes("gratitude") || emotions.includes("peace")) {
      systemPrompt += "The user has been experiencing positive emotions. Help them deepen and expand these feelings, and channel this energy into further spiritual growth. ";
    }
  }
  
  // Add guidance based on active chakras
  if (userContext.chakrasActivated && userContext.chakrasActivated.length > 0) {
    const chakras = userContext.chakrasActivated;
    
    if (chakras.includes("Root")) {
      systemPrompt += "The user's Root chakra is active. Include guidance related to stability, security, and grounding. ";
    }
    
    if (chakras.includes("Heart")) {
      systemPrompt += "The user's Heart chakra is active. Emphasize self-love, compassion, and emotional healing. ";
    }
    
    if (chakras.includes("Third Eye")) {
      systemPrompt += "The user's Third Eye chakra is active. Include insights about intuition, clarity, and spiritual vision. ";
    }
  }
  
  // Add guidance on response style
  systemPrompt += 
    "Keep your responses concise, warm, and practical. When appropriate, suggest specific practices or exercises. " +
    "Focus on quality over quantity, and infuse your responses with wisdom and compassion. " +
    "If appropriate, include 1-3 recommended practices as a separate section at the end of your response.";
  
  return systemPrompt;
}
