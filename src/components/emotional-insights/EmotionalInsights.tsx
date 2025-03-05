
import React from 'react';
import { Heart, Brain, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmotionalJourneyTimeline from './EmotionalJourneyTimeline';
import EmotionalGrowthInsights from './EmotionalGrowthInsights';
import ChakraBalanceRadar from './ChakraBalanceRadar';
import EmotionalProgressChart from './EmotionalProgressChart';
import EmotionalIntelligenceMeter from './EmotionalIntelligenceMeter';
import AstralSilhouetteVisualization from './astral-visualization/AstralSilhouetteVisualization';
import { useEmotionalAnalysis } from './useEmotionalAnalysis';
import VisualizationGuide from './VisualizationGuide';
import DreamEnergyAnalysis from './DreamEnergyAnalysis';
import ActiveEnergyCenters from './ActiveEnergyCenters';
import { CHAKRA_COLORS, CHAKRA_NAMES } from '../entry-animation/cosmic/types';

interface EmotionalInsightsProps {
  reflectionData?: any[];
  emotionalData?: any[];
}

const EmotionalInsights: React.FC<EmotionalInsightsProps> = () => {
  const {
    emotionalGrowth,
    activatedChakras,
    dominantEmotions,
    insightMessages,
    getChakraIntensity,
    userDream,
    chakraBalanceData,
    emotionalHistoryData,
  } = useEmotionalAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-8 flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <Heart className="w-5 h-5 text-quantum-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-3">Emotional Resonance</h3>
            <AstralSilhouetteVisualization 
              emotionalGrowth={emotionalGrowth}
              getChakraIntensity={getChakraIntensity}
              activatedChakras={activatedChakras}
              dominantEmotions={dominantEmotions}
            />
            <VisualizationGuide emotionalGrowth={emotionalGrowth} />
          </div>
          
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <Brain className="w-5 h-5 text-quantum-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-3">Emotional Intelligence</h3>
            <div className="flex flex-col">
              <EmotionalIntelligenceMeter emotionalGrowth={emotionalGrowth} />
              <p className="text-quantum-300 text-sm mt-2">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Developing emotional wisdom through mindful practice
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <Activity className="w-5 h-5 text-quantum-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-3">Emotional Growth</h3>
            <Tabs defaultValue="journey" className="w-full">
              <TabsList className="bg-quantum-800/40 mb-4">
                <TabsTrigger value="journey">Journey</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="chakras">Energy</TabsTrigger>
              </TabsList>
              <TabsContent value="journey">
                <EmotionalJourneyTimeline milestones={emotionalHistoryData.milestones} />
              </TabsContent>
              <TabsContent value="growth">
                <EmotionalGrowthInsights insightMessages={insightMessages} />
              </TabsContent>
              <TabsContent value="chakras">
                <div className="space-y-3">
                  <ChakraBalanceRadar chakraData={chakraBalanceData} />
                  <ActiveEnergyCenters activatedChakras={activatedChakras} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Dream Energy Analysis</h3>
            <DreamEnergyAnalysis userDream={userDream} dominantEmotions={dominantEmotions} />
          </div>
          
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Emotional Progress</h3>
            <EmotionalProgressChart historyData={emotionalHistoryData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalInsights;
