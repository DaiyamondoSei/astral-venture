
/**
 * Streaming service for OpenAI chat completions
 */

import { logEvent } from "../../../shared/responseUtils.ts";
import type { AIModel, ChatOptions } from "./types.ts";

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
  options: ChatOptions = {}
): Promise<Response> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
  
  try {
    const model = options.model || "gpt-4o-mini";
    const temperature = options.temperature || 0.7;
    const maxTokens = options.max_tokens || 1500;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];
    
    // Start timing
    const startTime = Date.now();
    
    // Create request payload
    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      ...(options.function_call ? { function_call: options.function_call } : {}),
      ...(options.functions ? { functions: options.functions } : {})
    };
    
    // Make streaming request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }
    
    // Transform the response to include additional information
    const responseStream = response.body;
    if (!responseStream) {
      throw new Error("OpenAI response body is null");
    }
    
    // Create a TransformStream to process the response
    const { readable, writable } = new TransformStream();
    
    // Process the stream
    const writer = writable.getWriter();
    const reader = responseStream.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let responseText = "";
    
    // Start the stream processing
    (async () => {
      try {
        // Send timestamp at the beginning
        const startEvent = `data: ${JSON.stringify({
          timestamp: Date.now(),
          type: "start",
          model,
          event: "start"
        })}\n\n`;
        await writer.write(encoder.encode(startEvent));
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Decode chunk
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(line => line.trim() !== "");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              
              // Handle [DONE] message
              if (data === "[DONE]") {
                continue;
              }
              
              try {
                const json = JSON.parse(data);
                const delta = json.choices[0]?.delta;
                
                if (delta?.content) {
                  responseText += delta.content;
                }
                
                // Forward the data with added timestamp
                const enhancedData = {
                  ...json,
                  timestamp: Date.now(),
                  type: "chunk"
                };
                
                await writer.write(encoder.encode(`data: ${JSON.stringify(enhancedData)}\n\n`));
              } catch (error) {
                console.error("Error processing stream chunk:", error);
              }
            }
          }
        }
        
        // Send completion event
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        const completionEvent = `data: ${JSON.stringify({
          timestamp: endTime,
          type: "end",
          event: "end",
          model,
          processedText: responseText,
          processingTime,
          completed: true
        })}\n\n`;
        
        await writer.write(encoder.encode(completionEvent));
        
        // Log completion
        logEvent("info", "Streaming response completed", {
          model,
          processingTimeMs: processingTime,
          responseLength: responseText.length
        });
      } catch (error) {
        // Send error event
        const errorEvent = `data: ${JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown streaming error",
          timestamp: Date.now(),
          type: "error",
          event: "error",
          completed: true
        })}\n\n`;
        
        await writer.write(encoder.encode(errorEvent));
        
        // Log error
        logEvent("error", "Streaming response error", {
          error: error instanceof Error ? error.message : String(error),
          model
        });
      } finally {
        await writer.close();
      }
    })();
    
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    // Log error
    logEvent("error", "Error setting up streaming response", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
}
