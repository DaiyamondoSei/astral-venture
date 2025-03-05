
import { format, subDays } from 'date-fns';
import { chakraNames, chakraColors } from './mappings';

/**
 * Generate chakra balance data for radar visualization
 */
export function generateChakraBalanceData(activeChakras: number[], dominantEmotions: string[]) {
  return chakraNames.map((name, index) => {
    // Calculate value based on activation and position
    let value = activeChakras.includes(index) ? 70 + Math.random() * 30 : 10 + Math.random() * 40;
    
    // Heart chakra (index 3) is usually strongest in empathetic people
    if (index === 3 && dominantEmotions.includes('Love')) {
      value = Math.max(value, 85);
    }
    
    // Third eye (index 5) is stronger in insightful people
    if (index === 5 && dominantEmotions.includes('Wisdom')) {
      value = Math.max(value, 80);
    }
    
    return {
      subject: name,
      value: value,
      fullMark: 100
    };
  });
}

/**
 * Generate emotional history timeline for visualizations
 */
export function generateEmotionalHistoryData(reflections: any[], depthScores: number[]) {
  // Create timeline points
  const timeline = reflections.map((reflection, index) => {
    const date = new Date(reflection.created_at);
    return {
      date: format(date, 'MMM d'),
      emotionalGrowth: Math.min(30 + (index * 8) + (depthScores[index] * 30), 100),
      dominantEmotion: reflection.dominant_emotion || 'Growth'
    };
  }).reverse();
  
  // Add today if not present
  if (timeline.length < 7) {
    for (let i = timeline.length; i < 7; i++) {
      timeline.push({
        date: format(subDays(new Date(), 7-i), 'MMM d'),
        emotionalGrowth: 0,
        dominantEmotion: 'None'
      });
    }
  }
  
  // Create milestone events
  const milestones = [];
  
  // First reflection milestone
  if (reflections.length > 0) {
    const firstDate = new Date(reflections[reflections.length - 1].created_at);
    milestones.push({
      date: format(firstDate, 'MMM d, yyyy'),
      title: 'Journey Began',
      description: 'You started your emotional reflection practice'
    });
  }
  
  // Depth milestone
  const highestDepthIndex = depthScores.indexOf(Math.max(...depthScores));
  if (highestDepthIndex !== -1) {
    const deepestDate = new Date(reflections[highestDepthIndex].created_at);
    milestones.push({
      date: format(deepestDate, 'MMM d, yyyy'),
      title: 'Deepest Reflection',
      description: 'You reached a new level of emotional depth in your practice'
    });
  }
  
  // Consistency milestone
  if (reflections.length >= 5) {
    milestones.push({
      date: format(new Date(), 'MMM d, yyyy'),
      title: 'Consistent Practice',
      description: 'Your regular reflection practice is strengthening your emotional intelligence'
    });
  }
  
  return { timeline, milestones };
}

/**
 * Generate personalized recommendations based on analysis
 */
export function generateRecommendations(activeChakras: number[], emotions: string[]) {
  const recommendations = [];
  
  // Recommendations based on inactive chakras
  const inactiveChakras = [0, 1, 2, 3, 4, 5, 6].filter(index => !activeChakras.includes(index));
  
  if (inactiveChakras.includes(0)) {
    recommendations.push({
      title: 'Root Chakra Activation',
      description: 'Practice grounding meditations focused on stability and security to activate your root chakra.'
    });
  }
  
  if (inactiveChakras.includes(3)) {
    recommendations.push({
      title: 'Heart Energy Expansion',
      description: 'Practice loving-kindness meditation to open and balance your heart chakra.'
    });
  }
  
  if (inactiveChakras.includes(5)) {
    recommendations.push({
      title: 'Intuitive Awareness',
      description: 'Practice third eye meditation focusing on your inner vision and intuitive insights.'
    });
  }
  
  // Recommendations based on emotions
  if (emotions.includes('Love')) {
    recommendations.push({
      title: 'Channel Compassion Energy',
      description: 'Your strong heart energy can be directed toward healing practices for yourself and others.'
    });
  }
  
  if (emotions.includes('Wisdom')) {
    recommendations.push({
      title: 'Deepen Meditation Practice',
      description: 'Your wisdom energy suggests you would benefit from longer, deeper meditation sessions.'
    });
  }
  
  if (emotions.includes('Peace')) {
    recommendations.push({
      title: 'Share Your Calming Presence',
      description: 'Your peaceful energy makes you well-suited to guide others in meditation and mindfulness.'
    });
  }
  
  // Ensure we have at least two recommendations
  if (recommendations.length < 2) {
    recommendations.push({
      title: 'Daily Energy Check-in',
      description: 'Spend 5 minutes each morning scanning your energy body and noting which chakras feel active.'
    });
  }
  
  // Return maximum 4 recommendations
  return recommendations.slice(0, 4);
}
