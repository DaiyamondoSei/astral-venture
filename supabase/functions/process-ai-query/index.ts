
// Import Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Import shared utilities
import { 
  corsHeaders,
  handleCorsRequest
} from "../shared/responseUtils.ts";

import { withAuth } from "../shared/authUtils.ts";
import { processAIQuery } from "./services/aiProcessor.ts";
import { clearResponseCache } from "./services/cacheHandler.ts";

// Entry point for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  // Route for clearing cache (admin only)
  if (req.url.includes("/clear-cache")) {
    return handleClearCacheRequest(req);
  }
  
  // Process the request with authentication
  return withAuth(req, processAIQuery);
});

/**
 * Handle cache clearing request
 */
async function handleClearCacheRequest(req: Request): Promise<Response> {
  // This would normally have additional auth checks
  const entriesCleared = await clearResponseCache();
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Cache cleared: ${entriesCleared} entries removed` 
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
