
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "../shared/responseUtils.ts";
import { withAuth } from "../shared/authUtils.ts";
import { processAIQuery } from "./handlers/requestHandler.ts";

// Edge function entry point
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }
  
  // Process with authentication
  return withAuth(req, processAIQuery);
});
