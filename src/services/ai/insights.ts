
import { AIInsight } from './types';
import { generateRandomId } from '@/utils/idGenerator';

/**
 * Generate random insights for demo purposes
 */
export const generateInsights = (count: number = 3): AIInsight[] => {
  const insights: AIInsight[] = [];
  
  // Generate chakra insights
  insights.push({
    id: generateRandomId(),
    type: 'chakra',
    text: 'Your root chakra appears to be imbalanced based on your recent reflections. Consider grounding exercises.',
    confidence: 0.85,
    relevance: 0.9,
    title: 'Root Chakra Imbalance'
  });
  
  // Generate emotional insights
  insights.push({
    id: generateRandomId(),
    type: 'emotion',
    text: 'Your reflections show a pattern of anxiety when discussing future plans.',
    confidence: 0.78,
    relevance: 0.82,
    title: 'Anxiety Pattern Detected'
  });
  
  // Generate practice recommendations
  insights.push({
    id: generateRandomId(),
    type: 'practice',
    text: 'Based on your energy patterns, a daily 10-minute meditation focused on the heart chakra would be beneficial.',
    confidence: 0.92,
    relevance: 0.88,
    title: 'Heart Chakra Meditation'
  });
  
  // Generate wisdom insights
  insights.push({
    id: generateRandomId(),
    type: 'wisdom',
    text: 'Your reflections indicate a growing awareness of the interconnectedness of all things.',
    confidence: 0.75,
    relevance: 0.7,
    title: 'Expanding Consciousness'
  });
  
  // Return the specified number of insights
  return insights.slice(0, count);
};

/**
 * Generate insights specifically about chakras
 */
export const generateChakraInsights = (count: number = 2): AIInsight[] => {
  const chakraInsights: AIInsight[] = [
    {
      id: generateRandomId(),
      type: 'chakra',
      text: 'Your crown chakra shows signs of opening, indicating spiritual growth.',
      confidence: 0.82,
      relevance: 0.85,
      title: 'Crown Chakra Opening'
    },
    {
      id: generateRandomId(),
      type: 'chakra',
      text: 'Your solar plexus chakra appears blocked, which may be causing feelings of low self-esteem.',
      confidence: 0.88,
      relevance: 0.9,
      title: 'Solar Plexus Blockage'
    },
    {
      id: generateRandomId(),
      type: 'chakra',
      text: 'Your throat chakra is very active, reflecting your increasing ability to express yourself.',
      confidence: 0.76,
      relevance: 0.8,
      title: 'Throat Chakra Activation'
    }
  ];
  
  return chakraInsights.slice(0, count);
};

/**
 * Generate insights about emotional patterns
 */
export const generateEmotionalInsights = (count: number = 2): AIInsight[] => {
  const emotionalInsights: AIInsight[] = [
    {
      id: generateRandomId(),
      type: 'emotion',
      text: 'There's a pattern of sadness emerging when you discuss past relationships.',
      confidence: 0.79,
      relevance: 0.83,
      title: 'Relationship Sadness Pattern'
    },
    {
      id: generateRandomId(),
      type: 'emotion',
      text: 'Your reflections show increasing joy when discussing creative projects.',
      confidence: 0.91,
      relevance: 0.87,
      title: 'Creativity Joy Connection'
    }
  ];
  
  return emotionalInsights.slice(0, count);
};
