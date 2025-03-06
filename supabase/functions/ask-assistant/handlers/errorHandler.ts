
import { createErrorResponse, ErrorCode } from "../../shared/responseUtils.ts";

export function handleError(error: Error): Response {
  console.error("Error in ask-assistant function:", error);
  
  // Determine if it's a quota error
  const isQuotaError = error.message && error.message.includes("quota");
  
  return createErrorResponse(
    isQuotaError ? ErrorCode.QUOTA_EXCEEDED : ErrorCode.INTERNAL_ERROR,
    isQuotaError ? "AI service quota exceeded" : "Failed to process request",
    { errorMessage: error.message }
  );
}
