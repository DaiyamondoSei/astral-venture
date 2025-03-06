
import { AIResponse } from './types';

/**
 * Fallback responses for when AI service is unavailable
 */
export const FALLBACK_RESPONSES = [
  {
    question_type: "meditation",
    answer: "Meditation is a powerful practice for cultivating inner peace and awareness. Start with just 5 minutes of focusing on your breath, allowing thoughts to pass without judgment. Consistency is more important than duration.",
    practices: [
      "Focus on your breath for 5 minutes each morning",
      "Practice body scanning meditation before sleep",
      "Try a guided meditation app for structured practice"
    ]
  },
  {
    question_type: "chakra",
    answer: "Chakras are energy centers that influence our physical, emotional, and spiritual wellbeing. When balanced, they allow energy to flow freely throughout your body, promoting harmony and vitality.",
    practices: [
      "Visualize each chakra glowing with its corresponding color",
      "Use sound healing with chakra-specific frequencies",
      "Practice yoga poses that target specific chakras"
    ]
  },
  {
    question_type: "energy",
    answer: "Your energy field is constantly interacting with your environment and others around you. Maintaining healthy boundaries and regular energy clearing practices can help you stay centered and vibrant.",
    practices: [
      "Visualize a protective light surrounding your body",
      "Practice grounding by connecting with nature",
      "Use salt baths to clear your energy field"
    ]
  },
  {
    question_type: "consciousness",
    answer: "Consciousness is the awareness of your existence and the world around you. Expanding your consciousness involves becoming more aware of your thoughts, emotions, and the interconnectedness of all things.",
    practices: [
      "Practice mindful awareness throughout your daily activities",
      "Explore different states of consciousness through meditation",
      "Keep a consciousness journal to track your insights"
    ]
  },
  {
    question_type: "intuition",
    answer: "Intuition is your inner guidance system, a form of knowing that transcends logical reasoning. Developing your intuition helps you make decisions aligned with your higher self and true purpose.",
    practices: [
      "Take a few minutes each day to sit quietly and listen to your inner voice",
      "Practice intuitive decision-making on small daily choices",
      "Notice and record intuitive insights that prove accurate"
    ]
  }
];

/**
 * Find the best fallback response based on the question content
 * @param question User's question
 * @returns Best matching fallback response
 */
export function findFallbackResponse(question: string): {answer: string; practices: string[]} {
  // Keywords to match against question types
  const keywordMap = {
    meditation: ["meditate", "meditation", "breathe", "breathing", "mindful", "focus", "calm"],
    chakra: ["chakra", "energy center", "root", "sacral", "solar plexus", "heart", "throat", "third eye", "crown"],
    energy: ["energy", "vibration", "frequency", "aura", "field", "spiritual", "practice"],
    consciousness: ["conscious", "awareness", "awaken", "perception", "mindful", "presence"],
    intuition: ["intuition", "gut feeling", "inner voice", "insight", "knowing", "guidance"]
  };
  
  // Score each response type based on keyword matches
  const scores = FALLBACK_RESPONSES.map(response => {
    const type = response.question_type as keyof typeof keywordMap;
    const keywords = keywordMap[type] || [];
    
    // Count how many keywords match
    const score = keywords.reduce((count, keyword) => {
      return count + (question.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    
    return { response, score };
  });
  
  // Find best matching response
  const bestMatch = scores.sort((a, b) => b.score - a.score)[0];
  
  // If nothing matches well, use the first fallback
  if (bestMatch.score === 0) {
    return { 
      answer: FALLBACK_RESPONSES[0].answer, 
      practices: FALLBACK_RESPONSES[0].practices 
    };
  }
  
  return { 
    answer: bestMatch.response.answer, 
    practices: bestMatch.response.practices 
  };
}

/**
 * Create a fallback response when the AI service fails
 * 
 * @param question Original user question
 * @returns Fallback AI response
 */
export function createFallbackResponse(question: string): AIResponse {
  const fallback = findFallbackResponse(question);
  
  return {
    answer: `I'm sorry, I couldn't process your question at this time. ${fallback.answer}`,
    relatedInsights: [],
    suggestedPractices: fallback.practices,
    meta: {
      model: "fallback",
      tokenUsage: 0,
      processingTime: 0
    }
  };
}
