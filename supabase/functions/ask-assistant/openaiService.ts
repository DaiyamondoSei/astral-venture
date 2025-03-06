
// OpenAI service for ask-assistant edge function

// Define content moderation types
export type ContentModerationType = 
  | "hate"
  | "harassment"
  | "self-harm"
  | "sexual"
  | "violence"
  | "graphic";

// Chat message type
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Generate chat response using OpenAI API
export async function generateChatResponse(userPrompt: string): Promise<string> {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API key");
      return "I'm unable to respond right now due to a configuration issue. Please try again later.";
    }
    
    // System message to set the context and behavior
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are a spiritual guide and energy healing assistant for a wellness application.
      Provide thoughtful, insightful responses about energy healing, meditation, chakras,
      and spiritual wellness. Keep responses concise, supportive, and focused on the user's
      question. Avoid medical advice or claims that energy work can cure physical conditions.`
    };
    
    // User message
    const userMessage: ChatMessage = {
      role: "user",
      content: userPrompt
    };
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",  // Using GPT-4 for more nuanced responses
        messages: [systemMessage, userMessage],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.6
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}

// Check content moderation (in production, this would call OpenAI's moderation API)
export async function checkContentModeration(
  content: string
): Promise<{ flagged: boolean; categories: ContentModerationType[] }> {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API key for moderation");
      return { flagged: false, categories: [] };
    }
    
    // In a production environment, implement the OpenAI moderation API call here
    // This is a placeholder for now
    
    // For now, we'll do a simple keyword check
    const moderationKeywords: Record<ContentModerationType, string[]> = {
      "hate": ["hate", "despise", "loathe"],
      "harassment": ["harass", "bully", "intimidate"],
      "self-harm": ["suicide", "self-harm", "kill myself"],
      "sexual": ["explicit", "sexual", "nsfw"],
      "violence": ["violence", "attack", "kill", "murder"],
      "graphic": ["graphic", "gore", "blood"]
    };
    
    const flaggedCategories: ContentModerationType[] = [];
    const lowerContent = content.toLowerCase();
    
    // Check each category for flagged keywords
    Object.entries(moderationKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        flaggedCategories.push(category as ContentModerationType);
      }
    });
    
    return {
      flagged: flaggedCategories.length > 0,
      categories: flaggedCategories
    };
    
  } catch (error) {
    console.error("Error in content moderation:", error);
    return { flagged: false, categories: [] };
  }
}
