
import { AIModel, ChatMetrics, ChatOptions } from "./types.ts";

// Generate chat response
export async function generateChatResponse(
  prompt: string,
  systemPrompt: string,
  options: ChatOptions = {}
): Promise<{ content: string; metrics: ChatMetrics }> {
  const model = options.model || "gpt-4o-mini";
  const temperature = options.temperature || 0.7;
  const maxTokens = options.max_tokens || 1500;
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.",
      metrics: {
        model: data.model || model,
        totalTokens: data.usage?.total_tokens || 0,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens
      }
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}
