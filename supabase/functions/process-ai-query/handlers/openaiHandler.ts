
/**
 * Call the OpenAI API with improved error handling and logging
 */
export async function callOpenAI(query: string, context: string, options: {
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
  apiKey: string;
}): Promise<Response> {
  // Prepare messages for the AI request
  const messages = [
    {
      role: "system",
      content: "You are a consciousness expansion assistant. Provide insightful, helpful responses that expand awareness. Be concise yet profound."
    }
  ];
  
  // Add context if available
  if (context) {
    messages.push({
      role: "system",
      content: `Additional context: ${context}`
    });
  }
  
  // Add the user query
  messages.push({
    role: "user",
    content: query
  });
  
  // Log the request model and settings (not the content for privacy)
  console.log(`OpenAI request: model=${options.model}, temperature=${options.temperature}, stream=${options.stream}`);
  
  try {
    // Make request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: options.stream
      })
    });
    
    // Log response status
    console.log(`OpenAI response status: ${response.status}`);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }
    
    return response;
  } catch (error) {
    // Log and rethrow any errors
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}
