
/**
 * Handler for streaming responses
 */

import { 
  corsHeaders
} from "../../shared/responseUtils.ts";
import { 
  generateStreamingResponse 
} from "../services/openai/streamingService.ts";
import { AIModel } from "../services/openai/types.ts";

/**
 * Handle a streaming request to OpenAI
 * 
 * @param prompt The user prompt
 * @param systemPrompt The system instructions
 * @param model The AI model to use
 * @returns Streaming response
 */
export async function handleStreamingRequest(
  prompt: string,
  systemPrompt: string,
  model: AIModel = "gpt-4o-mini"
): Promise<Response> {
  try {
    // Generate streaming response
    const streamingResponse = await generateStreamingResponse(
      prompt,
      systemPrompt,
      { model }
    );
    
    // Return stream with appropriate CORS headers
    return new Response(streamingResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    console.error("Error generating streaming response:", error);
    
    // Return error as a stream event
    const errorEvent = `data: ${JSON.stringify({
      error: error.message || "Error generating streaming response",
      completed: true
    })}\n\n`;
    
    return new Response(errorEvent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  }
}
