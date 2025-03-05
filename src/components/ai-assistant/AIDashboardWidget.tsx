
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { askAIAssistant } from '@/services/ai/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIDashboardWidgetProps {
  latestReflection?: {
    content?: string;
    id?: string;
    dominant_emotion?: string;
  };
  onOpenAssistant: (reflectionId?: string, reflectionContent?: string) => void;
}

const AIDashboardWidget: React.FC<AIDashboardWidgetProps> = ({
  latestReflection,
  onOpenAssistant
}) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Get personalized insight based on latest reflection or overall patterns
  useEffect(() => {
    const fetchInsight = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Generate personalized insight based on reflection content or overall patterns
        const question = latestReflection?.content 
          ? `What insight can you offer about this reflection: "${latestReflection.content.substring(0, 100)}..."`
          : "What practice might benefit me today based on my reflection history?";
        
        const response = await askAIAssistant({
          question,
          context: latestReflection?.content,
          reflectionIds: latestReflection?.id ? [latestReflection.id] : undefined
        }, user.id);
        
        // Extract a concise insight from the full response
        const shortInsight = response.answer.split('.')[0] + '.';
        setInsight(shortInsight);
      } catch (error) {
        console.error('Error fetching AI insight:', error);
        setInsight('Reflect on your energy patterns to discover deeper awareness.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsight();
  }, [latestReflection, user]);

  return (
    <Card className="glass-card-dark border-quantum-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Sparkles size={16} className="text-quantum-400" />
          Quantum Guide Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`min-h-[60px] ${loading ? 'animate-pulse' : ''}`}>
          {loading ? (
            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
          ) : (
            <p className="text-white/80">
              <Lightbulb size={16} className="inline-block mr-2 text-quantum-400" />
              {insight || "Connect with your Quantum Guide for personalized insights."}
            </p>
          )}
        </div>
        
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-quantum-500/20 hover:bg-quantum-500/10 text-quantum-400"
            onClick={() => onOpenAssistant(latestReflection?.id, latestReflection?.content)}
          >
            Ask Quantum Guide
            <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDashboardWidget;
