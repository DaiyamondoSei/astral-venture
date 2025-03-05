
// Service for handling OpenAI API requests
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// OpenAI API related constants
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini"; // Using a cost-effective but powerful model

/**
 * Generates an AI response using OpenAI's API
 * 
 * @param question The user's question
 * @param context Optional reflection context from the user
 * @param userContext Optional user profile context data
 * @param apiKey OpenAI API key from environment variables
 * @returns Promise containing the AI response
 */
export async function generateOpenAIResponse(
  question: string, 
  context?: string, 
  userContext?: string,
  apiKey?: string
): Promise<any> {
  // Validate required parameters
  if (!question || !apiKey) {
    console.error("Missing required parameters for OpenAI call");
    throw new Error("Invalid parameters for AI response generation");
  }

  try {
    // Build the system prompt with available context
    let systemPrompt = `You are Quantum Guide, an AI assistant for a spiritual and energy practice app.
Your role is to provide thoughtful, insightful responses about energy practices, chakras, meditation,
and spiritual experiences. Be supportive, wise, and helpful.

Keep responses concise but meaningful, around 2-3 paragraphs.`;

    // Add user context if available
    if (userContext) {
      systemPrompt += `\n\nUser Context: ${userContext}`;
    }

    // Add reflection context if available
    if (context) {
      systemPrompt += `\n\nRecent Reflection: ${context}`;
    }

    // Prepare messages for the OpenAI API
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: question
      }
    ];

    // Make request to OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        temperature: 0.7, // Balanced between creativity and consistency
        max_tokens: 500   // Reasonable limit for concise responses
      })
    });

    // Parse API response
    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
    }

    // Extract the response content
    const aiResponse = data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response content from OpenAI");
    }

    // Generate some suggested practices based on the question topic
    const suggestedPractices = generateSuggestedPractices(question, aiResponse);

    return {
      answer: aiResponse,
      relatedInsights: [
        {
          id: crypto.randomUUID(),
          content: "Your energy journey is unique to you - trust your intuition",
          category: "insight",
          confidence: 0.95,
          created_at: new Date().toISOString()
        }
      ],
      suggestedPractices
    };
  } catch (error) {
    console.error("Error generating OpenAI response:", error);
    throw error;
  }
}

/**
 * Generate relevant suggested practices based on user question
 */
function generateSuggestedPractices(question: string, aiResponse: string): string[] {
  const lowerQuestion = question.toLowerCase();
  
  // Default practices that work for many scenarios
  const defaultPractices = [
    "Practice mindful breathing for 5 minutes daily",
    "Journal about your energy experiences",
    "Try a body scan meditation"
  ];
  
  // Topic-specific practice suggestions
  if (lowerQuestion.includes("chakra") || aiResponse.toLowerCase().includes("chakra")) {
    return [
      "Visualize the color associated with that chakra during meditation",
      "Practice yoga poses that activate the specific chakra",
      "Use sound healing with the corresponding chakra frequency",
      "Journal about blockages you feel in this energy center"
    ];
  } else if (lowerQuestion.includes("meditation") || lowerQuestion.includes("focus")) {
    return [
      "Try a guided meditation for beginners",
      "Practice breath counting to improve concentration",
      "Use a meditation timer to gradually increase session length",
      "Create a dedicated meditation space in your home"
    ];
  } else if (lowerQuestion.includes("dream") || lowerQuestion.includes("sleep")) {
    return [
      "Keep a dream journal by your bed",
      "Practice reality checks throughout the day",
      "Try a bedtime meditation focused on intention setting",
      "Reduce screen time 1 hour before sleep"
    ];
  }
  
  return defaultPractices;
}
