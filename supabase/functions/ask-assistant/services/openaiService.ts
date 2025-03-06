
import { corsHeaders } from '../../shared/responseUtils.ts';

// Define supported AI models
export type AIModel = "gpt-4o" | "gpt-4o-mini";

// Types for content moderation
export type ContentModerationType = 
  | "sexual" 
  | "hate" 
  | "harassment" 
  | "self-harm" 
  | "violence" 
  | "graphic";

interface ChatMetrics {
  model: string;
  totalTokens: number;
  promptTokens?: number;
  completionTokens?: number;
}

interface ChatOptions {
  model?: AIModel;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

// Environment variables
const apiKey = Deno.env.get("OPENAI_API_KEY");
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable");
}

// Select the optimal model based on query complexity
export function selectOptimalModel(query: string): AIModel {
  // Advanced complexity detection
  const complexityIndicators = [
    query.length > 150,
    query.split(" ").length > 50,
    /philosophical|metaphysical|consciousness|quantum|transcendence/i.test(query),
    /explain in detail|analyze|compare and contrast/i.test(query)
  ];
  
  // Count number of complexity indicators present
  const complexityScore = complexityIndicators.filter(Boolean).length;
  
  // If query seems complex, use more capable model
  return complexityScore >= 2 ? "gpt-4o" : "gpt-4o-mini";
}

// Content moderation check
export async function moderateContent(content: string): Promise<{
  flagged: boolean;
  flaggedCategories: ContentModerationType[];
}> {
  try {
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

// Generate chat response
export async function generateChatResponse(
  prompt: string,
  systemPrompt: string,
  options: ChatOptions = {}
): Promise<{ content: string; metrics: ChatMetrics }> {
  const model = options.model || "gpt-4o-mini";
  const temperature = options.temperature || 0.7;
  const maxTokens = options.max_tokens || 1500;
  
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

// Generate streaming response
export async function generateStreamingResponse(
  prompt: string,
  systemPrompt: string,
  options: ChatOptions = {}
): Promise<{ response: Response; metrics: Partial<ChatMetrics> }> {
  const model = options.model || "gpt-4o";
  const temperature = options.temperature || 0.7;
  
  try {
    // Create a fetch to OpenAI that will stream the response
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
        stream: true
      })
    });
    
    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API streaming error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    // Prepare transformer to handle OpenAI's stream format
    const transformStream = new TransformStream({
      start(controller) {
        // Send initial JSON to establish connection
        controller.enqueue(JSON.stringify({
          event: 'start',
          data: { model }
        }) + '\n');
      },
      async transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk);
          // Process the SSE format from OpenAI
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                controller.enqueue(JSON.stringify({
                  event: 'done',
                  data: {}
                }) + '\n');
                continue;
              }
              
              try {
                const parsedData = JSON.parse(data);
                const delta = parsedData.choices[0]?.delta?.content || '';
                
                if (delta) {
                  controller.enqueue(JSON.stringify({
                    event: 'chunk',
                    data: { text: delta }
                  }) + '\n');
                }
              } catch (e) {
                console.error('Error parsing JSON from stream:', e);
              }
            }
          }
        } catch (error) {
          console.error('Error in stream transform:', error);
        }
      }
    });
    
    // Create response for client from the transformed stream
    const { readable, writable } = new TransformStream();
    openaiResponse.body?.pipeTo(transformStream.writable).then(() => {
      // Stream is done
    });
    transformStream.readable.pipeTo(writable).catch(err => {
      console.error('Error piping stream:', err);
    });
    
    return {
      response: new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }),
      metrics: { model }
    };
  } catch (error) {
    console.error('Error in streaming response generation:', error);
    throw error;
  }
}
