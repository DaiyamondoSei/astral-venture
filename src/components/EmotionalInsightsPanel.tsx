
import React from 'react';
import { useEmotionalAnalysis } from './emotional-insights/useEmotionalAnalysis';
import EmotionalInsightsLoading from './emotional-insights/EmotionalInsightsLoading';
import EmotionalIntelligenceMeter from './emotional-insights/EmotionalIntelligenceMeter';
import DreamEnergyAnalysis from './emotional-insights/DreamEnergyAnalysis';
import EmotionalGrowthInsights from './emotional-insights/EmotionalGrowthInsights';
import ActiveEnergyCenters from './emotional-insights/ActiveEnergyCenters';
import AstralSilhouetteVisualization from './emotional-insights/astral-visualization/AstralSilhouetteVisualization';
import EmotionalProgressChart from './emotional-insights/EmotionalProgressChart';
import EmotionalJourneyTimeline from './emotional-insights/EmotionalJourneyTimeline';
import ChakraBalanceRadar from './emotional-insights/ChakraBalanceRadar';
import { Sparkles } from 'lucide-react';

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
    <div className="glass-card p-6 lg:p-8 shadow-xl border border-white/10 rounded-xl">
      <h2 className="font-display text-2xl mb-6 text-white/95 tracking-wide">
        Your Emotional Evolution
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col space-y-8">
          <EmotionalIntelligenceMeter emotionalGrowth={emotionalGrowth} />
          
          <DreamEnergyAnalysis userDream={userDream} dominantEmotions={dominantEmotions} />
          
          <EmotionalGrowthInsights insightMessages={insightMessages} />
          
          <ActiveEnergyCenters activatedChakras={activatedChakras} />
          
          <ChakraBalanceRadar chakraData={chakraBalanceData} />
        </div>
        
        <div className="flex flex-col space-y-8">
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
      
      <section 
        className="mt-10 bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-lg"
        aria-labelledby="practices-heading"
      >
        <h3 
          id="practices-heading" 
          className="text-white/95 text-lg font-display mb-5 flex items-center"
        >
          <Sparkles size={20} className="inline-block text-quantum-400 mr-3" />
          Energy Practices for Your Journey
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emotionalRecommendations.map((rec, index) => (
            <div 
              key={index} 
              className="bg-white/5 p-5 rounded-lg border border-white/10 hover:border-quantum-400/40 transition-colors group"
              tabIndex={0}
              role="article"
            >
              <h4 className="text-base font-medium text-quantum-300 mb-3 group-hover:text-quantum-200 transition-colors">
                {rec.title}
              </h4>
              <p className="text-white/80 leading-relaxed">
                {rec.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EmotionalInsightsPanel;
