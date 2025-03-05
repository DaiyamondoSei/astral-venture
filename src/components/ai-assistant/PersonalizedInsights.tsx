
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonalizedRecommendations } from '@/services/ai/aiService';
import { Sparkles, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIAssistantDialog from './AIAssistantDialog';

const PersonalizedInsights: React.FC = () => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      
      try {
        const personalizedRecommendations = await getPersonalizedRecommendations(user.id);
        setRecommendations(personalizedRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Set some defaults if there's an error
        setRecommendations([
          "Practice mindful breathing for 5 minutes daily",
          "Try a chakra balancing meditation",
          "Journal about your energy experiences"
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [user]);

  if (loading) {
    return (
      <Card className="glass-card animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-3/4 bg-white/20 rounded"></div>
          <div className="h-4 w-1/2 bg-white/10 rounded mt-1"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded"></div>
            <div className="h-4 w-full bg-white/10 rounded"></div>
            <div className="h-4 w-3/4 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card border-quantum-400/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Sparkles size={18} className="mr-2 text-quantum-400" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations for your practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <li 
                key={index} 
                className="text-white/80 pl-4 border-l-2 border-quantum-400/30 py-1 text-sm"
              >
                {recommendation}
              </li>
            ))}
          </ul>
          
          <div className="mt-4 flex justify-between">
            <Button 
              variant="link" 
              size="sm" 
              className="text-quantum-400 p-0 h-auto"
              onClick={() => setAiDialogOpen(true)}
            >
              <Sparkles size={14} className="mr-1" />
              <span>Ask AI Guide</span>
            </Button>
            
            {recommendations.length > 3 && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-white/60 p-0 h-auto"
              >
                <MoreHorizontal size={14} className="mr-1" />
                <span>More</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AIAssistantDialog 
        open={aiDialogOpen} 
        onOpenChange={setAiDialogOpen} 
      />
    </>
  );
};

export default PersonalizedInsights;
