
interface EmotionalFactors {
  emotionalDepth: number;  // 0-1 scale
  selfAwareness: number;   // 0-1 scale
  chakraResonance: number; // 0-1 scale
  emotionalThemes: string[];
}

export const calculateEnergyPoints = (text: string): { points: number; emotionalAnalysis: EmotionalFactors } => {
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
  
  return { 
    points: Math.min(points, 40), // Cap at 40 points max (increased from 30)
    emotionalAnalysis: emotionalFactors
  };
};

// Enhanced analysis of emotional factors (would be better with real NLP/AI)
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
  
  // Analyze for emotional themes
  const emotionalThemeAnalysis = {
    love: 0,
    joy: 0,
    peace: 0,
    power: 0,
    wisdom: 0,
    creativity: 0,
    healing: 0,
    gratitude: 0,
    spiritual: 0
  };
  
  const themeKeywords = {
    love: ['love', 'compassion', 'heart', 'connection', 'kindness', 'care'],
    joy: ['joy', 'happiness', 'delight', 'pleasure', 'exciting', 'glad'],
    peace: ['peace', 'calm', 'tranquil', 'serene', 'still', 'quiet', 'harmony'],
    power: ['power', 'strength', 'confidence', 'ability', 'capable', 'strong'],
    wisdom: ['wisdom', 'insight', 'understand', 'clarity', 'perspective', 'see'],
    creativity: ['create', 'express', 'flow', 'imagine', 'inspire', 'idea'],
    healing: ['heal', 'release', 'recover', 'better', 'transform', 'overcome'],
    gratitude: ['grateful', 'thankful', 'appreciate', 'blessing', 'gift'],
    spiritual: ['spirit', 'soul', 'divine', 'universe', 'cosmic', 'transcend']
  };
  
  // Count theme keywords
  Object.entries(themeKeywords).forEach(([theme, words]) => {
    words.forEach(word => {
      if (textLower.includes(word)) {
        emotionalThemeAnalysis[theme]++;
      }
    });
  });
  
  // Get top themes
  const topThemes = Object.entries(emotionalThemeAnalysis)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0)
    .slice(0, 3)
    .map(([theme]) => theme);
  
  return {
    emotionalDepth: Math.min(emotionalDepthScore, 1), // Cap at 1.0
    selfAwareness: Math.min(selfAwarenessScore, 1),   // Cap at 1.0
    chakraResonance: Math.min(chakraResonanceScore, 1), // Cap at 1.0
    emotionalThemes: topThemes
  };
};

// Utility to determine which chakras activate based on emotional themes
export const getActivatedChakrasFromThemes = (themes: string[]): number[] => {
  const chakraMap = {
    love: 2,       // Heart chakra
    joy: 3,        // Solar plexus
    peace: 1,      // Throat chakra
    power: 3,      // Solar plexus
    wisdom: 0,     // Third eye
    creativity: 4, // Sacral chakra  
    healing: 2,    // Heart chakra
    gratitude: 2,  // Heart chakra
    spiritual: 0   // Crown chakra
  };
  
  const activatedChakras: number[] = [];
  
  themes.forEach(theme => {
    const chakraIndex = chakraMap[theme];
    if (chakraIndex !== undefined && !activatedChakras.includes(chakraIndex)) {
      activatedChakras.push(chakraIndex);
    }
  });
  
  return activatedChakras;
};
