
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDivineIntelligenceContext } from '@/contexts/DivineIntelligenceContext';
import AIDivineGuide from './AIDivineGuide';
import { Sparkles, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const SUGGESTED_PROMPTS = [
  "What energy practices would help balance my chakras?",
  "How can I deepen my meditation experience?",
  "What does my current energy pattern suggest for my growth?",
  "How can I raise my consciousness level?",
  "What practices align with my current energetic state?"
];

const AIDivineWidget = () => {
  const { userContext, lastResponse } = useDivineIntelligenceContext();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [personalizedPrompts, setPersonalizedPrompts] = useState<string[]>(SUGGESTED_PROMPTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generate personalized prompts based on user context
  useEffect(() => {
    if (userContext) {
      const customPrompts = [...SUGGESTED_PROMPTS];
      
      // Personalize based on astral level
      if (userContext.astralLevel && userContext.astralLevel > 3) {
        customPrompts.push("What advanced energy techniques are suitable for my level?");
        customPrompts.push("How can I work with the quantum field at my current stage?");
      }
      
      // Personalize based on emotions
      if (userContext.emotionalState && userContext.emotionalState.length > 0) {
        const recentEmotion = userContext.emotionalState[0];
        customPrompts.push(`How can I work with my recent ${recentEmotion} energy?`);
      }
      
      // Personalize based on chakras
      if (userContext.chakraBalance) {
        const chakras = Object.keys(userContext.chakraBalance);
        if (chakras.length > 0) {
          const lowestChakra = chakras.reduce((lowest, current) => {
            const currentValue = userContext.chakraBalance?.[current] || 0;
            const lowestValue = userContext.chakraBalance?.[lowest] || 0;
            return currentValue < lowestValue ? current : lowest;
          }, chakras[0]);
          
          customPrompts.push(`What practices would help strengthen my ${lowestChakra} chakra?`);
        }
      }
      
      // Set a randomly selected subset of the prompts
      const shuffled = [...customPrompts].sort(() => 0.5 - Math.random());
      setPersonalizedPrompts(shuffled.slice(0, 3));
    }
  }, [userContext]);

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    setIsDialogOpen(true);
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Divine Intelligence</h3>
        </div>
        <p className="text-sm text-white/80">Your quantum consciousness guide</p>
      </div>
      
      <div className="p-4 space-y-4">
        {lastResponse ? (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Last Insight</h4>
              <p className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                {lastResponse.insights && lastResponse.insights.length > 0 
                  ? lastResponse.insights[0].content 
                  : lastResponse.message.substring(0, 120) + '...'}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full flex gap-2 items-center"
              onClick={() => setIsDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4" />
              Continue Conversation
            </Button>
          </>
        ) : (
          <>
            <h4 className="text-sm font-semibold">Ask about your journey</h4>
            <div className="grid gap-2">
              {personalizedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => handlePromptClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="hidden">Open divine guide</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] p-0">
          <AIDivineGuide 
            initialPrompt={selectedPrompt || undefined}
            maxHeight="400px"
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AIDivineWidget;
