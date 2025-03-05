
/**
 * Consciousness level analyzer for philosophical reflections
 */

interface ConsciousnessAnalysis {
  points: number;
  insights: string[];
}

export const calculateConsciousnessPoints = (text: string): ConsciousnessAnalysis => {
  // Base points for any reflection
  let points = 5;
  
  // Additional points based on depth (word count as a basic metric)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  
  if (wordCount > 50) points += 5;
  if (wordCount > 100) points += 5;
  if (wordCount > 200) points += 5;
  
  // Consciousness exploration keywords - grouped by categories
  const keywords = {
    // Basic concepts
    awareness: ['awareness', 'conscious', 'consciousness', 'presence', 'mindful', 
                'observe', 'observer', 'witnessing', 'attention'],
    
    // Quantum concepts  
    quantum: ['quantum', 'wave', 'particle', 'field', 'entanglement', 'nonlocal', 
              'superposition', 'probability', 'observer effect', 'measurement'],
    
    // Philosophical concepts
    philosophy: ['reality', 'being', 'existence', 'ontology', 'epistemology', 
                 'perception', 'phenomena', 'noumena', 'essence', 'form'],
    
    // Spiritual concepts
    spiritual: ['spirit', 'soul', 'divine', 'sacred', 'transcend', 'enlighten', 
                'awakening', 'higher self', 'source', 'universal'],
                
    // Integration concepts
    integration: ['integrate', 'wholeness', 'unity', 'oneness', 'interconnect', 
                  'holistic', 'synthesis', 'mergence', 'harmony'],
                  
    // Advanced concepts
    advanced: ['non-duality', 'emptiness', 'void', 'akasha', 'implicate order', 
               'morphic field', 'noosphere', 'omega point', 'singularity', 'holographic']
  };
  
  // Points for different categories
  const categoryPoints = {
    awareness: 1,   // Basic concepts
    quantum: 1.5,   // Quantum concepts
    philosophy: 1.5, // Philosophical concepts
    spiritual: 1.5,  // Spiritual concepts
    integration: 2,  // Integration concepts
    advanced: 3      // Advanced concepts
  };
  
  // Track keyword matches by category
  const categoryMatches: Record<string, number> = {
    awareness: 0,
    quantum: 0,
    philosophy: 0,
    spiritual: 0,
    integration: 0,
    advanced: 0
  };
  
  // Convert text to lowercase for case-insensitive matching
  const textLower = text.toLowerCase();
  
  // Count matches in each category
  Object.entries(keywords).forEach(([category, wordList]) => {
    wordList.forEach(keyword => {
      if (textLower.includes(keyword.toLowerCase())) {
        categoryMatches[category]++;
      }
    });
  });
  
  // Add points based on keyword categories (with caps per category)
  Object.entries(categoryMatches).forEach(([category, count]) => {
    const maxForCategory = category === 'advanced' ? 15 : 10;
    points += Math.min(count * categoryPoints[category], maxForCategory);
  });
  
  // Analyze for depth of reflection
  const reflectionDepthMarkers = [
    'because', 'therefore', 'however', 'although',
    'consider', 'reflect', 'understand', 'realize',
    'connection between', 'relationship', 'perspective',
    'question', 'wonder', 'contemplate', 'ponder'
  ];
  
  let depthScore = 0;
  reflectionDepthMarkers.forEach(marker => {
    if (textLower.includes(marker)) {
      depthScore += 1;
    }
  });
  
  // Add depth bonus (max 10 points)
  points += Math.min(depthScore, 10);
  
  // Generate insights based on the content
  const insights: string[] = [];
  
  // Add insights based on categories with significant matches
  if (categoryMatches.quantum >= 2) {
    insights.push("You show interest in quantum perspectives of consciousness");
  }
  
  if (categoryMatches.spiritual >= 2) {
    insights.push("Your reflection reveals a connection to spiritual dimensions of awareness");
  }
  
  if (categoryMatches.philosophy >= 2) {
    insights.push("You engage deeply with philosophical aspects of existence");
  }
  
  if (categoryMatches.integration >= 2) {
    insights.push("You demonstrate an integrative understanding of consciousness");
  }
  
  if (categoryMatches.advanced >= 1) {
    insights.push("Your exploration touches on advanced consciousness concepts");
  }
  
  if (depthScore >= 4) {
    insights.push("Your reflection shows significant depth of contemplation");
  }
  
  // If no insights were generated, add a default one
  if (insights.length === 0) {
    insights.push("Continue exploring consciousness through regular reflection");
  }
  
  return { 
    points: Math.min(points, 50), // Cap at 50 points max
    insights
  };
};
