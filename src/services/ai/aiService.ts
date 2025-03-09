
import { AIQuestion, AIResponse, AIQuestionOptions } from './types';

// Simulated backend response delay
const simulateBackendDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ask a question to the AI assistant
 * 
 * @param question The question to ask or an AIQuestion object
 * @param options Optional configuration
 * @returns Promise with AI response
 */
export const askAIAssistant = async (
  question: string | AIQuestion,
  options: AIQuestionOptions = {}
): Promise<AIResponse> => {
  try {
    // Create a proper question object
    const questionObj: AIQuestion = typeof question === 'string' 
      ? { text: question } 
      : question;
    
    // For frontend testing/demo, we'll simulate a backend response
    await simulateBackendDelay(1500);
    
    // Create a demo response
    const response = generateDemoResponse(questionObj);
    
    return response;
  } catch (error) {
    console.error('Error asking AI assistant:', error);
    return {
      answer: 'Sorry, I encountered an error processing your request.',
      type: 'error',
      suggestedPractices: []
    };
  }
};

/**
 * For frontend testing/demo purposes only
 * This generates a mock response
 */
function generateDemoResponse(question: AIQuestion): AIResponse {
  const { text: questionText } = question;
  
  // For demo/testing purposes
  if (questionText.toLowerCase().includes('meditation')) {
    return {
      answer: 'Meditation is a practice where an individual uses a technique – such as mindfulness, or focusing the mind on a particular object, thought, or activity – to train attention and awareness, and achieve a mentally clear and emotionally calm and stable state.',
      type: 'text',
      suggestedPractices: [
        'Mindful breathing meditation',
        'Body scan meditation',
        'Loving-kindness meditation'
      ],
      meta: {
        model: 'gpt-4o-mini',
        tokenUsage: 205,
        processingTime: 342
      }
    };
  }
  
  if (questionText.toLowerCase().includes('chakra')) {
    return {
      answer: 'Chakras are the energy centers in your body. According to ancient texts, there are 7 main chakras that align along your spine, from the base to the crown of your head. Each is associated with specific physical, psychological, and spiritual aspects of well-being.',
      type: 'text',
      suggestedPractices: [
        'Root chakra meditation',
        'Chakra balancing yoga',
        'Sound healing with chakra frequencies'
      ],
      meta: {
        model: 'gpt-4o',
        tokenUsage: 368,
        processingTime: 512
      }
    };
  }
  
  // Default response
  return {
    answer: `I've received your question: "${questionText}". This is a simulated AI response for development purposes. In a production environment, this would connect to an actual AI service.`,
    type: 'text',
    suggestedPractices: [
      'Mindful breathing',
      'Gratitude journaling',
      'Nature connection practice'
    ],
    meta: {
      model: 'gpt-3.5-turbo',
      tokenUsage: 125,
      processingTime: 278
    }
  };
}
