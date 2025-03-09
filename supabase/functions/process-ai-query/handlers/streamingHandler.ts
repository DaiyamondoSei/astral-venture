
import { selectOptimalModel } from "../services/openai/index.ts";

// Helper for streaming API responses
const encoder = new TextEncoder();

/**
 * Handle streaming requests from OpenAI
 */
export async function handleStreamingRequest(
  prompt: string,
  systemPrompt: string,
  model = "gpt-4o-mini"
): Promise<Response> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key is required" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Create a ReadableStream to stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
              "Accept": "text/event-stream"
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7,
              stream: true
            })
          });

          if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            controller.error(new Error(`API error: ${JSON.stringify(errorData)}`));
            return;
          }

          if (!apiResponse.body) {
            controller.error(new Error("No response body from OpenAI"));
            return;
          }

          const reader = apiResponse.body.getReader();
          let fullContent = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Process the chunk
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ") && !line.includes("[DONE]")) {
                  try {
                    const data = JSON.parse(line.substring(6));
                    const content = data.choices[0]?.delta?.content || "";
                    if (content) {
                      fullContent += content;
                      controller.enqueue(encoder.encode(content));
                    }
                  } catch (e) {
                    console.error("Error parsing streaming data:", e);
                  }
                }
              }
            }
          } catch (readError) {
            console.error("Error reading from stream:", readError);
            controller.error(readError);
          } finally {
            controller.close();
          }
        } catch (error) {
          console.error("Streaming request error:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    console.error("Error in handleStreamingRequest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
