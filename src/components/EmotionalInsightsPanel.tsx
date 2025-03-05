
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
    <div className="glass-card p-4">
      <h3 className="font-display text-lg mb-3">Your Emotional Evolution</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-4">
          <EmotionalIntelligenceMeter emotionalGrowth={emotionalGrowth} />
          
          <DreamEnergyAnalysis userDream={userDream} dominantEmotions={dominantEmotions} />
          
          <EmotionalGrowthInsights insightMessages={insightMessages} />
          
          <ActiveEnergyCenters activatedChakras={activatedChakras} />
          
          <ChakraBalanceRadar chakraData={chakraBalanceData} />
        </div>
        
        <div className="flex flex-col space-y-4">
          <AstralSilhouetteVisualization 
            emotionalGrowth={emotionalGrowth}
            getChakraIntensity={getChakraIntensity}
            activatedChakras={activatedChakras}
          />
          
          <EmotionalProgressChart historyData={emotionalHistoryData} />
          
          <EmotionalJourneyTimeline 
            milestones={emotionalHistoryData.milestones} 
          />
        </div>
      </div>
      
      <div className="mt-5 bg-black/20 rounded-lg p-4">
        <h4 className="text-white/90 text-sm font-medium mb-2">Recommended Energy Practices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {emotionalRecommendations.map((rec, index) => (
            <div key={index} className="bg-white/5 p-3 rounded border border-white/10">
              <h5 className="text-xs font-medium text-quantum-400 mb-1">{rec.title}</h5>
              <p className="text-xs text-white/70">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionalInsightsPanel;
