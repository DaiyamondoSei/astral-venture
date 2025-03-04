
interface EmotionalFactors {
  emotionalDepth: number;  // 0-1 scale
  selfAwareness: number;   // 0-1 scale
  chakraResonance: number; // 0-1 scale
}

export const calculateEnergyPoints = (text: string): number => {
  // Base points for any reflection
  let points = 5;
  
  // Additional points based on depth (word count as a basic metric)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  
  if (wordCount > 50) points += 5;
  if (wordCount > 100) points += 5;
  if (wordCount > 200) points += 5;
  
  // Additional points for energy-related keywords
  const keywords = [
    'meditation', 'energy', 'chakra', 'breath', 'awareness', 
    'consciousness', 'presence', 'mindfulness', 'intuition', 'vibration'
  ];
  
  // Emotional intelligence keywords
  const emotionalKeywords = [
    'feel', 'emotion', 'heart', 'compassion', 'understand',
    'empathy', 'connect', 'sense', 'intuition', 'relationship',
    'self-awareness', 'balance'
  ];
  
  let keywordMatches = 0;
  keywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  });
  
  let emotionalKeywordMatches = 0;
  emotionalKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      emotionalKeywordMatches++;
    }
  });
  
  // Add points based on keyword usage (capped)
  points += Math.min(keywordMatches * 2, 10);
  
  // Add points for emotional intelligence (capped)
  points += Math.min(emotionalKeywordMatches * 2, 10);
  
  // Analyze emotional factors (simplified version)
  const emotionalFactors = analyzeEmotionalFactors(text);
  
  // Add bonus points for emotional intelligence factors
  const emotionalBonus = Math.round(
    (emotionalFactors.emotionalDepth + 
     emotionalFactors.selfAwareness + 
     emotionalFactors.chakraResonance) * 10
  );
  
  points += emotionalBonus;
  
  return Math.min(points, 40); // Cap at 40 points max (increased from 30)
};

// Simple analysis of emotional factors (would be better with real NLP/AI)
const analyzeEmotionalFactors = (text: string): EmotionalFactors => {
  const textLower = text.toLowerCase();
  
  // Emotional depth - check for emotional language and introspection
  const emotionalPhrases = [
    'i feel', 'felt', 'emotion', 'heart', 'deeply', 'profound',
    'moved', 'touching', 'powerful', 'experience'
  ];
  
  let emotionalDepthScore = 0;
  emotionalPhrases.forEach(phrase => {
    if (textLower.includes(phrase)) {
      emotionalDepthScore += 0.1; // 0.1 points per emotional phrase
    }
  });
  
  // Self-awareness - check for reflective language
  const selfAwarenessPhrases = [
    'i realized', 'i understood', 'became aware', 'noticed that i',
    'recognized', 'discovered about myself', 'pattern', 'tendency',
    'self-reflection', 'learned about myself'
  ];
  
  let selfAwarenessScore = 0;
  selfAwarenessPhrases.forEach(phrase => {
    if (textLower.includes(phrase)) {
      selfAwarenessScore += 0.1; // 0.1 points per self-awareness phrase
    }
  });
  
  // Chakra resonance - check for references to different energy centers
  const chakraPhrases = [
    'root', 'grounded', 'sacral', 'creativity', 'solar plexus',
    'power', 'heart', 'love', 'throat', 'expression', 'third eye',
    'intuition', 'crown', 'connection', 'divine'
  ];
  
  let chakraResonanceScore = 0;
  chakraPhrases.forEach(phrase => {
    if (textLower.includes(phrase)) {
      chakraResonanceScore += 0.1; // 0.1 points per chakra reference
    }
  });
  
  return {
    emotionalDepth: Math.min(emotionalDepthScore, 1), // Cap at 1.0
    selfAwareness: Math.min(selfAwarenessScore, 1),   // Cap at 1.0
    chakraResonance: Math.min(chakraResonanceScore, 1) // Cap at 1.0
  };
};
