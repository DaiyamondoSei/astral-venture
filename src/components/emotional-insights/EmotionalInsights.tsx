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
  reflectionData: any[];
  emotionalData: any[];
}

interface DominantEmotions {
  primary: { emotion: string; score: number; chakraPosition: number };
  secondary: { emotion: string; score: number; chakraPosition: number };
  tertiary: { emotion: string; score: number; chakraPosition: number };
}

const EmotionalInsights: React.FC<EmotionalInsightsProps> = ({ reflectionData, emotionalData }) => {
  const {
    chakraActivation,
    emotionalGrowth,
    emotionalJourney,
    emotionalProgressData,
    emotionalIntelligence,
    dominantEmotions,
    emotionalResonance,
    consciousness
  } = useEmotionalAnalysis(reflectionData, emotionalData);
  
  const chartData = {
    labels: emotionalProgressData.map(item => item.date),
    datasets: [
      {
        label: 'Happiness',
        data: emotionalProgressData.map(item => item.happiness),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Sadness',
        data: emotionalProgressData.map(item => item.sadness),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Anger',
        data: emotionalProgressData.map(item => item.anger),
        borderColor: 'rgba(255, 205, 86, 1)',
        backgroundColor: 'rgba(255, 205, 86, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-8 flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <Heart className="w-5 h-5 text-quantum-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-3">Emotional Resonance</h3>
            <AstralSilhouetteVisualization 
              consciousness={consciousness}
              emotionalResonance={emotionalResonance}
              dominantChakras={Object.keys(chakraActivation)
                .filter(key => chakraActivation[key as keyof typeof chakraActivation] > 0.7)
                .map(key => Number(key))}
              dominantColors={{
                primary: CHAKRA_COLORS[dominantEmotions.primary.chakraPosition],
                secondary: CHAKRA_COLORS[dominantEmotions.secondary.chakraPosition],
                accent: CHAKRA_COLORS[dominantEmotions.tertiary.chakraPosition]
              }}
            />
            <VisualizationGuide consciousness={consciousness} />
          </div>
          
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <Brain className="w-5 h-5 text-quantum-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-3">Emotional Intelligence</h3>
            <div className="flex flex-col">
              <EmotionalIntelligenceMeter value={emotionalIntelligence.score} />
              <p className="text-quantum-300 text-sm mt-2">
                <Sparkles className="w-4 h-4 inline mr-1" />
                {emotionalIntelligence.insight}
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
                <EmotionalJourneyTimeline journey={emotionalJourney} />
              </TabsContent>
              <TabsContent value="growth">
                <EmotionalGrowthInsights insights={emotionalGrowth} />
              </TabsContent>
              <TabsContent value="chakras">
                <div className="space-y-3">
                  <ChakraBalanceRadar 
                    chakraActivation={chakraActivation} 
                    chakraNames={CHAKRA_NAMES} 
                  />
                  <ActiveEnergyCenters 
                    activations={chakraActivation} 
                    primaryColor={CHAKRA_COLORS[dominantEmotions.primary.chakraPosition]} 
                    secondaryColor={CHAKRA_COLORS[dominantEmotions.secondary.chakraPosition]} 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Dream Energy Analysis</h3>
            <DreamEnergyAnalysis reflectionData={reflectionData} />
          </div>
          
          <div className="bg-gradient-to-br from-quantum-900/80 to-quantum-950/80 rounded-lg p-4 border border-quantum-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Emotional Progress</h3>
            <EmotionalProgressChart chartData={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalInsights;
