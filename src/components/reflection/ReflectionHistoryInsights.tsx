
import React from 'react';
import { ChakraActivated, normalizeChakraData, ChakraData } from '@/utils/emotion/chakraTypes';
import ChakraInsights from './insights/ChakraInsights';
import EmotionInsights from './insights/EmotionInsights';
import ChakraBalanceIndicator from './insights/ChakraBalanceIndicator';
import PersonalizedInsightsList from './insights/PersonalizedInsightsList';
import RecommendedPractices from './insights/RecommendedPractices';
import EmotionalAnalysisGrid from './insights/EmotionalAnalysisGrid';
import AskAIButton from './insights/AskAIButton';
import { useChakraInsights } from './insights/useChakraInsights';

interface ReflectionHistoryInsightsProps {
  data?: ChakraData;
  onOpenAiAssistant?: (reflectionId?: string, reflectionContent?: string) => void;
  reflection?: any;
  onClose?: () => void;
}

const ReflectionHistoryInsights: React.FC<ReflectionHistoryInsightsProps> = ({ 
  data = {},
  onOpenAiAssistant,
  reflection,
  onClose
}) => {
  // Set default empty values to prevent errors
  const activatedChakras = data.activatedChakras || reflection?.chakras_activated || [];
  const dominantEmotions = data.dominantEmotions || (reflection?.dominant_emotion ? [reflection.dominant_emotion] : []);
  const emotionalAnalysis = data.emotionalAnalysis || {};
  
  const { 
    personalizedInsights, 
    practiceRecommendations, 
    loading 
  } = useChakraInsights(activatedChakras as ChakraActivated, dominantEmotions);
  
  return (
    <div className="glass-panel p-4 space-y-4">
      {onClose && (
        <div className="flex justify-end">
          <button onClick={onClose} className="text-white/70 hover:text-white">
            Close
          </button>
        </div>
      )}
      
      <div className="text-white/70 text-sm mb-2">
        Your reflections have revealed these insights:
      </div>
      
      <ChakraInsights activatedChakras={activatedChakras as ChakraActivated} />
      
      <EmotionInsights dominantEmotions={dominantEmotions} />
      
      <ChakraBalanceIndicator activatedChakras={activatedChakras as ChakraActivated} />
      
      <PersonalizedInsightsList 
        insights={personalizedInsights}
        loading={loading}
      />
      
      <RecommendedPractices 
        practices={practiceRecommendations}
        loading={loading}
      />
      
      {onOpenAiAssistant && (
        <AskAIButton onOpenAiAssistant={() => onOpenAiAssistant(reflection?.id, reflection?.content)} />
      )}
      
      <EmotionalAnalysisGrid emotionalAnalysis={emotionalAnalysis} />
    </div>
  );
};

export default ReflectionHistoryInsights;
