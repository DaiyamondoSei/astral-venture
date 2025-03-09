
// Import Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Import shared utilities
import { 
  corsHeaders,
  handleCorsRequest
} from "../shared/responseUtils.ts";

import { withAuth } from "../shared/authUtils.ts";
import { processAIQuery } from "./handlers/requestHandler.ts";
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
 * Handle cache clearing request with additional security
 */
async function handleClearCacheRequest(req: Request): Promise<Response> {
  // Check the authorization header contains the admin key
  const authHeader = req.headers.get("authorization") || "";
  const isAdmin = authHeader.includes(Deno.env.get("ADMIN_KEY") || "");
  
  if (!isAdmin) {
    return new Response(
      JSON.stringify({ error: "Unauthorized. Admin privileges required" }),
      { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
  
  // Clear the cache
  const entriesCleared = await clearResponseCache();
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Cache cleared: ${entriesCleared} entries removed`,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
