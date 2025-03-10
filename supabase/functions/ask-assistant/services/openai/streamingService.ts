
/**
 * OpenAI streaming service for real-time responses
 */
import type { AIModel, ChatOptions, StreamingMessage } from "./types.ts";

/**
 * Generate a streaming response from OpenAI
 * 
 * @param messages - Array of chat messages
 * @param options - Configuration options
 * @returns Async iterator for streaming response chunks
 */
export async function generateStreamingResponse(
  messages: Array<{ role: string; content: string; }>,
  options?: ChatOptions
): Promise<ReadableStream<Uint8Array>> {
  // Get API key from environment
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  // Set up default options
  const model = options?.model || "gpt-4o-mini";
  const temperature = options?.temperature ?? 0.7;
  const max_tokens = options?.max_tokens ?? 1000;
  
  // Prepare request body
  const requestBody: Record<string, any> = {
    model,
    messages,
    temperature,
    max_tokens,
    stream: true
  };
  
  // Add function calling if specified
  if (options?.function_call) {
    requestBody.function_call = options.function_call;
  }
  
  if (options?.functions) {
    requestBody.functions = options.functions;
  }
  
  try {
    // Make request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    // Return the streaming response
    return processStreamingResponse(response.body!);
  } catch (error) {
    console.error("Error in streaming completion:", error);
    throw error;
  }
}

/**
 * Process streaming response from OpenAI
 */
function processStreamingResponse(
  responseBody: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  
  // Transform stream to handle server-sent events
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      // Decode chunk and add to buffer
      buffer += decoder.decode(chunk, { stream: true });
      
      // Process complete events
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          // Handle end of stream
          if (data === "[DONE]") {
            // Send a final event with finished flag
            const finalMessage: StreamingMessage = {
              content: "",
              role: "assistant",
              finished: true
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalMessage)}\n\n`));
            return;
          }
          
          try {
            // Parse data
            const parsed = JSON.parse(data);
            const choice = parsed.choices?.[0];
            
            if (choice?.delta?.content) {
              // Send content chunk
              const message: StreamingMessage = {
                content: choice.delta.content,
                role: "assistant",
                finished: false
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
            } else if (choice?.finish_reason) {
              // Send finished message
              const message: StreamingMessage = {
                content: "",
                role: "assistant",
                finished: true
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
            }
          } catch (e) {
            console.error("Error parsing streaming response:", e);
          }
        }
      }
    },
    flush(controller) {
      // Process any remaining buffer
      if (buffer) {
        try {
          if (buffer.includes("data: ")) {
            const data = buffer.slice(buffer.indexOf("data: ") + 6);
            if (data && data !== "[DONE]") {
              const parsed = JSON.parse(data);
              const choice = parsed.choices?.[0];
              
              if (choice?.delta?.content) {
                const message: StreamingMessage = {
                  content: choice.delta.content,
                  role: "assistant",
                  finished: false
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
              }
            }
          }
        } catch (e) {
          console.error("Error processing buffer in flush:", e);
        }
      }
      
      // Final finished message
      const finalMessage: StreamingMessage = {
        content: "",
        role: "assistant",
        finished: true
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalMessage)}\n\n`));
    }
  });
  
  // Return transformed stream
  return responseBody.pipeThrough(transformStream);
}
