
import React from 'react';
import { useEmotionalAnalysis } from './emotional-insights/useEmotionalAnalysis';
import EmotionalInsightsLoading from './emotional-insights/EmotionalInsightsLoading';
import EmotionalIntelligenceMeter from './emotional-insights/EmotionalIntelligenceMeter';
import DreamEnergyAnalysis from './emotional-insights/DreamEnergyAnalysis';
import EmotionalGrowthInsights from './emotional-insights/EmotionalGrowthInsights';
import ActiveEnergyCenters from './emotional-insights/ActiveEnergyCenters';
import AstralSilhouetteVisualization from './emotional-insights/AstralSilhouetteVisualization';
import EmotionalProgressChart from './emotional-insights/EmotionalProgressChart';
import EmotionalJourneyTimeline from './emotional-insights/EmotionalJourneyTimeline';
import ChakraBalanceRadar from './emotional-insights/ChakraBalanceRadar';

const EmotionalInsightsPanel = () => {
  const {
    loading,
    emotionalGrowth,
    activatedChakras,
    dominantEmotions,
    insightMessages,
    getChakraIntensity,
    userDream,
    chakraBalanceData,
    emotionalHistoryData,
    emotionalRecommendations
  } = useEmotionalAnalysis();

  if (loading) {
    return <EmotionalInsightsLoading />;
  }

  return (
    <div className="glass-card p-6 shadow-lg">
      <h3 className="font-display text-xl mb-4 text-white/95 tracking-wide">Your Emotional Evolution</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-6">
          <EmotionalIntelligenceMeter emotionalGrowth={emotionalGrowth} />
          
          <DreamEnergyAnalysis userDream={userDream} dominantEmotions={dominantEmotions} />
          
          <EmotionalGrowthInsights insightMessages={insightMessages} />
          
          <ActiveEnergyCenters activatedChakras={activatedChakras} />
          
          <ChakraBalanceRadar chakraData={chakraBalanceData} />
        </div>
        
        <div className="flex flex-col space-y-6">
          <AstralSilhouetteVisualization 
            emotionalGrowth={emotionalGrowth}
            getChakraIntensity={getChakraIntensity}
            activatedChakras={activatedChakras}
            dominantEmotions={dominantEmotions}
          />
          
          <EmotionalProgressChart historyData={emotionalHistoryData} />
          
          <EmotionalJourneyTimeline 
            milestones={emotionalHistoryData.milestones} 
          />
        </div>
      </div>
      
      <div className="mt-8 bg-black/30 rounded-lg p-6 border border-white/10">
        <h4 className="text-white/90 text-base font-medium mb-4 flex items-center">
          <span className="inline-block w-1.5 h-1.5 bg-quantum-400 rounded-full mr-2"></span>
          Energy Practices for Your Journey
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emotionalRecommendations.map((rec, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-quantum-400/30 transition-colors">
              <h5 className="text-sm font-medium text-quantum-300 mb-2">{rec.title}</h5>
              <p className="text-sm text-white/80 leading-relaxed">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionalInsightsPanel;
