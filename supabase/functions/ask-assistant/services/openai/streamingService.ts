
/**
 * Streaming service for OpenAI responses
 */

import { AIModel, ChatMetrics } from "./types.ts";

/**
 * Generate a streaming response from OpenAI
 * 
 * @param prompt User prompt
 * @param systemPrompt System instructions
 * @param options Configuration options
 * @returns Streaming response
 */
export async function generateStreamingResponse(
  prompt: string,
  systemPrompt: string,
  options: {
    model?: AIModel;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<Response> {
  const model = options.model || "gpt-4o-mini";
  const temperature = options.temperature || 0.7;
  const maxTokens = options.maxTokens || 1500;
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
        stream: true
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error generating streaming response:', error);
    throw error;
  }
}

/**
 * Process a streaming response chunk
 * 
 * @param chunk The streaming chunk data
 * @returns Processed chunk content
 */
export function processStreamingChunk(chunk: string): string {
  // Remove "data: " prefix
  const data = chunk.replace(/^data: /, '');
  
  // Handle stream end
  if (data === '[DONE]') {
    return '';
  }
  
  try {
    // Parse the JSON data
    const parsedData = JSON.parse(data);
    
    // Extract content delta
    const contentDelta = parsedData.choices[0]?.delta?.content || '';
    
    return contentDelta;
  } catch (error) {
    console.error('Error parsing streaming chunk:', error);
    return '';
  }
}
