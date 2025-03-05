import React, { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/tabs';
import TabsHeader from './reflection/TabsHeader';
import TabsContent from './reflection/TabsContent';
import AIAssistantDialog from './ai-assistant/AIAssistantDialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { analyzeEmotionPatterns } from '@/services/ai/patternAnalysis';
import { HistoricalReflection } from '@/components/reflection/types';
import { Json } from '@/integrations/supabase/types';

interface ReflectionTabProps {
  onReflectionComplete?: (pointsEarned: number, emotionalInsights?: any) => void;
}

const ReflectionTab = ({ onReflectionComplete }: ReflectionTabProps) => {
  const [activeTab, setActiveTab] = useState('new');
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState<{ id?: string, content?: string } | null>(null);
  const [patternInsights, setPatternInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadReflectionPatterns = async () => {
      if (!user) return;
      
      setLoadingInsights(true);
      try {
        const { data: reflections, error } = await supabase
          .from('energy_reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (reflections && reflections.length > 0) {
          const convertedReflections: HistoricalReflection[] = reflections.map(reflection => ({
            ...reflection,
            chakras_activated: Array.isArray(reflection.chakras_activated) 
              ? reflection.chakras_activated 
              : typeof reflection.chakras_activated === 'string'
                ? JSON.parse(reflection.chakras_activated as string)
                : []
          }));
          
          const insights = analyzeEmotionPatterns(convertedReflections);
          setPatternInsights({
            activatedChakras: insights.dominantChakras,
            dominantEmotions: insights.dominantEmotions,
            emotionalAnalysis: {
              recentTrends: insights.recentTrends.join(' '),
              recommendedFocus: insights.recommendedFocus.join(' '),
              chakraBalance: insights.chakraProgression.length / 7 // Proportion of activated chakras
            }
          });
        }
      } catch (error) {
        console.error('Error loading reflection patterns:', error);
      } finally {
        setLoadingInsights(false);
      }
    };
    
    if (activeTab === 'insights') {
      loadReflectionPatterns();
    }
  }, [activeTab, user]);

  const handleReflectionComplete = (pointsEarned: number) => {
    if (user) {
      setPatternInsights(null);
    }
    
    const emotionalInsights = {
      dominantEmotion: 'growth',
      emotionalBalance: 0.8,
      chakrasAffected: ['heart', 'throat']
    };
    
    if (onReflectionComplete) {
      onReflectionComplete(pointsEarned, emotionalInsights);
    }
    
    setActiveTab('insights');
  };

  const handleOpenAiAssistant = (reflectionId?: string, reflectionContent?: string) => {
    setSelectedReflection({ id: reflectionId, content: reflectionContent });
    setAiDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsHeader />
        </Tabs>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 border-quantum-400/30 text-quantum-400 hover:bg-quantum-500/10"
          onClick={() => handleOpenAiAssistant()}
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">Ask AI Guide</span>
        </Button>
      </div>
      
      <TabsContent 
        activeTab={activeTab}
        onReflectionComplete={handleReflectionComplete}
        onOpenAiAssistant={handleOpenAiAssistant}
        patternInsights={patternInsights}
        loadingInsights={loadingInsights}
      />
      
      <AIAssistantDialog 
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        selectedReflectionId={selectedReflection?.id}
        reflectionContext={selectedReflection?.content}
      />
    </>
  );
};

export default ReflectionTab;
