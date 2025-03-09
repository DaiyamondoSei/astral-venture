
/**
 * Call the OpenAI API
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
  
  // Make request to OpenAI
  return fetch("https://api.openai.com/v1/chat/completions", {
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
}
