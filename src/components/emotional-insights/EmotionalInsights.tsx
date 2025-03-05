
import React from 'react';
import { useEmotionalAnalysis } from './useEmotionalAnalysis';
import EmotionalInsightsLoading from './EmotionalInsightsLoading';
import { Sparkles, Activity, Heart, Brain } from 'lucide-react';
import { chakraNames, chakraColors } from '@/utils/emotion/mappings';
import AstralSilhouetteVisualization from './AstralSilhouetteVisualization';

const EmotionalInsights: React.FC = () => {
  const {
    loading,
    emotionalGrowth,
    activatedChakras,
    dominantEmotions,
    insightMessages,
    getChakraIntensity,
    chakraBalanceData,
    emotionalHistoryData,
    emotionalRecommendations
  } = useEmotionalAnalysis();

  if (loading) {
    return <EmotionalInsightsLoading />;
  }

  return (
    <div className="glass-card p-5">
      <h2 className="font-display text-xl mb-4 text-white">Your Emotional Journey</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Astral visualization and dominant emotions */}
        <div className="space-y-5">
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="text-lg mb-3 flex items-center text-quantum-300">
              <Heart className="mr-2" size={18} />
              Emotional Essence
            </h3>
            
            <AstralSilhouetteVisualization 
              activatedChakras={activatedChakras} 
              emotionalGrowth={emotionalGrowth}
              getChakraIntensity={getChakraIntensity}
            />
            
            <div className="mt-4">
              <h4 className="text-sm text-white/70 mb-2">Dominant Energies:</h4>
              <div className="flex flex-wrap gap-2">
                {dominantEmotions.map((emotion, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ 
                      backgroundColor: `${chakraColors[idx % chakraColors.length]}40`,
                      color: chakraColors[idx % chakraColors.length]
                    }}
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="text-lg mb-3 flex items-center text-quantum-300">
              <Brain className="mr-2" size={18} />
              Energy Insights
            </h3>
            
            <ul className="space-y-2">
              {insightMessages.map((insight, idx) => (
                <li key={idx} className="text-sm text-white/80 flex items-start">
                  <Sparkles className="mr-2 text-quantum-400 shrink-0 mt-1" size={14} />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Right column - Charts and recommendations */}
        <div className="space-y-5">
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="text-lg mb-3 flex items-center text-quantum-300">
              <Activity className="mr-2" size={18} />
              Energy Growth
            </h3>
            
            <div className="mb-3">
              <div className="text-sm text-white/70 mb-1">Emotional Growth:</div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-quantum-400 to-quantum-600 h-3 rounded-full"
                  style={{ width: `${Math.min(emotionalGrowth, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-white/50 mt-1 text-right">
                {Math.round(emotionalGrowth)}% activated
              </div>
            </div>
            
            <div>
              <div className="text-sm text-white/70 mb-1">Active Energy Centers:</div>
              <div className="flex justify-around mb-2">
                {chakraNames.map((name, idx) => {
                  const isActive = activatedChakras.includes(idx);
                  return (
                    <div 
                      key={idx} 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isActive ? 'text-white' : 'text-white/30'}`} 
                      style={{ 
                        backgroundColor: isActive ? chakraColors[idx] : 'rgba(255,255,255,0.1)',
                        boxShadow: isActive ? `0 0 10px ${chakraColors[idx]}` : 'none' 
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-white/50 text-center">
                {activatedChakras.length}/7 chakras activated
              </div>
            </div>
          </div>
          
          {/* Practice recommendations */}
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="text-lg mb-3 text-quantum-300">Recommended Practices</h3>
            
            <div className="space-y-3">
              {emotionalRecommendations.map((rec, idx) => (
                <div key={idx} className="border border-quantum-500/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-quantum-300 mb-1">{rec.title}</h4>
                  <p className="text-xs text-white/70">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalInsights;
