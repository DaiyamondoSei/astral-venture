
import { corsHeaders } from "../../shared/responseUtils.ts";

/**
 * Generate insights from user reflections using OpenAI
 */
export async function generateInsightsWithOpenAI(
  reflectionTexts: any[],
  openAIApiKey: string
): Promise<any[]> {
  try {
    // Create a system prompt for the OpenAI model
    const systemPrompt = 
      "You are an expert spiritual guide specializing in analyzing reflections and meditations. " +
      "Analyze the provided reflection entries to identify patterns, growth opportunities, " +
      "and spiritual insights. Focus on emotional patterns, chakra activations, " +
      "and potential spiritual practices that could benefit the user.";
    
    // Create a prompt with the reflection data
    const userPrompt = `
      Please analyze the following reflection entries and generate 5-7 key insights:
      
      ${reflectionTexts.map((r, i) => `
      Entry ${i+1} (${new Date(r.date).toLocaleDateString()}):
      Content: "${r.content}"
      Dominant emotion: ${r.dominant_emotion}
      Emotional depth: ${r.emotional_depth}
      Chakras activated: ${Array.isArray(r.chakras_activated) ? r.chakras_activated.join(", ") : r.chakras_activated}
      `).join("\n")}
      
      Provide insights in the following JSON format:
      [
        {
          "insight": "The specific insight observation",
          "category": "emotional_pattern | chakra_activation | spiritual_growth | practice_recommendation",
          "confidence": A number between 0 and 1 representing confidence,
          "recommendation": "A specific practice or action recommendation based on this insight"
        },
        ...
      ]
      
      Only return valid JSON without any additional text.
    `;
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    const responseData = await response.json();
    const content = responseData.choices[0].message.content;
    
    // Parse the JSON response
    try {
      // Find the JSON part of the response (in case there's additional text)
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      const insights = JSON.parse(jsonString);
      
      // Validate and format insights
      return insights.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        insight: insight.insight,
        category: insight.category,
        confidence: insight.confidence || 0.8,
        recommendation: insight.recommendation,
        created_at: new Date().toISOString()
      }));
    } catch (err) {
      console.error("Error parsing OpenAI response:", err);
      console.log("Raw response:", content);
      
      // Fallback insights if parsing fails
      return [{
        id: `insight-${Date.now()}-fallback`,
        insight: "Based on your reflections, consider taking time for more mindfulness practices",
        category: "practice_recommendation",
        confidence: 0.7,
        recommendation: "Try a 5-minute daily meditation focused on breath awareness",
        created_at: new Date().toISOString()
      }];
    }
  } catch (error) {
    console.error("Error generating insights with OpenAI:", error);
    throw error;
  }
}
