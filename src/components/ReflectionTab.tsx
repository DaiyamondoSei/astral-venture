
import React, { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/tabs';
import TabsHeader from './reflection/TabsHeader';
import TabsContent from './reflection/TabsContent';
import AIAssistantDialog from './ai-assistant/AIAssistantDialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { analyzeReflectionPatterns } from '@/services/ai/patternAnalysis';

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

  // Fetch and analyze user reflection patterns
  useEffect(() => {
    const loadReflectionPatterns = async () => {
      if (!user) return;
      
      setLoadingInsights(true);
      try {
        // Fetch user's reflections
        const { data: reflections, error } = await supabase
          .from('energy_reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (reflections && reflections.length > 0) {
          // Analyze patterns
          const patterns = analyzeReflectionPatterns(reflections);
          setPatternInsights({
            activatedChakras: patterns.dominantChakras,
            dominantEmotions: patterns.dominantEmotions,
            emotionalAnalysis: {
              recentTrends: patterns.recentTrends.join(' '),
              recommendedFocus: patterns.recommendedFocus.join(' '),
              chakraBalance: patterns.chakraProgression.length / 7 // Proportion of activated chakras
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
    // Refresh pattern insights when a new reflection is submitted
    if (user) {
      setPatternInsights(null);
    }
    
    // We can enhance this with emotional analysis in the future
    const emotionalInsights = {
      dominantEmotion: 'growth',
      emotionalBalance: 0.8,
      chakrasAffected: ['heart', 'throat']
    };
    
    if (onReflectionComplete) {
      onReflectionComplete(pointsEarned, emotionalInsights);
    }
    
    // Switch to insights tab after submission
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
