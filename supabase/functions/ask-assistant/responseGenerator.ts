
// Functions for generating responses to user questions
export function generateBasicResponse(question: string, context?: string, userContext?: string) {
  // Normalize the question
  const lowerQuestion = question.toLowerCase();
  let answer = "";
  let suggestedPractices = [];
  
  // Check for various question types and provide appropriate responses
  if (lowerQuestion.includes("tingling") || lowerQuestion.includes("sensation")) {
    answer = "Tingling sensations during meditation or energy practices are common signs of energy movement in your body. These sensations often indicate that blocked energy is beginning to flow more freely. If you feel tingling in specific areas, it may reflect activation of nearby chakras or meridian points.";
    suggestedPractices = [
      "Try a body scan meditation to increase awareness of these sensations",
      "Journal about where you feel the sensations and what triggers them",
      "Practice grounding exercises if the sensations become too intense"
    ];
  } 
  else if (lowerQuestion.includes("throat chakra") || lowerQuestion.includes("communication")) {
    answer = "The throat chakra governs expression, communication, and speaking your truth. When this chakra is blocked, you might experience difficulty expressing yourself, fear of speaking up, or physical issues in the throat area. Balance in this chakra brings clear, authentic communication.";
    suggestedPractices = [
      "Practice humming or chanting to stimulate the throat area",
      "Express yourself through journaling or creative writing",
      "Visualization meditation focusing on blue light at the throat",
      "Try neck stretches and shoulder rolls to release physical tension"
    ];
  }
  else if (lowerQuestion.includes("heart chakra") || lowerQuestion.includes("love")) {
    answer = "The heart chakra is the center of love, compassion, and connection. Blockages here can manifest as difficulty giving or receiving love, holding grudges, or feeling disconnected from others. A balanced heart chakra allows for open, unconditional love and deep connection with yourself and others.";
    suggestedPractices = [
      "Practice loving-kindness meditation",
      "Try heart-opening yoga poses like backbends",
      "Work with rose quartz or green crystals",
      "Practice forgiveness exercises to release old wounds"
    ];
  }
  else if (lowerQuestion.includes("dream") || lowerQuestion.includes("dreams")) {
    answer = "Dreams can be powerful indicators of your subconscious energy processing. Vivid or recurring dreams often reflect important themes your higher self is working through. Pay attention to symbols, emotions, and recurring patterns as they may provide insights into your energy state and spiritual development.";
    suggestedPractices = [
      "Keep a dream journal by your bed to record dreams immediately upon waking",
      "Practice reality checks throughout the day to increase dream awareness",
      "Set intentions before sleep to remember your dreams",
      "Meditate on recurring dream symbols to understand their meaning"
    ];
  }
  else if (lowerQuestion.includes("synchronicity") || lowerQuestion.includes("coincidence")) {
    answer = "Synchronicities are meaningful coincidences that often indicate you're aligned with your higher purpose or receiving guidance. These experiences suggest you're becoming more attuned to the interconnected nature of reality. When you notice synchronicities increasing, it typically means you're becoming more energetically sensitive and your consciousness is expanding.";
    suggestedPractices = [
      "Keep a synchronicity journal to record meaningful coincidences",
      "Practice present moment awareness to notice subtle patterns",
      "Set intentions to receive guidance through synchronistic events",
      "Meditate on the meaning behind significant synchronicities"
    ];
  }
  else {
    // Default response for other questions
    answer = "That's an interesting question about your energy practice. As you continue your journey, pay attention to your intuition and how your body responds to different practices. Regular reflection, meditation, and mindfulness will help you develop greater awareness and understanding of your unique energy patterns.";
    suggestedPractices = [
      "Practice daily mindfulness meditation",
      "Journal regularly about your experiences",
      "Explore different energy practices to see what resonates with you",
      "Connect with nature to harmonize your energy"
    ];
  }
  
  // Add context-specific insights if provided
  if (context) {
    answer += "\n\nBased on your reflection, I notice you're exploring themes that relate to your question. Continue to observe how these experiences unfold and document the patterns you notice.";
  }
  
  // Add user-specific insights if available
  if (userContext) {
    answer += "\n\nYour energy profile suggests you might benefit from practices that focus on " + 
      (userContext.includes("Heart") ? "heart-centered connection and compassion" : 
       userContext.includes("Third Eye") ? "intuition and inner vision" :
       userContext.includes("Crown") ? "spiritual connection and higher awareness" :
       userContext.includes("Throat") ? "authentic expression and communication" :
       userContext.includes("Solar Plexus") ? "personal power and confidence" :
       userContext.includes("Sacral") ? "creativity and emotional flow" :
       userContext.includes("Root") ? "grounding and stability" :
       "balanced energy across all chakras") + ".";
  }
  
  return {
    answer,
    relatedInsights: [
      {
        id: crypto.randomUUID(),
        content: "Regular practice strengthens your energy awareness",
        category: "practice",
        confidence: 0.9,
        created_at: new Date().toISOString()
      }
    ],
    suggestedPractices
  };
}

// Simplified function that wraps the response generation
export function generateResponse(question: string, context?: string, userContext?: string) {
  return generateBasicResponse(question, context, userContext);
}
