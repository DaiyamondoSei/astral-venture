
import React from 'react';
import { useEmotionalAnalysis } from './emotional-insights/useEmotionalAnalysis';
import EmotionalInsightsLoading from './emotional-insights/EmotionalInsightsLoading';
import EmotionalIntelligenceMeter from './emotional-insights/EmotionalIntelligenceMeter';
import DreamEnergyAnalysis from './emotional-insights/DreamEnergyAnalysis';
import EmotionalGrowthInsights from './emotional-insights/EmotionalGrowthInsights';
import ActiveEnergyCenters from './emotional-insights/ActiveEnergyCenters';
import AstralSilhouetteVisualization from './emotional-insights/AstralSilhouetteVisualization';

const EmotionalInsightsPanel = () => {
  const {
    loading,
    emotionalGrowth,
    activatedChakras,
    dominantEmotions,
    insightMessages,
    getChakraIntensity,
    userDream
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
        </div>
        
        <AstralSilhouetteVisualization 
          emotionalGrowth={emotionalGrowth}
          getChakraIntensity={getChakraIntensity}
          activatedChakras={activatedChakras}
        />
      </div>
    </div>
  );
};

export default EmotionalInsightsPanel;
