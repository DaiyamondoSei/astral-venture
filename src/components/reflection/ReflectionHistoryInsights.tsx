
import React from 'react';
import { ChakraData, ChakraActivated } from '@/utils/emotion/chakraTypes';
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
}

const ReflectionHistoryInsights: React.FC<ReflectionHistoryInsightsProps> = ({ 
  data = {},
  onOpenAiAssistant
}) => {
  const { 
    activatedChakras = [], 
    dominantEmotions = [],
    emotionalAnalysis = {}
  } = data;
  
  const { 
    personalizedInsights, 
    practiceRecommendations, 
    loading 
  } = useChakraInsights(activatedChakras as ChakraActivated, dominantEmotions);
  
  return (
    <div className="glass-panel p-4 space-y-4">
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
        <AskAIButton onOpenAiAssistant={() => onOpenAiAssistant()} />
      )}
      
      <EmotionalAnalysisGrid emotionalAnalysis={emotionalAnalysis} />
    </div>
  );
};

export default ReflectionHistoryInsights;
