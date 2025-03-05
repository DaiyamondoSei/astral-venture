
import { fetchUserContext } from './userContext.ts';
import { generateResponse } from './responseGenerator.ts';

// Main request handler function
export async function handleRequest(req: Request, corsHeaders: HeadersInit) {
  try {
    const { question, context, reflectionIds, userId } = await req.json();
    
    // Basic validation
    if (!question || typeof question !== "string") {
      return new Response(
        JSON.stringify({ 
          error: "Invalid or missing question",
          answer: "I couldn't understand your question. Please try again with a clearer question.",
          suggestedPractices: ["Try asking a simple question about energy practices", "Ask about a specific chakra or meditation technique"]
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch user data for context
    const userContext = userId ? await fetchUserContext(userId) : "";
    
    // Generate a response
    try {
      console.log(`Generating response for question: ${question.substring(0, 30)}...`);
      
      // Set a timeout for the response generation
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      let response;
      try {
        response = await Promise.race([
          generateResponse(question, context, userContext),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Response generation timed out')), 20000);
          })
        ]);
        clearTimeout(timeout);
      } catch (timeoutError) {
        console.error("Response generation timed out:", timeoutError);
        return new Response(
          JSON.stringify({ 
            error: "Response generation timed out",
            answer: "I'm sorry, it's taking me longer than expected to process your question. Please try again with a simpler question.",
            suggestedPractices: ["Try asking a more focused question", "Break your question into smaller parts", "Try again in a moment"]
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Validate response format to ensure consistent structure
      if (!response || typeof response.answer !== 'string') {
        throw new Error('Invalid response format generated');
      }
      
      // Ensure suggestedPractices is always an array
      if (!response.suggestedPractices || !Array.isArray(response.suggestedPractices)) {
        response.suggestedPractices = [];
      }
      
      console.log(`Successfully generated response, length: ${response.answer.length}`);
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error generating response:", error);
      return handleError(error, corsHeaders);
    }
  } catch (parseError) {
    console.error("Error parsing request:", parseError);
    return handleError(new Error("Invalid request format"), corsHeaders);
  }
}

// Error handler function
export function handleError(error: Error, corsHeaders: HeadersInit) {
  console.error("Error in ask-assistant function:", error);
  
  return new Response(
    JSON.stringify({ 
      error: error.message,
      answer: "I'm sorry, I couldn't process your question at this time. Please try again later.",
      relatedInsights: [],
      suggestedPractices: ["Try refreshing the page", "Try again in a few moments", "Ask a different question"]
    }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
