
import { fetchUserContext } from './userContext.ts';
import { generateResponse } from './responseGenerator.ts';

// Main request handler function
export async function handleRequest(req: Request, corsHeaders: HeadersInit) {
  const { question, context, reflectionIds, userId } = await req.json();
  
  // Basic validation
  if (!question || typeof question !== "string") {
    return new Response(
      JSON.stringify({ error: "Invalid or missing question" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Fetch user data for context
  const userContext = userId ? await fetchUserContext(userId) : "";
  
  // Generate a response
  const response = generateResponse(question, context, userContext);
  
  return new Response(
    JSON.stringify(response),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Error handler function
export function handleError(error: Error, corsHeaders: HeadersInit) {
  console.error("Error in ask-assistant function:", error);
  
  return new Response(
    JSON.stringify({ 
      error: error.message,
      answer: "I'm sorry, I couldn't process your question at this time. Please try again later.",
      relatedInsights: [],
      suggestedPractices: ["Try refreshing the page", "Try again in a few moments"]
    }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
