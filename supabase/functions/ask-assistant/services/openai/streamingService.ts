
import { AIModel, ChatMetrics } from "./types.ts";
import { corsHeaders } from "../../../shared/responseUtils.ts";

// Generate streaming response with optimized token handling
export async function generateStreamingResponse(
  prompt: string,
  systemPrompt: string,
  options: { model?: AIModel; temperature?: number } = {}
): Promise<{ response: Response; metrics: Partial<ChatMetrics> }> {
  const model = options.model || "gpt-4o-mini"; // Default to the cheaper model
  const temperature = options.temperature || 0.7;
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  
  // Estimate token counts to optimize requests
  const estimatedSystemTokens = Math.ceil(systemPrompt.length / 4);
  const estimatedPromptTokens = Math.ceil(prompt.length / 4);
  const totalEstimatedTokens = estimatedSystemTokens + estimatedPromptTokens;
  
  // Adjust parameters based on estimated tokens
  const useGpt4o = model === "gpt-4o" || totalEstimatedTokens > 8000;
  const finalModel = useGpt4o ? "gpt-4o" : "gpt-4o-mini";
  
  try {
    console.log(`Using model: ${finalModel} (estimated tokens: ${totalEstimatedTokens})`);
    
    // Create a fetch to OpenAI that will stream the response
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        stream: true,
        // Add frequency penalty to reduce repetition
        frequency_penalty: 0.3
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
          data: { model: finalModel }
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
      // Stream is done - log completion for monitoring
      console.log(`Stream completed for model: ${finalModel}`);
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
      metrics: { 
        model: finalModel,
        promptTokens: estimatedPromptTokens,
        totalTokens: totalEstimatedTokens
      }
    };
  } catch (error) {
    console.error('Error in streaming response generation:', error);
    throw error;
  }
}
