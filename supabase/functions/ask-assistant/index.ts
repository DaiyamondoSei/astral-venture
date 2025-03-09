
// Import Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Import shared utilities
import { 
  corsHeaders,
  handleCorsRequest
} from "../shared/responseUtils.ts";

import { withAuth } from "../shared/authUtils.ts";
import { handleAIRequest, handleClearCache } from "./handlers/requestHandler.ts";

// Entry point for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }
  
  // Add route for clearing cache (admin only)
  if (req.url.includes("/clear-cache")) {
    return withAuth(req, handleClearCache);
  }

  // Process the request with authentication
  return withAuth(req, handleAIRequest);
});
