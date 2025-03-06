
import { createErrorResponse, ErrorCode } from "../../shared/responseUtils.ts";
import { generateStreamingResponse, AIModel } from "../services/openai/index.ts";

// Handle streaming responses with improved implementation
export async function handleStreamingRequest(
  prompt: string, 
  systemPrompt: string, 
  model: AIModel
): Promise<Response> {
  try {
    // Use OpenAI's streaming API integration
    const { response, metrics } = await generateStreamingResponse(
      prompt, 
      systemPrompt,
      { model }
    );
    
    return response;
  } catch (error) {
    console.error("Error in streaming request:", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to process streaming request",
      { errorMessage: error.message }
    );
  }
}
