
// This file is now a wrapper that re-exports from the refactored structure
// to maintain backward compatibility with existing imports

import {
  selectOptimalModel,
  moderateContent,
  generateChatResponse,
  generateStreamingResponse,
  type AIModel,
  type ContentModerationType,
  type ChatMetrics,
  type ChatOptions
} from "./services/openai/index.ts";

// Re-export all the components
export {
  selectOptimalModel,
  moderateContent,
  generateChatResponse,
  generateStreamingResponse,
  type AIModel,
  type ContentModerationType,
  type ChatMetrics,
  type ChatOptions
};
