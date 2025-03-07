
import { AIResponse } from './types';

/**
 * Fallback responses for when AI service is unavailable
 */
export const FALLBACK_RESPONSES = [
  {
    question_type: "meditation",
    answer: "Meditation is a powerful practice for cultivating inner peace and awareness. Start with just 5 minutes of focusing on your breath, allowing thoughts to pass without judgment. Consistency is more important than duration. As you develop your practice, you may notice increased clarity, reduced stress, and a stronger connection to your spiritual essence.",
    practices: [
      "Focus on your breath for 5 minutes each morning",
      "Practice body scanning meditation before sleep",
      "Try a guided meditation app for structured practice"
    ]
  },
  {
    question_type: "chakra",
    answer: "Chakras are energy centers that influence our physical, emotional, and spiritual wellbeing. When balanced, they allow energy to flow freely throughout your body, promoting harmony and vitality. Each of the seven main chakras corresponds to different aspects of your being, from grounding and security (root chakra) to spiritual connection and higher consciousness (crown chakra).",
    practices: [
      "Visualize each chakra glowing with its corresponding color",
      "Use sound healing with chakra-specific frequencies",
      "Practice yoga poses that target specific chakras"
    ]
  },
  {
    question_type: "energy",
    answer: "Your energy field is constantly interacting with your environment and others around you. Maintaining healthy boundaries and regular energy clearing practices can help you stay centered and vibrant. Energy work involves becoming aware of subtle sensations in and around your body, and learning to direct or clear this energy intentionally. Regular practice can enhance your intuition and overall wellbeing.",
    practices: [
      "Visualize a protective light surrounding your body",
      "Practice grounding by connecting with nature",
      "Use salt baths to clear your energy field"
    ]
  },
  {
    question_type: "consciousness",
    answer: "Consciousness is the awareness of your existence and the world around you. Expanding your consciousness involves becoming more aware of your thoughts, emotions, and the interconnectedness of all things. This journey often includes recognizing patterns in your perception, questioning assumptions, and opening to new possibilities beyond your current understanding.",
    practices: [
      "Practice mindful awareness throughout your daily activities",
      "Explore different states of consciousness through meditation",
      "Keep a consciousness journal to track your insights"
    ]
  },
  {
    question_type: "intuition",
    answer: "Intuition is your inner guidance system, a form of knowing that transcends logical reasoning. Developing your intuition helps you make decisions aligned with your higher self and true purpose. Everyone has intuitive abilities, though they may manifest differently for each person. Some receive guidance through feelings, others through visual imagery, sounds, or simply a knowing without explanation.",
    practices: [
      "Take a few minutes each day to sit quietly and listen to your inner voice",
      "Practice intuitive decision-making on small daily choices",
      "Notice and record intuitive insights that prove accurate"
    ]
  },
  {
    question_type: "kundalini",
    answer: "Kundalini energy is often described as a dormant spiritual force located at the base of the spine. When awakened, it rises through the chakras, potentially leading to profound spiritual experiences and transformation. This process should be approached with respect and proper guidance, as intense kundalini awakenings can be challenging to integrate.",
    practices: [
      "Practice kundalini yoga under proper guidance",
      "Strengthen your energetic system with grounding practices",
      "Maintain a consistent meditation practice to process experiences"
    ]
  },
  {
    question_type: "astral",
    answer: "The astral body is a subtle energetic layer that exists beyond the physical body and is associated with emotions, desires, and astral projection experiences. Developing awareness of your astral body can enhance dream work, energy healing, and spiritual experiences beyond ordinary consciousness.",
    practices: [
      "Keep a dream journal to enhance astral awareness",
      "Practice visualization exercises to strengthen your astral perception",
      "Explore guided astral travel meditations"
    ]
  },
  {
    question_type: "practice",
    answer: "Consistent spiritual practice is key to personal growth and energy development. The most effective practice is one you can sustain regularly, rather than intense but infrequent sessions. Start with 5-10 minutes daily of any practice that resonates with you, whether meditation, energy work, or contemplation, and gradually build from there.",
    practices: [
      "Create a dedicated space for your spiritual practice",
      "Set a consistent time each day for practice",
      "Combine different modalities that resonate with you"
    ]
  }
];

/**
 * Find the best fallback response based on the question content
 * @param question User's question
 * @returns Best matching fallback response
 */
export function findFallbackResponse(question: string): {answer: string; practices: string[]} {
  // Normalize the question
  const normalizedQuestion = question.toLowerCase();
  
  // Keywords to match against question types
  const keywordMap = {
    meditation: ["meditate", "meditation", "breathe", "breathing", "mindful", "focus", "calm", "stillness", "quiet mind", "presence"],
    chakra: ["chakra", "energy center", "root", "sacral", "solar plexus", "heart", "throat", "third eye", "crown", "aura", "balance"],
    energy: ["energy", "vibration", "frequency", "aura", "field", "spiritual", "practice", "cleansing", "protection", "shielding"],
    consciousness: ["conscious", "awareness", "awaken", "perception", "mindful", "presence", "expansion", "higher self", "transcendence"],
    intuition: ["intuition", "gut feeling", "inner voice", "insight", "knowing", "guidance", "psychic", "sense", "feeling", "hunch"],
    kundalini: ["kundalini", "serpent energy", "spiritual energy", "awakening", "rising", "spine", "shakti", "energy rising", "kriyas"],
    astral: ["astral", "projection", "travel", "out of body", "dream", "lucid", "etheric", "realm", "dimension", "journey"],
    practice: ["practice", "routine", "habit", "daily", "consistent", "discipline", "ritual", "technique", "method", "approach"]
  };
  
  // Calculate match scores for each response type
  const scores = FALLBACK_RESPONSES.map(response => {
    const type = response.question_type as keyof typeof keywordMap;
    const keywords = keywordMap[type] || [];
    
    // Count matching keywords with weighted scoring
    let score = 0;
    for (const keyword of keywords) {
      if (normalizedQuestion.includes(keyword)) {
        // Give higher weight to longer keyword matches
        score += keyword.length > 5 ? 2 : 1;
      }
    }
    
    return { response, score };
  });
  
  // Find best matching response
  const bestMatch = scores.sort((a, b) => b.score - a.score)[0];
  
  // If nothing matches well, use a general response
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
 * @param isOffline Optional flag to indicate if the fallback is due to offline status
 * @returns Fallback AI response
 */
export function createFallbackResponse(question: string, isOffline?: boolean): AIResponse {
  const fallback = findFallbackResponse(question);
  
  // Create appropriate message based on whether we're offline or experiencing an error
  const prefixMessage = isOffline 
    ? "You're currently offline. " 
    : "I'm sorry, I couldn't process your question at this time. ";
  
  return {
    answer: `${prefixMessage}${fallback.answer}`,
    relatedInsights: [],
    suggestedPractices: fallback.practices,
    meta: {
      model: isOffline ? "offline" : "fallback",
      tokenUsage: 0,
      processingTime: 0
    }
  };
}
