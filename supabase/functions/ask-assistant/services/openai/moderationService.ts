
import { ContentModerationType } from "./types.ts";

// Content moderation check
export async function moderateContent(content: string): Promise<{
  flagged: boolean;
  flaggedCategories: ContentModerationType[];
}> {
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY environment variable");
      throw new Error("OpenAI API key is not configured");
    }
    
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: content })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Moderation API error:', error);
      throw new Error(`Moderation API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('Invalid response from moderation API');
    }
    
    const result = data.results[0];
    const flaggedCategories: ContentModerationType[] = [];
    
    // Extract flagged categories
    if (result.categories) {
      if (result.categories.sexual && result.category_scores.sexual > 0.5) flaggedCategories.push('sexual');
      if (result.categories.hate && result.category_scores.hate > 0.5) flaggedCategories.push('hate');
      if (result.categories.harassment && result.category_scores.harassment > 0.5) flaggedCategories.push('harassment');
      if (result.categories['self-harm'] && result.category_scores['self-harm'] > 0.5) flaggedCategories.push('self-harm');
      if (result.categories.violence && result.category_scores.violence > 0.5) flaggedCategories.push('violence');
      if (result.categories.graphic && result.category_scores.graphic > 0.5) flaggedCategories.push('graphic');
    }
    
    return {
      flagged: result.flagged,
      flaggedCategories
    };
  } catch (error) {
    console.error('Error in content moderation:', error);
    // Default to not flagged if moderation fails
    return {
      flagged: false,
      flaggedCategories: []
    };
  }
}
